(function () {

    angular
        .module('app')
        .controller('ProjectController',  Controller);

    Controller.$inject = ['$stateParams', 'ProjectService'];

    function Controller($stateParams, ProjectService) {

        var vm = this;

        vm.project = ProjectService.detail( $stateParams.id ).clean;

        return vm;

    }

})();