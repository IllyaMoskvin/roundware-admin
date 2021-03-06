(function () {

    angular
        .module('app')
        .controller('NewAssetController',  Controller);

    Controller.$inject = ['$scope', '$q', '$state', '$stateParams', 'leafletData', 'ApiService', 'GeocodeService', 'AssetService', 'ProjectService', 'LanguageService', 'Notification'];

    function Controller($scope, $q, $state, $stateParams, leafletData, ApiService, GeocodeService, AssetService, ProjectService, LanguageService, Notification) {

        var vm = this;

        // This is the object we'll be saving to server
        vm.asset = {

            project_id: $stateParams.id,
            session_id: 1, // Reserved admin session

            media_type: "audio", // Support more formats?

            // Needed for map
            latitude: 0,
            longitude: 0,

            // Needed to avoid NaN on slider widget
            weight: 50,

            // Select "Create new envelope" as default
            envelope_ids: 0,

            // For convenience?
            language_id: 1,
            submitted: true,
            volume: 1,

        };

        vm.map = null;
        vm.languages = null;

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

            $q.all({
                'map': leafletData.getMap('map'),
                'project': ProjectService.find( $stateParams.id ).promise,
                'languages': LanguageService.list().promise,
            }).then( function( results ) {

                vm.map = results.map;

                // Load info from the caches
                vm.languages = results.languages.clean;

                // TODO: Filter languages by project languages?

                // Pan map to marker, when its coordinates change
                // Triggering this for <input/> change requires `ng-change` attr
                $scope.$watchGroup( ['vm.marker.lat', 'vm.marker.lng'], centerMapOnMarker );

                // Center marker using project coordinates, map should follow
                vm.marker.lat = results.project.clean.latitude || 0;
                vm.marker.lng = results.project.clean.longitude || 0;

            });

        }

        function getFileUrl( path ) {

            // If path is relative: ApiService.getBaseUrl( path )
            // https://stackoverflow.com/a/17819167/1943591
            return path;

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

        function save() {

            // Start the saving process...
            vm.saving = true;

            // See AssetService for more details re: args & return
            AssetService.createEx({

                'asset': vm.asset,
                'marker': vm.marker,

                // Note that these reference elements via names, not ids
                'file': document.forms['asset']['file'].files[0],

            }).promise.then( function(cache) {

                // Open Edit Asset with the new asset's id
                $state.go('project.asset-edit', { asset_id: cache.id } );

                Notification.success( { message: 'Changes saved!' } );

            }, function(error) {

                // This is for validation errors in AssetService
                Notification.error( { message: error } );

            }).finally( function() {

                vm.saving = false;

            });

        }

    }

})();