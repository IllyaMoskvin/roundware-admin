(function () {

    angular
        .module('app')
        .controller('NewProjectController',  Controller);

    Controller.$inject = ['$uibModalInstance', 'ProjectService', 'LanguageService', 'Notification'];

    function Controller($uibModalInstance, ProjectService, LanguageService, Notification) {

        var vm = this;

        vm.project = null;
        vm.languages = null;

        vm.cancel = cancel;
        vm.save = save;

        vm.showCancel = true;

        vm.saving = false;

        activate();

        return vm;

        function activate() {

            vm.project = {};

            vm.languages = LanguageService.list().cache.clean;

            // seed();

        }

        function save() {

            vm.saving = true;

            ProjectService.create( vm.project ).promise.then( function( cache ) {

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

            vm.project = {
                name: 'Fee',
                pub_date: '2017-09-11T23:34:36',
                latitude: 0,
                longitude: 0,
                language_ids: [1],
                max_recording_length: 30,
                recording_radius: 2000,
                out_of_range_distance: 10000,
                audio_stream_bitrate: '96',
                sharing_url: 'http://g.co',
                out_of_range_url: 'http://g.co',
                repeat_mode: 'continuous',
                ordering: 'by_weight',
                audio_format: 'mp3',
            };

        }

    }

})();