(function () {

    angular
        .module('app')
        .controller('AudiotracksController',  Controller);

    Controller.$inject = ['AudiotrackService', 'ModalService', 'Notification'];

    function Controller(AudiotrackService, ModalService, Notification) {

        var vm = this;

        vm.audiotracks = null;

        vm.deleteAudiotrack = deleteAudiotrack;

        activate();

        return vm;

        function activate() {

            vm.audiotracks = AudiotrackService.list().cache;

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