(function () {
    'use strict';

    angular
        .module('app')
        .directive('integer', Directive);

    Directive.$inject = [];

    // https://stackoverflow.com/questions/15072152/input-model-changes-from-integer-to-string-when-changed

    // Binding select to a non-string value via ngModel parsing / formatting
    // https://code.angularjs.org/1.4.7/docs/api/ng/directive/select

    // TODO: Remove bindings on destroy so they don't fire after element is removed?
    // https://stackoverflow.com/questions/24701705/

    function Directive() {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function( scope, element, attr, ngModel ) {

                var parser = function(val) {
                    return parseInt( val, 10 );
                };

                var formatter = function(val) {
                    return '' + val;
                };

                ngModel.$parsers.unshift( parser );
                ngModel.$formatters.push( formatter );

            }
        }
    }
}());