(function () {
    'use strict';

    angular
        .module('app')
        .factory('EnvelopeService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        return new DataFactory.Collection({
            route: 'envelopes',
        });

    }

})();