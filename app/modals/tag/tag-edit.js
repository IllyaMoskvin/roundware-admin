(function () {

    angular
        .module('app')
        .controller('EditTagController',  Controller);

    Controller.$inject = ['$uibModalInstance', 'id', 'TagService', 'TagCategoryService', 'Notification'];

    function Controller($uibModalInstance, id, TagService, TagCategoryService, Notification) {

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
            vm.tag = TagService.detail(id).cache.dirty;

        }

        function save() {

            vm.saving = true;

            TagService.update( vm.tag.id ).promise.then( function() {

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