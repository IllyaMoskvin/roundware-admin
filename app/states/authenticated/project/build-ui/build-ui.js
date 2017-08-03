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