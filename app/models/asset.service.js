(function () {
    'use strict';

    angular
        .module('app')
        .factory('AssetService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        return new DataFactory.Collection({
            route: 'assets',
            refresh: true,
            mapped: [
                {
                    incoming: 'loc_description_admin',
                    stored: 'loc_description',
                    outgoing: 'loc_description',
                },
                {
                    incoming: 'loc_alt_text_admin',
                    stored: 'loc_alt_text',
                    outgoing: 'loc_alt_text',
                },
            ],
            embedded: [
                {
                    field: 'loc_description',
                    model: 'LocalizedStringService',
                },
                {
                    field: 'loc_alt_text',
                    model: 'LocalizedStringService',
                },
            ],
        });

    }

})();