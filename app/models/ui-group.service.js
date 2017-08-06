(function () {
    'use strict';

    angular
        .module('app')
        .factory('UiGroupService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        return new DataFactory.Collection({
            route: 'uigroups',
            wrapper: 'ui_groups',
            refresh: true,
            ignored: [
                'header_text_loc',
            ],
            mapped: [
                {
                    incoming: 'header_text_loc_admin',
                    stored: 'header_text_loc',
                    outgoing: 'header_text_loc',
                },
            ],
            embedded: [
                {
                    field: 'header_text_loc',
                    model: 'LocalizedStringService',
                },
                {
                    field: 'ui_items',
                    model: 'UiItemService',
                },
            ],
        });

    }

})();