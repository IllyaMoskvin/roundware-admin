(function () {

    angular
        .module('app')
        .controller('OrganizeTagsController', Controller);

    Controller.$inject = ['$scope', 'TagService', 'TagCategoryService', 'TagRelationshipService'];

    function Controller($scope, TagService, TagCategoryService, TagRelationshipService) {

        var vm = this;

        vm.relationships = null;
        vm.categories = null;
        vm.tags = null;

        vm.tree = [];

        vm.getTag = getTag;

        activate();

        return vm;


        function activate() {

            $scope.$watch( 'vm.relationships', nestRelationships, true );

            vm.relationships = TagRelationshipService.list().cache.clean;
            vm.categories = TagCategoryService.list().cache.clean;
            vm.tags = TagService.list().cache.clean;

        }


        function getTag( tag_id ) {

            return TagService.find( tag_id ).clean;

        }


        function nestRelationships( items, old ) {

            var nested = convert( items );

            if( typeof nested !== 'undefined' ) {

                vm.tree = nested.nodes;

                console.log( vm.tree );
            }

        }


        // Adapted from https://stackoverflow.com/a/31715170/1943591
        function convert( array ){
            var map = {};
            for(var i = 0; i < array.length; i++) {
                var obj = array[i];
                if(!(obj.id in map)){
                    map[obj.id] = obj;
                    map[obj.id].nodes = [];
                }

                if(typeof map[obj.id].id == 'undefined'){
                    map[obj.id].id = obj.id;
                    map[obj.id].tag_id = obj.tag_id;
                    map[obj.id].parent_id = obj.parent_id;
                }

                var parent = obj.parent_id || '-';
                if(!(parent in map)){
                    map[parent] = {};
                    map[parent].nodes = [];
                }

                map[parent].nodes.push(map[obj.id]);
            }
            return map['-'];
        }

    }

})();