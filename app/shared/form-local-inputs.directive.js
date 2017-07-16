(function () {
    'use strict';

    angular
        .module('app')
        .directive('localInputs', Directive);

    Directive.$inject = ['$filter', '$stateParams', 'ProjectService', 'LanguageService'];

    function Directive($filter, $stateParams, ProjectService, LanguageService) {
        return {
            restrict: 'E',
            scope: {
                strings: '=list',
            },
            template: `

                <div class="form-group" ng-repeat="language in getProjectLanguages()">
                    <label class="col-sm-2 control-label">
                        {{ language.name }}
                    </label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" ng-model="getString( language ).text">
                    </div>
                </div>

            `,
            link: function( scope, element, attr ) {

                // Use the dirty project to add fields live to Overview screen
                scope.project = ProjectService.find( $stateParams.id ).dirty;
                scope.languages = LanguageService.list().cache.clean;

                scope.getProjectLanguages = function() {

                    var valid_ids = scope.project.language_ids;

                    if( !valid_ids ) {
                        // Wait until the data is ready...
                        return null;
                    }

                    return scope.languages.filter( function( language ) {
                        return valid_ids.indexOf( language.id ) > -1;
                    });

                };

                scope.getString = function( language ) {

                    // TODO: Handle cases where strings[] is undefined
                    // TODO: Handle cases where the string for the language is undefined

                    // We need to return the object, not the string it contains
                    // We should be using Array.find for this, but no IE support

                    var matches = scope.strings.filter( function( string ) {
                        return string.language === language.language_code;
                    });

                    return matches[0];

                }

            }
        }
    }
}());