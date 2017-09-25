(function () {
    'use strict';

    angular
        .module('app')
        .directive('numeric', Directive);

    Directive.$inject = [];

    // https://stackoverflow.com/questions/15072152/input-model-changes-from-integer-to-string-when-changed

    // Binding select to a non-string value via ngModel parsing / formatting
    // https://code.angularjs.org/1.4.7/docs/api/ng/directive/select

    // TODO: Remove bindings on destroy so they don't fire after element is removed?
    // https://stackoverflow.com/questions/24701705/

    // Note that this doesn't work with checkbox value

    function Directive() {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function( scope, element, attr, ngModel ) {

                // TODO: Double-check that this is stable
                if( !ngModel ) {
                    return;
                }

                var parser = function( value ) {

                    // Mitigate unassigned values
                    if(!value) {
                        return 0;
                    }

                    // There's no point to using parseInt here
                    return parseFloat( value );

                };

                var formatter = function( value ) {

                    // Prevent 'undefined' turning up in form fields
                    if( typeof value === 'undefined' ) {
                        value = '';
                    }

                    return '' + value;
                };

                ngModel.$parsers.unshift( parser );
                ngModel.$formatters.push( formatter );

            }
        }
    }
}());