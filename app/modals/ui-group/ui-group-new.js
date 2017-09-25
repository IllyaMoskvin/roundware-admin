(function () {

    angular
        .module('app')
        .controller('NewUiGroupController',  Controller);

    Controller.$inject = ['$uibModalInstance', '$stateParams', 'index', 'ui_mode', 'UiGroupService', 'TagCategoryService', 'Notification'];

    function Controller($uibModalInstance, $stateParams, index, ui_mode, UiGroupService, TagCategoryService, Notification) {

        var vm = this;

        vm.categories = null;
        vm.group = null;

        vm.cancel = cancel;
        vm.save = save;

        vm.saving = false;

        activate();

        return vm;

        function activate() {

            vm.categories = TagCategoryService.list().cache;
            vm.group = {
                project_id: $stateParams.id,
                index: index,
                ui_mode: ui_mode,
            };

        }

        function save() {

            vm.saving = true;

            UiGroupService.create( vm.group ).promise.then( function() {

                Notification.success( { message: 'Changes saved!' } );

                $uibModalInstance.close();

            }).finally( function() {

                vm.saving = false;

            });

        }

        function cancel() {

            $uibModalInstance.dismiss();

        }

    }

})();