(function () {

    angular
        .module('app')
        .controller('ProjectController',  Controller);

    Controller.$inject = ['$stateParams', 'ProjectService', 'TagService', 'UiGroupService'];

    function Controller($stateParams, ProjectService, TagService, UiGroupService) {

        var vm = this;

        vm.project = ProjectService.detail( $stateParams.id ).cache.clean;

        activate();

        return vm;

        function activate() {

            TagService.setDefaultParams({
                project_id: $stateParams.id
            });

            UiGroupService.setDefaultParams({
                project_id: $stateParams.id
            });

        }

    }

})();