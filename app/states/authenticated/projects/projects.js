(function () {

    angular
        .module('app')
        .controller('ProjectsController',  Controller);

    Controller.$inject = ['$state', 'ProjectService'];

    function Controller($state, ProjectService) {

        var vm = this;

        vm.projects = ProjectService.list().cache.clean;

        vm.addProjectHandler = addProjectHandler;

        return vm;

        function addProjectHandler( promise ) {

            promise.result.then( function( project_id ) {

                $state.go('project.overview', { id: project_id } )

            });

        }

    }

})();