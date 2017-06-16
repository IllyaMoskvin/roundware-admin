(function () {
    'use strict';

    angular
        .module('app')
        .factory('ApiService', Service);

    Service.$inject = ['$http'];

    function Service($http) {

        // config is optional, defaults to vagrant setup
        var settings = {
            url: "http://localhost:8888/api/2/"
        };

        // define public interface
        return {
            init: init,
            get: get,
            post: post,
            patch: patch,
            error: error,
        };

        function init( config ) {

            // Replace default settings with defined configs
            if( config !== null && typeof config === 'object' ) {

                Object.keys(settings).forEach( function( key ) {
                    settings[key] = config[key] || settings[key];
                })

            }

            // Add trailing slash to the url, if it's missing
            settings.url = settings.url.replace(/\/?$/, '/');

        }

        function get( url, config ) {

            url = getFullUrl( url );

            // config is an optional argument
            config = config || {};

            // session-for-admin-uploads
            angular.merge( config, {
                params: {
                    session_id: 1
                }
            });

            return $http.get( url, config );

        }

        function post( url, data, config ) {

            url = getFullUrl( url );

            return $http.post( url, data, config );

        }

        function patch( url, data, config ) {

            url = getFullUrl( url );

            return $http.patch( url, data, config );

        }

        // Return errors in a standardized format
        // Meant for feeding messages to Notification
        function error( response ) {

            if( response.status <= 0 ) {
                return "Cannot reach server";
            }

            if( "detail" in response.data ) {
                return response.data.detail;
            }

            // TODO: Make this more specific, see:
            // https://gist.github.com/kottenator/433f677e5fdddf78d195
            return "Missing required field.";

        }

        // enforce certain url rules, for ease of use
        function getFullUrl( url ) {

            // remove leading slash, if it's present
            url = url.replace(/^\//g, '');

            // append trailing slash, if it's missing
            url = url.replace(/\/?$/, '/');

            // prepend the base url
            url = settings.url + url;

            return url;

        }

    }

})();