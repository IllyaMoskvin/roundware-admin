(function () {
    'use strict';

    angular
        .module('app')
        .factory('TagCategoryService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        return new DataFactory.Collection({
            route: 'tagcategories',
        });

    }

})();