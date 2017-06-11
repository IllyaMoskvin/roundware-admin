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

        vm.echo = echo;

        activate();

        return vm;

        function activate() {

            vm.categories = TagCategoryService.list();
            vm.tags = TagService.list();

        }

        function getCategory( category_id ) {

            return TagCategoryService.find( category_id ).clean;

        }

        function echo(row) {
            console.log(row);
        }

    }

})();