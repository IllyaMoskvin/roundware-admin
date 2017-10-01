(function () {

    angular
        .module('app')
        .controller('EditAssetController',  Controller);

    Controller.$inject = ['$scope', '$q', '$stateParams', 'leafletData', 'ApiService', 'GeocodeService', 'AssetService', 'TagService', 'LanguageService', 'EnvelopeService', 'Notification'];

    function Controller($scope, $q, $stateParams, leafletData, ApiService, GeocodeService, AssetService, TagService, LanguageService, EnvelopeService, Notification) {

        var vm = this;

        vm.asset = null;
        vm.tags = null;
        vm.languages = null;
        vm.envelopes = null;

        vm.selected_tags = null;

        // Serialize this into vm.asset on save()
        vm.marker = {
            focus: true,
            draggable: true,
            lat: 0,
            lng: 0,
            icon: {
                type: 'awesomeMarker',
                icon: 'glyphicon-volume-up',
                markerColor: 'blue'
            }
        };

        // Leaflet configs: http://angular-ui.github.io/ui-leaflet/
        vm.leaflet = {
            center: {
                lat: 0,
                lng: 0,
                zoom: 17,
            },
            defaults: {
                scrollWheelZoom: false,
            },
            markers: {
                asset: vm.marker,
            },
        };

        // Helper functions for rendering in view
        vm.getFileUrl = getFileUrl;
        vm.getTag = getTag;

        // Helpers for setting coordinates + updating map
        vm.setLocation = setLocation;
        vm.resetLocation = resetLocation;
        vm.centerMapOnMarker = centerMapOnMarker;

        // Container for geocoding related stuff
        vm.geocode = {
            search: geocode,
            query: null,
            results: [],
        };

        vm.saving = false;

        vm.save = save;

        activate();

        return vm;

        function activate() {

            // Waiting until Tags are loaded to set vm.asset will
            // eliminate server request spam caused by getTag()

            $q.all({
                'map': leafletData.getMap('map'),
                'asset': AssetService.find( $stateParams.asset_id ).promise,
                'tags': TagService.list().promise,
                'languages': LanguageService.list().promise,
                'envelopes': EnvelopeService.list().promise,
            }).then( function( results ) {

                vm.map = results.map;

                // Load info from the caches
                vm.asset = results.asset.dirty;
                vm.tags = results.tags.clean;
                vm.languages = results.languages.clean;
                vm.envelopes = results.envelopes.clean;

                // TODO: Filter languages by project languages?

                // Find Tags assoc. w/ this asset
                vm.selected_tags = vm.tags.filter( function( tag ) {
                    return vm.asset.tag_ids.includes( tag.id );
                });

                // Pan map to marker, when its coordinates change
                // Triggering this for <input/> change requires `ng-change` attr
                $scope.$watchGroup( ['vm.marker.lat', 'vm.marker.lng'], centerMapOnMarker );

                // Update the marker to match the Asset's coordinates
                resetLocation();

            });

        }

        function getFileUrl( path ) {

            return ApiService.getBaseUrl( path );

        }

        function getTag( tag_id ) {

            return TagService.find( tag_id ).cache.clean;

        }

        function setLocation( lat, lng ) {

            vm.leaflet.center.lat = vm.marker.lat = parseFloat( lat );
            vm.leaflet.center.lng = vm.marker.lng = parseFloat( lng );

        }

        function resetLocation( ) {

            return setLocation( vm.asset.latitude, vm.asset.longitude );

        }

        function centerMapOnMarker( ) {

            vm.map.panTo( new L.LatLng( vm.marker.lat, vm.marker.lng ) );

        }

        function geocode( ) {

            GeocodeService.get( vm.geocode.query ).then( function( results ) {
                return vm.geocode.results = results;
            });

        }

        // TODO: Abstract some of this into AssetService
        function save() {

            vm.saving = true;

            // Because we might be making a new Envelope, this returns a promise
            var promise = getEnvelopeId( vm.asset.envelope_ids );

            // Wait until we have our envelope(s), then save
            promise.then( function( envelope_ids ) {

                var asset = angular.merge( {}, vm.asset );

                // Add the correct(ed) envelope_ids
                asset.envelope_ids = envelope_ids;

                // Serialize selected Tags back into the Asset
                asset.tag_ids = vm.selected_tags.map( function( tag ) {
                    return tag.id;
                });

                // Serialize Leaflet marker into the Asset
                asset.latitude = vm.marker.lat;
                asset.longitude = vm.marker.lng;

                // Null out the file field: we aren't uploading stuff
                asset.file = undefined;

                // TODO: Remove this once things are stable
                console.log( asset );

                return AssetService.update( vm.asset.id, asset ).promise;

            }).then( function() {

                Notification.success( { message: 'Changes saved!' } );

            }).finally( function() {

                vm.saving = false;

            });

        }

        function getEnvelopeId( envelope_ids ) {

            var deferred = $q.defer();

            // Envelope <select/> accepts an array, but returns an int
            // We need to serialize it back into an array
            if( envelope_ids.constructor !== Array ) {

                // Special case for creating new Envelope
                if( vm.asset.envelope_ids == 0 ) {

                    // TODO: Use project-specific admin sessions
                    EnvelopeService.create({

                        session_id: 1,

                    }).promise.then( function( cache ) {

                        deferred.resolve( cache.id );

                    });

                } else {

                    // It's an int or a string, return it back
                    deferred.resolve( envelope_ids );

                }

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