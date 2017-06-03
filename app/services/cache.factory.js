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

            // TODO: Two arrays vs. array of { clean: {}, dirty: {} }
            var clean = [];
            var dirty = [];

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


            function list( editable ) {

                return editable ? dirty : clean;

            }


            function detail( id, editable ) {

                return getDatum( id, editable ? dirty : clean );

            }


            function updateData( data ) {

                angular.forEach( data, function( datum, i ) {

                    updateDatum( datum );

                });

                return data;

            }


            function updateDatum( newDatum ) {

                // Find the datum in both the clean and dirty data collections
                // Replace its properties with those from the server
                var id = newDatum[ ID_FIELD ];

                var cleanDatum = getDatum( id, clean );
                var dirtyDatum = getDatum( id, dirty );

                angular.extend( cleanDatum, newDatum );
                angular.extend( dirtyDatum, newDatum );

                return newDatum;

            }


            function getDatum( id, cache ) {

                // Ensure id is an integer
                id = parseInt( id );

                // Search for existing datum
                for( var i = 0; i < cache.length; i++ ) {

                    if( cache[i][ ID_FIELD ] == id ) {
                        return cache[i];
                    }

                }

                // Otherwise, add dummy to cache
                var dummy = {};

                // Blank slate is just {id: id}
                dummy[ ID_FIELD ] = id;

                cache.push( dummy );
                return dummy;

            }

        }

    }

})();