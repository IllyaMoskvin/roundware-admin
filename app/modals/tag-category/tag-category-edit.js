(function () {

    angular
        .module('app')
        .controller('EditTagCategoryController',  Controller);

    Controller.$inject = ['$uibModalInstance', 'id', 'TagCategoryService', 'Notification'];

    function Controller($uibModalInstance, id, TagCategoryService, Notification) {

        var vm = this;

        vm.category = null;

        vm.cancel = cancel;
        vm.save = save;

        vm.saving = false;

        activate();

        return vm;

        function activate() {

            vm.category = TagCategoryService.detail(id).cache.dirty;

        }

        function save() {

            vm.saving = true;

            TagCategoryService.update( vm.category.id ).promise.then( function() {

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