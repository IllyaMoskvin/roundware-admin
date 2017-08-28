(function () {

    angular
        .module('app')
        .controller('AssetController',  Controller);

    Controller.$inject = ['$q', '$stateParams', 'ApiService', 'AssetService', 'TagService'];

    function Controller($q, $stateParams, ApiService, AssetService, TagService) {

        var vm = this;

        vm.asset = null;

        vm.getFileUrl = getFileUrl;
        vm.getTag = getTag;

        activate();

        return vm;

        function activate() {

            $q.all({
                'asset': AssetService.find( $stateParams.asset_id ).promise,
                'tags': TagService.list().promise,
            }).then( function( caches ) {

                // Waiting until Tags are loaded to set vm.asset will
                // eliminate server request spam caused by getTag()
                vm.asset = caches.asset.dirty;

            });

        }

        function getFileUrl( path ) {

            return ApiService.getBaseUrl( path );

        }

        function getTag( tag_id ) {

            return TagService.find( tag_id ).cache.clean;

        }

    }

})();