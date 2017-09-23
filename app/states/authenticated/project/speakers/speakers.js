(function () {

    angular
        .module('app')
        .controller('SpeakersController',  Controller);

    Controller.$inject = ['$scope', 'leafletData', 'SpeakerService', 'ModalService', 'Notification'];

    function Controller($scope, leafletData, SpeakerService, ModalService, Notification) {

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
        vm.deleteSpeaker = deleteSpeaker;

        vm.saving = false;
        vm.editing = false;

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
                vm.map.on('draw:drawstart', editStart );
                vm.map.on('draw:editstart', editStart );
                vm.map.on('draw:deletestart', editStart );

                // ...but because there's no draw:cancel event, we'll restore
                // attenuation if nothing is currently saving to server
                // https://github.com/Leaflet/Leaflet.draw/issues/357
                vm.map.on('draw:drawstop', editStop );
                vm.map.on('draw:editstop', editStop );
                vm.map.on('draw:deletestop', editStop );

                // Helpers to decrease repetition
                function editStart() {
                    hideCurrentAttenuationBorder();
                    vm.editing = true;
                }

                function editStop() {
                    showCurrentAttenuationBorder();
                    vm.editing = false;
                }

            });

            SpeakerService.list().promise.then( function(cache) {

                // Save the cache to controller
                vm.speakers = cache;

                // Set up $watchers for updates
                initWatchers();

                // Run the first draw loop manually
                vm.speakers.clean.forEach( setSpeaker );

                fitBoundsToAll();

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


        // Useful for resetting the map to show all Speakers
        function fitBoundsToAll( ) {

            // Create a FeatureGroup of FeatureGroups
            var features = editableGroups.map( function( group ) {
                return group.features;
            });

            var group = new L.FeatureGroup( features );

            vm.map.fitBounds( group.getBounds() );

        }


        function setCurrentSpeaker( id ) {

            // Restore attenuation border for any previously edited Speaker
            // Fixes cases where this is called after triggering e.g. draw:drawstart
            showCurrentAttenuationBorder();

            var speaker = vm.speakers.clean.find( function( speaker ) {
                return speaker.id == id;
            });

            var group = editableGroups.find( function( group ) {
                return group.speaker_id == id;
            });

            // Set the current group...
            vm.currentGroup = group;

            // TODO: Use flyToBounds?
            if( vm.currentGroup.features.getLayers().length > 0 ) {
                vm.map.fitBounds( vm.currentGroup.features.getBounds() );
            } else {
                fitBoundsToAll();
            }

            // Leaflet.draw does not allow changing the target featureGroup
            // We'll work around this by creating a new L.Draw.Control instance

            // Modify the drawOptions for the new drawControl instance
            vm.leaflet.drawOptions.edit.featureGroup = vm.currentGroup.features;
            vm.leaflet.drawOptions.draw.polygon.shapeOptions.color = vm.currentGroup.color;
            vm.leaflet.drawOptions.draw.rectangle.shapeOptions.color = vm.currentGroup.color;

            // TODO: This doesn't actually change the leaflet-draw-guide-dash colors
            vm.leaflet.drawOptions.draw.polygon.shapeOptions.className = getSpeakerClasses( speaker );
            vm.leaflet.drawOptions.draw.rectangle.shapeOptions.className = getSpeakerClasses( speaker );

            // Remove the existing drawControl, if there is one
            if( vm.drawControl ) {

                // This is definitely a hack, but Leaflet.draw doesn't clean up after itself, so...
                // If we don't do this, `Cancel` won't be fired if you switch Speakers while drawing
                for( var toolbar in vm.drawControl._toolbars ) {
                    vm.drawControl._toolbars[toolbar].disable();
                }

                vm.map.removeControl( vm.drawControl );
            }

            // Create the new drawControl
            vm.drawControl = new L.Control.Draw( vm.leaflet.drawOptions );

            vm.drawControl.addTo( vm.map );

        }


        function setSpeaker( speaker ) {

            // Check if this speaker's features are already being tracked
            var group = editableGroups.find( function( group ) {
                return group.speaker_id == speaker.id;
            });

            var features;

            if( typeof group !== 'undefined' ) {

                // Use the existing FeatureGroup, avoid breaking drawControl
                features = group.features;

                // Remove existing shapes from the group
                features.clearLayers();

            } else {

                // Create a FeatureGroup for the Speaker
                features = new L.geoJSON();

                // Create new metagroup
                group = {
                    speaker_id: speaker.id,
                    color: getColor( speaker.id ),
                };

                // Add the FeatureGroup to our tracker
                editableGroups.push( group );

            }

            // Add the FeatureGroup to the map
            features.addTo( vm.map );

            // New Speakers will have `shape` as null
            if( speaker.shape ) {

                // Get a copy of the shapes w/ their coord order flipped
                var shapes = flip( speaker.shape.coordinates );

                // Add the shapes as Polygons to our FeatureGroup
                shapes.forEach( function( shape ) {

                    var poly = new L.Polygon( shape, {
                        color: getColor( speaker.id ),
                        className: getSpeakerClasses( speaker ),
                    }).addTo( features );

                    // Clicking on a shape opens this speaker
                    poly.on('click', function() {

                        // Don't interfere with actual functionality
                        if( vm.editing ) {
                            return;
                        }

                        setCurrentSpeaker( speaker.id );

                    });

                });

            }

            // Add the features to our metagroup
            group.features = features;

            // Add `attenuation_border` to map and tracker
            setAttenuationBorder( speaker );

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

            // Abort if the (new) serverside attenuation is undefined
            if( !speaker.attenuation_border ) {
                return false;
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
                    className: getAttenuationClasses( speaker ),
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

        function deleteSpeaker( id ) {

            ModalService.open('speaker-confirm-delete').result.then( function() {

                SpeakerService.delete( id ).promise.then( function() {

                    Notification.warning( { message: 'Speaker deleted!' } );

                });

            });

        }

        // Moved here due to sheer size. We are watching the "clean" speakers
        // collection, and setting up individual watchers for each speaker.
        // The goal is to prevent a watch cascade, where an update on one speaker
        // triggers an update for all other speakers. setSpeakers is effectively
        // indemnipotent, but using a simple deep watch caused bugs w/ attenuation
        function initWatchers( ) {

            var watchers = [];

            // Set a watch to catch serverside updates
            $scope.$watchCollection( 'vm.speakers.clean', function( speakers ) {

                console.log('📫 Speaker collection change detected');

                // vm.speakers should be defined at this point, but if not, exit
                if( !speakers ) {
                    return;
                }

                // Identify any speakers that were removed
                var removed_speakers = watchers.filter( function( watcher ) {

                    var match = speakers.find( function( speaker ) {
                        return speaker.id == watcher.id
                    });

                    return (typeof match === 'undefined');

                });

                // Identify any speakers that were added
                var added_speakers = speakers.filter( function( speaker ) {

                    var match = watchers.find( function( watcher ) {
                        return watcher.id == speaker.id
                    });

                    return (typeof match === 'undefined');

                });

                // Remove any watchers for removed Speakers
                removed_speakers.forEach( function( speaker ) {

                    var watcher = watchers.find( function( watcher ) {
                        return watcher.id == speaker.id;
                    });

                    // Call the function returned by the watcher to remove it
                    // https://stackoverflow.com/questions/14957614/angularjs-clear-watch
                    watcher.listener();

                    // Remove this watcher from our list
                    watchers.splice( watchers.indexOf( watcher ), 1 );

                    // Remove this Speaker from the map
                    var group = editableGroups.find( function( group ) {
                        return group.speaker_id == speaker.id;
                    });

                    if( group ) {

                        if( group.features ) {
                            group.features.removeFrom( vm.map );
                            group.features = null;
                        }

                        if( group.attenuation ) {
                            group.attenuation.removeFrom( vm.map );
                            group.attenuation = null;
                        }

                    }

                    // Remove this speaker from our tracker
                    editableGroups.splice( editableGroups.indexOf( group ), 1 );

                    // Remove the current draw control
                    if( vm.currentGroup && vm.currentGroup.speaker_id == speaker.id ) {

                        // TODO: Reduce code duplication!
                        for( var toolbar in vm.drawControl._toolbars ) {
                            vm.drawControl._toolbars[toolbar].disable();
                        }

                        vm.map.removeControl( vm.drawControl );
                        vm.currentGroup = null;
                        vm.drawControl = null;
                    }

                    console.log('Removed Speaker #' + speaker.id);

                });

                // Add watchers for added Speakers
                added_speakers.forEach( function( speaker ) {

                    // Add new watcher to our list
                    var watcher = {
                        id: speaker.id,
                        initialized: false,
                    };

                    watchers.push( watcher );

                    // This doesn't work b/c the index changes when an item is removed...
                    var index = vm.speakers.clean.indexOf( speaker );
                    var expression = 'vm.speakers.clean[' + index + ']';

                    // What attributes are we actually interested in watching?
                    var attributes = [
                        expression + '.activeyn',
                        expression + '.attenuation_distance',
                        expression + '.attenuation_border',
                    ];

                    // Watch these attributes, and check if any of them actually changed
                    watcher.listener = $scope.$watchGroup( attributes, function( new_values, old_values ) {

                        console.log('👂 Possible change detected for Speaker #' + speaker.id);

                        if( watcher.initialized ) {

                            var changed = false;

                            for( var i=0; i < new_values.length; i++ ) {
                                if( new_values[i] != old_values[i] ) {
                                    console.log('➡ Attr. change in Speaker #' + speaker.id + ': ' + attributes[i]);
                                    console.log('↪ New: ', new_values[i]);
                                    console.log('↪ Old: ', old_values[i]);
                                    changed = true;
                                }
                            }

                            if( !changed ) {
                                console.log('🚫 Nothing actually changed for Speaker #' + speaker.id);
                                return;
                            }

                        }

                        watcher.initialized = true;

                        // Sanity check
                        console.log('‼ Change confirmed for Speaker #' + speaker.id);

                        // This is the function we actually want to call
                        setSpeaker( speaker );

                    });

                    console.log('👓 Added watcher for Speaker #' + speaker.id);

                });

            });

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
                            shapeOptions: {},
                        },
                        circle: false,
                        circlemarker: false,
                        rectangle: {
                            shapeOptions: {},
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


        function getSpeakerClasses( speaker ) {

            return getActiveClasses( speaker, 'rw-map-speaker' );

        }


        function getAttenuationClasses( speaker ) {

            return getActiveClasses( speaker, 'rw-map-attenuation' );

        }

        function getActiveClasses( speaker, base ) {

            var classes = [
                base,
                speaker.activeyn ? 'active' : 'inactive',
            ];

            return classes.join(' ');

        }

    }

})();