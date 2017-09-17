(function () {

    angular
        .module('app')
        .controller('SpeakersController',  Controller);

    Controller.$inject = ['$scope', 'leafletData', 'SpeakerService', 'Notification'];

    function Controller($scope, leafletData, SpeakerService, Notification) {

        // Leafet.draw cannot render multigeometries, e.g. MultiPolygons
        // This is where we will store these FeatureGroups, along with their metadata
        // We will always draw all FeatureGroups, but only one will be editable at a time
        // Structure of each group: { speaker_id: speaker.id, features: FeatureGroup }
        var editableGroups = [];

        var vm = this;

        // This will be a pointer to the currently editable FeatureGroup
        vm.currentGroup = null;

        // https://github.com/angular-ui/ui-leaflet-draw/issues/7
        vm.drawControl = null;

        vm.speakers = null;
        vm.map = null;

        vm.getColor = getColor;
        vm.setCurrentSpeaker = setCurrentSpeaker;

        activate();

        return vm;

        function activate() {

            // This is where we'll be adding our editable FeatureGroups
            leafletData.getMap('map').then( function( map ) {

                vm.map = map;

                // TODO: Also handle draw:edited and draw:deleted
                vm.map.on('draw:created', function(e) {
                    vm.currentGroup.features.addLayer(e.layer);
                });

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

                        var poly = new L.Polygon( shape, {
                            color: getColor( speaker.id ),
                        }).addTo( group );

                    });

                    // Add the FeatureGroup to the map
                    group.addTo( vm.map );

                    // Add the FeatureGroup to our tracker
                    editableGroups.push({
                        speaker_id: speaker.id,
                        features: group,
                    });

                });

            });

            initLeaflet();

        }


        function setCurrentSpeaker( id ) {

            var group = editableGroups.find( function( group ) {
                return group.speaker_id == id;
            });

            // Set the current group...
            vm.currentGroup = group;

            // TODO: Use flyToBounds?
            vm.map.fitBounds( vm.currentGroup.features.getBounds() );

            // Leaflet.draw does not allow changing the target featureGroup
            // We'll work around this by creating a new L.Draw.Control instance

            // Modify the drawOptions for the new drawControl instance
            vm.leaflet.drawOptions.edit.featureGroup = vm.currentGroup.features;

            // Remove the existing drawControl, if there is one
            if( vm.drawControl ) {
                vm.map.removeControl( vm.drawControl );
            }

            // Create the new drawControl
            vm.drawControl = new L.Control.Draw( vm.leaflet.drawOptions );

            vm.drawControl.addTo( vm.map );

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
                        // REQUIRED! Change this before initializing L.Draw.Control
                        featureGroup: null,
                        remove: true
                    }
                }

            };

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


        function getColor( seed, alpha ) {

            // Alpha is optional, defaults to 1
            var alpha = alpha || 1;

            // Uncomment these sections to control the hue
            // var hues = ['red', 'orange', 'yellow', 'purple', 'pink'];

            return randomColor({
                // hue: hues[Math.floor(Math.random() * hues.length)],
                luminosity: 'bright',
                seed: seed * 10, // increase differentiation
                format: alpha ? 'rgba' : 'hex',
                alpha: alpha,
            });

        }

    }

})();