(function () {

    angular
        .module('app')
        .controller('NewTagCategoryController',  Controller);

    Controller.$inject = ['$uibModalInstance', 'TagCategoryService'];

    function Controller($uibModalInstance, TagCategoryService) {

        var vm = this;

        vm.category = null;

        vm.cancel = cancel;
        vm.save = save;

        vm.saving = false;

        activate();

        return vm;

        function activate() {

            vm.category = {};

        }

        function save() {

            vm.saving = true;

            TagCategoryService.create( vm.category ).then( function() {

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