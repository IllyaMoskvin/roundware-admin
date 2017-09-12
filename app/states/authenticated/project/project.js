(function () {

    angular
        .module('app')
        .controller('ProjectController',  Controller);

    Controller.$inject = ['$stateParams', 'ProjectService', 'TagService', 'UiGroupService', 'AssetService', 'AudiotrackService'];

    function Controller($stateParams, ProjectService, TagService, UiGroupService, AssetService, AudiotrackService) {

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

            AssetService.setDefaultParams({
                project_id: $stateParams.id
            });

            AudiotrackService.setDefaultParams({
                project_id: $stateParams.id
            });

        }

    }

})();