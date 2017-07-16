(function () {

    angular
        .module('app')
        .controller('AuthenticateController',  AuthenticateController);

    AuthenticateController.$inject = ['AuthService', 'Notification'];

    function AuthenticateController(AuthService, Notification) {

        var vm = this;

        vm.login = login;

        return vm;

        function login() {

            vm.loading = true;

            AuthService.login( vm.username, vm.password, function( result ) {

                if( result === true ) {

                    Notification.success( { message: 'Login successful!' } );

                    // AuthService redirects users to wherever they were trying to access

                } else {
                    Notification.error( { message: 'Incorrect credentials' } );
                }

                vm.loading = false;

            });

        };

    }

})();