(function () {

    angular
        .module('app')
        .controller('AssetController',  Controller);

    Controller.$inject = ['$q', '$stateParams', 'ApiService', 'AssetService', 'TagService'];

    function Controller($q, $stateParams, ApiService, AssetService, TagService) {

        var vm = this;

        vm.asset = null;
        vm.tags = null;

        vm.selected_tags = null;

        vm.getFileUrl = getFileUrl;
        vm.getTag = getTag;

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

            });

        }

        function getFileUrl( path ) {

            return ApiService.getBaseUrl( path );

        }

        function getTag( tag_id ) {

            return TagService.find( tag_id ).cache.clean;

        }

        function save() {

            // Serialize selected Tags back into the Asset
            vm.asset.tag_ids = vm.selected_tags.map( function( tag ) {
                return tag.id;
            });

            console.log( vm.asset.tag_ids );

        }

    }

})();