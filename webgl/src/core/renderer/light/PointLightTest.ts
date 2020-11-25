import Device from "../../../Device";
import LoaderManager from "../../../LoaderManager";
import { glMatrix } from "../../Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { G_ShaderFactory } from "../shader/Shader";

var vertexshader3d =
  'attribute vec4 a_position;' +
  'attribute vec3 a_normal;' +
  'uniform vec3 u_lightWorldPosition;' +
  'uniform vec3 u_viewWorldPosition;' +
  'uniform mat4 u_world;' +
  'uniform mat4 u_worldViewProjection;' +
  'uniform mat4 u_worldInverseTranspose;' +
  'varying vec3 v_normal;' +
  'varying vec3 v_surfaceToLight;' +
  'varying vec3 v_surfaceToView;' +
  'void main() {' +
  'gl_Position = u_worldViewProjection * a_position;' +
  'v_normal = mat3(u_worldInverseTranspose) * a_normal;' +
  'vec3 surfaceWorldPosition = (u_world * a_position).xyz;' +
  'v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;' +
  'v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;' +
  '}'
var fragmentshader3d =
  'precision mediump float;' +
  'varying vec3 v_normal;' +
  'varying vec3 v_surfaceToLight;' +
  'varying vec3 v_surfaceToView;' +
  'uniform vec4 u_color;' +
  'uniform float u_shininess;' +
  'void main() {' +
  'vec3 normal = normalize(v_normal);' +
  'vec3 surfaceToLightDirection = normalize(v_surfaceToLight);' +
  'vec3 surfaceToViewDirection = normalize(v_surfaceToView);' +
  'vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);' +
  'float light = dot(normal, surfaceToLightDirection);' +
  'float specular = 0.0;' +
  'if (light > 0.0) {' +
  'specular = pow(dot(normal, halfVector), u_shininess);' +
  '}' +
  'gl_FragColor = u_color;' +
  'gl_FragColor.rgb *= light;' +
  'gl_FragColor.rgb += specular;' +
  '}'

"use strict";




function main() {
  var gl = Device.Instance.gl;
  if (!gl) {
    return;
  }

  // setup GLSL program
  var programShader = G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);
  var matrix = glMatrix.mat4.identity(null);
  glMatrix.mat4.rotateX(matrix, matrix, Math.PI);
  glMatrix.mat4.translate(matrix, matrix, [-50, -75, -15]);

  let datas = LoaderManager.instance.getCacheData("res/models/char/F.json");
  let cubeDatas:any = {};
  cubeDatas.position = new Float32Array(datas.position);
  cubeDatas.normal = new Float32Array(datas.normal);

  for (var ii = 0; ii < cubeDatas.position.length; ii += 3) {
    var vector = glMatrix.mat4.transformPoint(null, matrix, [cubeDatas.position[ii + 0], cubeDatas.position[ii + 1], cubeDatas.position[ii + 2], 1]);
    cubeDatas.position[ii + 0] = vector[0];
    cubeDatas.position[ii + 1] = vector[1];
    cubeDatas.position[ii + 2] = vector[2];
  }

  var attrBufferData = G_ShaderFactory.createBufferInfoFromArrays(cubeDatas);


  var uniformDatas = {
    u_worldViewProjection: {},
    u_worldInverseTranspose: {},
    u_color: {},
    u_shininess: {},
    u_lightWorldPosition: {},
    u_viewWorldPosition: {},
    u_world: {}
  }


  var fieldOfViewRadians = MathUtils.degToRad(60);
  var fRotationRadians = 0;
  var shininess = 150;

  drawScene();

  // Setup a ui.
  var webglLessonsUI = window["webglLessonsUI"];
  webglLessonsUI.setupSlider("#fRotation", { value: MathUtils.radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360 });
  webglLessonsUI.setupSlider("#shininess", { value: shininess, slide: updateShininess, min: 1, max: 300 });

  function updateRotation(event, ui) {
    fRotationRadians = MathUtils.degToRad(ui.value);
    drawScene();
  }

  function updateShininess(event, ui) {
    shininess = ui.value;
    drawScene();
  }

  function setCamera(){
        // Compute the projection matrix
    var aspect = gl.canvas.width / gl.canvas.height;
    var zNear = 1;
    var zFar = 2000;
    var projectionMatrix = glMatrix.mat4.perspective(null, fieldOfViewRadians, aspect, zNear, zFar);

    // Compute the camera's matrix
    var cameraPos = [100, 150, 200];
    var target = [0, 35, 0];
    var up = [0, 1, 0];
    var cameraMatrix = glMatrix.mat4.lookAt2(null, cameraPos, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = glMatrix.mat4.invert(null, cameraMatrix);

    // Compute a view projection matrix
    var viewProjectionMatrix = glMatrix.mat4.multiply(null, projectionMatrix, viewMatrix);  //pv投影视口矩阵
    
    return {
      viewProjectionMatrix:viewProjectionMatrix,
      cameraPosition:cameraPos
    }
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

    let cameraData = setCamera();
    // Draw a F at the origin
    var worldMatrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.rotateY(worldMatrix, worldMatrix, fRotationRadians);

    // Multiply the matrices.
    var worldViewProjectionMatrix = glMatrix.mat4.multiply(null, cameraData.viewProjectionMatrix, worldMatrix);
    var worldInverseMatrix = glMatrix.mat4.invert(null, worldMatrix);
    var worldInverseTransposeMatrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.transpose(worldInverseTransposeMatrix, worldInverseMatrix);


    uniformDatas.u_worldViewProjection = worldViewProjectionMatrix;  //投影矩阵 x 视口矩阵 x 世界矩阵
    uniformDatas.u_worldInverseTranspose = worldInverseTransposeMatrix;//世界矩阵逆矩阵的转置矩阵
    uniformDatas.u_world = worldMatrix;//世界矩阵
    uniformDatas.u_color = [0.2, 1, 0.2, 1];//光的颜色
    uniformDatas.u_lightWorldPosition = [20, 30, 60];//光的位置
    uniformDatas.u_viewWorldPosition = cameraData.cameraPosition;//摄像机的位置
    uniformDatas.u_shininess = shininess;

    G_ShaderFactory.setBuffersAndAttributes(programShader.attrSetters, attrBufferData);
    G_ShaderFactory.setUniforms(programShader.uniSetters, uniformDatas);
    G_ShaderFactory.drawBufferInfo(attrBufferData, gl.TRIANGLES);

  }
}


export default class PointLightTest {
  static run() {
    main();
  }
}

