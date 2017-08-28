(function () {

    angular
        .module('app')
        .controller('ConfirmGenericController',  Controller);

    Controller.$inject = ['$uibModalInstance'];

    function Controller($uibModalInstance) {

        var vm = this;

        vm.cancel = cancel;
        vm.confirm = confirm;

        return vm;

        function confirm() {

            $uibModalInstance.close( true );

        }

        function cancel() {

            $uibModalInstance.dismiss();

        }

    }

})();