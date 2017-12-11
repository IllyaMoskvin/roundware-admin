(function () {

    angular
        .module('app')
        .controller('BuildUiController',  Controller);

    Controller.$inject = ['$scope', '$q', 'UiGroupService', 'UiItemService', 'TagCategoryService', 'TagService', 'ModalService', 'Notification'];

    function Controller($scope, $q, UiGroupService, UiItemService, TagCategoryService, TagService, ModalService, Notification) {

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
            accept: groupTreeAccept,
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

        vm.toggleItemsByGroup = toggleItemsByGroup;

        vm.getItem = getItem;
        vm.toggleDefault = toggleDefault;

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

                // This resets the UI Group tree when the last group is deleted
                vm.groupTree = [];

                return;

            }

            // Deep-copy the UI Groups to avoid modifying the originals
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
            // Only do this if you've deep-copied the groups!
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

                // This resets the UI Item tree when the last item is deleted
                vm.itemTree = [];

                return;

            }

            // Deep-copy the items to avoid modifying originals
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
            // Only do this if you've deep-copied the items previously!
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


        function groupTreeAccept( sourceNodeScope, destNodesScope, destIndex ) {

            // Determine which tree was the source
            var source = sourceNodeScope.$treeScope.$element.attr('id');

            // Reject if the node came from the ui-item tree
            if( source == 'rw-tree-ui-items' ) {
                return false;
            }

            return true;

        }


        // We want to allow UI Items to be re-ordered w/in their heirarchy,
        // but not be moved outside of their "cannonical" parent (UI Item)
        function itemTreeAccept( sourceNodeScope, destNodesScope, destIndex ) {

            // Determine which tree was the source
            var source = sourceNodeScope.$treeScope.$element.attr('id');

            // Reject if the node came from the ui-group tree
            if( source == 'rw-tree-ui-groups' ) {
                return false;
            }

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
            var new_ui_groups = nodes.map( function( node ) {

                return {
                    id: node.$modelValue.id,
                    index: node.index() + 1,
                    // Roundware indexes are 1-based
                }

            });

            // TODO: Don't use groupTree for this, since it's semantically wrong
            // Basically, we need an array of UI Groups filtered by the current UI Mode
            var old_ui_groups = vm.groupTree;

            // Find the lowest index among the changed UI Groups
            var indexes = old_ui_groups.reduce( function( results, old_ui_group ) {

                var new_ui_group = new_ui_groups.find( function( ui_group ) {
                    return ui_group.id == old_ui_group.id;
                });

                if( new_ui_group.index != old_ui_group.index ) {
                    results.push( new_ui_group.index );
                }

                return results;

            }, []);

            // This might happen if the indexes weren't updated since last reorder
            if( indexes.length < 1 ) {
                Notification.info( { message: 'Nothing changed..?' } );
                return false;
            }

            // Everything at or above this index should be nuked
            var min_index = Math.min.apply( null, indexes );

            // Find all old UI Groups w/ indexes at or above this one
            var affected_ui_groups = old_ui_groups.filter( function( ui_group ) {
                return ui_group.index >= min_index;
            });

            // Extract just the UI Group ids
            var affected_ui_group_ids = affected_ui_groups.map( function( ui_group ) {
                return ui_group.id;
            });

            // Find all UI Items that belong to these UI Groups
            var affected_ui_items = vm.ui_items.filter( function( ui_item ) {
                return affected_ui_group_ids.includes( ui_item.ui_group_id );
            });

            // Update new (projected) UI Groups to just include those that changed
            new_ui_groups = new_ui_groups.filter( function( new_ui_group ) {
                return affected_ui_group_ids.includes( new_ui_group.id );
            });

            // Launch modal to confirm reorder
            // TODO: Only show modal when there's actually some affected UI Items
            ModalService.open('ui-group-confirm-reorder').result.then( function() {

                vm.saving = true;

                // Save all affected UI Groups to server
                var ui_group_promises = new_ui_groups.map( function( ui_group ) {
                    return UiGroupService.update( ui_group.id, ui_group ).promise;
                });

                // Delete all affected UI Items from server
                var ui_item_promises = affected_ui_items.map( function( ui_item ) {
                    return UiItemService.delete( ui_item.id ).promise;
                    // TODO: Recover from 404 responses, for items missing due to cascade?
                });

                var promises = [].concat( ui_group_promises, ui_item_promises );

                return $q.all( promises );

            }).finally( function() {

                // Quick'n'dirty workaround for 404s
                return $q.all({

                    'ui_items': UiItemService.list().promise,
                    'ui_groups': UiGroupService.list().promise,

                });

            }).finally( function( caches ) {

                // Turn off saving before updating vm
                vm.saving = false;

                // TODO: Watch doesn't pick up the changes, so do this manually..?
                nestBoth();

            }).then( function() {

                Notification.warning( { message: 'All changes saved!' } );

            });

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


        // https://github.com/angular-ui-tree/angular-ui-tree/issues/740
        // https://stackoverflow.com/questions/13743058
        function toggleItemsByGroup( index ) {

            var tree = document.getElementById('rw-tree-ui-items');

            // Collapse all items w/ indexes >= than this one
            for( var i = index; i <= vm.max_index; i++ ) {

                getItems(i).forEach( function( item ) {
                    angular.element( item ).scope().collapse();
                });

            }

            // Expand all items w/ indexes < than this one
            for( var i = 1; i < index; i++ ) {

                getItems(i).forEach( function( item ) {
                    angular.element( item ).scope().expand();
                });

            }

            // Helper for convenience
            function getItems( index ) {
                return tree.querySelectorAll('.rw-index-' + index);
            }

        }


        function getItem( ui_item_id ) {

            return UiItemService.find( ui_item_id ).cache;

        }


        function toggleDefault( ui_item_id, is_default ) {

            UiItemService.update( ui_item_id, {

                'default': is_default,

            }).promise.then( function() {

                Notification.success( { message: 'Changes saved!' } );

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