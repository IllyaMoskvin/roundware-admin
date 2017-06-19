(function () {
    'use strict';

    angular
        .module('app')
        .factory('ModalService', Service);

    Service.$inject = ['$uibModal'];

    function Service($uibModal) {

        var modals = {};

        // define public interface
        return {
            modal: modal,
            open: open,
        };

        function modal( key, options ) {

            modals[key] = options;

        }

        function open( key, data ) {

            // Parse data into promises
            var options = angular.copy( modals[key] );

            if( options.params ) {

                // resolve is optional
                options.resolve = options.resolve || {};

                angular.forEach( options.params, function( param ) {

                    options.resolve[param] = function( ) {
                        return data[param] || undefined;
                    }

                });

                delete options.params;

            }

            var promise = $uibModal.open( options );

            // I don't care about "backdrop click" rejections...
            // https://stackoverflow.com/questions/42416570
            // In fact, I don't care about unhandled rejections at all!
            // See app.config(rejections) in app.module.js

            return promise;

        }

    }

})();