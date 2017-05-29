(function () {

    angular
        .module('app')
        .controller('AuthenticatedController',  Controller);

    Controller.$inject = ['AuthService'];

    function Controller(AuthService) {

        var vm = this;

        vm.username = AuthService.getUsername();
        vm.logout = AuthService.logout;

        return vm;

    }

})();