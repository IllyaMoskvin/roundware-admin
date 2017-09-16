(function () {

    angular
        .module('app')
        .controller('SpeakersController',  Controller);

    Controller.$inject = ['$scope', 'leafletData', 'leafletDrawEvents', 'SpeakerService', 'Notification'];

    function Controller($scope, leafletData, leafletDrawEvents, SpeakerService, Notification) {

        // Leafet.draw cannot render multigeometries, e.g. MultiPolygons
        // We need to decompose MultiPolygons into FeatureGroups of Polygons
        // This is where we will store these FeatureGroups
        var editableGroups = [];

        // We will always draw all FeatureGroups, but only one will be editable at a time.

        var vm = this;

        vm.speakers = null;
        vm.map = null;

        activate();

        return vm;

        function activate() {

            // This is where we'll be adding our editable FeatureGroups
            leafletData.getMap('map').then( function( map ) {

                vm.map = map;

            });

            SpeakerService.list().promise.then( function(cache) {

                vm.speakers = cache.dirty;

                vm.speakers.forEach( function( speaker ) {

                    // Create a FeatureGroup for each Speaker
                    var group = new L.geoJSON();

                    // Get a copy of the shapes w/ their coord order flipped
                    var shapes = getFlippedShapes( speaker.shape.coordinates );

                    // Add the shapes as Polygons to our FeatureGroup
                    shapes.forEach( function( shape ) {

                        var poly = new L.Polygon( shape ).addTo( group );

                    });

                    // Add the FeatureGroup to the map
                    group.addTo( vm.map );

                    // Add the FeatureGroup to our tracker
                    editableGroups.push( group );

                });

            });

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
                        featureGroup: editableGroups[0], //REQUIRED!!
                        remove: false
                    }
                }

            };


            var handle = {
                created: function(e,leafletEvent, leafletObject, model, modelName) {
                    editableGroups[0].addLayer(leafletEvent.layer);
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


        // Django returns GeoJSON? Lat & Long are flipped.
        // https://github.com/Leaflet/Leaflet/issues/2495
        // https://github.com/Leaflet/Leaflet/issues/1455
        function getFlippedShapes( coordinates ) {

            // Avoid changing the original arrays
            var shapes = angular.extend( [], coordinates );

            // Flip each coordinate in each shape
            return shapes.map( function( shape ) {

                return shape.map( function( points ) {

                    return points.map( function( point ) {

                        return point.reverse();

                    });

                });

            });

        }

    }

})();