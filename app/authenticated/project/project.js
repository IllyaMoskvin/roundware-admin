(function () {

    angular
        .module('app')
        .controller('ProjectController',  Controller);

    Controller.$inject = ['$stateParams', 'ProjectService', 'TagService'];

    function Controller($stateParams, ProjectService, TagService) {

        var vm = this;

        vm.project = ProjectService.detail( $stateParams.id ).cache.clean;

        activate();

        return vm;

        function activate() {

            TagService.filter({
                project_id: $stateParams.id
            });

        }

    }

})();