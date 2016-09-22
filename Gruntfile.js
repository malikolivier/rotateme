//Gruntfile.js

module.exports = function(grunt) {

    // ===========================================================================
    // CONFIGURE GRUNT ===========================================================
    // ===========================================================================
    grunt.initConfig({

        // get the configuration info from package.json ----------------------------
        // this way we can use things like name and version (pkg.name)
        pkg: grunt.file.readJSON('package.json'),

        bowerRequirejs: {
            target: {
                rjsConfig: 'public/javascripts/config.js'
            }
        },

        requirejs: {
            compile: {
                options: {
                    shim: {
                        "bootstrap": { "deps": ['jquery'] }
                    },
                    baseUrl: 'public/javascripts',
                    mainConfigFile: 'public/javascripts/main.js',
                    name: 'main',
                    paths: {
                        bootstrap: 'lib/bootstrap/dist/js/bootstrap',
                        three: 'lib/three.js/build/three',
                        jquery: 'lib/jquery/dist/jquery'
                    },
                    include: ['jquery', 'bootstrap', 'three'],
                    out: 'public/javascripts/main.js'
                }
            }
        }
    });


    // ===========================================================================
    // LOAD GRUNT PLUGINS ========================================================
    // ===========================================================================
    // we can only load these if they are in our package.json
    // make sure you have run npm install so our app can find these
    grunt.loadNpmTasks('grunt-bower-requirejs');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask('default', ['bowerRequirejs']);

};
