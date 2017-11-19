// https://stackoverflow.com/questions/28394572/angularjs-seconds-to-time-filter

(function () {
    'use strict';

    angular
        .module('app')
        .filter('secondsToDateTime', routeCssClassnames);

    routeCssClassnames.$inject = [];

    function routeCssClassnames() {
        return function(seconds) {
            return new Date(1970, 0, 1).setSeconds(seconds);
        };
    }

}());