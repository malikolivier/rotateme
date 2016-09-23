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

        jshint: {
            options: {
                reporter: require('jshint-stylish'), // use jshint-stylish to make our errors look and read good
            },
            // when this task is run, lint the Gruntfile and all js files in src
            build: ['**/*.js', '!node_modules/**', '!public/javascripts/lib/**', '!dist/**', '!Gruntfile.js']
        },

        bowerRequirejs: {
            target: {
                rjsConfig: 'public/javascripts/config.js'
            }
        },

        requirejs: {
            compileJS: {
                options: {
                    baseUrl: 'public/javascripts',
                    mainConfigFile: 'public/javascripts/config.js',
                    out: BUILD_JS_TMP,
                    name: "main",
                    include: ["config", "main"]
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
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bower-requirejs');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['jshint', 'bowerRequirejs', 'requirejs',
        'exec:compileCSS', 'exec:removeDistDir', 'copy', 'exec:removeTmpFiles'
    ]);

};
