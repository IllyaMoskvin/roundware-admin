(function () {
    'use strict';

    angular
        .module('app')
        .factory('ProjectService', Service);

    Service.$inject = ['ApiService'];

    function Service(ApiService) {

        var data = [];

        // define public interface
        return {
            list: list,
            detail: detail,
            update: update,
        };

        function list() {

            ApiService.get( 'projects' ).then( updateData, updateError );

            return data;

        }

        function detail( id ) {

            ApiService.get( 'projects/' + id ).then( updateDatum, updateError );

            return findDatum( id );

        }

        function update( id, data ) {

            ApiService.patch( 'projects/' + id, data ).then( updateDatum, updateError );

            return findDatum( id );

        }

        function updateData( response ) {

            angular.forEach( response.data, function( newDatum, i ) {

                var oldDatum = findDatum( newDatum.project_id );

                angular.extend( oldDatum, newDatum );

            });

            return data;

        }

        function findDatum( id ) {

            // Standardize id into integer
            id = parseInt( id );

            var dummy = { project_id: id };
            var datum;

            // Search for existing datum
            for( var i = 0; i < data.length; i++ ) {

                datum = data[i];

                if( datum.project_id == id ) {
                    return datum;
                }

            }

            // If there's no match, add dummy to data collection
            data.push( dummy );
            return dummy;

        }

        function updateDatum( response ) {

            // Find the datum in the data collection
            // Replace its properties with those from the server
            var datum = findDatum( response.data.project_id );

            angular.extend( datum, response.data );

            return datum;

        }

        function updateError( response ) {

            console.error( 'Unable to update cache' );

            return response;

        }

    }

})();