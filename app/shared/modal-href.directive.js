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
                handler: '=modalHandler',
            },
            link: function( scope, element, attr ) {

                element.on('click', function() {

                    var promise = ModalService.open( scope.modal, scope.data );

                    // Call the handler, passing it the promise instance
                    if( scope.handler ) {
                        scope.handler( promise );
                    }

                });

            }

        }
    }
}());