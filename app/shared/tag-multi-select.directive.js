(function () {
    'use strict';

    angular
        .module('app')
        .directive('tagMultiSelect', Directive);

    Directive.$inject = ['$q', 'TagService', 'TagCategoryService'];

    function Directive($q, TagService, TagCategoryService) {
        return {
            restrict: 'E',
            scope: {
                model: '=', // an array of tag ids
                max_labels: '=maxLabels',
            },
            template: `

                <p ng-show="loading" class="form-control-static">Loading...</p>

                <div
                    ng-show="!loading"
                    isteven-multi-select
                    input-model="displayed_tags"
                    output-model="selected_tags"
                    button-label="label"
                    item-label="label"
                    tick-property="is_selected"
                    helper-elements="filter"
                    search-property="label"
                    group-property="group"
                    translation="localization"
                    max-labels="{{ max_labels }}"
                ></div>

            `,
            link: function( scope, element, attr ) {

                // Filter (search) was added to avoid focus-related bugs
                // https://github.com/isteven/angular-multi-select/issues/543

                // https://github.com/isteven/angular-multi-select/issues/196
                scope.loading = true;
                scope.changing = false;

                scope.tags = null;
                scope.categories = null;

                scope.displayed_tags = null;
                scope.selected_tags = null;

                // Mostly for brevity
                scope.localization = {
                    selectAll: 'All',
                    selectNone: 'None',
                    reset: 'Reset',
                    search: 'Filter',
                    nothingSelected: 'None',
                };

                scope.$watch( 'tags', transform );
                scope.$watch( 'categories', transform );

                // Transform any external changes to the model for display
                scope.$watch( 'model', updatedSelectedTags );
                scope.$watch( 'displayed_tags', updatedSelectedTags );

                // Transform selections into the model
                scope.$watch( 'selected_tags', function() {

                    if( !scope.selected_tags ) {
                        return;
                    }

                    scope.changing = true;

                    scope.model = scope.selected_tags.map( function( tag ) {
                        return tag.id;
                    });

                });

                $q.all({
                    'tags': TagService.list().promise,
                    'categories': TagCategoryService.list().promise,
                }).then( function( caches ) {

                    scope.tags = caches.tags.clean.sort( function( a, b ) {
                        return a.value.localeCompare( b.value );
                    });

                    // Sorting the categories here won't work
                    // We need to sort the category ids gathered from tags
                    scope.categories = caches.categories.clean;

                    scope.loading = false;

                });


                function transform() {

                    // Wait until both values are ready
                    if( !scope.tags || !scope.categories ) {
                        return;
                    }

                    // Gather tag category ids used by this project's tags
                    var current_category_ids = scope.tags.map( function( tag ) {
                        return tag.tag_category_id;
                    });

                    // Ensure the items in the category id array are unique
                    // https://stackoverflow.com/a/14438954/1943591
                    current_category_ids = current_category_ids.filter( function( values, index, self ) {
                        return self.indexOf( values ) === index;
                    });

                    // Order the category ids by the categories' names
                    current_category_ids = current_category_ids.sort( function( id_a, id_b ) {

                        var category_a = scope.categories.find( function( category ) {
                            return category.id == id_a;
                        });

                        var category_b = scope.categories.find( function( category ) {
                            return category.id == id_b;
                        });

                        return category_a.name.localeCompare( category_b.name );

                    });

                    // Group tags into an array of arrays by their category ids
                    var tag_groups = current_category_ids.map( function( category_id ) {
                        return scope.tags.filter( function( tag ) {
                            return tag.tag_category_id === category_id;
                        });
                    });

                    // Build the displayed tag array by iterating over these groups
                    var nested_displayed_tags = tag_groups.map( function( tag_group ) {

                        var output = [];

                        var category_id = tag_group[0].tag_category_id;

                        var category = scope.categories.find( function( category ) {
                            return category.id == category_id;
                        });

                        output.push({
                            label: category.name,
                            group: true
                        });

                        var labeled_tags = tag_group.map( function( tag ) {
                            return {
                                id: tag.id,
                                label: tag.value,
                            }
                        });

                        output = output.concat( labeled_tags );

                        output.push({
                            group: false
                        });

                        return output;

                    });

                    // Flatten the array of arrays
                    scope.displayed_tags = [].concat.apply( [], nested_displayed_tags );

                }

                function updatedSelectedTags( ) {

                    // Wait until the model and displayed tags have loaded
                    if( !scope.model || !scope.displayed_tags ) {
                        return;
                    }

                    // Exit if the change was caused by our $watch
                    if( scope.changing ) {
                        scope.changing = false;
                        return;
                    }

                    // Loop through the displayed tags and toggle selected
                    scope.displayed_tags.forEach( function( tag, i ) {
                        tag.is_selected = scope.model.includes( tag.id );
                    });

                }

            }
        }
    }

}());