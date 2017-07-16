(function () {

    angular
        .module('app')
        .controller('ProjectsController',  Controller);

    Controller.$inject = ['ProjectService'];

    function Controller(ProjectService) {

        var vm = this;

        vm.projects = ProjectService.list().cache.clean;

        return vm;

    }

})();