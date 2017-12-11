(function () {

    angular
        .module('app')
        .controller('AudiotracksController',  Controller);

    Controller.$inject = ['AudiotrackService', 'ModalService', 'Notification'];

    function Controller(AudiotrackService, ModalService, Notification) {

        var vm = this;

        vm.audiotracks = null;

        vm.getAudiotrack = getAudiotrack;
        vm.toggleRepeat = toggleRepeat;

        vm.deleteAudiotrack = deleteAudiotrack;

        activate();

        return vm;

        function activate() {

            vm.audiotracks = AudiotrackService.list().cache;

        }

        function getAudiotrack( audiotrack_id ) {

            return AudiotrackService.find( audiotrack_id ).cache;

        }

        function toggleRepeat( audiotrack_id, is_repeated ) {

            AudiotrackService.update( audiotrack_id, {

                'repeatrecordings': is_repeated,

            }).promise.then( function() {

                Notification.success( { message: 'Changes saved!' } );

            });

        }

        function deleteAudiotrack( id ) {

            ModalService.open('audiotrack-confirm-delete').result.then( function() {

                AudiotrackService.delete( id ).promise.then( function() {

                    Notification.warning( { message: 'Audiotrack deleted!' } );

                });

            });

        }

    }

})();