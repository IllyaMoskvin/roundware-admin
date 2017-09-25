(function () {

    angular
        .module('app')
        .controller('DefineTagsController',  Controller);

    Controller.$inject = ['TagService', 'TagCategoryService', 'ModalService', 'Notification'];

    function Controller(TagService, TagCategoryService, ModalService, Notification) {

        var vm = this;

        vm.categories = null;
        vm.tags = null;

        // Used to retrieve category names in table
        vm.getCategory = getCategory;

        vm.deleteTagCategory = deleteTagCategory;

        activate();

        return vm;

        function activate() {

            vm.categories = TagCategoryService.list().cache;
            vm.tags = TagService.list().cache;

        }

        function getCategory( category_id ) {

            return TagCategoryService.find( category_id ).cache.clean;

        }

        function deleteTagCategory( id ) {

            ModalService.open('tag-category-confirm-delete').result.then( function() {

                return TagCategoryService.delete( id ).promise;

            }).then( function() {

                // The Tag list needs to be refreshed to remove cascaded Tags
                // TODO: Remove them clientside immediately? There's a FOSS happening...
                return TagService.list().promise;

            }).then( function() {

                Notification.warning( { message: 'Tag Category deleted!' } );

            });

        }

    }

})();