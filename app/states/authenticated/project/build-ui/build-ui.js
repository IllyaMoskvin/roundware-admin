(function () {

    angular
        .module('app')
        .controller('BuildUiController',  Controller);

    Controller.$inject = [];

    function Controller() {

        var vm = this;

        // TODO: Avoid hard-coding this, serverside?
        vm.ui_modes = [
            {
                label: 'Speak',
                value: 'speak',
            },
            {
                label: 'Listen',
                value: 'listen',
            },
        ];

        // Currently active mode
        vm.mode = vm.ui_modes[0].value;

        activate();

        return vm;

        function activate() {

        }

    }

})();