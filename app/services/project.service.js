(function () {
    'use strict';

    angular
        .module('app')
        .factory('ProjectService', Service);

    Service.$inject = ['ApiService', 'CacheFactory'];

    function Service(ApiService, CacheFactory) {

        var cache = new CacheFactory.Cache( 'project_id' );

        // define public interface
        return {
            list: list,
            detail: detail,
            update: update,
        };

        function list() {

            ApiService.get( 'projects' ).then( cache.update, cache.error );

            return cache.list();

        }

        function detail( id ) {

            ApiService.get( 'projects/' + id ).then( cache.update, cache.error );

            return cache.detail( id );

        }

        function update( id, data ) {

            ApiService.patch( 'projects/' + id, data ).then( cache.update, cache.error );

            return cache.detail( id );

        }

    }

})();