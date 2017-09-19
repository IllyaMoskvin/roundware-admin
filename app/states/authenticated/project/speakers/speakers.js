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

        vm.saving = false;

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

                vm.map.on('draw:created', saveLeafletChanges );
                vm.map.on('draw:edited', saveLeafletChanges );
                vm.map.on('draw:deleted', saveLeafletChanges );

                // It's up to the server callback to restore attenuation
                vm.map.on('draw:drawstart', hideCurrentAttenuationBorder );
                vm.map.on('draw:editstart', hideCurrentAttenuationBorder );
                vm.map.on('draw:deletestart', hideCurrentAttenuationBorder );

                // ...but because there's no draw:cancel event, we'll restore
                // attenuation if nothing is currently saving to server
                // https://github.com/Leaflet/Leaflet.draw/issues/357
                vm.map.on('draw:drawstop', showCurrentAttenuationBorder );
                vm.map.on('draw:editstop', showCurrentAttenuationBorder );
                vm.map.on('draw:deletestop', showCurrentAttenuationBorder );

            });

            SpeakerService.list().promise.then( function(cache) {

                vm.speakers = cache.dirty;

                // Verification for whether lat-lon needs to be flipped:
                // console.log( vm.speakers[1].shape.coordinates[0][0][0] );

                vm.speakers.forEach( function( speaker ) {

                    // Create a FeatureGroup for each Speaker
                    var group = new L.geoJSON();

                    // Get a copy of the shapes w/ their coord order flipped
                    var shapes = flip( speaker.shape.coordinates );

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
                        color: getColor( speaker.id ),
                        features: group,
                    });

                    setAttenuationBorder( speaker );

                });

            });

            initLeaflet();

        }


        function saveLeafletChanges( event ) {

            // Unforunately, we can't call toGeoJson on a FeatureGroup
            // https://github.com/Leaflet/Leaflet/issues/712
            // https://github.com/Leaflet/Leaflet/issues/2734

            var layers = vm.currentGroup.features.getLayers();

            var features = layers.map( function( polygon ) {
                return polygon.toGeoJSON();
            });

            var coordinates = features.map( function( feature ) {
                return feature.geometry.coordinates;
            });

            // Since we used toGeoJSON, flipping is not required?
            // console.log( coordinates[0][0][0] );
            // coordinates = flip( coordinates );

            var shape = {
                type: 'MultiPolygon',
                coordinates: coordinates,
            };

            // Dope. Now, save shape to server...
            vm.saving = true;

            SpeakerService.update( vm.currentGroup.speaker_id, {

                shape: shape

            }).promise.then( function( cache ) {

                // Draw the new attenuation_border on our map
                setAttenuationBorder( cache.clean );

                Notification.success( { message: 'Changes saved!' } );

            }).finally( function() {

                vm.saving = false;

            });

        }


        function setCurrentSpeaker( id ) {

            // Restore attenuation border for any previously edited Speaker
            // Fixes cases where this is called after triggering e.g. draw:drawstart
            showCurrentAttenuationBorder();

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
            vm.leaflet.drawOptions.draw.polygon.shapeOptions.color = vm.currentGroup.color;
            vm.leaflet.drawOptions.draw.rectangle.shapeOptions.color = vm.currentGroup.color;

            // Remove the existing drawControl, if there is one
            if( vm.drawControl ) {
                vm.map.removeControl( vm.drawControl );
            }

            // Create the new drawControl
            vm.drawControl = new L.Control.Draw( vm.leaflet.drawOptions );

            vm.drawControl.addTo( vm.map );

        }


        function setAttenuationBorder( speaker ) {

            var group = editableGroups.find( function( group ) {
                return group.speaker_id == speaker.id;
            });

            // Reset the group's attenuation_border
            if( group.attenuation ) {
                hideAttenuationBorder( group );
                delete group.attenuation;
            }

            // Create new attenuation FeatureGroup
            var attenuation = new L.geoJSON();

            var coordinates = speaker.attenuation_border.coordinates;

            // Refactor? Standardize to an array of lines
            switch( speaker.attenuation_border.type ) {
                case "MultiLineString":
                    flip( coordinates ).map( addLine );
                break;
                case "LineString":
                    [ flip( coordinates ) ].map( addLine );
                break;
            }

            // Helper for adding each line to FeatureGroup
            function addLine( line ) {

                new L.Polyline( line, {
                    color: getColor( speaker.id ),
                    weight: 1,
                }).addTo( attenuation );

            }

            // Show the FeatureGroup on the map
            attenuation.addTo( vm.map );

            // Save the attenuation group to our tracker
            group.attenuation = attenuation;

        }


        // Meant for L.Draw.Control callbacks
        function hideCurrentAttenuationBorder( ) {

            return hideAttenuationBorder( vm.currentGroup );

        }

        // Likewise, but this is a work-around for lack of draw:cancel
        function showCurrentAttenuationBorder( ) {

            if( vm.saving ) {
                return false;
            }

            return showAttenuationBorder( vm.currentGroup );

        }

        // Remove a group's attenuation from map, if it's shown
        function hideAttenuationBorder( group ) {

            if( !hasAttenuationBorder( group ) ) {
                return false;
            }

            if( !isAttenuationBorderDrawn( group ) ) {
                return false;
            }

            group.attenuation.removeFrom( vm.map );

            return true;

        }

        // Add the group's attenuation to map, if it's hidden
        function showAttenuationBorder( group ) {

            if( !hasAttenuationBorder( group ) ) {
                return false;
            }

            if( isAttenuationBorderDrawn( group ) ) {
                return false;
            }

            group.attenuation.addTo( vm.map );

            return true;

        }

        function hasAttenuationBorder( group ) {

            if( !group ) {
                return false;
            }

            if( !group.attenuation ) {
                return false;
            }

            return true;

        }

        function isAttenuationBorderDrawn( group ) {

            return vm.map.hasLayer( group.attenuation );

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
                                opacity: 1,
                                weight: 3,
                            }
                        },
                        circle: false,
                        circlemarker: false,
                        rectangle: {
                            shapeOptions: {
                                opacity: 1,
                                weight: 3,
                            },
                        },
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

        // I've abstracted flipping to be recursive:
        // https://tools.ietf.org/html/rfc7946#section-3.1.1

        function flip( array ) {

            // Is this an array of arrays, or is it a point?
            if( array[0] && array[0].constructor === Array ) {
                return array.map( flip );
            }

            // array.reverse edits in place, but we want a copy
            var point = angular.extend( [], array );

            return point.reverse();

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