(function () {
    'use strict';

    angular
        .module('app')
        .factory('ProjectService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        var collection = new DataFactory.Collection({
            mapped: [
                {
                    incoming: 'demo_stream_message_loc_admin',
                    outgoing: 'demo_stream_message_loc',
                },
                {
                    incoming: 'legal_agreement_loc_admin',
                    outgoing: 'legal_agreement_loc',
                },
                {
                    incoming: 'sharing_message_loc_admin',
                    outgoing: 'sharing_message_loc',
                },
                {
                    incoming: 'out_of_range_message_loc_admin',
                    outgoing: 'out_of_range_message_loc',
                },
            ],
            embedded: [
                {
                    field: 'demo_stream_message_loc',
                    model: 'LocalizedStringService',
                },
                {
                    field: 'legal_agreement_loc',
                    model: 'LocalizedStringService',
                },
                {
                    field: 'sharing_message_loc',
                    model: 'LocalizedStringService',
                },
                {
                    field: 'out_of_range_message_loc',
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