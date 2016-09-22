//Gruntfile.js

const BUILD_JS_TMP = 'public/build.js';
const BUILD_CSS_TMP = 'public/build.css';

const DIST_DIR = 'dist';

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
            compileJS: {
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
                    out: BUILD_JS_TMP
                }
            }
        },

        exec: {
            compileCSS: 'r.js -o cssIn=public/stylesheets/main.css out=public/build.css',
            removeDistDir: `rm -rf ${DIST_DIR}`,
            removeTmpFiles: `rm ${BUILD_JS_TMP} ${BUILD_CSS_TMP}`
        },

        copy: {
            dist: {
                expand: true,
                files: [{
                    expand: true,
                    cwd: '.',
                    src: ['bin/**', 'routes/**', 'views/**', 'app.js'],
                    dest: DIST_DIR
                }, {
                    src: BUILD_CSS_TMP,
                    dest: `${DIST_DIR}/public/stylesheets/main.css`
                }, {
                    src: BUILD_JS_TMP,
                    dest: `${DIST_DIR}/public/javascripts/main.js`
                }, {
                    src: 'public/javascripts/lib/requirejs/require.js',
                    dest: `${DIST_DIR}/public/javascripts/lib/requirejs/require.js`
                }]
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
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['bowerRequirejs', 'requirejs',
        'exec:compileCSS', 'exec:removeDistDir', 'copy', 'exec:removeTmpFiles']);

};
