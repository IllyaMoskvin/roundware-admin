(function () {

    angular
        .module('app')
        .controller('EditTagController',  Controller);

    Controller.$inject = ['$uibModalInstance', 'id', 'TagService', 'TagCategoryService'];

    function Controller($uibModalInstance, id, TagService, TagCategoryService) {

        var vm = this;

        vm.categories = null;
        vm.tag = null;

        vm.update = update;
        vm.cancel = cancel;

        activate();

        return vm;

        function activate() {

            vm.categories = TagCategoryService.list().cache;
            vm.tag = TagService.detail(id).cache.dirty;

        }

        function update() {

            TagService.update( vm.tag.id );

        }

        function cancel() {

            $uibModalInstance.close();

        }

    }

})();