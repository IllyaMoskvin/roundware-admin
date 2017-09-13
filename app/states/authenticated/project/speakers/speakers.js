(function () {

    angular
        .module('app')
        .controller('SpeakersController',  Controller);

    Controller.$inject = ['SpeakerService', 'Notification'];

    function Controller(SpeakerService, Notification) {

        var vm = this;

        vm.speakers = null;

        activate();

        return vm;

        function activate() {

            vm.speakers = SpeakerService.list().cache.dirty;

        }

    }

})();