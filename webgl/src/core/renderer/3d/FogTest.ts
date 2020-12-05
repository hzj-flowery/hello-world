import Device from "../../Device";
import { glMatrix } from "../../Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { G_ShaderFactory } from "../shader/Shader";

var vertexshader3d =
  'attribute vec4 a_position;' +
  'attribute vec2 a_texcoord;' +
  'uniform mat4 u_worldView;' +
  'uniform mat4 u_projection;' +
  'varying vec2 v_texcoord;' +
  'varying vec3 v_position;' +
  'void main() {' +
  'gl_Position = u_projection * u_worldView * a_position;' +
  'v_texcoord = a_texcoord;' +
  'v_position = (u_worldView * a_position).xyz;' +
  '}'
var fragmentshader3d =
  'precision mediump float;' +
  'varying vec2 v_texcoord;' +
  'varying vec3 v_position;' +
  'uniform sampler2D u_texture;' +
  'uniform vec4 u_fogColor;' +
  'uniform float u_fogDensity;' +
  'void main() {' +
  'vec4 color = texture2D(u_texture, v_texcoord);' +
  'float fogDistance = length(v_position);' +
  'float fogAmount = 1. - exp2(-u_fogDensity * u_fogDensity * fogDistance * fogDistance * 1.442695);' +
  'fogAmount = clamp(fogAmount, 0., 1.);' +
  'gl_FragColor = mix(color, u_fogColor, fogAmount);' +
  '}'

"use strict";

var fogDataArrays = {
  position: new Float32Array([
    -0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,

    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,

    -0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,

    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5, 0.5,

    -0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,

    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, 0.5, 0.5,
  ]),
  texcoord: new Float32Array([
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,

    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,

    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,

    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,

    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,

    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,
  ])
}

function main() {

  var gl = Device.Instance.gl;
  if (!gl) {
    return;
  }

  // setup GLSL program
  var programShader = G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);

  var fogBufferArr = G_ShaderFactory.createBufferInfoFromArrays(fogDataArrays);

  var uniformData = {
    u_projection: {},
    u_worldView: {},
    u_texture: {},
    u_fogColor: {},
    u_fogDensity: {}
  }




  // Create a texture.
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255]));
  // Asynchronously load an image
  var image = new Image();
  image.src = "resources/f-texture.png";
  image.addEventListener('load', function () {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Check if the image is a power of 2 in both dimensions.
    if (MathUtils.isPowerOf2(image.width) && MathUtils.isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  });


  var fieldOfViewRadians = MathUtils.degToRad(60);
  var modelXRotationRadians = MathUtils.degToRad(0);
  var modelYRotationRadians = MathUtils.degToRad(0);
  var fogColor = [0.8, 0.9, 1, 1];
  var settings = {
    fogDensity: 0.092,
    xOff: 1.1,
    zOff: 1.4,
  };

  var webglLessonsUI = window["webglLessonsUI"];
  webglLessonsUI.setupUI(document.querySelector("#ui"), settings, [
    { type: "slider", key: "fogDensity", min: 0, max: 1, precision: 3, step: 0.001, },
  ]);

  // Get the starting time.
  var then = 0;

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time) {
    // convert to seconds
    time *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = time - then;
    // Remember the current time for the next frame.
    then = time;

    Device.Instance.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Animate the rotation
    modelYRotationRadians += -0.7 * deltaTime;
    modelXRotationRadians += -0.4 * deltaTime;

    // Clear the canvas AND the depth buffer.
    gl.clearColor(fogColor[0], fogColor[1], fogColor[2], fogColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(programShader.spGlID);




    G_ShaderFactory.setBuffersAndAttributes(programShader.attrSetters, fogBufferArr);

    // Compute the projection matrix
    var aspect = gl.canvas.width / gl.canvas.height;
    var projectionMatrix = glMatrix.mat4.perspective(null, fieldOfViewRadians, aspect, 1, 2000);

    var cameraPosition = [0, 0, 2];
    var up = [0, 1, 0];
    var target = [0, 0, 0];

    // Compute the camera's matrix using look at.
    var cameraMatrix = glMatrix.mat4.lookAt2(null, cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = glMatrix.mat4.invert(null, cameraMatrix);


    uniformData.u_projection = projectionMatrix;
    uniformData.u_texture = texture;
    uniformData.u_fogColor = fogColor;
    uniformData.u_fogDensity = settings.fogDensity;

    const numCubes = 40;
    for (let i = 0; i <= numCubes; ++i) {
      var worldViewMatrix = glMatrix.mat4.translate(null, viewMatrix, [-2 + i * settings.xOff, 0, -i * settings.zOff]);
      glMatrix.mat4.rotateX(worldViewMatrix, worldViewMatrix, modelXRotationRadians + i * 0.1);
      glMatrix.mat4.rotateY(worldViewMatrix, worldViewMatrix, modelYRotationRadians + i * 0.1);

      uniformData.u_worldView = worldViewMatrix;
      G_ShaderFactory.setUniforms(programShader.uniSetters,uniformData);
      G_ShaderFactory.drawBufferInfo(fogBufferArr, gl.TRIANGLES);
    }

    requestAnimationFrame(drawScene);
  }
}

export default class FogTest {
  static run() {
    main();
  }
}
