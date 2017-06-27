(function () {
    'use strict';

    angular
        .module('app')
        .factory('ProjectService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        var collection = new DataFactory.Collection({
            embedded: [
                {
                    field: 'demo_stream_message_loc_admin',
                    model: 'LocalizedStringService',
                },
                {
                    field: 'legal_agreement_loc_admin',
                    model: 'LocalizedStringService',
                },
                {
                    field: 'sharing_message_loc_admin',
                    model: 'LocalizedStringService',
                },
                {
                    field: 'out_of_range_message_loc_admin',
                    model: 'LocalizedStringService',
                },
            ],
        });

        // define public interface
        return {
            list: list,
            detail: detail,
            find: find,
            update: update,
        };

        function list() {

            return collection.list( 'projects' );

        }

        function detail( id ) {

            return collection.detail( 'projects/' + id );

        }

        function find( id ) {

            return collection.find( 'projects/' + id );

        }

        function update( id, data ) {

            return collection.update( 'projects/' + id, data );

        }

    }

})();