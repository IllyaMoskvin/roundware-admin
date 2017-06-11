(function () {
    'use strict';

    angular
        .module('app')
        .directive('stButton', Directive);

    Directive.$inject = [];

    function Directive() {
        return {
            restrict: 'E',
            template: '<a href="javascript:;" class="btn btn-sm btn-default">'
                    + '<span class="glyphicon" ng-class="icon"></span>'
                    + '</a>',
            scope: {
                // We don't need to actually pass this to scope, just use attr
                // type: '='
            },
            link: function( scope, element, attr ) {

                switch( attr.type ) {
                    case 'delete':
                        scope.icon = 'glyphicon-remove';
                    break;
                    case 'edit':
                    default:
                        scope.icon = 'glyphicon-edit';
                    break;
                }

            }
        }
    }
}());