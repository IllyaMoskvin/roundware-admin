(function () {
    'use strict';

    angular
        .module('app')
        .directive('modalHref', Directive);

    Directive.$inject = ['ModalService'];

    function Directive(ModalService) {
        return {
            restrict: 'A',
            scope: {
                modal: '@modalHref',
                data: '=modalData',
            },
            link: function( scope, element, attr ) {

                element.on('click', function() {

                    ModalService.open( scope.modal, scope.data );

                });

            }

        }
    }
}());