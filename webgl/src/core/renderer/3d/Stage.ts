"use strict";

/**
 <div class="description" style="position: absolute;left: 750px; top:10px;color:crimson">
        Drag sliders to change the frustum.
        </div>
        <div style="position:absolute;">
          <img id="eye" src="resources/eye-icon.png" style="position: absolute; z-index:2; left: 10px; top: 275px; width: 32px; height: auto;"/>
        </div>
        <div id="uiContainer" style="position: absolute;left: 750px; top:30px;color: blue;">
          <div id="ui">
            <div id="cameraPosX"></div>
            <div id="cameraPosY"></div>
            <div id="cameraPosZ"></div>
            <div id="cameraRotateX"></div>
            <div id="cameraRotateY"></div>
            <div id="cameraRotateZ"></div>
            <div id="fieldOfView"></div>
            <div id="zNear"></div>
            <div id="zFar"></div>
            <div id="zPosition"></div>
          </div>
        </div>
 */
import Device from "../../../Device";
import { glMatrix } from "../../Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { CameraFrustum } from "../camera/CameraFrustum";
import { syPrimitives } from "../shader/Primitives";
import { BufferAttribsData, G_ShaderFactory, ShaderData } from "../shader/Shader";

var baseVertexShader =
  'attribute vec4 a_position;' +
  'attribute vec4 a_color;' +
  'uniform mat4 u_worldViewProjection;' +
  'uniform mat4 u_exampleWorldViewProjection;' +
  'varying vec4 v_color;' +
  'varying vec4 v_position;' +
  'void main() {' +
  'gl_Position = u_worldViewProjection * a_position;' +
  'v_position = u_exampleWorldViewProjection * a_position;' +
  'v_position = v_position / v_position.w;' +
  'v_color = a_color;' +
  '}'
var colorFragmentShader =
  'precision mediump float;' +
  'varying vec4 v_color;' +
  'varying vec4 v_position;' +
  'uniform vec4 u_color;' +
  'void main() {' +
  'bool blend = (v_position.x < -1.0 || v_position.x > 1.0 ||' +
  'v_position.y < -1.0 || v_position.y > 1.0 ||' +
  'v_position.z < -1.0 || v_position.z > 1.0);' +
  'vec4 blendColor = blend ? vec4(0.35, 0.35, 0.35, 1.0) : vec4(1, 1, 1, 1);' +
  'gl_FragColor = v_color * u_color * blendColor;' +
  '}'

var faceColors = [
  [1, 0, 0, 1,],
  [0, 1, 0, 1,],
  [1, 1, 0, 1,],
  [0, 0, 1, 1,],
  [1, 0, 1, 1,],
  [0, 1, 1, 1,],
];
var colorVerts = [];
for (var f = 0; f < 6; ++f) {
  for (var v = 0; v < 4; ++v) {
    colorVerts.push.apply(colorVerts, faceColors[f]);
  }
}


// globals
var pixelRatio = window.devicePixelRatio || 1;






export default class Stage {
  constructor() {
    this.gl = Device.Instance.gl;
  }
  static run() {
    new Stage().start();
  }
  private sceneCubeUniforms = {
    u_color: [1, 1, 1, 1],
    u_worldViewProjection: new Float32Array(16),
    u_exampleWorldViewProjection: new Float32Array(16),
  };
  private zNear = 10;//相机最近能看到的距离
  private zFar = 50;//相机最远能看到的距离
  private fieldOfView = 30;//相机张开的角度
  private zPosition = -25;//场景的位置
  private yPosition = 0;//场景的位置
  private xPosition = 0;//场景的位置
  private aspect: number;
  private v3t0 = new Float32Array(3);
  private targetToEye: Float32Array = new Float32Array(3);
  private eyePosition = new Float32Array([31, 17, 15]);//相机的位置
  private eyeRotation = new Float32Array([0, 0, 0]);//相机的旋转
  private target = new Float32Array([23, 16, 0]);
  // private target = new Float32Array([0,0,0]);
  private up = new Float32Array([0, 1, 0]);
  private gl: WebGLRenderingContext;
  private colorProgramInfo: ShaderData;
  private cubeBufferInfo: BufferAttribsData;
  private viewProjection: Float32Array = new Float32Array(16);
  private _frustum:CameraFrustum;
  private start(): void {
    this.colorProgramInfo = G_ShaderFactory.createProgramInfo(baseVertexShader, colorFragmentShader);
    var cubeArrays: any = syPrimitives.createCubeVertices(2);
    delete cubeArrays.normal;
    delete cubeArrays.texcoord;
    cubeArrays.color = colorVerts;
    this.cubeBufferInfo = G_ShaderFactory.createBufferInfoFromArrays(cubeArrays);
    this.aspect = this.gl.canvas.width / (this.gl.canvas.width / 2);
    this._frustum = new CameraFrustum(this.gl);

    requestAnimationFrame(this.render.bind(this));
  }

