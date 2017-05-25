(function () {

    angular
        .module('app')
        .config(routing)
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
            });

    }


    run.$inject = ['ApiService'];

    function run( ApiService ) {

        // TODO: Load config from file?
        ApiService.init({
            url: 'http://localhost:8888/api/2/',
        });

    }

})();