(function () {
    'use strict';

    angular
        .module('app')
        .factory('ProjectService', Service);

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

            return collection.list( 'projects' );

        }

        function detail( id ) {

            return collection.detail( 'projects/' + id );

        }

        function update( id, data ) {

            return collection.update( 'projects/' + id, data );

        }

    }

})();