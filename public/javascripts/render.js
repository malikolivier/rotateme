define(['three', 'jquery', './whammy', './OrbitControls'], function(THREE, $, Whammy) {
    var Render = {
        debugging: false,
        // shaderLoaded: function called back when shaders are finished loading
        start: function(shaderLoaded) {
            this.measure = "off";
            var self = this;
            var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 10e20);
            var scene = new THREE.Scene();
            var ambientLight = new THREE.AmbientLight(0xffffff);
            scene.add(ambientLight);
            var frontLight = new THREE.PointLight(0x666666, 5, 30);
            frontLight.position.set(0, 5, 5);
            scene.add(frontLight);
            var backLight = new THREE.PointLight(0x666666, 5, 30);
            backLight.position.set(0, 5, -5);
            scene.add(backLight);

            // Add background
            var cameraCube = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 10e20);
            var sceneCube = new THREE.Scene();
            var path = "../resources/bg/blue/";
            var format = '.png';
            var urls = [
                path + 'px' + format, path + 'nx' + format,
                path + 'py' + format, path + 'ny' + format,
                path + 'pz' + format, path + 'nz' + format
            ];
            var reflectionCube = new THREE.CubeTextureLoader().load(urls);
            reflectionCube.format = THREE.RGBFormat;

            var viewDirectionProjectionInverse = new THREE.Matrix4();
            var geometry = new THREE.PlaneBufferGeometry(2, 2);
            var uniforms = {
                skybox: {
                    type: "t",
                    value: reflectionCube
                },
                viewDirectionProjectionInverse: {
                    type: "m4",
                    value: viewDirectionProjectionInverse
                },
            };

            $.ajax({
                url: "../resources/shaders/skybox.vert",
                success: function(vertexShader) {
                    $.ajax({
                        url: "../resources/shaders/skybox.frag",
                        success: function(fragmentShader) {
                            var material = new THREE.ShaderMaterial({
                                uniforms: uniforms,
                                vertexShader: vertexShader,
                                fragmentShader: fragmentShader,
                                depthWrite: false
                            });

                            Render.skyBoxMesh = new THREE.Mesh(geometry, material);
                            scene.add(Render.skyBoxMesh);
                            if (shaderLoaded)
                                shaderLoaded();
                        }
                    });
                }
            });
            // End add background

            var canvas = document.getElementById("canvas");

            var renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                autoclear: false
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            // controls
            var controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.target.set(0, 0.85, 0);
            controls.enableDamping = true;
            controls.minPolarAngle = Math.PI / 2;
            controls.maxPolarAngle = Math.PI / 2;
            camera.position.set(0, 0.9, 3);
            // End orbit controls

            // After the canvas size is set, start drawing on canvas
            // The canvas size will be set when the drawing of all DOM elements is finished.
            var trySetCanvasSize = function() {
                setTimeout(function() {
                    if (canvas.getBoundingClientRect().top === 0) {
                        trySetCanvasSize();
                    } else {
                        var rect = canvas.getBoundingClientRect();
                        var rendererTop = rect.top;
                        var rendererLeft = rect.left;
                        renderer.setSize(window.innerWidth - rendererLeft * 2, window.innerHeight - rendererTop - rendererLeft);
                        camera.aspect = canvas.width / canvas.height;
                        cameraCube.aspect = canvas.width / canvas.height;
                        camera.updateProjectionMatrix();
                        cameraCube.updateProjectionMatrix();
                        requestAnimationFrame(render);
                    }
                }, 100);
            };
            trySetCanvasSize();

            function dataURItoBlob(dataURI) {
                var mimetype = dataURI.split(",")[0].split(':')[1].split(';')[0];
                var byteString = atob(dataURI.split(',')[1]);
                var u8a = new Uint8Array(byteString.length);
                for (var i = 0; i < byteString.length; i++) {
                    u8a[i] = byteString.charCodeAt(i);
                }
                return new Blob([u8a.buffer], {
                    type: mimetype
                });
            }

            function saveSnapshot(blob, type, done) {
                if (typeof cordova !== 'undefined') {
                    // Save to phone memory
                    var now = new Date();
                    var filename = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate() +
                        "_" + now.getHours() + "-" + now.getMinutes() + "-" + now.getSeconds();
                    var file = new app.io.File("snapshot-" + filename + "." + type, app.io.PICTURES, function(file) {
                        file.write(blob, function() {
                            // Do something when the write has finished
                            //window.location.assign(file.getPath()); // DIRTY TEST to show the picture in the WebView
                            if (done) done();
                        });
                    });
                }
            }

            var takeSnapshot = false,
                imgData;
            var takeVideoSnapshot = false,
                stopVideoSnapshot = false,
                encoder = null,
                frameCounter = 0;
            var autoRotateSpeed = 0;

            function render() {
                // Render background
                cameraCube.rotation.copy(camera.rotation);
                cameraCube.matrixWorldInverse.getInverse(cameraCube.matrixWorld);
                viewDirectionProjectionInverse.multiplyMatrices(cameraCube.projectionMatrix, cameraCube.matrixWorldInverse);
                viewDirectionProjectionInverse.getInverse(viewDirectionProjectionInverse);

                renderer.render(sceneCube, cameraCube);
                //End render background

                controls.update();

                renderer.render(scene, camera);
                $.each(moreScenes, function(i, val) {
                    renderer.clearDepth();
                    renderer.render(val.scene, val.camera);
                });

                if (takeSnapshot) {
                    takeSnapshot = false;
                    imgData = renderer.domElement.toDataURL();
                    var imgBlob = dataURItoBlob(imgData);
                    saveSnapshot(imgBlob, "png");
                    var anchor = document.createElement('a');
                    anchor.href = imgData;
                    var fileName = "snapshot.png";
                    anchor.setAttribute('download', fileName);
                    anchor.setAttribute('target', '_blank');
                    // The element must be appended to the DOM for it to work on Firefox
                    document.body.appendChild(anchor);
                    anchor.click();
                }
                if (takeVideoSnapshot) {
                    if (encoder === null) {
                        encoder = new Whammy.Video(15);
                    }
                    if (frameCounter % 4 === 0) {
                        imgData = renderer.domElement.toDataURL("image/webp");
                        encoder.add(imgData);
                        var gl = renderer.getContext();
                        var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
                        gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    }
                    frameCounter++;
                    if (stopVideoSnapshot) {
                        takeVideoSnapshot = false;
                        stopVideoSnapshot = false;
                        var output = encoder.compile();
                        encoder = null;
                        saveSnapshot(output, "webm", function() {
                            alert("Snapshot saved to storage!");
                        });
                        var url = window.URL.createObjectURL(output);
                        var anchor = document.createElement('a');
                        anchor.href = url;
                        var fileName = "snapshot.webm";
                        anchor.setAttribute('download', fileName);
                        anchor.setAttribute('target', '_blank');
                        // The element must be appended to the DOM for it to work on Firefox
                        document.body.appendChild(anchor);
                        anchor.click();
                    }
                }
                Render.moveMesh(autoRotateSpeed);

                requestAnimationFrame(render);
            }

            // Compute position on screen (in pixel) of the Vector3 given as input argument
            this.toScreenPosition = function(point) {
                var widthHalf = 0.5 * renderer.domElement.clientWidth;
                var heightHalf = 0.5 * renderer.domElement.clientHeight;
                var vector = new THREE.Vector3().copy(point);
                vector.project(camera);

                vector.x = (vector.x * widthHalf) + widthHalf;
                vector.y = -(vector.y * heightHalf) + heightHalf;

                if (Render.debugging) {
                    alert(JSON.stringify({
                        point: point,
                        widthHalf: widthHalf,
                        heightHalf: heightHalf,
                        camera: camera,
                        vector: vector
                    }));
                }

                return {
                    x: vector.x,
                    y: vector.y
                };
            };
            this.getCanvas = function() {
                return canvas;
            };
            this.getControls = function() {
                return controls;
            };
            this.getMesh = function() {
                return scene.getObjectByName("human");
            };
            this.getCamera = function() {
                return camera;
            };
            this.getScene = function() {
                return scene;
            };
            this.getRenderer = function() {
                return renderer;
            };
            this.resetCamera = function() {
                camera.position.x = 0;
                camera.position.y = 0.85;
                camera.position.z = 3;
                camera.rotation.x = 0;
                camera.rotation.y = 0;
                camera.rotation.z = 0;
                // Must reset the rotation of the mesh as well
                this.getMesh().rotation.y = 0;
            };
            var moreScenes = [];
            this.addScene = function(scene, camera) {
                moreScenes.push({
                    scene: scene,
                    camera: camera
                });
            };
            this.takeSnapshot = function() {
                takeSnapshot = true;
            };
            this.takeVideoSnapshot = function() {
                if (takeVideoSnapshot) {
                    stopVideoSnapshot = true;
                } else {
                    takeVideoSnapshot = true;
                }
            };
            this.setAutoRotateSpeed = function(speed) {
                autoRotateSpeed = speed;
            };

        },

        changeBG: function(backgroundName, format) {
            var skyBox = Render.skyBoxMesh;
            var path = "../resources/bg/" + backgroundName + "/";
            format = '.' + format;
            var urls = [
                path + 'px' + format, path + 'nx' + format,
                path + 'py' + format, path + 'ny' + format,
                path + 'pz' + format, path + 'nz' + format
            ];
            skyBox.material.uniforms.skybox.value = new THREE.CubeTextureLoader().load(urls);
            skyBox.material.uniforms.skybox.value.format = THREE.RGBFormat;
        },

        changeModel: (function() {
            var loader = new THREE.JSONLoader();
            return function(modelName, textures) {
                loader.load('../resources/bodies/' + modelName + '.json', function(geometry, materials) {
                    var faceMaterial, humanMesh;
                    if (textures === 'vertex') {
                        faceMaterial = new THREE.MeshLambertMaterial({
                            vertexColors: THREE.VertexColors
                        });
                        humanMesh = new THREE.Mesh(geometry, faceMaterial);
                    } else if (textures === 'diffuse') {
                        faceMaterial = new THREE.MultiMaterial(materials);
                        humanMesh = new THREE.Mesh(geometry, faceMaterial);
                    } else {
                        throw "Unkown texture type as argument: " + textures;
                    }
                    humanMesh.name = "human";
                    // Set material to DoubleSide to enable raycasting from within the mesh
                    humanMesh.material.side = THREE.DoubleSide;
                    var scene = Render.getScene();
                    scene.remove(scene.getObjectByName("human"));
                    scene.add(humanMesh);
                });
            };
        })(),

        moveMesh: function(direction) {
            var mesh = Render.getMesh()
            if (mesh) {
                mesh.rotation.y += Math.PI / 2 * direction;
            }
        }

    };

    // Pollute global namespace:
    window.changeBG = Render.changeBG;
    setTimeout( function() {
        window.takeSnapshot = Render.takeSnapshot;
        window.takeVideoSnapshot = Render.takeVideoSnapshot;
        window.setAutoRotateSpeed = Render.setAutoRotateSpeed;
    }, 1000);

    return Render;
});
