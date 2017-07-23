(function () {

    angular
        .module('app')
        .controller('OrganizeTagsController', Controller);

    Controller.$inject = ['TagService', 'TagCategoryService', 'TagRelationshipService'];

    function Controller(TagService, TagCategoryService, TagRelationshipService) {

        var vm = this;

        vm.relationships = null;
        vm.categories = null;
        vm.tags = null;

        activate();

        return vm;

        function activate() {

            vm.relationships = TagRelationshipService.list().cache;
            vm.categories = TagCategoryService.list().cache;
            vm.tags = TagService.list().cache;

        }

    }

})();