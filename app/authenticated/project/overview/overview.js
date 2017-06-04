(function () {

    angular
        .module('app')
        .controller('OverviewController',  Controller);

    Controller.$inject = ['$stateParams', 'ProjectService', 'Notification'];

    function Controller($stateParams, ProjectService, Notification) {

        var vm = this;

        vm.project = null;
        vm.update = update;

        activate();

        return vm;

        function activate() {

            vm.project = ProjectService.detail( $stateParams.id ).dirty;

        }

        function update() {

            ProjectService.update( vm.project.project_id );

        }

    }

})();