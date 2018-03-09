(function () {

    angular
        .module('app')
        .controller('AssetsController',  Controller);

    Controller.$inject = ['$scope', '$q', '$stateParams', 'ApiService', 'AssetService', 'TagService', 'ProjectService', 'LanguageService', 'ModalService', 'Notification'];

    function Controller($scope, $q, $stateParams, ApiService, AssetService, TagService, ProjectService, LanguageService, ModalService, Notification) {

        var vm = this;

        vm.assets = null;
        vm.tags = null;
        vm.languages = null;

        vm.pipe = pipe;

        // Controlled by our tag-multi-select
        // Defined here so we can watch it
        vm.search_tag_ids = null;

        vm.getFileUrl = getFileUrl;
        vm.getTag = getTag;
        vm.getLanguage = getLanguage;

        vm.getAsset = getAsset;
        vm.toggleSubmitted = toggleSubmitted;

        vm.deleteAsset = deleteAsset;

        activate();

        return vm;

        function activate() {

            $q.all({
                // This ensures our caches are preloaded before processing
                'languages': LanguageService.list().promise,
                'project': ProjectService.find( $stateParams.id ).promise,
                'tags': TagService.list().promise,
            }).then( function( caches ) {

                vm.tags = caches.tags.clean;

                // Filter languages by this project's languages
                vm.languages = caches.languages.clean.filter( function( language ) {
                    return caches.project.clean.language_ids.indexOf( parseInt( language.id ) ) > -1;
                });

                // Pipe is usually triggered on page load, but we want to wait until tags are ready
                // This will trigger it manually, via the stRefresh directive
                $scope.$broadcast('refreshTable');

            });

            // This directive requires us to manually trigger pipe
            $scope.$watch( 'vm.search_tag_ids', function( nv, ov ) {

                if( !vm.search_tag_ids ) {
                    return;
                }

                $scope.$broadcast('refreshTable');

            });

        }

        function pipe( tableState, tableCtrl ) {

            // Waiting until Tags are loaded to set vm.assets will
            // eliminate server request spam caused by getTag()
            if( !vm.tags ) {
                return;
            }

            // Start building our param array
            var params = {};

            // Parse out the filters from tableState
            var filters = angular.extend( {}, tableState.search.predicateObject );

            // `media_type` filter is used directly b/c it's a string

            // Sending an array doesn't work right, but comma-separated does
            filters.tag_ids = vm.search_tag_ids.join(',');

            // `language` filter is used directly b/c it's a string

            if( filters.submitted ) {

                // Convert string to boolean
                switch( filters.submitted ) {
                    case 'true':
                        filters.submitted = true;
                    break;
                    case 'false':
                        filters.submitted = false;
                    break;
                    default:
                        delete filters.submitted;
                    break;
                }

            }

            // Append filters to the params array
            params = angular.extend( params, filters );

            // Append pagination to the params array
            // Page size is set via st-items-by-page in assets.html
            params = angular.extend( params, {
                paginate: true,
                page_size: tableState.pagination.number,
                page: Math.floor( tableState.pagination.start / tableState.pagination.number ) + 1
            });

            // Run a paginated list query using our params
            AssetService.paginate({
                params: params
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

        function getLanguage( language_id ) {

            return LanguageService.find( language_id ).cache.clean;

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