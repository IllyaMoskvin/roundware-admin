(function () {
    'use strict';

    angular
        .module('app')
        .factory('CacheFactory', Service);

    Service.$inject = [];

    function Service() {

        // CacheFactory allows data sharing across controllers.
        // It should be injected into each resource service.
        // Then, create a new instance of Cache, like so:
        //
        //     var cache = new CacheFactory.Cache('id');
        //
        // Be sure to swap 'id' for the actual id field, e.g. project_id
        // In each of the resource's CRUD methods, chain...
        //
        //     .then( cache.update, cache.error )
        //
        // ...after calling the relevant ApiService method, and...
        //
        //     return cache.list( editable )
        //     return cache.detail( editable )
        //
        // ...in those CRUD methods.

        return {
            Cache: Cache,
        }

        function Cache( ID_FIELD ) {

            // For some resources, this could be e.g. project_id
            // We are treating it as a constant, essentially.
            ID_FIELD = ID_FIELD || 'id';

            // Each item in cache is { clean: {}, dirty: {} }
            // It is up to the view or the controller to choose one
            var cache = []

            return {
                update: update,
                error: error,
                list: list,
                detail: detail,
            };

            function update( response ) {

                // Determine we are updating all data
                if( response.data.constructor === Array ) {
                    return updateData( response.data );
                }

                // Assume that otherwise, we're updating one datum
                return updateDatum( response.data );

            }


            function error( response ) {

                console.error( 'Unable to update cache' );

                return response;

            }


            function list( ) {

                return cache;

            }


            function detail( id ) {

                return getDatum( id );

            }


            function updateData( data ) {

                angular.forEach( data, function( datum, i ) {

                    updateDatum( datum );

                });

                return cache;

            }


            function updateDatum( newDatum ) {

                // Find the datum in both the clean and dirty data collections
                // Replace its properties with those from the server
                var id = newDatum[ ID_FIELD ];

                var oldDatum = getDatum( id );

                angular.extend( oldDatum.clean, newDatum );
                angular.extend( oldDatum.dirty, newDatum );

                return newDatum;

            }


            function getDatum( id ) {

                // Ensure id is an integer
                id = parseInt( id );

                // Search for existing datum
                for( var i = 0; i < cache.length; i++ ) {

                    if( cache[i].id == id ) {
                        return cache[i];
                    }

                }

                // Otherwise, add dummy to cache
                var dummy = {
                    id: id,
                    clean: {},
                    dirty: {},
                };

                cache.push( dummy );
                return dummy;

            }

        }

    }

})();