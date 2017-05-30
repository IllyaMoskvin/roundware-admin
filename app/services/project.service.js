(function () {
    'use strict';

    angular
        .module('app')
        .factory('ProjectService', Service);

    Service.$inject = ['ApiService'];

    function Service(ApiService) {

        // define public interface
        return {
            list: list,
            detail: detail,
            update: update,
        };

        function list() {

            return ApiService.get( 'projects' );

        }

        function detail( id ) {

            return ApiService.get( 'projects/' + id );

        }

        function update( id, data ) {

            return ApiService.patch( 'projects/' + id, data );

        }

    }

})();