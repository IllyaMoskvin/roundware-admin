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
            .state('root', {
                url: '/',
                redirectTo: 'projects',
            })
            .state('authenticate', {
                url: '/authenticate',
                templateUrl: 'states/authenticate/authenticate.html',
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
                templateUrl: 'states/authenticated/authenticated.html',
                controller: 'AuthenticatedController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-authenticated'
                }
            })
            .state('projects', {
                url: '/projects',
                parent: 'authenticated',
                templateUrl: 'states/authenticated/projects/projects.html',
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
                templateUrl: 'states/authenticated/project/project.html',
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
                templateUrl: 'states/authenticated/project/overview/overview.html',
                controller: 'OverviewController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-overview'
                }
            })
            .state('project.define-tags', {
                url: '/define-tags',
                templateUrl: 'states/authenticated/project/define-tags/define-tags.html',
                controller: 'DefineTagsController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-define-tags'
                }
            })
            .state('project.organize-tags', {
                url: '/organize-tags',
                templateUrl: 'states/authenticated/project/organize-tags/organize-tags.html',
                controller: 'OrganizeTagsController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-organize-tags'
                }
            })
            .state('project.build-ui', {
                url: '/build-ui',
                templateUrl: 'states/authenticated/project/build-ui/build-ui.html',
                controller: 'BuildUiController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-build-ui'
                }
            });

    }


    modals.$inject = ['ModalService'];

    function modals( ModalService ) {

        // http://angular-ui.github.io/bootstrap/#!#%2Fmodal
        ModalService
            .modal('tag-edit', {
                templateUrl: 'modals/tag/tag.html',
                controller: 'EditTagController',
                controllerAs: 'vm',
                params: [
                    'id'
                ]
            })
            .modal('tag-new', {
                templateUrl: 'modals/tag/tag.html',
                controller: 'NewTagController',
                controllerAs: 'vm',
            })
            .modal('tag-category-edit', {
                templateUrl: 'modals/tag-category/tag-category.html',
                controller: 'EditTagCategoryController',
                controllerAs: 'vm',
                params: [
                    'id'
                ]
            })
            .modal('tag-category-new', {
                templateUrl: 'modals/tag-category/tag-category.html',
                controller: 'NewTagCategoryController',
                controllerAs: 'vm',
            })
            .modal('ui-group-edit', {
                templateUrl: 'modals/ui-group/ui-group.html',
                controller: 'EditUiGroupController',
                controllerAs: 'vm',
                params: [
                    'id'
                ]
            })
            .modal('ui-group-new', {
                templateUrl: 'modals/ui-group/ui-group.html',
                controller: 'NewUiGroupController',
                controllerAs: 'vm',
                params: [
                    'index',
                    'ui_mode',
                ]
            })
            .modal('ui-items-add-to-item', {
                templateUrl: 'modals/ui-items-add/ui-items-add.html',
                controller: 'AddItemsToItemController',
                controllerAs: 'vm',
                params: [
                    'parent_ui_item',
                ]
            })
            .modal('ui-items-add-to-group', {
                templateUrl: 'modals/ui-items-add/ui-items-add.html',
                controller: 'AddItemsToGroupController',
                controllerAs: 'vm',
                params: [
                    'ui_group',
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