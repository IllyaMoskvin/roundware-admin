(function () {
    'use strict';

    angular
        .module('app')
        .factory('SessionService', Service);

    Service.$inject = ['DataFactory'];

    function Service(DataFactory) {

        var collection = new DataFactory.Collection({
            route: 'sessions',
            refresh: true,
        });

        var custom = {
            create: create,
        };

        return angular.merge( {}, collection, custom );


        function create( datum, config ) {

            // An admin session should always declare its `client_type` as `admin`
            // TODO: Change this if we ever allow session editing via the admin
            datum.client_type = "admin";

            var promise = collection.create( datum, config ).promise;

            return {
                promise: promise,
                cache: datum,
            };

        }

    }

})();