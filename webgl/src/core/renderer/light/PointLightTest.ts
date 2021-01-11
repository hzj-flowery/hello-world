import Device from "../../Device";
import LoaderManager from "../../LoaderManager";
import { glMatrix } from "../../Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { CameraData } from "../data/CameraData";
import { G_LightCenter } from "./LightCenter";
import { PointLight } from "./PointLight";

function main() {
  var gl = Device.Instance.gl;
  if (!gl) {
    return;
  }
  

  let FModel = new PointLight();
  FModel.Url = "res/models/char/F.json";
  var fRotationRadians = 0;
  var cameraPoX:number = 100;
  var cameraPoY:number = 150;
  var cameraPoZ:number = 200;
  var shininess = 150;

  drawScene();

  // Setup a ui.
  var webglLessonsUI = window["webglLessonsUI"];
  webglLessonsUI.setupSlider("#fRotation", { value: MathUtils.radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360 });
  webglLessonsUI.setupSlider("#cameraPosX", { value: cameraPoX, slide: upateCamPosX, min: -360, max: 360 });
  webglLessonsUI.setupSlider("#cameraPosY", { value: cameraPoY, slide: upateCamPosY, min: -360, max: 360 });
  webglLessonsUI.setupSlider("#cameraPosZ", { value: cameraPoZ, slide: upateCamPosZ, min: -360, max: 360 });
  webglLessonsUI.setupSlider("#shininess", { value: shininess, slide: updateShininess, min: 1, max: 300 });

  function updateRotation(event, ui) {
    fRotationRadians = ui.value;
    drawScene();
  }
  function upateCamPosX(event, ui){
       cameraPoX = ui.value;
       drawScene();
  }
  function upateCamPosY(event, ui){
      cameraPoY = ui.value;
      drawScene();
  }
  function upateCamPosZ(event, ui){
      cameraPoZ = ui.value;
      drawScene();
  }

  function updateShininess(event, ui) {
    shininess = ui.value;
    drawScene();
  }
  
  //设置相机
  function setCamera():CameraData{
        // Compute the projection matrix
    var aspect = gl.canvas.width / gl.canvas.height;
    var zNear = 1;
    var zFar = 2000;
    var projectionMatrix = glMatrix.mat4.perspective(null, MathUtils.degToRad(60), aspect, zNear, zFar);
    
    cameraPoX = 0;
    cameraPoY = 0;
    // cameraPoZ = 100;
    // Compute the camera's matrix
    var cameraPos = [cameraPoX,cameraPoY,cameraPoZ];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    // var cameraMatrix = glMatrix.mat4.lookAt2(null, cameraPos, target, up);
    let cameraMatrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.translate(cameraMatrix,cameraMatrix,cameraPos);

    // Make a view matrix from the camera matrix.
    var viewMatrix = glMatrix.mat4.invert(null, cameraMatrix);

    // Compute a view projection matrix
    var viewProjectionMatrix = glMatrix.mat4.multiply(null, projectionMatrix, viewMatrix);  //pv投影视口矩阵

    var worldMatrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.rotateY(worldMatrix, worldMatrix, fRotationRadians);

    let ret = new CameraData();
    ret.position = cameraPos;
    return ret;
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
    gl.useProgram(FModel._shaderData.spGlID);

    let cameraData = setCamera();
    FModel.setRotation(0,fRotationRadians,0);
    FModel.visit(0);
    FModel.updateUniformsData(cameraData,G_LightCenter.lightData);
    FModel.testDraw();

  }
}


export default class PointLightTest {
  static run() {
    main();
  }
}

