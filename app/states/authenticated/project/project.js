(function () {

    angular
        .module('app')
        .controller('ProjectController',  Controller);

    Controller.$inject = ['$stateParams', 'ProjectService', 'TagService', 'UiGroupService', 'AssetService', 'AudiotrackService', 'SpeakerService'];

    function Controller($stateParams, ProjectService, TagService, UiGroupService, AssetService, AudiotrackService, SpeakerService) {

        var vm = this;

        vm.project = ProjectService.detail( $stateParams.id ).cache.clean;

        activate();

        return vm;

        function activate() {

            var services = [
                AssetService,
                AudiotrackService,
                TagService,
                SpeakerService,
                UiGroupService,
            ];

            services.forEach( function( service ) {
                service.setDefaultParam('project_id', $stateParams.id );
            });

        }

    }

})();