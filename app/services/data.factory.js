(function () {
    'use strict';

    angular
        .module('app')
        .factory('DataFactory', Service);

    Service.$inject = ['ApiService', 'CacheFactory'];

    function Service(ApiService, CacheFactory) {

        return {
            Collection: Collection,
        }

        function Collection( ID_FIELD ) {

            // See CacheFactory for more info on ID_FIELD

            var cache = new CacheFactory.Cache( ID_FIELD || 'id' );

            // define public interface
            return {
                list: list,
                detail: detail,
                update: update,
            };


            function list( url, config ) {

                ApiService.get( url, config ).then( cache.update, cache.error );

                return cache.list();

            }


            function detail( url, config ) {

                var id = getId( url );

                ApiService.get( url, config ).then( cache.update, cache.error );

                return cache.detail( id );

            }


            function update( url, data, config ) {

                var id = getId( url );

                ApiService.patch( url, data, config ).then( cache.update, cache.error );

                return cache.detail( id );

            }


            function getId( url ) {

                // Assumes that the last part of the URL is the id
                var id = url.substr( url.lastIndexOf('/') + 1 );

                // TODO: URL should not contain query string
                // GET params should be defined by config.params
                // ...but just to be safe, drop anything after ?

                // TODO: Anticipate trailing forwardslash

                // Ensure that it's numeric
                return parseInt( id );

            }


        }

    }

})();