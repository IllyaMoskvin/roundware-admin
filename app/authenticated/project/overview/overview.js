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

            ProjectService.detail( $stateParams.id ).then(
                function( response ) {
                    vm.project = response.data;
                },
                function( response ) {
                    Notification.error( { message: 'Cannot retrieve project' } );
                }
            );

        }

        function update() {

            ProjectService.update( vm.project.project_id, {
                // TODO: Make a copy of the original and only send the updated fields
                name: vm.project.name
            }).then(
                function( response ) {
                    vm.project = response.data;
                },
                function( response ) {
                    Notification.error( { message: 'Cannot save project' } );
                }
            );

        }

    }

})();