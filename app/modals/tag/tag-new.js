(function () {

    angular
        .module('app')
        .controller('NewTagController',  Controller);

    Controller.$inject = ['$uibModalInstance', '$stateParams', 'TagService', 'TagCategoryService', 'Notification'];

    function Controller($uibModalInstance, $stateParams, TagService, TagCategoryService, Notification) {

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
            vm.tag = {
                project_id: $stateParams.id,
            };

        }

        function save() {

            vm.saving = true;

            TagService.create( vm.tag ).promise.then( function() {

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