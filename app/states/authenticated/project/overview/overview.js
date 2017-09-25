(function () {

    angular
        .module('app')
        .controller('OverviewController',  Controller);

    Controller.$inject = ['$stateParams', 'ProjectService', 'LanguageService', 'Notification'];

    function Controller($stateParams, ProjectService, LanguageService, Notification) {

        var vm = this;

        vm.project = null;
        vm.languages = null;

        vm.showOptional = true;

        vm.save = save;

        activate();

        return vm;

        function activate() {

            vm.project = ProjectService.detail( $stateParams.id ).cache.dirty;
            vm.languages = LanguageService.list().cache.clean;

        }

        function save() {

            ProjectService.update( vm.project.id ).promise.then( function() {
                Notification.success( { message: 'Changes saved!' } );
            });

        }

    }

})();