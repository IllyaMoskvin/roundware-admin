(function () {
    'use strict';

    angular
        .module('app')
        .factory('GeocodeService', Service);

    Service.$inject = ['$http'];

    function Service($http) {

        var modals = {};

        // define public interface
        return {
            get: get,
        };

        function get( query ) {

            // https://gis.stackexchange.com/questions/21890/does-leaflet-js-api-provide-a-geocoding-service
            // http://wiki.openstreetmap.org/wiki/Nominatim
            return $http.get('http://nominatim.openstreetmap.org/search', {
                params: {
                    'q': query,
                    'format': 'json',
                    'limit': 5,
                    'extratags': false,
                }
            }).then( function( response ) {

                // Standardize into just the fields we need
                return response.data.map( function( datum ) {

                    return {
                        title: datum.display_name,
                        lat: parseFloat( datum.lat ),
                        lng: parseFloat( datum.lon ),
                    }

                });

            });

        }

    }

})();