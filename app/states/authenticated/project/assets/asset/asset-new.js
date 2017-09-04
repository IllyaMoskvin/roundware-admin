(function () {

    angular
        .module('app')
        .controller('NewAssetController',  Controller);

    Controller.$inject = ['$q', '$stateParams', 'ApiService', 'GeocodeService', 'AssetService', 'TagService'];

    function Controller($q, $stateParams, ApiService, GeocodeService, AssetService, TagService) {

        var vm = this;

        // This is the object we'll be saving to server
        vm.asset = {

            project: $stateParams.id, // TODO: Change to project_id
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

        // Multi-select widget won't work if these start as null
        vm.selected_tags = [];
        vm.tags = [];

        // Serialize this into vm.asset on save()
        vm.marker = {
            focus: true,
            draggable: true,
            lat: 0,
            lng: 0,
        };

        // Leaflet configs: http://angular-ui.github.io/ui-leaflet/
        vm.leaflet = {
            center: {
                lat: 0,
                lng: 0,
                zoom: 6,
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
                'tags': TagService.list().promise,
            }).then( function( caches ) {

                vm.tags = caches.tags.clean;

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