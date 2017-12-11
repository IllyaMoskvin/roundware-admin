(function () {

    angular
        .module('app')
        .controller('AssetsController',  Controller);

    Controller.$inject = ['$scope', '$q', 'ApiService', 'AssetService', 'TagService', 'ModalService', 'Notification'];

    function Controller($scope, $q, ApiService, AssetService, TagService, ModalService, Notification) {

        var vm = this;

        vm.assets = null;
        vm.tags = null;

        vm.pipe = pipe;

        vm.getFileUrl = getFileUrl;
        vm.getTag = getTag;

        vm.getAsset = getAsset;
        vm.toggleSubmitted = toggleSubmitted;

        vm.deleteAsset = deleteAsset;

        activate();

        return vm;

        function activate() {

            TagService.list().promise.then( function( cache ) {

                vm.tags = cache.clean;

                // Pipe is usually triggered on page load, but we want to wait until tags are ready
                // This will trigger it manually, via the stRefresh directive
                $scope.$broadcast('refreshTable');

            });

        }

        function pipe( tableState, tableCtrl ) {

            // Waiting until Tags are loaded to set vm.assets will
            // eliminate server request spam caused by getTag()
            if( !vm.tags ) {
                return;
            }

            // Page size is set via st-items-by-page in assets.html

            AssetService.paginate({
                params: {
                    paginate: true,
                    page_size: tableState.pagination.number,
                    page: Math.floor( tableState.pagination.start / tableState.pagination.number ) + 1
                }
            }).promise.then( function( data ) {

                vm.assets = data.cache.clean;

                tableState.pagination.totalItemCount = data.meta.count;
                tableState.pagination.numberOfPages = Math.ceil( data.meta.count / tableState.pagination.number );

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