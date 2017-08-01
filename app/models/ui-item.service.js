(function () {
    'use strict';

    angular
        .module('app')
        .factory('UiItemService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        return new DataFactory.Collection({
            route: 'uiitems',
        });

    }

})();