(function () {

    angular
        .module('app')
        .controller('NewAudiotrackController',  Controller);

    Controller.$inject = ['$uibModalInstance', '$stateParams', 'AudiotrackService', 'Notification'];

    function Controller($uibModalInstance, $stateParams, AudiotrackService, Notification) {

        var vm = this;

        vm.audiotrack = null;

        vm.cancel = cancel;
        vm.save = save;

        vm.saving = false;

        activate();

        return vm;

        function activate() {

            vm.audiotrack = {
                project_id: $stateParams.id,
            };

        }

        function save() {

            vm.saving = true;

            AudiotrackService.create( vm.audiotrack ).promise.then( function() {

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