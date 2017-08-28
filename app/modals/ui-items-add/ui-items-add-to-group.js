(function () {

    angular
        .module('app')
        .controller('AddItemsToGroupController',  Controller);

    Controller.$inject = ['$uibModalInstance', '$q', 'ui_group', 'UiItemService', 'UiGroupService', 'TagCategoryService', 'TagService', 'Notification'];

    function Controller($uibModalInstance, $q, ui_group, UiItemService, UiGroupService, TagCategoryService, TagService, Notification) {

        var vm = this;

        // The view value provides ids, not entire Tag objects
        vm.selected_tag_ids = [];

        // Ascertaining which UI Group is one index higher than this one
        // This might remain null; i.e. this is the highest UI Group
        vm.parent_ui_group_id = null;

        // UI Items of "parent" UI Group
        vm.parent_ui_items = null;

        // UI Items of "current" UI Group
        vm.sibling_ui_items = null;

        // The ui_group param should *never* be null here
        vm.ui_group = ui_group;

        vm.category = null;
        vm.tags = null;

        vm.getTag = getTag;

        vm.cancel = cancel;
        vm.save = save;

        vm.saving = false;

        activate();

        return vm;

        function activate() {

            UiGroupService.list().promise.then( function( cache ) {

                var ui_groups = angular.extend([], cache.clean);

                // Filter UI Groups by this group's UI Mode
                ui_groups = ui_groups.filter( function( ui_group ) {
                    return ui_group.ui_mode == vm.ui_group.ui_mode;
                });

                // Sort the UI Groups by index, descending
                ui_groups.sort( function( a, b ) {
                    return b.index - a.index;
                });

                // Find the first UI Group w/ an index lower than this UI Group
                // This only works smoothly if the groups are already sorted by index
                var parent_ui_group = ui_groups.find( function( ui_group ) {
                    return ui_group.index < vm.ui_group.index;
                });

                // Save the id of the parent; null if none found
                vm.parent_ui_group_id = parent_ui_group ? parent_ui_group.id : null;

                // Grab all UI Items; we'll filter them later
                return UiItemService.list().promise;

            }).then( function( cache ) {

                var ui_items = angular.extend([], cache.clean);

                // Sort the UI Items by index
                ui_items.sort( function( a, b ) {
                    return a.index - b.index;
                });

                // Get UI Items which belong to the "parent" UI Group
                vm.parent_ui_items = ui_items.filter( function( ui_item ) {
                    return ui_item.ui_group_id == vm.parent_ui_group_id;
                });

                // Get UI Items which belong to the "current" UI Group
                vm.sibling_ui_items = ui_items.filter( function( ui_item ) {
                    return ui_item.ui_group_id == vm.ui_group.id;
                });

                // Find the TagCategory of the current UI Group
                return TagCategoryService.find( vm.ui_group.tag_category_id ).promise;

            }).then( function( cache ) {

                // Save the Tag Category to controller
                vm.category = cache.clean;

                // Retrieve all tags; we will filter them later
                return TagService.list().promise;

            }).then( function( cache ) {

                var tags = angular.extend([], cache.clean);

                // Filter Tags by the current Tag Category
                tags = tags.filter( function( tag ) {
                    return tag.tag_category_id == vm.category.id;
                });

                // Unlike AddItemsToItemController, we don't need to filter Tags to remove
                // any already assoc. w/ sibling UI Items. We'll do that when saving!

                // Save the tags to controller
                vm.tags = tags;

                return true;

            });

        }

        function getTag( id ) {
            return TagService.find( id ).cache.clean;
        }

        function save() {

            // Return if nothing was selected
            if( vm.selected_tag_ids.length < 1 ) {
                Notification.info( { message: 'Nothing to save.' } );
                return false;
            }

            // Enable saving flag
            vm.saving = true;

            // We need to do some special logic if this is the "highest" group
            // We are making a copy of this so as not to affect the view
            var parent_ui_items = angular.extend([], vm.parent_ui_items);

            if( vm.parent_ui_group_id == null ) {
                parent_ui_items.push({
                    id: null,
                });
            }

            var queued_ui_items = [];

            parent_ui_items.forEach( function( parent_ui_item ) {

                // Get all siblings that are nested under this specific parent UI Item
                var current_sibling_ui_items = vm.sibling_ui_items.filter( function( sibling_ui_item ) {
                    return sibling_ui_item.parent_id == parent_ui_item.id;
                });

                // Get all the Tag ids that are already nested via UI Items under this parent
                var present_tag_ids = current_sibling_ui_items.map( function( sibling_ui_item ) {
                    return sibling_ui_item.tag_id;
                });

                // Filter the selected tags to exclude those that already have UI Items here
                var absent_tag_ids = vm.selected_tag_ids.filter( function( selected_tag_id ) {
                    return !present_tag_ids.includes( selected_tag_id );
                });

                // If there's no absent_tag_ids, exit this iteration
                if( absent_tag_ids.length < 1 ) {
                    return false;
                }

                // Assume that (1) UI Items have been sorted by index,
                // and thus (2) the last group has the highest index,
                // and (3) there is no duplicate indexes among the groups
                var max_index;

                // Get highest index of sibling UI Items
                if( current_sibling_ui_items.length > 0 ) {
                    max_index = current_sibling_ui_items[ current_sibling_ui_items.length - 1 ].index;
                } else {
                    max_index = 0;
                }

                // Prep stub UI Items for saving to server
                var ui_items = absent_tag_ids.map( function( tag_id, i ) {
                    return {
                        index: max_index + i + 1,
                        tag_id: tag_id,
                        default: false,
                        active: true,
                        parent_id: parent_ui_item.id,
                        ui_group_id: vm.ui_group.id,
                    }
                });

                // Add them to the queue
                queued_ui_items = queued_ui_items.concat( ui_items );

            });

            // Return if nothing was selected
            if( queued_ui_items.length < 1 ) {
                Notification.info( { message: 'No new UI Items to create.' } );
                vm.saving = false;
                return false;
            }

            // Issue create commands to serverside
            var promises = queued_ui_items.map( function( ui_item ) {

                return UiItemService.create( ui_item ).promise;

            });

            // Wait for all promises to resolve, then notify the user
            $q.all( promises ).then( function() {

                Notification.success( { message: 'Changes saved!' } );

                $uibModalInstance.close();

            }).finally( function() {

                vm.saving = false;

            });

        }

        function cancel() {

            $uibModalInstance.close();

        }

    }

})();