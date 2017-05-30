(function () {

    angular
        .module('app')
        .controller('ProjectController',  Controller);

    Controller.$inject = ['$stateParams', 'ProjectService', 'Notification'];

    function Controller($stateParams, ProjectService, Notification) {

        var vm = this;

        vm.project = null;

        activate();

        return vm;

        function activate() {

            ProjectService.detail( $stateParams.id ).then(
                function( response ) {
                    vm.project = response.data;
                },
                function( response ) {
                    Notification.error( { message: 'Cannot retrieve project' } );
                }
            );

        }

    }

})();