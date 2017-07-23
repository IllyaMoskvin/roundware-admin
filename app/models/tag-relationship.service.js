(function () {
    'use strict';

    angular
        .module('app')
        .factory('TagRelationshipService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        return new DataFactory.Collection({
            route: 'tagrelationships',
        });

    }

})();