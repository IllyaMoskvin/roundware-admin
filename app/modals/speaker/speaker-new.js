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

            // seed();

        }

        function save() {

            vm.saving = true;

            SpeakerService.create( vm.speaker ).promise.then( function( cache ) {

                Notification.success( { message: 'Changes saved!' } );

                $uibModalInstance.close( cache.id );

            }).finally( function() {

                vm.saving = false;

            });

        }

        function cancel() {

            $uibModalInstance.dismiss();

        }

        // Useful for testing the form. Call this in activate()
        function seed() {

            angular.extend( vm.speaker, {

                activeyn: true,
                code: 5,
                minvolume: 0,
                maxvolume: 1,
                uri: 'http://g.co',
                attenuation_distance: 10000,

            });

        }

    }

})();