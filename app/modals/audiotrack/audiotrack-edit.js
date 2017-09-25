(function () {

    angular
        .module('app')
        .controller('EditAudiotrackController',  Controller);

    Controller.$inject = ['$uibModalInstance', 'id', 'AudiotrackService', 'Notification'];

    function Controller($uibModalInstance, id, AudiotrackService, Notification) {

        var vm = this;

        vm.audiotrack = null;

        vm.cancel = cancel;
        vm.save = save;

        vm.saving = false;

        activate();

        return vm;

        function activate() {

            vm.audiotrack = AudiotrackService.detail(id).cache.dirty;

        }

        function save() {

            vm.saving = true;

            AudiotrackService.update( vm.audiotrack.id ).promise.then( function() {

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