(function () {

    angular
        .module('app')
        .config(routing)
        .config(notifications)
        .run(run);

    routing.$inject = ['$stateProvider', '$urlRouterProvider'];

    function routing( $stateProvider, $urlRouterProvider ) {

        // default route
        $urlRouterProvider.otherwise('/');

        // app routes
        $stateProvider
            .state('sandbox', {
                url: '/',
                templateUrl: 'sandbox/sandbox.html',
                controller: 'SandboxController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-sandbox'
                }
            })
            .state('authenticate', {
                url: '/authenticate',
                templateUrl: 'authenticate/authenticate.html',
                controller: 'AuthenticateController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-authenticate'
                }
            });

    }


    notifications.$inject = ['NotificationProvider'];

    function notifications( NotificationProvider ) {

        NotificationProvider.setOptions({
            positionX: 'right',
            positionY: 'bottom',
        });

    }


    run.$inject = ['ApiService', 'AuthService'];

    function run( ApiService, AuthService ) {

        // TODO: Load config from file?
        ApiService.init({
            url: 'http://localhost:8888/api/2/',
        });

        AuthService.init({
            login: '/authenticate',
            public: ['/authenticate'],
            redirect: '/',
        });

    }

})();