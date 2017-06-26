(function () {
    'use strict';

    angular
        .module('app')
        .factory('DataFactory', Service);

    Service.$inject = ['$q', 'ApiService', 'CacheFactory', 'Notification'];

    function Service($q, ApiService, CacheFactory, Notification) {

        return {
            Collection: Collection,
        }

        function Collection( options ) {

            var options = options || {};

            var settings = {
                id_field: options.id_field || 'id',
                wrapper: options.wrapper || null,
            };

            // See CacheFactory for more info on ID_FIELD and WRAPPER

            var cache = new CacheFactory.Cache( settings.id_field, settings.wrapper );
            var filters = {};

            // define public interface
            return {
                list: list,
                detail: detail,
                find: find,
                update: update,
                create: create,
                filter: filter,
            };


            function list( url, config ) {

                var config = getConfig( config );

                var promise = ApiService.get( url, config ).then( cache.update, cache.error );
                var data = cache.list();

                return {
                    promise: promise,
                    cache: data,
                }

            }


            function detail( url, config ) {

                var id = getId( url );
                var config = getConfig( config );

                var promise = ApiService.get( url, config ).then( cache.update, cache.error );
                var datum = cache.detail( id );

                return {
                    promise: promise,
                    cache: datum,
                }

            }


            // find() is like a soft detail(), meant for static views
            // it will get() a datum only if it's not cached yet
            // very much a convenience function, sans promise handling
            function find( url, config ) {

                var id = getId( url );
                var config = getConfig( config );
                var datum = cache.detail( id );

                // Enrich the datum with an extra property: track whether
                // it is just a stub, or if it contains server data.
                // See also: CacheFactory.Cache.updateDatum()
                if( !datum.initialized ) {

                    ApiService.get( url, config ).then( cache.update, cache.error );

                    // Necessary so as to avoid inifinite digest cycles.
                    datum.initialized = true;

                }

                return datum;

            }


            function update( url, data, config ) {

                var id = getId( url );
                var datum = cache.detail( id );

                // Omit data to submit changed fields in dirty
                // For hardening, passing datum or datum.dirty will also trigger this
                if( !data || data === datum || data === datum.dirty ) {

                    // DRF accepts PATCHes w/ only changed fields
                    // An empty object means no changes
                    data = getChanges( datum.clean, datum.dirty );

                    // TODO: Remove after it's proven to be sufficiently stable
                    console.log( data );

                    // TODO: Alert user if nothing changed?

                }

                var promise = ApiService.patch( url, data, config ).then( cache.update, cache.error );

                // Alert the user...
                promise.then(
                    function( response ) {
                        Notification.success( { message: 'Changes saved!' } );
                        return response;
                    },
                    function( response ) {
                        Notification.error( { message: ApiService.error( response ) } );
                        return $q.reject( response )
                    }
                );

                return {
                    promise: promise,
                    cache: datum,
                }

            }


            // We cannot know if the create() succeeds ahead of time.
            // Therefore, we cannot return a datum, only a promise.
            // We can assume it would succeed and create a stub cache entry,
            //   but that doesn't seem worth the trouble currently.
            // Use DataService.detail() to get the datum in the resolve!
            function create( url, data, config ) {

                var promise = ApiService.post( url, data, config ).then( cache.update, cache.error );

                // Alert the user...
                // TODO: Consolidate w/ alert above?
                promise.then(
                    function( response ) {
                        Notification.success( { message: 'Changes saved!' } );
                        return response;
                    },
                    function( response ) {
                        Notification.error( { message: ApiService.error( response ) } );
                        return $q.reject( response )
                    }
                );

                return promise;

            }


            // Use this to set persistent param filters for all GET requests
            // Expects an object of params as per Angular's $http.config
            // TODO: Additive filters? Currently, it's a `set` situation.
            function filter( params ) {

                return filters = params || {};

            }


            function getId( url ) {

                // Assumes that the last part of the URL is the id
                var id = url.substr( url.lastIndexOf('/') + 1 );

                // TODO: URL should not contain query string
                // GET params should be defined by config.params
                // ...but just to be safe, drop anything after ?

                // TODO: Anticipate trailing forwardslash

                // Ensure that it's numeric
                return parseInt( id );

            }


            function getConfig( config ) {

                // config is an optional argument
                config = config || {};

                // apply any defined filters
                angular.merge( config, {
                    params: filters
                });

                return config;

            }


            // TODO: Abstract this into a module, or use existing library?
            function getChanges( clean, dirty ) {

                return compareObjects( clean, dirty, {} );

                function compareObjects( a, b, node ) {

                    // We will use clean as the reference
                    // If dirty contains a property that isn't in clean, ignore it
                    for( var prop in a ) {

                        // Ignore Angular's internal keys
                        if( prop.substring(0,2) == '$$' ) {
                            continue;
                        }

                        // We assume that dirty contains this property too
                        // if(typeof b[prop] == 'undefined'){}

                        // Naive comparison
                        if( JSON.stringify( a[prop] ) == JSON.stringify( b[prop] ) ) {
                            continue;
                        }

                        if( isValue( b[prop] ) ){

                            // TODO: parse numeric strings into numbers?
                            node[prop] = b[prop];

                            continue;

                        }

                        if( isArray( b[prop] ) ){
                            node[prop] = compareArrays( a[prop], b[prop] );
                            continue;
                        }

                        if( isObject( b[prop] ) ) {
                            compareObjects( a[prop], b[prop], node[prop] );
                            continue;
                        }

                    }

                    return node;

                }

                // This works only for arrays of values, not objects or arrays
                // Does not care about order of elements
                function compareArrays( a, b ) {

                    // TODO: Check what happens with numeric strings

                    // ensure that all of the values in a are in b
                    for( var i in a ) {
                        if( b.indexOf(i) < 0 ) {
                            return b;
                        }
                    }

                    // ensure that all of the values in b are in a
                    for( var i in b ) {
                        if( a.indexOf(i) < 0 ) {
                            return b;
                        }
                    }

                    // otherwise, return undefined
                    return undefined;

                }

                function isValue(obj) {
                    return typeof obj !== 'object' || obj == null;
                }

                function isArray(obj) {
                    return {}.toString.apply(obj) === '[object Array]';
                }

                function isObject(obj) {
                    return {}.toString.apply(obj) === '[object Object]';
                }

                // Unused, but might be needed for string -> number
                function isInt(n){
                    return Number(n) === n && n % 1 === 0;
                }

                function isFloat(n){
                    return Number(n) === n && n % 1 !== 0;
                }

            }

        }

    }

})();