(function () {
    'use strict';

    angular
        .module('app')
        .factory('TagService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        return new DataFactory.Collection({
            route: 'tags',
            wrapper: 'tags',
            refresh: true,
            mapped: [
                {
                    incoming: 'loc_msg_admin',
                    stored: 'loc_msg',
                    outgoing: 'loc_msg',
                },
                {
                    incoming: 'loc_description_admin',
                    stored: 'loc_description',
                    outgoing: 'loc_description',
                },
            ],
            embedded: [
                {
                    field: 'loc_msg',
                    model: 'LocalizedStringService',
                },
                {
                    field: 'loc_description',
                    model: 'LocalizedStringService',
                },
            ],
        });

    }

})();