(function () {

    angular
        .module('app')
        .controller('SpeakersController',  Controller);

    Controller.$inject = ['$scope', 'leafletDrawEvents', 'SpeakerService', 'Notification'];

    function Controller($scope, leafletDrawEvents, SpeakerService, Notification) {

        // This is where all the speaker shapes are stored
        // https://github.com/Leaflet/Leaflet/issues/2495
        // https://github.com/Leaflet/Leaflet/issues/1455
        var drawnItems  = new L.geoJSON();

        var vm = this;

        vm.speakers = null;

        activate();

        return vm;

        function activate() {

            vm.speakers = SpeakerService.list().cache.dirty;

            initLeaflet();

        }

        function initLeaflet() {

            // Leaflet configs: http://angular-ui.github.io/ui-leaflet/
            vm.leaflet = {
                center: {
                    lat: 0,
                    lng: 0,
                    zoom: 6,
                },
                defaults: {
                    scrollWheelZoom: false,
                },

                // https://github.com/Leaflet/Leaflet.draw
                drawOptions: {
                    draw: {
                        position : 'bottomright',
                        polyline: false,
                        polygon: {
                            allowIntersection: false,
                            drawError: {
                                color: '#e1e100',
                                message: 'Polygons cannot intersect.'
                            },
                            shapeOptions: {
                                color: '#bada55'
                            }
                        },
                        circle: false,
                        circlemarker: false,
                        rectangle: false,
                        marker: false,
                    },
                    edit: {
                        featureGroup: drawnItems, //REQUIRED!!
                        remove: false
                    }
                }

            };


            var handle = {
                created: function(e,leafletEvent, leafletObject, model, modelName) {
                    drawnItems.addLayer(leafletEvent.layer);
                },
                edited: function(arg) {},
                deleted: function(arg) {},

                // These events aren't useful, but available for binding
                drawstart: function(arg) {},
                drawstop: function(arg) {},
                editstart: function(arg) {},
                editstop: function(arg) {},
                deletestart: function(arg) {},
                deletestop: function(arg) {}
            };

            var drawEvents = leafletDrawEvents.getAvailableEvents();

            drawEvents.forEach(function(eventName){
                $scope.$on('leafletDirectiveDraw.' + eventName, function(e, payload) {
                    //{leafletEvent, leafletObject, model, modelName} = payload
                    var leafletEvent, leafletObject, model, modelName; //destructuring not supported by chrome yet :(
                    leafletEvent = payload.leafletEvent, leafletObject = payload.leafletObject, model = payload.model,
                    modelName = payload.modelName;
                    handle[eventName.replace('draw:','')](e,leafletEvent, leafletObject, model, modelName);
                });
            });

        }

    }

})();