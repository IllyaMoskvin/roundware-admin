(function () {
    'use strict';

    angular
        .module('app')
        .factory('TagService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        var collection = new DataFactory.Collection({
            wrapper: 'tags',
            embedded: [
                {
                    field: 'loc_msg_admin',
                    model: 'LocalizedStringService',
                },
                {
                    field: 'loc_description_admin',
                    model: 'LocalizedStringService',
                },
            ],
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