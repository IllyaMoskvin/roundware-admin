(function () {

    angular
        .module('app')
        .controller('ProjectsController',  Controller);

    Controller.$inject = ['$state', 'ProjectService', 'ModalService', 'Notification'];

    function Controller($state, ProjectService, ModalService, Notification) {

        var vm = this;

        vm.projects = ProjectService.list().cache.clean;

        vm.addProjectHandler = addProjectHandler;
        vm.deleteProject = deleteProject;

        return vm;

        function addProjectHandler( promise ) {

            promise.result.then( function( project_id ) {

                $state.go('project.overview', { id: project_id } )

            });

        }

        function deleteProject( id ) {

            ModalService.open('project-confirm-delete').result.then( function() {

                return ProjectService.delete( id ).promise;

            }).then( function() {

                Notification.warning( { message: 'Project deleted!' } );

            });

        }

    }

})();