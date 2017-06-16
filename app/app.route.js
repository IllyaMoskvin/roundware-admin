(function () {

    angular
        .module('app')
        .config(routing)
        .config(notifications)
        .config(rejections)
        .run(modals)
        .run(services)
        .run(redirection);

    routing.$inject = ['$stateProvider', '$urlRouterProvider'];

    function routing( $stateProvider, $urlRouterProvider ) {

        // default route
        $urlRouterProvider.otherwise('/');

        // app routes
        $stateProvider
            .state('sandbox', {
                url: '/sandbox',
                templateUrl: 'sandbox/sandbox.html',
                controller: 'SandboxController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-sandbox'
                }
            })
            .state('root', {
                url: '/',
                redirectTo: 'projects',
            })
            .state('authenticate', {
                url: '/authenticate',
                templateUrl: 'authenticate/authenticate.html',
                controller: 'AuthenticateController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-authenticate'
                }
            })
            // Use as parent state to add topbar
            .state('authenticated', {
                abstract: true,
                // Omit URL so that it's not prepended to everything
                templateUrl: 'authenticated/authenticated.html',
                controller: 'AuthenticatedController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-authenticated'
                }
            })
            .state('projects', {
                url: '/projects',
                parent: 'authenticated',
                templateUrl: 'authenticated/projects/projects.html',
                controller: 'ProjectsController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-projects'
                }
            })
            // Use as parent to add sidebar
            // It uses `authenticated` as parent, so topbar will be there
            .state('project', {
                abstract: true,
                url: '/project/:id',
                parent: 'authenticated',
                templateUrl: 'authenticated/project/project.html',
                controller: 'ProjectController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-project'
                }
            })
            // If no :id is specified, redirect to projects list
            // This seems to match /project/:id as well
            .state('project-undefined', {
                url: '/project',
                redirectTo: 'projects',
            })
            .state('project.overview', {
                url: '/overview',
                templateUrl: 'authenticated/project/overview/overview.html',
                controller: 'OverviewController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-overview'
                }
            })
            .state('project.define-tags', {
                url: '/define-tags',
                templateUrl: 'authenticated/project/define-tags/define-tags.html',
                controller: 'DefineTagsController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-define-tags'
                }
            })
            // Not really meant to be entered directly... this should be a modal.
            .state('project.edit-tag', {
                url: '/tag/:tag_id',
                templateUrl: 'authenticated/project/edit-tag/edit-tag.html',
                controller: 'EditTagController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-edit-tag'
                },
                resolve: {
                    id: function($stateParams) {
                        return $stateParams.tag_id;
                    }
                }
            });

    }


    modals.$inject = ['ModalService'];

    function modals( ModalService ) {

        // http://angular-ui.github.io/bootstrap/#!#%2Fmodal
        ModalService
            .modal('tag', {
                templateUrl: 'authenticated/project/edit-tag/edit-tag.html',
                controller: 'EditTagController',
                controllerAs: 'vm',
                params: [
                    'id'
                ]
            });

    }


    notifications.$inject = ['NotificationProvider'];

    function notifications( NotificationProvider ) {

        NotificationProvider.setOptions({
            positionX: 'right',
            positionY: 'bottom',
        });

    }


    rejections.$inject = ['$qProvider'];

    function rejections( $qProvider ) {

        $qProvider.errorOnUnhandledRejections(false);

    }


    services.$inject = ['ApiService', 'AuthService'];

    function services( ApiService, AuthService ) {

        // TODO: Load config from file?
        ApiService.init({
            url: 'http://localhost:8888/api/2/',
        });

        AuthService.init({
            login: '/authenticate',
            public: ['/authenticate'],
            redirect: '/projects',
        });

    }


    redirection.$inject = ['$rootScope', '$state'];

    function redirection( $rootScope, $state ) {

        // Allows us to add redirects to routes via redirectTo
        // https://stackoverflow.com/a/29491412/1943591
        $rootScope.$on('$stateChangeStart', function( event, to, params ) {
            if( to.redirectTo ) {
                event.preventDefault();
                $state.go(to.redirectTo, params, {location: 'replace'})
            }
        });

    }

})();