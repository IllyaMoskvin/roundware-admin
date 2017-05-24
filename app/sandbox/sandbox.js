(function () {

    angular
        .module('app')
        .controller('SandboxController',  SandboxController);

    SandboxController.$inject = [];

    function SandboxController() {

        var vm = this;

        vm.echo = "Hello World";

        return vm;

    };

})();