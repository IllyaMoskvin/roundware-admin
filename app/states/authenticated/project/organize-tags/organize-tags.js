(function () {

    angular
        .module('app')
        .controller('OrganizeTagsController', Controller);

    Controller.$inject = ['$scope', 'TagService', 'TagCategoryService', 'TagRelationshipService', 'Notification'];

    function Controller($scope, TagService, TagCategoryService, TagRelationshipService, Notification) {

        var vm = this;

        vm.relationships = null;
        vm.categories = null;
        vm.tags = null;

        // Only the relationship tree needs a dedicated array
        vm.tree = [];

        // Even though nodes will be dropped into relationships,
        // beforeDrop for tags needs to be configured on the tag tree
        vm.tagTreeOptions = {
            beforeDrag: beforeDrag,
            beforeDrop: tagBeforeDrop,
        };

        vm.relationshipTreeOptions = {
            beforeDrag: beforeDrag,
        };

        vm.getTag = getTag;

        vm.saving = false;

        activate();

        return vm;


        function activate() {

            $scope.$watch( 'vm.relationships', nestRelationships, true );

            // Load tags first to avoid duplicate server calls
            var request = TagService.list();

            request.promise.then( function() {

                vm.tags = request.cache.clean;
                vm.categories = TagCategoryService.list().cache.clean;
                vm.relationships = TagRelationshipService.list().cache.clean;

            });

        }


        function getTag( tag_id ) {

            return TagService.find( tag_id ).clean;

        }


        function nestRelationships( items, old ) {

            if( !items ) {
                return;
            }

            // Let's make tag accessible directly
            // This should make it easier to access the tag's loc strs
            items.forEach( function( item, index ) {
                item.tag = vm.getTag( item.tag_id );
            });

            // Convert from flat to nested
            var nested = convert( items );

            // TODO: Determine what causes this?
            if( typeof nested !== 'undefined' ) {

                vm.tree = nested.nodes;

                console.log( vm.tree );
            }

        }


        function beforeDrag( event ) {

            // Prevent dragging if there's an ongoing server operation
            return !vm.saving;

        }


        function tagBeforeDrop( event ) {

            var relationship = {};

            // Determine which tree was the destination
            var dest = event.dest.nodesScope.$treeScope.$element.attr('id');

            // Ignore if the node was dropped in the tags tree
            if( dest == 'rw-tree-tags' ) {
                return false;
            }

            // Determine dest parent node + set parent_id accordingly.
            // If node is being dropped directly into the root of the tree,
            // parent_id will be set to undefined due to absence of data attr.
            relationship.parent_id = event.dest.nodesScope.$element.attr('data-parent-id');

            // Get tag info from event.source.cloneModel
            relationship.tag_id = event.source.cloneModel.id;

            console.log( relationship );

            // Save the tag relationship to server
            vm.saving = true;

            TagRelationshipService.create( relationship ).promise.then( function() {

                Notification.success( { message: 'Changes saved!' } );

            }).finally( function() {

                vm.saving = false;

            });

            // TODO: Prevent drop if that tag has already been nested under the destination?

            // TODO: Temporarily add the relationship to the destination?
            // event.source.cloneModel = relationship;

            // TODO: If so, set dest.index to the last position?
            // event.dest.index = event.dest.nodesScope.childNodes().length - 1;

            return false;

        }


        // Adapted from https://stackoverflow.com/a/31715170/1943591
        function convert( array ){
            var map = {};
            for(var i = 0; i < array.length; i++) {

                // Cloning is necessary to avoid triggering $watch
                var obj = angular.merge({}, array[i]);

                if(!(obj.id in map)){
                    map[obj.id] = obj;
                    map[obj.id].nodes = [];
                }

                // TODO: This appears to be dead code?
                if(typeof map[obj.id].id == 'undefined'){
                    map[obj.id].id = obj.id;
                    map[obj.id].tag_id = obj.tag_id;
                    map[obj.id].parent_id = obj.parent_id;
                    // console.log( map[obj.id] );
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