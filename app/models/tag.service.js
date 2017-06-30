(function () {
    'use strict';

    angular
        .module('app')
        .factory('TagService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        var collection = new DataFactory.Collection({
            wrapper: 'tags',
            mapped: [
                {
                    incoming: 'loc_msg_admin',
                    outgoing: 'loc_msg',
                },
                {
                    incoming: 'loc_description_admin',
                    outgoing: 'loc_description',
                },
            ],
            embedded: [
                {
                    field: 'loc_msg',
                    model: 'LocalizedStringService',
                },
                {
                    field: 'loc_description',
                    model: 'LocalizedStringService',
                },
            ],
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