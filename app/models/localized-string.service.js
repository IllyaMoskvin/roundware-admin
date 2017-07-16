(function () {
    'use strict';

    angular
        .module('app')
        .factory('LocalizedStringService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        var collection = new DataFactory.Collection();

        // define public interface
        return {
            list: list,
            detail: detail,
            find: find,
            inject: inject,
            update: update,
            create: create,
        };

        function list() {

            return collection.list( 'localizedstrings' );

        }

        function detail( id ) {

            return collection.detail( 'localizedstrings/' + id );

        }

        function find( id ) {

            return collection.find( 'localizedstrings/' + id );

        }

        function inject( datum ) {

            return collection.inject( datum );

        }

        function update( id, data ) {

            return collection.update( 'localizedstrings/' + id, data );

        }

        function create( data ) {

            return collection.create( 'localizedstrings', data );

        }

    }

})();