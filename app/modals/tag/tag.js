(function () {

    angular
        .module('app')
        .controller('TagController',  Controller);

    Controller.$inject = ['$uibModalInstance', 'id', 'TagService', 'TagCategoryService'];

    function Controller($uibModalInstance, id, TagService, TagCategoryService) {

        var vm = this;

        vm.categories = null;
        vm.tag = null;

        vm.update = update;
        vm.cancel = cancel;

        vm.updating = false;

        activate();

        return vm;

        function activate() {

            vm.categories = TagCategoryService.list().cache;
            vm.tag = TagService.detail(id).cache.dirty;

        }

        function update() {

            vm.updating = true;

            TagService.update( vm.tag.id ).promise.then( function() {

                $uibModalInstance.close();

            }).finally( function() {

                vm.updating = false;

            });

        }

        function cancel() {

            $uibModalInstance.close();

        }

    }

})();