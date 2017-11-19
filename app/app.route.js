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
            })
            .state('project.assets', {
                url: '/assets',
                templateUrl: 'states/authenticated/project/assets/assets.html',
                controller: 'AssetsController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-assets'
                }
            })
            // This must be above the looser-matching asset-edit definition
            .state('project.asset-new', {
                url: '/assets/new',
                templateUrl: 'states/authenticated/project/assets/asset/asset.html',
                controller: 'NewAssetController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-asset'
                }
            })
            // Inherits from project to use its ui-view, but belongs to assets
            .state('project.asset-edit', {
                url: '/assets/:asset_id',
                templateUrl: 'states/authenticated/project/assets/asset/asset.html',
                controller: 'EditAssetController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-asset'
                }
            })
            .state('project.audiotracks', {
                url: '/audiotracks',
                templateUrl: 'states/authenticated/project/audiotracks/audiotracks.html',
                controller: 'AudiotracksController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-audiotracks'
                }
            })
            .state('project.speakers', {
                url: '/speakers',
                templateUrl: 'states/authenticated/project/speakers/speakers.html',
                controller: 'SpeakersController',
                controllerAs: 'vm',
                data: {
                    cssClassnames: 'rw-state-speakers'
                }
            });

    }


    modals.$inject = ['ModalService'];

    function modals( ModalService ) {

        // http://angular-ui.github.io/bootstrap/#!#%2Fmodal
        ModalService
            // This one is an oddball, since it uses a state's template
            .modal('project-new', {
                templateUrl: 'states/authenticated/project/overview/overview.html',
                controller: 'NewProjectController',
                controllerAs: 'vm',
            })
            .modal('project-confirm-delete', {
                templateUrl: 'modals/project/confirm-delete.html',
                controller: 'ConfirmGenericController',
                controllerAs: 'vm',
            })
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
            .modal('tag-confirm-delete', {
                templateUrl: 'modals/tag/confirm-delete.html',
                controller: 'ConfirmGenericController',
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
            .modal('tag-category-confirm-delete', {
                templateUrl: 'modals/tag-category/confirm-delete.html',
                controller: 'ConfirmGenericController',
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
            })
            .modal('ui-group-confirm-reorder', {
                templateUrl: 'modals/ui-group/confirm-reorder.html',
                controller: 'ConfirmGenericController',
                controllerAs: 'vm',
            })
            .modal('asset-confirm-delete', {
                templateUrl: 'modals/asset/confirm-delete.html',
                controller: 'ConfirmGenericController',
                controllerAs: 'vm',
            })
            .modal('audiotrack-edit', {
                templateUrl: 'modals/audiotrack/audiotrack.html',
                controller: 'EditAudiotrackController',
                controllerAs: 'vm',
                params: [
                    'id'
                ]
            })
            .modal('audiotrack-new', {
                templateUrl: 'modals/audiotrack/audiotrack.html',
                controller: 'NewAudiotrackController',
                controllerAs: 'vm',
            })
            .modal('audiotrack-confirm-delete', {
                templateUrl: 'modals/audiotrack/confirm-delete.html',
                controller: 'ConfirmGenericController',
                controllerAs: 'vm',
            })
            .modal('speaker-edit', {
                templateUrl: 'modals/speaker/speaker.html',
                controller: 'EditSpeakerController',
                controllerAs: 'vm',
                params: [
                    'id'
                ]
            })
            .modal('speaker-new', {
                templateUrl: 'modals/speaker/speaker.html',
                controller: 'NewSpeakerController',
                controllerAs: 'vm',
            })
            .modal('speaker-confirm-delete', {
                templateUrl: 'modals/speaker/confirm-delete.html',
                controller: 'ConfirmGenericController',
                controllerAs: 'vm',
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
            base: 'http://localhost:8888',
            path: '/api/2/',
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