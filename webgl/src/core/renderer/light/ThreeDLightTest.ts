import Device from "../../Device";
import LoaderManager from "../../LoaderManager";
import { glMatrix } from "../../Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { BufferAttribsData, G_ShaderFactory } from "../shader/Shader";

//三维光源
var vertexshader3d =
  'attribute vec4 a_position;' +
  'attribute vec3 a_normal;' +
  'uniform mat4 u_worldViewProjection;' +
  'uniform mat4 u_worldInverseTranspose;' +
  'varying vec3 v_normal;' +
  'void main() {' +
  'gl_Position = u_worldViewProjection * a_position;' +
  'v_normal = mat3(u_worldInverseTranspose) * a_normal;' +
  '}'


var fragmentshader3d =
  'precision mediump float;' +
  'varying vec3 v_normal;' +
  'uniform vec3 u_reverseLightDirection;' +
  'uniform vec4 u_color;' +
  'void main() {' +
  'vec3 normal = normalize(v_normal);' +
  'float light = dot(normal, u_reverseLightDirection);' +
  'gl_FragColor = u_color;' +
  'gl_FragColor.rgb *= light;' +
  '}'

"use strict";


function main() {
  var gl = Device.Instance.gl;
  if (!gl) {
    return;
  }

  // setup GLSL program
  var programShader = G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);
  
  let datas = LoaderManager.instance.getRes("res/models/char/F.json");
  let cubeData:any = {};
  cubeData.position = new Float32Array(datas.position);
  cubeData.normal = new Float32Array(datas.normal);

  var matrix = glMatrix.mat4.identity(null);
  glMatrix.mat4.rotateX(matrix,matrix,Math.PI);
  glMatrix.mat4.translate(matrix,matrix, [-50, -75, -15]);
  for (var ii = 0; ii < cubeData.position.length; ii += 3) {
    var vector = glMatrix.mat4.transformPoint(null,matrix, [cubeData.position[ii + 0], cubeData.position[ii + 1], cubeData.position[ii + 2], 1]);
    cubeData.position[ii + 0] = vector[0];
    cubeData.position[ii + 1] = vector[1];
    cubeData.position[ii + 2] = vector[2];
  }

  var cubeBufferInfo: BufferAttribsData = G_ShaderFactory.createBufferInfoFromArrays(cubeData);
  var fieldOfViewRadians = MathUtils.degToRad(60);
  var fRotationRadians = 0;

  drawScene();

  // Setup a ui.
  var webglLessonsUI = window["webglLessonsUI"];
  webglLessonsUI.setupSlider("#fRotation", { value: MathUtils.radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360 });

  function updateRotation(event, ui) {
    fRotationRadians = MathUtils.degToRad(ui.value);
    drawScene();
  }

  // Draw the scene.
  function drawScene() {
    Device.Instance.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Turn on culling. By default backfacing triangles
    // will be culled.
    gl.enable(gl.CULL_FACE);

    // Enable the depth buffer
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(programShader.spGlID);

   


    // Compute the projection matrix
    var aspect = gl.canvas.width / gl.canvas.height;
    var zNear = 1;
    var zFar = 2000;
    var projectionMatrix = glMatrix.mat4.perspective(null, fieldOfViewRadians, aspect, zNear, zFar);

    // Compute the camera's matrix
    var camera = [100, 150, 200];
    var target = [0, 35, 0];
    var up = [0, 1, 0];
    var cameraMatrix = glMatrix.mat4.lookAt2(null, camera, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = glMatrix.mat4.invert(null, cameraMatrix);
    // Compute a view projection matrix
    var viewProjectionMatrix = glMatrix.mat4.multiply(null, projectionMatrix, viewMatrix);
    // Draw a F at the origin
    var worldMatrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.rotateY(worldMatrix, worldMatrix, fRotationRadians);

    // Multiply the matrices.
    var worldViewProjectionMatrix = glMatrix.mat4.multiply(null, viewProjectionMatrix, worldMatrix);//pvm
    var worldInverseMatrix = glMatrix.mat4.invert(null, worldMatrix);
    var worldInverseTransposeMatrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.transpose(worldInverseTransposeMatrix, worldInverseMatrix);
    var uniformData = {
      u_worldViewProjection: worldViewProjectionMatrix,
      u_worldInverseTranspose: worldInverseTransposeMatrix,
      u_color: [0.2, 1, 0.2, 1],
      u_reverseLightDirection: glMatrix.vec3.normalize(null, [0.5, 0.7, 1])
    }
    G_ShaderFactory.setBuffersAndAttributes(programShader.attrSetters, cubeBufferInfo);
    G_ShaderFactory.setUniforms(programShader.uniSetters, uniformData);
    G_ShaderFactory.drawBufferInfo(cubeBufferInfo, gl.TRIANGLES);
  }
}

export default class ThreeDLightTest {
  static run() {
    main();
  }
}

