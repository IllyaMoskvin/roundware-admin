(function () {

    angular
        .module('app')
        .controller('EditTagController',  Controller);

    Controller.$inject = ['id', 'TagService', 'TagCategoryService'];

    function Controller(id, TagService, TagCategoryService) {

        var vm = this;

        vm.categories = null;
        vm.tag = null;

        vm.update = update;

        activate();

        return vm;

        function activate() {

            vm.categories = TagCategoryService.list().cache;
            vm.tag = TagService.detail(id).cache.dirty;

        }

        function update() {

            TagService.update( vm.tag.id );

        }

    }

})();