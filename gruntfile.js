module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass_globbing: {
            dist: {
                files: {
                    'app/map.scss': ['app/**/*.scss','!app/*'],
                },
                options: {
                    useSingleQuotes: false,
                    signature: '// Generated with grunt-sass-globbing'
                }
            }
        },
        sass: {
            dist: {
                options: {
                    noCache: true,
                    sourcemap: "none",
                    unixNewlines: true,
                    style: "expanded",
                    lineNumbers: false
                },
                files: {
                    'app/app.css' : 'app/app.scss'
                }
            }
        },
        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    linebreak: true,
                    banner: '/**\n' +
                            ' * This file was generated with grunt-contrib-sass.\n' +
                            ' * Do NOT edit it directly! Edit *.scss files instead.\n' +
                            ' * Consult the readme for more details.\n' +
                            ' */\n',
                },
                files: {
                    src: ['app/app.css']
                }
            }
        },
        watch: {
            styles: {
                files: ['**/*.scss'],
                tasks: ['sass_globbing', 'sass', 'usebanner'],
                options: {
                    event: ['changed', 'added', 'deleted']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-sass-globbing');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-banner');

    grunt.registerTask('default', ['sass_globbing', 'sass', 'usebanner', 'watch'] );

};