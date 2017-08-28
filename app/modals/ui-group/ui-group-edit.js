(function () {

    angular
        .module('app')
        .controller('EditUiGroupController',  Controller);

    Controller.$inject = ['$uibModalInstance', 'id', 'UiGroupService', 'TagCategoryService', 'Notification'];

    function Controller($uibModalInstance, id, UiGroupService, TagCategoryService, Notification) {

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
            vm.group = UiGroupService.detail(id).cache.dirty;

        }

        function save() {

            vm.saving = true;

            // We decided that active should always be true
            vm.group.active = true;

            // The following fields cannot be adjusted via the edit modal:
            // `index` (drag to reorder)
            // `ui_mode` (inferred from mode toggle on Build UI screen)
            // `project_id` (inferred from currently open project)

            // TODO: Changing the tag_category should nuke related UI Items!

            UiGroupService.update( vm.group.id ).promise.then( function( response ) {

                Notification.success( { message: 'Changes saved!' } );

                $uibModalInstance.close();

            }).finally( function( response ) {

                vm.saving = false;

            });

        }

        function cancel() {

            $uibModalInstance.close();

        }

    }

})();