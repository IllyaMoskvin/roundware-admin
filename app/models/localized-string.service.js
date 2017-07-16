(function () {
    'use strict';

    angular
        .module('app')
        .factory('LocalizedStringService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        return new DataFactory.Collection({
            route: 'localizedstrings',
        });

    }

})();