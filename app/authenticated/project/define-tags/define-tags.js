(function () {

    angular
        .module('app')
        .controller('DefineTagsController',  Controller);

    Controller.$inject = ['TagService', 'TagCategoryService'];

    function Controller(TagService, TagCategoryService) {

        var vm = this;

        vm.categories = null;
        vm.tags = null;

        vm.TagCategoryService = TagCategoryService;

        activate();

        return vm;

        function activate() {

            vm.categories = TagCategoryService.list();
            vm.tags = TagService.list();

        }

    }

})();