(function () {

    angular
        .module('app')
        .controller('AddItemsToItemController',  Controller);

    Controller.$inject = ['$uibModalInstance', '$q', 'parent_ui_item', 'UiItemService', 'UiGroupService', 'TagCategoryService', 'TagService', 'Notification'];

    function Controller($uibModalInstance, $q, parent_ui_item, UiItemService, UiGroupService, TagCategoryService, TagService, Notification) {

        var vm = this;

        // For this controller, parent_ui_item will never be null
        vm.parent_ui_item = parent_ui_item;

        // The view value provides ids, not entire Tag objects
        vm.selected_tag_ids = [];

        vm.ui_group = null
        vm.ui_items = null;

        vm.category = null;
        vm.tags = null;

        vm.getTag = getTag;

        vm.cancel = cancel;
        vm.save = save;

        vm.saving = false;

        activate();

        return vm;

        function activate() {

            var ui_group_id = parent_ui_item.ui_group_id;

            UiGroupService.list().promise.then( function( cache ) {

                var ui_groups = cache.clean;

                // Sort the UI Groups by index
                ui_groups.sort( function( a, b ) {
                    return a.index - b.index;
                });

                // Find the UI Group of the parent_ui_item
                var parent_ui_group = ui_groups.find( function( ui_group ) {
                    return ui_group.id == parent_ui_item.ui_group_id;
                });

                // Find the UI Group w/ an index subsequent to the parent_ui_group
                // This only works smoothly if the groups are already sorted by index
                var current_ui_group = ui_groups.find( function( ui_group ) {
                    return ui_group.index > parent_ui_group.index;
                });

                // Save current UI Group to controller
                vm.ui_group = current_ui_group;

                // Grab all UI Items; we'll filter them later
                return UiItemService.list().promise;

            }).then( function( cache ) {

                var ui_items = cache.clean;

                // Get only the UI Items which belong to this UI Group
                ui_items = ui_items.filter( function( ui_item ) {
                    return ui_item.ui_group_id == vm.ui_group.id;
                });

                // Get only the UI Items which belong to the parent UI Item
                ui_items = ui_items.filter( function( ui_item ) {
                    return ui_item.parent_id == parent_ui_item.id;
                });

                // Save the UI Items to controller. We'll use them to filter Tags
                vm.ui_items = ui_items;

                // Find the TagCategory of the current UI Group
                return TagCategoryService.find( vm.ui_group.tag_category_id ).promise;

            }).then( function( cache ) {

                // Save the Tag Category to controller
                vm.category = cache.clean;

                // Retrieve all tags; we will filter them later
                return TagService.list().promise;

            }).then( function( cache ) {

                var tags = cache.clean;

                // Filter Tags by the current Tag Category
                tags = tags.filter( function( tag ) {
                    return tag.tag_category_id == vm.category.id;
                });

                // Filter Tags to remove any already assoc. w/ sibling UI Items
                tags = tags.filter( function( tag ) {

                    var match = vm.ui_items.find( function( ui_item ) {
                        return ui_item.tag_id == tag.id;
                    });

                    return !Boolean(match);

                });

                // Save the tags to controller
                vm.tags = tags;

                return true;

            });

        }

        function getTag( id ) {
            return TagService.find( id ).cache.clean;
        }

        function save() {

            // Assume that (1) UI Items have been sorted by index,
            // and thus (2) the last group has the highest index,
            // and (3) there is no duplicate indexes among the groups
            var max_index;

            // Return if nothing was selected
            if( vm.selected_tag_ids.length < 1 ) {
                Notification.info( { message: 'Nothing to save.' } );
                return false;
            }

            // Enable saving flag
            vm.saving = true;

            // Get highest index of sibling UI Items
            if( vm.ui_items && vm.ui_items.length > 0 ) {
                max_index = vm.ui_items[ vm.ui_items.length - 1 ].index;
            } else {
                max_index = 0;
            }

            // Prep stub UI Items for saving to server
            var ui_items = vm.selected_tag_ids.map( function( tag_id, i ) {
                return {
                    index: max_index + i + 1,
                    tag_id: tag_id,
                    default: false,
                    active: true,
                    ui_group_id: vm.ui_group.id,
                    parent_id: vm.parent_ui_item.id,
                }
            });

            // Issue create commands to serverside
            var promises = ui_items.map( function( ui_item ) {

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