  private render(time): void {
    
    var uiData = this._frustum.getUIData();
    this.fieldOfView = uiData.fieldOfView;
    this.zNear = uiData.zNear;
    this.zFar = uiData.zFar;
    this.zPosition = uiData.zPosition;
    this.yPosition = uiData.yPosition;
    this.xPosition = uiData.xPosition;
    this.eyeRotation = uiData.eyeRotation;
    this.eyePosition = uiData.eyePosition;
    this.target = uiData.target;


    time *= 0.001;
    this.adjustCamera();

    this.drawScene(time, this.viewProjection, new Float32Array(16), this.colorProgramInfo, this.cubeBufferInfo);
    //----------------------------------------
    this._frustum.testDraw(this.viewProjection,this.aspect,this.zNear,this.zFar,this.fieldOfView);
    this.draw3DView(time);
    requestAnimationFrame(this.render.bind(this));
  }


  private adjustCamera(): void {

    glMatrix.vec3.subtract(this.targetToEye, this.eyePosition, this.target);

    var gl = this.gl;
    Device.Instance.resizeCanvasToDisplaySize(gl.canvas, pixelRatio);
    const halfHeight = gl.canvas.height / 2;
    const width = gl.canvas.width;
    let proj = glMatrix.mat4.create();
    let view = new Float32Array(16);
    // clear the screen.
    gl.disable(gl.SCISSOR_TEST);
    gl.colorMask(true, true, true, true);
    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, halfHeight, width, halfHeight);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    glMatrix.mat4.perspective(proj,
      MathUtils.degToRad(60),
      this.aspect,
      1,
      5000);
    let f = 1;
    glMatrix.vec3.scale(this.v3t0, this.targetToEye, f);
    glMatrix.vec3.add(this.v3t0, this.target, this.v3t0);
    
    glMatrix.mat4.lookAt(view,
      this.v3t0, //eyePosition,
      this.target,
      this.up);

    glMatrix.mat4.rotateX(view, view, this.eyeRotation[0]);
    glMatrix.mat4.rotateY(view, view, this.eyeRotation[1]);
    glMatrix.mat4.rotateZ(view, view, this.eyeRotation[2]);

    // glMatrix.mat4.invert(view, view);


    //算出视图投影矩阵
    glMatrix.mat4.multiply(this.viewProjection, proj, view);
  }

  
  
  // Draw scene
  private drawScene(time: number, vp: Float32Array, exProjection: Float32Array, shaderD: ShaderData, buffAttData: BufferAttribsData) {

    Device.Instance.cullFace(false);
    let worldTemp = glMatrix.mat4.create();
    this.gl.useProgram(shaderD.spGlID);
    G_ShaderFactory.setBuffersAndAttributes(shaderD.attrSetters, buffAttData);
    var cubeScale = 3;
    for (var ii = -1; ii <= 1; ++ii) {
      glMatrix.mat4.translation(worldTemp, ii * 10,this.yPosition, this.zPosition);
      // glMatrix.mat4.rotateY(worldTemp, worldTemp, time + ii * Math.PI / 6);
      // glMatrix.mat4.rotateX(worldTemp, worldTemp, Math.PI / 4);
      // glMatrix.mat4.rotateZ(worldTemp, worldTemp, Math.PI / 4);
      glMatrix.mat4.scale(worldTemp, worldTemp, [cubeScale, cubeScale, cubeScale]);
      glMatrix.mat4.multiply(this.sceneCubeUniforms.u_worldViewProjection, vp, worldTemp);
      glMatrix.mat4.multiply(this.sceneCubeUniforms.u_exampleWorldViewProjection, exProjection, worldTemp);
      G_ShaderFactory.setUniforms(shaderD.uniSetters, this.sceneCubeUniforms);
      G_ShaderFactory.drawBufferInfo(buffAttData);
    }
    Device.Instance.closeCullFace();
  }
  
  // Draw 3D view
  private draw3DView(time) {

    const halfHeight = this.gl.canvas.height / 2;
    const width = this.gl.canvas.width;

    var gl = this.gl;
    gl.enable(gl.SCISSOR_TEST);
    gl.viewport(0, 0, width, halfHeight);
    gl.scissor(0, 0, width, halfHeight);
    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    let proj = glMatrix.mat4.create();
    glMatrix.mat4.perspective(
      proj,
      MathUtils.degToRad(this.fieldOfView),
      this.aspect,
      this.zNear,
      this.zFar);
    this.drawScene(time, proj as Float32Array, new Float32Array(16), this.colorProgramInfo, this.cubeBufferInfo);
    // this.drawScene(time, this.viewProjection, new Float32Array(16), this.colorProgramInfo, this.cubeBufferInfo);
  }


}
