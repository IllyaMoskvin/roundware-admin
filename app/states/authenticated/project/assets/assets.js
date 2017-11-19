(function () {

    angular
        .module('app')
        .controller('AssetsController',  Controller);

    Controller.$inject = ['$q', 'ApiService', 'AssetService', 'TagService', 'ModalService', 'Notification'];

    function Controller($q, ApiService, AssetService, TagService, ModalService, Notification) {

        var vm = this;

        vm.assets = null;

        vm.getFileUrl = getFileUrl;
        vm.getTag = getTag;

        vm.getAsset = getAsset;
        vm.toggleSubmitted = toggleSubmitted;

        vm.deleteAsset = deleteAsset;

        activate();

        return vm;

        function activate() {

            $q.all({
                'assets': AssetService.list().promise,
                'tags': TagService.list().promise,
            }).then( function( caches ) {

                // Waiting until Tags are loaded to set vm.assets will
                // eliminate server request spam caused by getTag()
                vm.assets = caches.assets.clean;

            });

        }

        function getFileUrl( path ) {

            return ApiService.getBaseUrl( path );

        }

        function getTag( tag_id ) {

            return TagService.find( tag_id ).cache.clean;

        }

        function getAsset( asset_id ) {

            return AssetService.find( asset_id ).cache;

        }

        function toggleSubmitted( asset_id, is_submitted ) {

            AssetService.update( asset_id, {

                'submitted': is_submitted,

            }).promise.then( function() {

                Notification.success( { message: 'Changes saved!' } );

            });

        }

        function deleteAsset( id ) {

            ModalService.open('asset-confirm-delete').result.then( function() {

                return AssetService.delete( id ).promise;

            }).then( function() {

                Notification.warning( { message: 'Asset deleted!' } );

            });

        }

    }

})();