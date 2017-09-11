(function () {

    angular
        .module('app')
        .controller('AudiotracksController',  Controller);

    Controller.$inject = ['AudiotrackService', 'Notification'];

    function Controller(AudiotrackService, Notification) {

        var vm = this;

        vm.audiotracks = null;

        vm.deleteAudiotrack = deleteAudiotrack;

        activate();

        return vm;

        function activate() {

            vm.audiotracks = AudiotrackService.list().cache;

        }

        function deleteAudiotrack( id ) {

            AudiotrackService.delete( id ).promise.then( function() {

                Notification.warning( { message: 'Audiotrack deleted!' } );

            });

        }

    }

})();