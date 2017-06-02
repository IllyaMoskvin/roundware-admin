(function () {

    angular
        .module('app')
        .controller('ProjectController',  Controller);

    Controller.$inject = ['$stateParams', 'ProjectService', 'Notification'];

    function Controller($stateParams, ProjectService, Notification) {

        var vm = this;

        vm.project = ProjectService.detail( $stateParams.id );

        return vm;

    }

})();