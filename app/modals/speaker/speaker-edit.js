(function () {

    angular
        .module('app')
        .controller('EditSpeakerController',  Controller);

    Controller.$inject = ['$uibModalInstance', 'id', 'SpeakerService', 'Notification'];

    function Controller($uibModalInstance, id, SpeakerService, Notification) {

        var vm = this;

        vm.speaker = null;

        vm.cancel = cancel;
        vm.save = save;

        vm.saving = false;

        activate();

        return vm;

        function activate() {

            vm.speaker = SpeakerService.detail(id).cache.dirty;

        }

        function save() {

            vm.saving = true;

            SpeakerService.update( vm.speaker.id ).promise.then( function() {

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