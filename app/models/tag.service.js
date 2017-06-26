(function () {
    'use strict';

    angular
        .module('app')
        .factory('TagService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        var collection = new DataFactory.Collection({
            wrapper: 'tags',
        });

        // define public interface
        return {
            list: list,
            detail: detail,
            update: update,
            create: create,
            filter: collection.filter
        };

        function list() {

            return collection.list( 'tags' );

        }

        function detail( id ) {

            return collection.detail( 'tags/' + id );

        }

        function update( id, data ) {

            return collection.update( 'tags/' + id, data );

        }

        function create( data ) {

            return collection.create( 'tags', data );

        }

    }

})();