(function () {
    'use strict';

    angular
        .module('app')
        .factory('ProjectService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        return new DataFactory.Collection({
            route: 'projects',
            refresh: true,
            mapped: [
                {
                    incoming: 'demo_stream_message_loc_admin',
                    stored: 'demo_stream_message_loc',
                    outgoing: 'demo_stream_message_loc',
                },
                {
                    incoming: 'legal_agreement_loc_admin',
                    stored: 'legal_agreement_loc',
                    outgoing: 'legal_agreement_loc',
                },
                {
                    incoming: 'sharing_message_loc_admin',
                    stored: 'sharing_message_loc',
                    outgoing: 'sharing_message_loc',
                },
                {
                    incoming: 'out_of_range_message_loc_admin',
                    stored: 'out_of_range_message_loc',
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

    }

})();