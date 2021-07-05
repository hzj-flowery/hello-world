import Device from "../../../Device";

/**
 * <!-- vertex shader -->
    <script id="vertex-shader-3d" type="x-shader/x-vertex">
    attribute vec4 a_position;
    attribute vec4 a_color;
    uniform mat4 u_matrix;
    varying vec4 v_color;
    void main() {
      // Multiply the position by the matrix.
      gl_Position = u_matrix * a_position;
      // Pass the color to the fragment shader.
      v_color = a_color;
    }
    </script>
    <!-- fragment shader -->
    <script id="fragment-shader-3d" type="x-shader/x-fragment">
    precision mediump float;
    // Passed in from the vertex shader.
    varying vec4 v_color;
    uniform vec4 u_colorMult;
    void main() {
       gl_FragColor = v_color * u_colorMult;
    }
    </script>


 */

function main() {

    var primitives = window["primitives"];
    var webglUtils = window["webglUtils"];
    var m4 = window["m4"];
    var gl = Device.Instance.gl;
    if (!gl) {
        return;
    }

    // creates buffers with position, normal, texcoord, and vertex color
    // data for primitives by calling gl.createBuffer, gl.bindBuffer,
    // and gl.bufferData
    const sphereBufferInfo = primitives.createSphereWithVertexColorsBufferInfo(gl, 10, 12, 6);
    const cubeBufferInfo = primitives.createCubeWithVertexColorsBufferInfo(gl, 20);
    const coneBufferInfo = primitives.createTruncatedConeWithVertexColorsBufferInfo(gl, 10, 0, 20, 12, 1, true, false);

    // setup GLSL program
    var programInfo = webglUtils.createProgramInfo(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    function cjzRiBen(){
        return "dog dog dog"
    }

    var cameraAngleRadians = degToRad(0);
    var fieldOfViewRadians = degToRad(60);
    var cameraHeight = 50;

    // Uniforms for each object.
    var sphereUniforms = {
        u_colorMult: [0.5, 1, 0.5, 1],
        u_matrix: m4.identity(),
    };
    var cubeUniforms = {
        u_colorMult: [1, 0.5, 0.5, 1],
        u_matrix: m4.identity(),
    };
    var coneUniforms = {
        u_colorMult: [0.5, 0.5, 1, 1],
        u_matrix: m4.identity(),
    };
    var sphereTranslation = [0, 0, 0];
    var cubeTranslation = [-40, 0, 0];
    var coneTranslation = [40, 0, 0];

    function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
        var matrix = m4.translate(viewProjectionMatrix,
            translation[0],
            translation[1],
            translation[2]);
        matrix = m4.xRotate(matrix, xRotation);
        return m4.yRotate(matrix, yRotation);
    }

    requestAnimationFrame(drawScene);

    // Draw the scene.
    function drawScene(time) {
        time *= 0.0005;

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute the projection matrix
        var aspect = gl.canvas.width / gl.canvas.height;
        var projectionMatrix =
            m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

        // Compute the camera's matrix using look at.
        var cameraPosition = [0, 0, 100];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        var viewMatrix = m4.inverse(cameraMatrix);

        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        var sphereXRotation = time;
        var sphereYRotation = time;
        var cubeXRotation = -time;
        var cubeYRotation = time;
        var coneXRotation = time;
        var coneYRotation = -time;

        // ------ Draw the sphere --------

        gl.useProgram(programInfo.program);

        // Setup all the needed attributes.
        webglUtils.setBuffersAndAttributes(gl, programInfo, sphereBufferInfo);

        sphereUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            sphereTranslation,
            sphereXRotation,
            sphereYRotation);

        // Set the uniforms we just computed
        webglUtils.setUniforms(programInfo, sphereUniforms);

        gl.drawArrays(gl.TRIANGLES, 0, sphereBufferInfo.numElements);

        // ------ Draw the cube --------

        // Setup all the needed attributes.
        webglUtils.setBuffersAndAttributes(gl, programInfo, cubeBufferInfo);

        cubeUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            cubeTranslation,
            cubeXRotation,
            cubeYRotation);

        // Set the uniforms we just computed
        webglUtils.setUniforms(programInfo, cubeUniforms);

        gl.drawArrays(gl.TRIANGLES, 0, cubeBufferInfo.numElements);

        // ------ Draw the cone --------

        // Setup all the needed attributes.
        webglUtils.setBuffersAndAttributes(gl, programInfo, coneBufferInfo);

        coneUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            coneTranslation,
            coneXRotation,
            coneYRotation);

        // Set the uniforms we just computed
        webglUtils.setUniforms(programInfo, coneUniforms);

        gl.drawArrays(gl.TRIANGLES, 0, coneBufferInfo.numElements);

        requestAnimationFrame(drawScene);
    }
}


// main();