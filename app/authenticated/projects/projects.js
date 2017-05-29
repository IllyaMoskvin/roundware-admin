(function () {

    angular
        .module('app')
        .controller('ProjectsController',  Controller);

    Controller.$inject = ['ProjectService', 'Notification'];

    function Controller(ProjectService, Notification) {

        var vm = this;

        vm.projects = [];

        activate();

        return vm;

        function activate() {

            ProjectService.list().then(
                function( response ) {
                    vm.projects = response.data;
                },
                function( response ) {
                    Notification.error( { message: 'Cannot retrieve projects' } );
                }
            );

        }

    }

})();