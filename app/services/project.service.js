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
        };

        function list() {

            return ApiService.get( 'projects' );

        }

        function detail( id ) {

            return ApiService.get( 'projects/' + id );

        }

    }

})();