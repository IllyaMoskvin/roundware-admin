(function () {
    'use strict';

    angular
        .module('app')
        .factory('LanguageService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        return new DataFactory.Collection({
            route: 'languages',
        });

    }

})();