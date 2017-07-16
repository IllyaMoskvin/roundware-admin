(function () {
    'use strict';

    angular
        .module('app')
        .directive('checkList', Directive);

    // Use this to bind to list of checkbox items:
    // https://stackoverflow.com/a/14519881/1943591

    Directive.$inject = [];

    function Directive() {
        return {
            scope: {
                list: '=checkList',
                value: '@'
            },
            link: function(scope, elem, attrs) {

                // https://stackoverflow.com/a/25812199/1943591
                scope.integer = 'checkInteger' in attrs;

                var handler = function(setup) {

                    // Wait until the list is available...
                    if( !scope.list ) {
                        return false;
                    }

                    // Add check-integer attr when working with int arrays
                    var value = scope.integer ? parseInt( scope.value, 10 ) : scope.value;

                    var checked = elem.prop('checked');
                    var index = scope.list.indexOf(value);

                    if (checked && index == -1) {
                        if (setup) elem.prop('checked', false);
                        else scope.list.push(value);
                    } else if (!checked && index != -1) {
                        if (setup) elem.prop('checked', true);
                        else scope.list.splice(index, 1);
                    }
                };

                var setupHandler = handler.bind(null, true);
                var changeHandler = handler.bind(null, false);

                elem.bind('change', function() {
                    scope.$apply(changeHandler);
                });
                scope.$watch('list', setupHandler, true);
            }
        };
    }

}());