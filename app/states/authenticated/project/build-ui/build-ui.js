(function () {

    angular
        .module('app')
        .controller('BuildUiController',  Controller);

    Controller.$inject = ['$scope', '$q', 'UiGroupService', 'UiItemService', 'TagCategoryService', 'TagService', 'Notification'];

    function Controller($scope, $q, UiGroupService, UiItemService, TagCategoryService, TagService, Notification) {

        var vm = this;

        vm.categories = null;
        vm.tags = null;

        vm.ui_groups = null;
        vm.ui_items = null;

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

        // Track the highest index among displayed UI Groups
        // Used for hiding the `ui-items-add-to-item` button
        vm.max_index = null;

        vm.deleteGroup = deleteGroup;
        vm.deleteItem = deleteItem;

        vm.saving = false;

        activate();

        return vm;


        function activate() {

            $scope.$watch( 'vm.ui_groups', nestGroups, true );
            $scope.$watch( 'vm.ui_items', nestItems, true );

            $scope.$watch( 'vm.mode', nestBoth, true );

            // Desired load order: tag categories, tags, groups, items
            $q.all({
                'categories': TagCategoryService.list().promise,
                'tags': TagService.list().promise,
                'ui_groups': UiGroupService.list().promise,
                'ui_items': UiItemService.list().promise,
            }).then( function( caches ) {

                vm.categories = caches.categories.clean;
                vm.tags = caches.tags.clean;

                vm.ui_groups = caches.ui_groups.clean;
                vm.ui_items = caches.ui_items.clean;

            });

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

            // Assume (1) that the last group has the highest index
            // and (2) there is no duplicate indexes among the groups
            vm.max_index = groups[ groups.length - 1 ].index;

            // Add tag_category (titles) to ease rendering
            groups.forEach( function( group ) {
                group.tag_category = TagCategoryService.find( group.tag_category_id ).cache.clean;
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

                var group = UiGroupService.find( item.ui_group_id ).cache.clean;

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
                item.tag = TagService.find( item.tag_id ).cache.clean;
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


        // Deleting UI Groups will also delete UI Items serverside
        // TODO: Delete UI Items clientside?
        function deleteGroup( node ) {

            vm.saving = true;

            UiGroupService.delete( node.id ).promise.then( function() {

                Notification.warning( { message: 'UI Group deleted!' } );

            }).finally( function() {

                vm.saving = false;

            });

        }


        // Delete cascades serverside:
        // See roundware/rw/migrations/0016_tags_uigroups_api2.py#L59
        function deleteItem( node ) {

            vm.saving = true;

            UiItemService.delete( node.id ).promise.then( function() {

                Notification.warning( { message: 'UI Item deleted!' } );

            }).finally( function() {

                vm.saving = false;

            });

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