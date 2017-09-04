(function () {

    angular
        .module('app')
        .controller('AudiotracksController',  Controller);

    Controller.$inject = ['AudiotrackService'];

    function Controller(AudiotrackService) {

        var vm = this;

        vm.audiotracks = null;

        activate();

        return vm;

        function activate() {

            vm.audiotracks = AudiotrackService.list().cache;

        }

    }

})();