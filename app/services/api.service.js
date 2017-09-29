(function () {
    'use strict';

    angular
        .module('app')
        .factory('ApiService', Service);

    Service.$inject = ['$http'];

    function Service($http) {

        // config is optional, defaults to vagrant setup
        var settings = {
            base: "http://localhost:8888",
            path: "/api/2/",
        };

        // define public interface
        return {
            init: init,
            get: get,
            post: post,
            patch: patch,
            delete: remove,
            error: error,

            getBaseUrl: getBaseUrl,
        };

        function init( config ) {

            // Replace default settings with defined configs
            if( config !== null && typeof config === 'object' ) {

                Object.keys(settings).forEach( function( key ) {
                    settings[key] = config[key] || settings[key];
                })

            }

            // Remove trailing slash from base, if needed
            settings.base = settings.base.replace(/\/$/, "");

            // Add leading slash to path, if needed
            settings.path = settings.path.replace(/^\/?/, "/");

            // Add trailing slash to path, if it's missing
            settings.path = settings.path.replace(/\/?$/, '/');

            // Save full url
            settings.full = settings.base + settings.path;

        }

        function get( url, config ) {

            url = getFullUrl( url );

            // config is an optional argument
            config = config || {};

            angular.merge( config, {
                params: {
                    // show embedded localized string lists
                    admin: 1,
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


        function remove( url, data, config ) {

            url = getFullUrl( url );

            return $http.delete( url, data, config );

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

            // prepend the (full) base url
            url = settings.full + url;

            return url;

        }

        function getBaseUrl( url ) {

            // Prevent errors if the info is still loading
            if( !url ) {
                return settings.base;
            }

            // add leading slash, if it's missing
            url = url.replace(/^\/?/g, '/');

            // prepend the base url
            url = settings.base + url;

            return url;

        }

    }

})();