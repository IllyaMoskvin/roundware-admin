(function () {
    'use strict';

    angular
        .module('app')
        .factory('SpeakerService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        return new DataFactory.Collection({
            route: 'speakers',
            refresh: true,
        });

    }

})();