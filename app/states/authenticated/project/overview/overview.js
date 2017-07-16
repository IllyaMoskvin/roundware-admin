(function () {

    angular
        .module('app')
        .controller('OverviewController',  Controller);

    Controller.$inject = ['$stateParams', 'ProjectService', 'LanguageService'];

    function Controller($stateParams, ProjectService, LanguageService) {

        var vm = this;

        vm.project = null;
        vm.languages = null;

        vm.update = update;

        activate();

        return vm;

        function activate() {

            vm.project = ProjectService.detail( $stateParams.id ).cache.dirty;
            vm.languages = LanguageService.list().cache.clean;

        }

        function update() {

            ProjectService.update( vm.project.id );

        }

    }

})();