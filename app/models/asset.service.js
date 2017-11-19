(function () {
    'use strict';

    angular
        .module('app')
        .factory('AssetService', Service);

    Service.$inject = ['$q', '$stateParams', 'DataFactory', 'EnvelopeService', 'SessionService', 'ProjectService'];

    function Service($q, $stateParams, DataFactory, EnvelopeService, SessionService, ProjectService) {

        var collection = new DataFactory.Collection({
            route: 'assets',
            refresh: true,
            mapped: [
                {
                    incoming: 'loc_description_admin',
                    stored: 'loc_description',
                    outgoing: 'description_loc_ids',
                },
                {
                    incoming: 'loc_alt_text_admin',
                    stored: 'loc_alt_text',
                    outgoing: 'loc_alt_text',
                },
            ],
            embedded: [
                {
                    field: 'loc_description',
                    model: 'LocalizedStringService',
                    delete: true,
                },
                {
                    field: 'loc_alt_text',
                    model: 'LocalizedStringService',
                    delete: true,
                },
            ],
        });

        // Assets require some custom pre-processing
        var custom = {
            updateEx: updateEx,
            createEx: createEx,
        };

        // Return all methods from collection, some overwritten w/ custom
        return angular.merge( {}, collection, custom );


        // Important! Note that AssetService's updateEx() and createEx() expect `params`,
        // which is *quite* different from other ModelServices. They are fairly
        // implementation-dependent, e.g. `marker` corresponds to a Leaflet marker.
        // This is done to reduce code duplication b/w New- and EditAssetControllers


        // These params are required by both update() and create()
        function validateSaveParams( params ) {

            var deferred = $q.defer();

            var failed = false;

            var required = [
                'asset',
                'marker',
                'tags',
            ];

            required.forEach( function( param ) {

                if( typeof params[param] === 'undefined' ) {
                    deferred.reject('Missing required param in AssetService save attempt: ' + param);
                    failed = true;
                }

            });

            // Redundant, but without the if, this will fail silently
            if( typeof params.marker !== 'undefined' ) {

                if( typeof params.marker.lat === 'undefined' ) {
                    deferred.reject('Missing marker latitude');
                    failed = true;
                }

                if( typeof params.marker.lng === 'undefined' ) {
                    deferred.reject('Missing marker longitude');
                    failed = true;
                }

            }

            if( !failed ) {
                deferred.resolve();
            }

            return deferred.promise;

        }


        // create() also expects `file` param
        function validateCreateParams( params ) {

            var deferred = $q.defer();

            var failed = false;

            if( typeof params.file === 'undefined' ) {

                deferred.reject( 'Please select a file to upload' );
                failed = true;

            } else {

                // Validate that `media_type` matches selected file
                // https://stackoverflow.com/questions/29805909
                var mime_type = params.file['type'].split('/')[0];

                if(
                    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
                    ( params.asset.media_type === 'audio' && mime_type !== 'audio' ) ||
                    ( params.asset.media_type === 'photo' && mime_type !== 'image' ) ||
                    ( params.asset.media_type === 'video' && mime_type !== 'video' ) ||
                    ( params.asset.media_type === 'text' && mime_type !== 'text' )
                ) {

                    deferred.reject( 'File does not match selected Media Type' );
                    failed = true;

                }

            }

            if( !failed ) {
                deferred.resolve();
            }

            return deferred.promise;

        }


        // This "overwrites" the collection's update() method
        function updateEx( params ) {

            // Validate shared params
            // Start building promise chain
            var promise = validateSaveParams( params );

            // Define this after validating that the asset param is set
            var datum = collection.find( params.asset.id );

            // Run shared transformations
            promise = promise.then( function() {
                return prepareSaveRequest( params );
            });

            // Update-specific calls go here
            promise = promise.then( function( asset ) {

                // Null out the file field: we aren't uploading stuff
                asset.file = undefined;

                return collection.update( asset.id, asset ).promise;

            });

            return {
                promise: promise,
                cache: datum,
            };

        }


        // This "overwrites" the collection's create() method
        function createEx( params, config ) {

            // Start a promise chain
            var promise = $q.when(true);

            // Run shared param validation
            promise = promise.then( function() {
                return validateSaveParams( params );
            });

            // Run create-specific param validation
            promise = promise.then( function() {
                return validateCreateParams( params );
            });

            // This is the original, "cached" datum
            // We might not use it for anything, it's here for parity
            // Define this after validating that the asset param is set
            var datum = params.asset;

            // Run shared transformations
            promise = promise.then( function() {
                return prepareSaveRequest( params );
            });

            // Create-specific calls go here
            promise = promise.then( function( asset ) {

                // Append our file
                asset.file = params.file;

                // TODO: envelope_ids[] is not accepted for create call
                // Fix server to expect envelope_ids, not envelope_id
                asset.envelope_id = asset.envelope_ids[0];
                delete asset.envelope_ids;

                // https://stackoverflow.com/questions/16483873/angularjs-http-post-file-and-form-data
                return collection.create( asset, {
                    headers: {
                        // AngularJS defaults to application/json; charset=utf-8
                        // Setting this to `undefined` allows it to send reasonable defaults
                        // i.e. multipart/form-data; boundary= [webkit stuff here]
                        'Content-Type': undefined
                    },
                    transformRequest: function (data, headersGetter) {

                        var formData = new FormData();

                        angular.forEach(data, function (value, key) {

                            // https://stackoverflow.com/questions/16104078
                            if( value.constructor === Array ) {
                                value.forEach( function( item ) {
                                    formData.append( key + '[]', item );
                                });
                            } else {
                                formData.append( key, value );
                            }

                        });

                        // TODO: Fix server to accept and return description ids in a consistent format:
                        // `partial_update` expects `description_loc_ids` to be an array, but
                        // `create` expects them to be a comma-searated string...
                        // See c. L628 of api.py
                        if( typeof data.description_loc_ids !== 'undefined' ) {
                            formData.set( 'description_loc_ids', data.description_loc_ids.join(',') );
                        }

                        // Ditto for tag ids. See c. L619 of api.py
                        if( typeof data.tag_ids !== 'undefined' ) {
                            formData.set( 'tag_ids', data.tag_ids.join(',') );
                        }

                        return formData;

                    }
                }).promise;

            });

            return {
                promise: promise,
                cache: datum,
            };

        }


        // Shared logic b/w create() and update()
        function prepareSaveRequest( params ) {

            // Start building promise chain
            var promise = $q.when(true);

            // Normalize envelope ids
            promise = promise.then( function() {

                return getEnvelopeId( params.asset.envelope_ids );

            });

            // Process the asset using other params
            promise = promise.then( function( envelope_ids ) {

                var asset = angular.merge( {}, params.asset );

                // Add the correct(ed) envelope_ids
                asset.envelope_ids = envelope_ids;

                // Serialize multi-selected Tags back into the Asset
                asset.tag_ids = params.tags.map( function( tag ) {
                    return tag.id;
                });

                // Serialize Leaflet marker into the Asset
                asset.latitude = params.marker.lat;
                asset.longitude = params.marker.lng;

                return asset;

            });

            return promise;

        }


        // Because we might be making a new Envelope, this returns a promise
        function getEnvelopeId( envelope_ids ) {

            var deferred = $q.defer();

            // Envelope <select/> accepts an array, but returns an int
            // If the `numeric` directive is missing, it'll return a string
            // We need to serialize it back into an array
            if( envelope_ids.constructor !== Array ) {

                // Special case for creating new Envelope
                if( envelope_ids == 0 ) {

                    // Create new "admin" session assoc. w/ this project
                    SessionService.create({

                        project_id: $stateParams.id,

                    }).promise.then( function( cache ) {

                        // Create Envelope assoc. w/ this session
                        return EnvelopeService.create({

                            session_id: cache.id,

                        }).promise;

                    }).then( function( cache ) {

                        // Resolve w/ this new Envelope's id
                        deferred.resolve( cache.id );

                    });

                } else {

                    // It's probably an int or a string, return it back
                    deferred.resolve( envelope_ids );

                }

            // If the form is submitted w/o changing the <select/>, it remains an array, not an int
            } else {

                // Normalize Asset to belong to only one Envelope
                deferred.resolve( envelope_ids[0] );

            }

            // This is where we wrap the id in an array
            var promise = deferred.promise.then( function( envelope_id ) {

                return [ envelope_id ];

            });

            return promise;

        }

    }

})();