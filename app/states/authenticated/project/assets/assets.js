(function () {

    angular
        .module('app')
        .controller('AssetsController',  Controller);

    Controller.$inject = ['$q', 'ApiService', 'AssetService', 'TagService'];

    function Controller($q, ApiService, AssetService, TagService) {

        var vm = this;

        vm.assets = null;

        vm.getFileUrl = getFileUrl;
        vm.playAudio = playAudio;
        vm.getTag = getTag;

        activate();

        return vm;

        function activate() {

            $q.all({
                'assets': AssetService.list().promise,
                'tags': TagService.list().promise,
            }).then( function( caches ) {

                // Waiting until Tags are loaded to set vm.assets will
                // eliminate server request spam caused by getTag()
                vm.assets = caches.assets.clean;

            });

        }

        function getFileUrl( path ) {

            return ApiService.getBaseUrl( path );

        }

        // TODO: This is terrible and should be replaced
        function playAudio( file ) {

            var audio = new Audio( getFileUrl( file ) );
            audio.play();

        }

        function getTag( tag_id ) {

            return TagService.find( tag_id ).cache.clean;

        }

    }

})();