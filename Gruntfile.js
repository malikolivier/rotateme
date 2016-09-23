//Gruntfile.js

module.exports = function(grunt) {

    // ===========================================================================
    // CONFIGURE GRUNT ===========================================================
    // ===========================================================================
    grunt.initConfig({

        // get the configuration info from package.json ----------------------------
        // this way we can use things like name and version (pkg.name)
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                reporter: require('jshint-stylish'), // use jshint-stylish to make our errors look and read good
            },
            // when this task is run, lint the Gruntfile and all js files in src
            build: ['**/*.js', '!node_modules/**', '!public/javascripts/lib/**', '!dist/**', 'Gruntfile.js']
        },

        css_import: {
            compile: {
                files: {
                    "dist/index.css": ['public/stylesheets/main.css']
                }
            }
        },

        pug: {
            compile: {
                files: {
                    "dist/index.html": ['views/index.pug']
                }
            }
        },

        browserify: {
            compile: {
                files: {
                    "dist/index.js": ['public/javascripts/main.js']
                }
            }
        },

        uglify: {
            dist: {
                files: {
                    "dist/index.js": ["dist/index.js"]
                }
            }
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'public/resources',
                    src: ['**/*'],
                    dest: 'dist/resources'
                }]
            }
        }


    });


    // ===========================================================================
    // LOAD GRUNT PLUGINS ========================================================
    // ===========================================================================
    // we can only load these if they are in our package.json
    // make sure you have run npm install so our app can find these
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-css-import');
    grunt.loadNpmTasks('grunt-contrib-pug');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['jshint', 'css_import', 'pug', 'browserify',
        'uglify', 'copy']);

    grunt.registerTask('dev', ['jshint', 'css_import', 'pug', 'browserify',
        'copy']);

};
