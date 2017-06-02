(function () {

    angular
        .module('app')
        .controller('ProjectsController',  Controller);

    Controller.$inject = ['ProjectService', 'Notification'];

    function Controller(ProjectService, Notification) {

        var vm = this;

        vm.projects = ProjectService.list();

        return vm;

    }

})();