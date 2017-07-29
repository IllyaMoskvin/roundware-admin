(function () {
    'use strict';

    angular
        .module('app')
        .directive('localString', Directive);

    Directive.$inject = ['$stateParams', 'ProjectService', 'LanguageService', 'LocalizedStringService'];

    function Directive($stateParams, ProjectService, LanguageService, LocalizedStringService) {
        return {
            // TODO: Make this an attribute?
            restrict: 'E',
            scope: {
                string_ids: '=stringIds',
                language_code: '=languageCode'
            },
            template: `<span>{{ string.text }}</span>`,
            link: function( scope, element, attr ) {

                scope.string = null;

                scope.$watch('string_ids', function() {

                    if( !scope.string_ids ) {
                        return;
                    }

                    // TODO: Use promise chains?
                    scope.strings = scope.string_ids.map( function( string_id ) {
                        return LocalizedStringService.find( string_id ).clean;
                    });

                });

                scope.$watch('strings', function() {

                    if( !scope.language_code || !scope.strings ) {
                        return;
                    }

                    var matches = scope.strings.filter( function( string ) {
                        return string.language === scope.language_code;
                    });

                    scope.string = matches[0] || null;

                });

            }
        }
    }
}());