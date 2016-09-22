require(['config'], function() {

    require(['render'], function(Render) {
        Render.start();
        Render.changeModel('malik', 'vertex');
    });

});
