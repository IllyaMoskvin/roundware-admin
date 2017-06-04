(function () {
    'use strict';

    angular
        .module('app')
        .factory('TagCategoryService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        var collection = new DataFactory.Collection( 'id' );

        // define public interface
        return {
            list: list,
            detail: detail,
            update: update,
        };

        function list() {

            return collection.list( 'tagcategories' );

        }

        function detail( id ) {

            return collection.detail( 'tagcategories/' + id );

        }

        function update( id, data ) {

            return collection.update( 'tagcategories/' + id, data );

        }

    }

})();