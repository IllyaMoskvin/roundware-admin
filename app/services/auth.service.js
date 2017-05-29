// Ideas borrowed liberally from the following tutorials:
// http://jasonwatmore.com/post/2016/04/05/angularjs-jwt-authentication-example-tutorial
// https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec

(function () {
    'use strict';

    angular
        .module('app')
        .factory('AuthService', Service);

    Service.$inject = ['$http', '$location', '$rootScope', '$localStorage', 'ApiService'];

    function Service($http, $location, $rootScope, $localStorage, ApiService) {

        // config is optional, these are the default values
        var settings = {
            login: '/authenticate',
            public: ['/authenticate'],
            redirect: '/',
        };

        // track last requested restricted page
        var lastPage = settings.redirect;

        // define public interface
        return {
            init: init,
            check: check,
            login: login,
            logout: logout,
            getUsername: getUsername,
        }

        function init( config ) {

            // Replace default settings with defined configs
            if( config !== null && typeof config === 'object' ) {

                Object.keys(settings).forEach( function( key ) {
                    settings[key] = config[key] || settings[key];
                })

            }

            // Keep user logged in after page refresh
            if( check() ) {
                $http.defaults.headers.common.Authorization = 'token ' + $localStorage.currentUser.token;
            }

            // Redirect to login page if not logged in and trying to access a restricted page
            // Redirect to default if logged in and trying to access login page
            $rootScope.$on('$locationChangeStart', function (event, next, current) {

                var request = $location.path();
                var isRestricted = settings.public.indexOf(request) === -1;

                // If the page is restricted and user not auth'd, redirect to login page
                if( isRestricted && !check() ) {

                    lastPage = request;

                    $location.path( settings.login );

                    return false;

                }

                // If the user is auth'd, they cannot access the login page
                if( check() && request === settings.login ) {

                    $location.path( settings.redirect );

                    return false;

                }

                // If logout happens in-between sessions, save current page?
                if( request !== settings.login ) {
                    lastPage = request;
                }

            });

        }

        // Check if a user is currently logged in
        function check() {
            return typeof $localStorage.currentUser !== 'undefined';
        }

        // Check if a user is currently logged in
        function getUsername() {

            if( !check() ) {
                return null;
            }

            return $localStorage.currentUser.username;
        }

        function login(username, password, callback) {

            // Clear existing user
            logout();

            ApiService.post('login', { username: username, password: password })
                .then(
                    function( response ) {

                        // login successful if there's a token in the response
                        if (response.data.token) {

                            // store username and token in local storage to keep user logged in between page refreshes
                            $localStorage.currentUser = { username: username, token: response.data.token };

                            // add jwt token to auth header for all requests made by the $http service
                            $http.defaults.headers.common.Authorization = 'token ' + response.data.token;

                            // redirect if there's a page saved
                            if( lastPage ) {
                                $location.path( lastPage );
                                lastPage = settings.redirect;
                            }

                            // execute callback with true to indicate successful login
                            callback(true);

                        } else {

                            // execute callback with false to indicate failed login
                            callback(false);

                        }

                    }, function( response ) {

                        callback(false);

                    }
                );
        }

        function logout() {

            // remove user from local storage
            if( check() ) {
                delete $localStorage.currentUser;
            }

            // clear http auth header
            $http.defaults.headers.common.Authorization = '';

            // redirect to the login page..?
            $location.path( settings.login );

        }
    }

})();