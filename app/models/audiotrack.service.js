(function () {
    'use strict';

    angular
        .module('app')
        .factory('AudiotrackService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        return new DataFactory.Collection({
            route: 'audiotracks',
        });

    }

})();