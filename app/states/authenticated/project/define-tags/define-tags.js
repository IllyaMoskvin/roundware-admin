(function () {

    angular
        .module('app')
        .controller('DefineTagsController',  Controller);

    Controller.$inject = ['TagService', 'TagCategoryService'];

    function Controller(TagService, TagCategoryService) {

        var vm = this;

        vm.categories = null;
        vm.tags = null;

        // Used to retrieve category names in table
        vm.getCategory = getCategory;

        activate();

        return vm;

        function activate() {

            vm.categories = TagCategoryService.list().cache;
            vm.tags = TagService.list().cache;

        }

        function getCategory( category_id ) {

            return TagCategoryService.find( category_id ).cache.clean;

        }

    }

})();