(function () {

    angular
        .module('app')
        .controller('NewTagController',  Controller);

    Controller.$inject = ['$uibModalInstance', 'TagService', 'TagCategoryService'];

    function Controller($uibModalInstance, TagService, TagCategoryService) {

        var vm = this;

        vm.categories = null;
        vm.tag = null;

        vm.cancel = cancel;
        vm.save = save;

        vm.saving = false;

        activate();

        return vm;

        function activate() {

            vm.categories = TagCategoryService.list().cache;
            vm.tag = {};

        }

        function save() {

            vm.saving = true;

            TagService.create( vm.tag ).then( function() {

                $uibModalInstance.close();

            }).finally( function() {

                vm.saving = false;

            });

        }

        function cancel() {

            $uibModalInstance.close();

        }

    }

})();