(function () {

    angular
        .module('app')
        .controller('AssetController',  Controller);

    Controller.$inject = ['$q', '$stateParams', 'ApiService', 'GeocodeService', 'AssetService', 'TagService'];

    function Controller($q, $stateParams, ApiService, GeocodeService, AssetService, TagService) {

        var vm = this;

        vm.asset = null;
        vm.tags = null;

        vm.selected_tags = null;

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
                'asset': AssetService.find( $stateParams.asset_id ).promise,
                'tags': TagService.list().promise,
            }).then( function( caches ) {

                vm.asset = caches.asset.dirty;
                vm.tags = caches.tags.clean;

                // Find Tags assoc. w/ this asset
                vm.selected_tags = vm.tags.filter( function( tag ) {
                    return vm.asset.tag_ids.includes( tag.id );
                });

                // Update the marker to match the Asset's coordinates
                vm.leaflet.center.lat = vm.marker.lat = vm.asset.latitude;
                vm.leaflet.center.lng = vm.marker.lng = vm.asset.longitude;

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

            console.log( vm.asset.tag_ids );

            // Serialize Leaflet marker into the Asset
            vm.asset.latitude = vm.marker.lat;
            vm.asset.longitude = vm.marker.lng;

            console.log( vm.asset.latitude, vm.asset.longitude );

        }

    }

})();