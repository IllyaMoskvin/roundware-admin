(function () {

    angular
        .module('app.sandbox')
        .controller('SandboxController',  SandboxController);

    SandboxController.$inject = [];

    function SandboxController() {

        vm = this;

        vm.echo = "Hello World";

        return vm;

    };

})();