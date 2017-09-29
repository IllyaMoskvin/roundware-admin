(function () {

    angular
        .module('app')
        .controller('NewAssetController',  Controller);

    Controller.$inject = ['$scope', '$q', '$stateParams', 'leafletData', 'ApiService', 'GeocodeService', 'AssetService', 'ProjectService', 'TagService', 'LanguageService'];

    function Controller($scope, $q, $stateParams, leafletData, ApiService, GeocodeService, AssetService, ProjectService, TagService, LanguageService) {

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

            // For convenience?
            submitted: true,
            volume: 1,

        };

        vm.map = null;
        vm.languages = null;

        // Multi-select widget won't work if these start as null
        vm.selected_tags = [];
        vm.tags = [];

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

        vm.save = save;

        activate();

        return vm;

        function activate() {

            // Waiting until Tags are loaded to set vm.asset will
            // eliminate server request spam caused by getTag()

            $q.all({
                'map': leafletData.getMap('map'),
                'tags': TagService.list().promise,
                'project': ProjectService.find( $stateParams.id ).promise,
                'languages': LanguageService.list().promise,
            }).then( function( results ) {

                vm.map = results.map;

                // Load info from the caches
                vm.tags = results.tags.clean;
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

        function save() {

            // Serialize selected Tags back into the Asset
            vm.asset.tag_ids = vm.selected_tags.map( function( tag ) {
                return tag.id;
            });

            // Serialize Leaflet marker into the Asset
            vm.asset.latitude = vm.marker.lat;
            vm.asset.longitude = vm.marker.lng;

            console.log( vm.asset );

        }

    }

})();