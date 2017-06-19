(function () {

    angular
        .module('app')
        .controller('OverviewController',  Controller);

    Controller.$inject = ['$stateParams', 'ProjectService'];

    function Controller($stateParams, ProjectService) {

        var vm = this;

        vm.project = null;
        vm.update = update;

        activate();

        return vm;

        function activate() {

            vm.project = ProjectService.detail( $stateParams.id ).cache.dirty;

        }

        function update() {

            ProjectService.update( vm.project.id );

        }

    }

})();