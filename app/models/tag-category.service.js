(function () {
    'use strict';

    angular
        .module('app')
        .factory('TagCategoryService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        var collection = new DataFactory.Collection();

        // define public interface
        return {
            list: list,
            detail: detail,
            find: find,
            update: update,
            create: create,
        };

        function list() {

            return collection.list( 'tagcategories' );

        }

        function detail( id ) {

            return collection.detail( 'tagcategories/' + id );

        }

        function find( id ) {

            return collection.find( 'tagcategories/' + id );

        }

        function update( id, data ) {

            return collection.update( 'tagcategories/' + id, data );

        }

        function create( data ) {

            return collection.create( 'tagcategories', data );

        }

    }

})();