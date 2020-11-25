'use strict';

import Device from "../../../Device";
import { glMatrix } from "../../Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { CameraModel, G_CameraModel } from "../camera/CameraModel";
import { syPrimitives } from "../shader/Primitives";
import { BufferAttribsData, G_ShaderFactory, ShaderData } from "../shader/Shader";
var vertexshader3d =
  'attribute vec4 a_position;' +
  'attribute vec4 a_color;' +
  'uniform mat4 u_matrix;' +
  'varying vec4 v_color;' +
  'void main() {' +
  'gl_Position = u_matrix * a_position;' +
  'v_color = a_color;' +
  '}'

var fragmentshader3d =
  'precision mediump float;' +
  'varying vec4 v_color;' +
  'void main() {' +
  'gl_FragColor = v_color;' +
  '}'
class SceneStage {
  private gl: WebGLRenderingContext;
  private settings: any;
  private vertexColorProgramInfo: ShaderData;
  private fBufferInfo: BufferAttribsData;
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.init();
  }

  private init(): void {
    // setup GLSL programs
    // compiles shaders, links program, looks up locations
    this.vertexColorProgramInfo = G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);
    G_CameraModel.setSceneCameraPosition([-600, 100, -400]);
    // create buffers and fill with data for a 3D 'F'
    this.fBufferInfo = syPrimitives.create3DFBufferInfo();

    this._gameCamearMatrix = glMatrix.mat4.identity(null);
    this._gameCameraFatherMatrix = glMatrix.mat4.identity(null);
    this._gameCameraProjectMatrix = glMatrix.mat4.identity(null);
    this.initUI();
  }
  
  //初始化UI
  private initUI() {
    this.settings = {
      posX: -15,
      posY: -35,
      posZ: -5,
      rotation: 150,  // in degrees
      cam1FieldOfView: 60,  // in degrees
      cam1PosX: 0,
      cam1PosY: 0,
      cam1PosZ: -200,
      cam1RotX: 0,
      cam1RotY: 0,
      cam1RotZ: 0,
      cam1Near: 30,
      cam1Far: 500,
      cam1Ortho: false,
      cam1OrthoUnits: 120,
    };

    var render = this.render.bind(this);

    var webglLessonsUI = window["webglLessonsUI"]
    webglLessonsUI.setupUI(document.querySelector('#ui'), this.settings, [
      { type: 'slider', key: 'rotation', min: 0, max: 360, change: render, precision: 2, step: 0.001, },
      { type: 'slider', key: 'posX', min: -200, max: 200, change: render, },
      { type: 'slider', key: 'posY', min: -200, max: 200, change: render, },
      { type: 'slider', key: 'posZ', min: -2000, max: 2000, change: render, },
      { type: 'slider', key: 'cam1FieldOfView', min: 1, max: 170, change: render, },
      { type: 'slider', key: 'cam1PosX', min: -200, max: 200, change: render, },
      { type: 'slider', key: 'cam1PosY', min: -200, max: 200, change: render, },
      { type: 'slider', key: 'cam1PosZ', min: -2000, max: 2000, change: render, },

      { type: 'slider', key: 'cam1RotX', min: 0, max: 360, change: render, },
      { type: 'slider', key: 'cam1RotY', min: 0, max: 360, change: render, },
      { type: 'slider', key: 'cam1RotZ', min: 0, max: 360, change: render, },

      { type: 'slider', key: 'cam1Near', min: 1, max: 3000, change: render, },
      { type: 'slider', key: 'cam1Far', min: 1, max: 3000, change: render, },
      { type: 'checkbox', key: 'cam1Ortho', change: render, },
      { type: 'slider', key: 'cam1OrthoUnits', min: 1, max: 150, change: render, },
    ]);

  }


  /**
   * 绘制场景
   * @param projectionMatrix 投影矩阵 
   * @param cameraMatrix  相机矩阵
   * @param worldMatrix 世界矩阵
   */
  private drawScene(projectionMatrix, cameraMatrix, worldMatrix) {
    var gl = this.gl;
    var vertexColorProgramInfo = this.vertexColorProgramInfo;
    var fBufferInfo = this.fBufferInfo;
    // 清除颜色缓冲和深度缓存
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Make a view matrix from the camera matrix.
    const viewMatrix = glMatrix.mat4.invert(null, cameraMatrix);

    let mat = glMatrix.mat4.multiply(null, projectionMatrix, viewMatrix);
    glMatrix.mat4.multiply(mat, mat, worldMatrix);

    gl.useProgram(vertexColorProgramInfo.spGlID);
    // ------ Draw the F --------
    // Setup all the needed attributes.
    G_ShaderFactory.setBuffersAndAttributes(vertexColorProgramInfo.attrSetters, fBufferInfo);
    // Set the uniforms
    G_ShaderFactory.setUniforms(vertexColorProgramInfo.uniSetters, {
      u_matrix: mat,
    });
    G_ShaderFactory.drawBufferInfo(fBufferInfo);
  }
   
  private _gameCamearMatrix:Float32Array;
  private _gameCameraFatherMatrix:Float32Array;
  private _gameCameraProjectMatrix:Float32Array;
  //设置目标相机
  private setGameCamera(){

    let lookType = 1;
    var settings = this.settings;
    var gl = this.gl;
          // we're going to split the view in 2
    const effectiveWidth = gl.canvas.width / 2;
    const aspect = effectiveWidth / gl.canvas.height;
    const near = 1;
    const far = 2000;
    // Compute a projection matrix
     settings.cam1Ortho
      ? glMatrix.mat4.ortho(this._gameCameraProjectMatrix,
        -settings.cam1OrthoUnits * aspect,  // left
        settings.cam1OrthoUnits * aspect,  // right
        -settings.cam1OrthoUnits,           // bottom
        settings.cam1OrthoUnits,           // top
        settings.cam1Near,
        settings.cam1Far)
      : glMatrix.mat4.perspective(this._gameCameraProjectMatrix, MathUtils.degToRad(settings.cam1FieldOfView),
        aspect,
        settings.cam1Near,
        settings.cam1Far);
    // Compute the camera's matrix using look at.
    //创建一个相机坐标系，默认情况下，相机坐标系父级节点是世界
    //所以相机中的点乘以相机坐标系，就可以将该点的坐标转换到世界坐标系下
    //所以世界中的点乘以相机坐标系的逆矩阵，就可以将该点转换到相机坐标系下
    const cameraPosition = [
      settings.cam1PosX,
      settings.cam1PosY,
      settings.cam1PosZ,
    ];
    if(lookType==1)
    {
      const target = [0, 0, 0];
      const up = [0, 1, 0];
      this._gameCamearMatrix = glMatrix.mat4.lookAt2(null, cameraPosition, target, up);
    }
    else if(lookType==2)
    {
      glMatrix.mat4.identity(this._gameCameraFatherMatrix);
      let cameraMatrix = this._gameCamearMatrix;
      glMatrix.mat4.identity(cameraMatrix);
      glMatrix.mat4.rotateX(cameraMatrix, cameraMatrix, MathUtils.degToRad(settings.cam1RotX));
      glMatrix.mat4.rotateY(cameraMatrix, cameraMatrix, MathUtils.degToRad(settings.cam1RotY));
      glMatrix.mat4.rotateZ(cameraMatrix, cameraMatrix, MathUtils.degToRad(settings.cam1RotZ));
      glMatrix.mat4.translate(this._gameCameraFatherMatrix, this._gameCameraFatherMatrix, cameraPosition);
      glMatrix.mat4.multiply(cameraMatrix, this._gameCameraFatherMatrix, cameraMatrix);
    }
  }

  public render() {
    var gl = this.gl;
    var settings = this.settings;
    Device.Instance.resizeCanvasToDisplaySize(gl.canvas);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.SCISSOR_TEST);

    this.setGameCamera();

    let fatherMatrix = glMatrix.mat4.identity(null);
    let worldMatrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.rotateY(null, worldMatrix, MathUtils.degToRad(settings.rotation));
    glMatrix.mat4.rotateX(worldMatrix, worldMatrix, MathUtils.degToRad(settings.rotation));
    // center the 'F' around its origin
    glMatrix.mat4.translate(fatherMatrix, fatherMatrix, [settings.posX, settings.posY, settings.posZ]);
    glMatrix.mat4.multiply(worldMatrix, fatherMatrix, worldMatrix);

    const { width, height } = gl.canvas;
    const leftWidth = width / 2 | 0;

    // draw on the left with orthographic camera
    gl.viewport(0, 0, leftWidth, height);
    gl.scissor(0, 0, leftWidth, height);
    gl.clearColor(1, 0.8, 0.8, 1);
    //将相机中的物体单独拿出来绘制
    //左侧将呈现一个单独的F模型
    this.drawScene(this._gameCameraProjectMatrix, this._gameCamearMatrix, worldMatrix);

    // draw on right with perspective camera
    const rightWidth = width - leftWidth;
    gl.viewport(leftWidth, 0, rightWidth, height);
    gl.scissor(leftWidth, 0, rightWidth, height);
    gl.clearColor(0.8, 0.8, 1, 1);

    //绘制相机中的物体
    this.drawScene(G_CameraModel.getSceneProjectMatrix(), G_CameraModel.getSceneCameraMatrix(), worldMatrix);
    G_CameraModel.draw(this._gameCameraProjectMatrix, this._gameCamearMatrix);
  }
}

export  class CameraTest {
  static run() {

    new SceneStage(Device.Instance.gl).render();
  }
}
