(function () {
    'use strict';

    angular
        .module('app')
        .factory('CacheFactory', Service);

    Service.$inject = ['$q'];

    function Service($q) {

        // CacheFactory allows data sharing across controllers.
        // Each resource service uses it via DataFactory.

        return {
            Cache: Cache,
        }

        function Cache( ) {

            // Each item in cache.both is { clean: {}, dirty: {} }
            // It is up to the view or the controller to choose one

            var cache = {
                clean: [],
                dirty: [],
                both: [],
            };

            return {
                list: list,
                detail: detail,
                update: update,
                delete: remove,
            };


            function list( ) {

                return cache;

            }


            function detail( id ) {

                var datum = getDatum( id, cache.both );

                if(!datum) {
                    datum = addDatum( id, cache.both );
                }

                return datum;

            }


            function update( input ) {

                // Determine if we are updating all data
                if( input.constructor === Array ) {
                    return updateData( input );
                }

                // Assume that otherwise, we're updating one datum
                return updateDatum( input );

            }


            function updateData( data ) {

                // Update cache for each datum present in the response
                angular.forEach( data, updateDatum );

                // Remove any cached datums that aren't present in the response
                // This assumes that list() returns the *entire* dataset for the resource
                filterInPlace( cache.both, filterDatum );
                filterInPlace( cache.clean, filterDatum );
                filterInPlace( cache.dirty, filterDatum );

                return cache;

                function filterDatum( oldDatum ) {

                    var matches = data.filter(function( newDatum ) {
                        return newDatum.id == oldDatum.id;
                    });

                    return matches.length > 0

                }

                // https://stackoverflow.com/questions/37318808
                function filterInPlace(a, condition, thisArg) {
                    var j = 0, squeezing = false;

                    a.forEach( function(e, i) {
                        if (condition.call(thisArg, e, i, a)) {
                            if (squeezing) a[j] = e;
                            j++;
                        } else squeezing = true;
                    });

                    a.length = j;
                    return a;
                }

            }


            function updateDatum( newDatum ) {

                // Find the datum in `cache.both` collection.
                // Get its `clean` and `dirty` sub-objects.
                // Replace their properties with those from the server.

                // This also updates datums in cache.clean and cache.dirty,
                // since they point to the same objects.

                var id = newDatum.id;
                var oldDatum = detail( id, cache.both );

                // http://davidcai.github.io/blog/posts/copy-vs-extend-vs-merge/
                angular.merge( oldDatum.clean, newDatum );
                angular.merge( oldDatum.dirty, newDatum );

                // See also: DataFactory.Collection.find()
                // Creates tight coupling, but prevents find() making server calls
                // after detail() or list() has been called, but not yet resolved.
                oldDatum.initialized = true;

                return oldDatum;

            }


            // Returns a promise!
            function remove( id ) {

                var deferred = $q.defer();

                // Cast id to int for comparison
                var id = parseInt( id );

                var result = {
                    clean: removeFrom( id, cache.clean ),
                    dirty: removeFrom( id, cache.dirty ),
                    both: removeFrom( id, cache.both ),
                };

                if( result.clean && result.dirty && result.both ) {
                    deferred.resolve( result );
                } else {
                    deferred.reject( result );
                }

                return deferred;

                function removeFrom( id, source ) {

                    for( var i = 0; i < source.length; i++ ) {
                        if( source[i].id == id ) {
                            source.splice(i, 1);
                            return true;
                        }
                    }

                    return false;

                }

            }


            function getDatum( id, source ) {

                // Cast id to int for comparison
                var id = parseInt( id );

                // Search for existing datum
                for( var i = 0; i < source.length; i++ ) {

                    // Assumes that id is set on all items
                    if( source[i].id == id ) {

                        return source[i];

                    }

                }

                return null;

            }


            function addDatum( id, source ) {

                id = parseInt( id );

                var clean = {};
                var dirty = {};
                var both = {
                    clean: clean,
                    dirty: dirty,
                };

                // TODO: Account for custom id fields?
                clean.id = id;
                dirty.id = id;
                both.id = id;

                cache.clean.push( clean );
                cache.dirty.push( dirty );
                cache.both.push( both );

                // Figure out what to return
                switch( source ) {

                    case cache.clean:
                        return clean;
                    break;

                    case cache.dirty:
                        return dirty;
                    break;

                    default:
                        return both;
                    break;

                }

            }

        }

    }

})();