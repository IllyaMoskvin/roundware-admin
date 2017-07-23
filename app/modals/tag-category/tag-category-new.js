(function () {

    angular
        .module('app')
        .controller('NewTagCategoryController',  Controller);

    Controller.$inject = ['$uibModalInstance', 'TagCategoryService', 'Notification'];

    function Controller($uibModalInstance, TagCategoryService, Notification) {

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

            TagCategoryService.create( vm.category ).promise.then( function() {

                Notification.success( { message: 'Changes saved!' } );

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