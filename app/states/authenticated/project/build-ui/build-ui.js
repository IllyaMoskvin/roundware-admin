(function () {

    angular
        .module('app')
        .controller('BuildUiController',  Controller);

    Controller.$inject = ['$scope', '$q', 'UiGroupService', 'UiItemService', 'TagCategoryService', 'TagService', 'Notification'];

    function Controller($scope, $q, UiGroupService, UiItemService, TagCategoryService, TagService, Notification) {

        var vm = this;

        vm.ui_groups = null;
        vm.ui_items = null;

        vm.categories = null;
        vm.tags = null;

        // Dedicated arrays for the trees
        vm.groupTree = [];
        vm.itemTree = [];

        // Options for the trees
        vm.groupTreeOptions = {
            // TODO: Prevent UI Items from being dropped here
            dropped: groupTreeDropped,
            beforeDrag: beforeDrag,
        };

        vm.itemTreeOptions = {
            accept: itemTreeAccept,
            dropped: itemTreeDropped,
            beforeDrag: beforeDrag,
        };

        // TODO: Avoid hard-coding this, serverside?
        vm.ui_modes = [
            {
                label: 'Speak',
                value: 'speak',
            },
            {
                label: 'Listen',
                value: 'listen',
            },
        ];

        // Currently active mode
        vm.mode = vm.ui_modes[1].value;

        vm.saving = false;

        activate();

        return vm;


        function activate() {

            $scope.$watch( 'vm.ui_groups', nestGroups, true );
            $scope.$watch( 'vm.ui_items', nestItems, true );

            $scope.$watch( 'vm.mode', nestBoth, true );

            // Load tags first to avoid duplicate server calls
            // TODO: Loading tag categories first may also help
            var tagRequest = TagService.list();
            var categoryRequest = TagCategoryService.list();

            // TODO: Refactor this to be cleaner
            $q.all([
                tagRequest.promise,
                categoryRequest.promise,
            ]).then( function() {

                vm.tags = tagRequest.cache.clean;
                vm.categories = categoryRequest.cache.clean;

                var groupRequest = UiGroupService.list();

                groupRequest.promise.then( function() {

                    vm.ui_groups = groupRequest.cache.clean;
                    vm.ui_items = UiItemService.list().cache.clean;

                });

            });

            // Desired load order: tag categories, tags, groups, items
            // TODO: Modify DataFactory to return cache on list() resolve

        }


        function nestBoth() {

            nestGroups();
            nestItems();

        }


        function nestGroups() {

            // Do nothing if there are pending requests
            if( vm.saving ) {
                return;
            }

            // Do nothing if there's nothing to parse
            if( !vm.ui_groups || vm.ui_groups.length < 1 ) {
                return;
            }

            // Cloning is necessary to avoid triggering $watch
            var groups = angular.merge([], vm.ui_groups);

            // Filter groups by currently active ui mode
            groups = groups.filter( function( group ) {
                return group.ui_mode == vm.mode;
            });

            // Sort groups by their indexes
            groups.sort( function( a, b ) {
                return a.index - b.index;
            });

            // Add tag_category (titles) to ease rendering
            groups.forEach( function( group ) {
                group.tag_category = TagCategoryService.find( group.tag_category_id ).clean;
            });

            // Update the tree for rendering
            vm.groupTree = groups;

        }


        function nestItems() {

            // Do nothing if there are pending requests
            if( vm.saving ) {
                return;
            }

            // Do nothing if there's nothing to parse
            if( !vm.ui_items || vm.ui_items.length < 1 ) {
                return;
            }

            // Cloning is necessary to avoid triggering $watch
            var items = angular.merge([], vm.ui_items);

            // Filter items by currently active ui groups.
            // Since nestGroups() has been called first,
            // groupTree should be filtered by ui mode already
            // TODO: Don't use groupTree directly? Use filtered ui groups.
            items = items.filter( function( item ) {

                var groups = vm.groupTree.filter( function( group ) {
                    return group.id == item.ui_group_id;
                });

                return groups.length > 0;

            });

            // Add the groups to items for reference
            items.forEach( function( item, index ) {

                var group = UiGroupService.find( item.ui_group_id ).clean;

                // Copy the group to avoid modifying original
                // TODO: Does this interfere w/ binding re: edits of groups
                item.group = angular.merge({}, group);

            });

            // Sort items by (1) its group's index, (2) its own index
            items.sort( function( a, b ) {

                if( a.group.index == b.group.index ) {
                    return a.index - b.index;
                }

                return a.group.index - b.group.index;

            });

            // Add tag (titles) to ease rendering
            items.forEach( function( item ) {
                item.tag = TagService.find( item.tag_id ).clean;
            });

            // Convert from flat to nested
            var nested = flat2nested( items );

            // nested becomes undefined if the array is empty
            // This resets tree if the last item is deleted
            vm.itemTree = nested ? nested.nodes : [];

        }


        function beforeDrag( event ) {

            // Prevent dragging if there's an ongoing server operation
            return !vm.saving;

        }


        // We want to allow UI Items to be re-ordered w/in their heirarchy,
        // but not be moved outside of their "cannonical" parent (UI Item)
        function itemTreeAccept( sourceNodeScope, destNodesScope, destIndex ) {

            // TODO: Prevent UI Groups from being dropped here

            var parent_id = sourceNodeScope.$modelValue.parent_id;

            var dest_id = destNodesScope.$element.attr('data-parent-id') || null;

            return parent_id == dest_id;

        }

        // We ensured that the item can only be dropped within its parent
        // Now, we need to reorder all of that parent-node's children
        function itemTreeDropped( event ) {

            // Do nothing if the position hasn't changed
            if( event.dest.index == event.source.index ) {
                return;
            }

            var nodes = event.dest.nodesScope.childNodes();

            // Intermediate step to gather up the data we need
            var items = nodes.map( function( node ) {

                return {
                    id: node.$modelValue.id,
                    index: node.index(),
                }

            });

            // Save the UI Items to server
            vm.saving = true;

            var promises = items.map( function( item ) {

                return UiItemService.update( item.id, {

                    // Roundware's indexes are 1-based
                    index: item.index + 1

                }).promise;

            });

            // Alert the user on success
            $q.all( promises ).then( function() {

                Notification.success( { message: 'Changes saved!' } );

            }).finally( function() {

                vm.saving = false;

            });

        }


        function groupTreeDropped( event ) {

            // Do nothing if the position hasn't changed
            if( event.dest.index == event.source.index ) {
                return;
            }

            var nodes = event.dest.nodesScope.childNodes();

            // Intermediate step to gather up the data we need
            var groups = nodes.map( function( node ) {

                return {
                    id: node.$modelValue.id,
                    index: node.index(),
                }

            });

            console.log( JSON.stringify( groups ) );

            // TODO: Add modal to confirm reorder
            // TODO: Save new indexes to server
            // TODO: Delete all *relevant* UI Items on reorder

        }


        // Adapted from https://stackoverflow.com/a/31715170/1943591
        function flat2nested( array ){

            var map = {};

            array.forEach( function( obj ) {

                if(!(obj.id in map)) {
                    map[obj.id] = obj;
                    map[obj.id].nodes = [];
                }

                // TODO: Figure out how this works? Fixes unsorted.
                if(typeof map[obj.id].id == 'undefined'){
                    map[obj.id] = angular.merge( map[obj.id], obj );
                }

                var parent = obj.parent_id || '-';

                if(!(parent in map)){
                    map[parent] = {};
                    map[parent].nodes = [];
                }

                map[parent].nodes.push( map[obj.id] );

            });

            return map['-'];

        }

    }

})();