(function () {
    'use strict';

    angular
        .module('app')
        .directive('btnEdit', Directive);

    Directive.$inject = [];

    function Directive() {
        return {
            restrict: 'E',
            template: '<a href="javascript:;" class="btn btn-sm btn-default btn-square">'
                    + '<span class="glyphicon glyphicon-edit"></span>'
                    + '</a>',
        }
    }
}());