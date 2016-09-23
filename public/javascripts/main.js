require(['config'], function() {

    require(['./render', 'jquery'], function(Render, $) {
        Render.start();
        Render.changeModel('malik', 'vertex');

        $(document).ready(function() {
            var fileInput = document.getElementById('plyFileInput');

            fileInput.addEventListener('change', function(e) {

                // file selection is done you can now read the file
                var file = this.files[0];

                // create a file reader
                var reader = new FileReader();

                // set on load handler for reader
                reader.onload = function(e) {
                    var result = reader.result;

                    // parse using your corresponding loader
                    Render.changeModelToPly(result);
                };

                // read the file as text using the reader
                reader.readAsArrayBuffer(file);
            });
        });
    });

});
