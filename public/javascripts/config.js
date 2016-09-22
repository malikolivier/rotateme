require.config({
  baseUrl: '/javascripts',
  shim: {
    bootstrap: {
      deps: [
        'jquery'
      ]
    }
  },
  paths: {
    bootstrap: 'lib/bootstrap/dist/js/bootstrap',
    requirejs: 'lib/requirejs/require',
    three: 'lib/three.js/build/three',
    jquery: 'lib/jquery/dist/jquery'
  },
  packages: [

  ]
});
