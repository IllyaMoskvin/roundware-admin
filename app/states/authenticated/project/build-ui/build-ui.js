(function () {

    angular
        .module('app')
        .controller('BuildUiController',  Controller);

    Controller.$inject = ['$scope', '$q', 'UiGroupService', 'UiItemService', 'TagCategoryService', 'TagService'];

    function Controller($scope, $q, UiGroupService, UiItemService, TagCategoryService, TagService) {

        var vm = this;

        vm.ui_groups = null;
        vm.ui_items = null;

        vm.categories = null;
        vm.tags = null;

        vm.groupTree = [];
        vm.itemTree = [];

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

            // Cloning is necessary to avoid triggering $watch
            var groups = angular.merge([], vm.ui_groups);

            // Do nothing if there's nothing to parse
            if( groups.length < 1 ) {
                return;
            }

            // Filter groups by currently active ui mode
            groups = groups.filter( function( group ) {
                return group.ui_mode == vm.mode;
            });

            // Add tag_category (titles) to ease rendering
            groups.forEach( function( group ) {
                group.tag_category = TagCategoryService.find( group.tag_category_id ).clean;
            });

            // Update the tree for rendering
            vm.groupTree = groups;

        }


        function nestItems() {

            // Cloning is necessary to avoid triggering $watch
            var items = angular.merge([], vm.ui_items);

            // Do nothing if there's nothing to parse
            if( items.length < 1 ) {
                return;
            }

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

            // Add tag (titles) to ease rendering
            items.forEach( function( item ) {
                item.tag = TagService.find( item.tag_id ).clean;
            });

            vm.itemTree = items;

            // TODO: Only show items for currently active groups? (ui_group_id)
            // TODO: Nest items w/ respect to ui groups

        }

    }

})();