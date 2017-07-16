(function () {
    'use strict';

    angular
        .module('app')
        .factory('DataFactory', Service);

    Service.$inject = ['$q', '$injector', 'ApiService', 'CacheFactory', 'Notification'];

    function Service($q, $injector, ApiService, CacheFactory, Notification) {

        return {
            Collection: Collection,
        }

        function Collection( options ) {

            var options = options || {};

            var settings = {
                route: options.route || 'resources',
                id_field: options.id_field || 'id',
                wrapper: options.wrapper || null,
                embedded: options.embedded || null,
                mapped: options.mapped || null,
            };

            // See CacheFactory for more info on ID_FIELD and WRAPPER

            var cache = new CacheFactory.Cache( settings.id_field, settings.wrapper );
            var filters = {};

            // define public interface
            return {
                list: list,
                detail: detail,
                find: find,
                inject: inject,
                update: update,
                create: create,
                filter: filter,
            };


            function list( config ) {

                var url = getUrl();
                var config = getConfig( config );

                var promise = ApiService.get( url, config )
                    .then( transformResponse )
                    .then( cache.update );

                var data = cache.list();

                return {
                    // promise: promise,
                    cache: data,
                }

            }


            function detail( id, config ) {

                var url = getUrl( id );
                var config = getConfig( config );

                var promise = ApiService.get( url, config )
                    .then( transformResponse )
                    .then( cache.update );

                var datum = cache.detail( id );

                return {
                    promise: promise,
                    cache: datum,
                }

            }


            // find() is like a soft detail(), meant for static views
            // it will get() a datum only if it's not cached yet
            // very much a convenience function, sans promise handling
            function find( id, config ) {

                var url = getUrl( id );
                var config = getConfig( config );
                var datum = cache.detail( id );

                // Enrich the datum with an extra property: track whether
                // it is just a stub, or if it contains server data.
                // See also: CacheFactory.Cache.updateDatum()
                if( !datum.initialized ) {

                    var promise = ApiService.get( url, config )
                        .then( transformResponse )
                        .then( cache.update );

                    // Necessary so as to avoid inifinite digest cycles.
                    datum.initialized = true;

                }

                return datum;

            }


            // inject() is an in-between of detail() and update()
            // it will update the cache without making a server call
            function inject( datum ) {

                return cache.update( datum );

            }


            function update( id, data, config ) {

                var url = getUrl( id );
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

                // Update all embedded resources before continuing...
                if( settings.embedded ) {

                    var promises = [];

                    settings.embedded.forEach( function( embed ) {

                        if( datum.dirty[embed.field] ) {

                            // Update each embedded object
                            datum.dirty[embed.field].forEach( function( resource ) {

                                var promise = $injector.get( embed.model ).update( resource ).promise;

                                // Add it to the promise queue for resolving
                                promises.push( promise );

                            });

                        }

                    });

                    // https://stackoverflow.com/questions/21759361/wait-for-all-promises-to-resolve
                    // TODO: Wait to update main model until all embedded resources have been saved
                    // TODO: Handle creation of new embedded resources + updating associations
                    $q.all( promises ).then( function() {
                        console.log( 'All embedded resources updated!' );
                    });

                }

                // Keeping this here for testing purposes...
                // return { promise: $q.reject( ) }

                var promise = ApiService.patch( url, data, config )
                    .then( transformResponse )
                    .then( cache.update );

                // Alert the user...
                // TODO: Don't alert the user if we are updating an embedded model!
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

                var promise = ApiService.post( url, data, config )
                    .then( transformResponse )
                    .then( cache.update );

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


            function getUrl( id ) {

                var url = [ settings.route, id ];

                return url.join('/');

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


            function transformResponse( response ) {

                // Determine if we need to unwrap the data
                if( settings.wrapper && response.data.hasOwnProperty( settings.wrapper ) ) {
                    response.data = response.data[ settings.wrapper ];
                }

                // Determine if we are transforming a list, or one datum
                if( response.data.constructor === Array ) {
                    transformResponseData( response.data );
                } else {
                    transformResponseDatum( response.data );
                }

                return response;

            }


            function transformResponseData( data ) {

                data.forEach( function( datum ) {

                    transformResponseDatum( datum )

                });

            }


            function transformResponseDatum( datum ) {

                // Map incoming fields into outgoing ones
                // Outgoing field names are the cannonical ones
                if( settings.mapped ) {

                    settings.mapped.forEach( function( map ) {

                        if( datum[map.incoming] ) {
                            datum[map.outgoing] = datum[map.incoming];
                            delete datum[map.incoming];
                        }

                    });

                }

                // Process embedded resources
                if( settings.embedded ) {

                    settings.embedded.forEach( function( embed ) {

                        // TODO: PATCH currently does not return embedded loc str
                        if( datum[embed.field] ) {

                            // Add each embedded object to its model's cache
                            datum[embed.field].forEach( function( resource ) {

                                // TODO: Ensure that the model exposes an inject method!
                                $injector.get( embed.model ).inject( resource );

                            });

                            // Replace the array of objects w/ array of ids
                            datum[embed.field] = datum[embed.field].map( function( resource ) {

                                // TODO: Account for id_field?
                                return resource.id;

                            });

                        }


                    });

                }

                return datum;

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