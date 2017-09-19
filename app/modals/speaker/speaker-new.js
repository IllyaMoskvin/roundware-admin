(function () {

    angular
        .module('app')
        .controller('NewSpeakerController',  Controller);

    Controller.$inject = ['$uibModalInstance', '$stateParams', 'SpeakerService', 'Notification'];

    function Controller($uibModalInstance, $stateParams, SpeakerService, Notification) {

        var vm = this;

        vm.speaker = null;

        vm.cancel = cancel;
        vm.save = save;

        vm.saving = false;

        activate();

        return vm;

        function activate() {

            vm.speaker = {
                project_id: $stateParams.id,
            };

        }

        function save() {

            vm.saving = true;

            SpeakerService.create( vm.speaker ).promise.then( function() {

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