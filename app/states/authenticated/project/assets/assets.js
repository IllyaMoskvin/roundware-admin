(function () {

    angular
        .module('app')
        .controller('AssetsController',  Controller);

    Controller.$inject = ['AssetService'];

    function Controller(AssetService) {

        var vm = this;

        vm.assets = null;

        activate();

        return vm;

        function activate() {

            vm.assets = AssetService.list().cache.clean;

        }

    }

})();