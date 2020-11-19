'use strict';

import Device from "../../../Device";
import { glMatrix } from "../../Matrix";
import { MathUtils } from "../../utils/MathUtils";
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


/**
 * 
 */
class Graphic {
  constructor(gl) {
    this.gl = gl;
    this.init();
  }
  private gl: WebGLRenderingContext;
  private vert =
    'attribute vec4 a_position;' +
    'attribute vec4 a_color;' +
    'uniform mat4 u_worldViewProjection;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_Position = u_worldViewProjection * a_position;' +
    'gl_PointSize = 5.0;' +
    'v_color = a_color;' +
    '}'

  private frag =
    'precision mediump float;' +
    'uniform vec4 u_color;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_FragColor = u_color * v_color;' +
    '}'

  private _coordinateArrays = {
    position: [
      0, 0, 0,         //原点0   //0
      1, 0, 0,   //x   //1
      0, 1, 0,   //y   //2
      0, 0, 1,    //z  //3
      0, 0, 0,         //原点1  //4
      0, 0, 0,         //原点2  //5
      0, 0, 0,         //原点3  //6

      1.2, 0, 0,   //x轴延申    //7
      0, 1.2, 0,   //y轴延申    //8
      0, 0, 1.2,    //z轴延申   //9

      0, 0, 0, 0,
      0, 1, 1, 0
    ],
    color: [
      0, 0, 0, 1,       //  0 原点
      1, 0, 0, 1,       //  1  x     red    红色
      0, 1, 0, 1,       //  2  y     green  绿色
      0, 0, 1, 1,       //  3  z     blue   蓝色
      1, 0, 0, 1,       //  4  原点x     red
      0, 1, 0, 1,       //  5  原点y     green
      0, 0, 1, 1,        // 6  原点z     blue
      0, 0, 0, 1,        // 9
      0, 0, 0, 1,        // 10
      0, 0, 0, 1,        // 11
      1, 1, 0, 0,        // 12
      1, 1, 0, 0         // 13
    ],
    indices: [
      4, 1, 5, 2, 6, 3, 1, 7, 2, 8, 3, 9, 10, 11 //11 12 13
    ]
  }
  private _pointArrays = {
    position: [
      0, 0, 0,
      1, 0, 0,   //3
      0, 1, 0,   //7  
      0, 0, 1    //11
    ],
    color: [
      0, 0, 0, 1,
      1, 0, 0, 1,
      0, 1, 0, 1,
      0, 0, 1, 1
    ]
  }

  private init(): void {
    let scale = 60;
    for (var j = 0; j < this._coordinateArrays.position.length; j++) {
      this._coordinateArrays.position[j] = this._coordinateArrays.position[j] * scale;
    }

    this._pointBufferInfor = G_ShaderFactory.createBufferInfoFromArrays(this._pointArrays);

    //创建shader
    this._programInfor = G_ShaderFactory.createProgramInfo(this.vert, this.frag);
    //创建attribuffer
    this._coordinateBufferInfo = G_ShaderFactory.createBufferInfoFromArrays(this._coordinateArrays);
  }
  private _programInfor: ShaderData;
  private _coordinateBufferInfo: BufferAttribsData;
  private _pointBufferInfor: BufferAttribsData;
  /**
   * 绘制世界坐标系
   * 你想在上面位置来观察世界坐标系
   * @param proj 投影矩阵
   * @param camera 相机矩阵
   * @param world 世界矩阵  当前模型中的点需要乘以这个矩阵转换到世界坐标系下
   * 
   */
  public drawLine(proj: Float32Array, camera: Float32Array, world = glMatrix.mat4.identity(null)): void {
    var view = glMatrix.mat4.invert(null, camera)
    let pv = glMatrix.mat4.multiply(null, proj, view);
    glMatrix.mat4.multiply(pv, pv, world);
    this.gl.useProgram(this._programInfor.spGlID);
    G_ShaderFactory.setBuffersAndAttributes(this._programInfor.attrSetters, this._coordinateBufferInfo);
    G_ShaderFactory.setUniforms(this._programInfor.uniSetters, { u_worldViewProjection: pv });
    G_ShaderFactory.setUniforms(this._programInfor.uniSetters, { u_color: [1, 1, 1, 1] });
    G_ShaderFactory.drawBufferInfo(this._coordinateBufferInfo, this.gl.LINES);
  }

  private updatePoint(): void {
    var change = 0.1;
    this._pointArrays.position[3] = this._pointArrays.position[3] + change;//眼睛的位置
    this._pointArrays.position[7] = this._pointArrays.position[7] + change;
    this._pointArrays.position[11] = this._pointArrays.position[11] + change;
    this._pointBufferInfor = G_ShaderFactory.createBufferInfoFromArrays(this._pointArrays);
  }

  public drawPoint(proj: Float32Array, camera: Float32Array, world = glMatrix.mat4.identity(null)): void {
    this.updatePoint();
    var view = glMatrix.mat4.invert(null, camera)
    let vp = glMatrix.mat4.multiply(null, proj, view);
    glMatrix.mat4.multiply(vp, vp, world);

    this.gl.useProgram(this._programInfor.spGlID);
    G_ShaderFactory.setBuffersAndAttributes(this._programInfor.attrSetters, this._pointBufferInfor);
    G_ShaderFactory.setUniforms(this._programInfor.uniSetters, { u_worldViewProjection: vp });
    G_ShaderFactory.setUniforms(this._programInfor.uniSetters, { u_color: [1, 1, 1, 1] });
    G_ShaderFactory.drawBufferInfo(this._pointBufferInfor, this.gl.POINTS);

  }

}

class CameraModel {
  constructor(gl) {
    this.gl = gl;
    this.init();
  }
  private gl: WebGLRenderingContext;
  private _programInfor: ShaderData;
  private _modelBuffer: BufferAttribsData;
  private _clipSpaceBuffer: BufferAttribsData;
  private _coordinate: Graphic;
  private solidcolorvertexshader =
    'attribute vec4 a_position;' +
    'uniform mat4 u_matrix;' +
    'void main() {' +
    'gl_Position = u_matrix * a_position;' +
    '}'

  private solidcolorfragmentshader =
    'precision mediump float;' +
    'uniform vec4 u_color;' +
    'void main() {' +
    'gl_FragColor = u_color;' +
    '}'

  private init(): void {
    this._programInfor = G_ShaderFactory.createProgramInfo(this.solidcolorvertexshader, this.solidcolorfragmentshader);
    this._modelBuffer = this.createCameraBufferInfo();
    this._clipSpaceBuffer = this.createClipspaceCubeBufferInfo();

    this._coordinate = new Graphic(this.gl);//绘制线
  }
  private createClipspaceCubeBufferInfo() {
    // first let's add a cube. It goes from 1 to 3
    // because cameras look down -Z so we want
    // the camera to start at Z = 0. We'll put a
    // a cone in front of this cube opening
    // toward -Z
    const positions = [
      -1, -1, -1,  // cube vertices
      1, -1, -1,
      -1, 1, -1,
      1, 1, -1,
      -1, -1, 1,
      1, -1, 1,
      -1, 1, 1,
      1, 1, 1,
      0, 0, -1,//后节点 8
      0, 0, 1 //前节点 9
    ];
    const indices = [
      0, 1, 1, 3, 3, 2, 2, 0, // cube indices
      4, 5, 5, 7, 7, 6, 6, 4,
      0, 4, 1, 5, 3, 7, 2, 6,
      8, 9, 9, 8
    ];
    return G_ShaderFactory.createBufferInfoFromArrays({
      position: positions,
      indices: indices,
    });
  }

  // create geometry for a camera
  private createCameraBufferInfo(scale = 20) {
    // first let's add a cube. It goes from 1 to 3
    // because cameras look down -Z so we want
    // the camera to start at Z = 0.
    // We'll put a cone in front of this cube opening
    // toward -Z
    const positions = [
      -1, -1, 1,  // cube vertices
      1, -1, 1,
      -1, 1, 1,
      1, 1, 1,
      -1, -1, 3,
      1, -1, 3,
      -1, 1, 3,
      1, 1, 3,
      0, 0, 1,  // cone tip
    ];
    const indices = [
      0, 1, 1, 3, 3, 2, 2, 0, // cube indices
      4, 5, 5, 7, 7, 6, 6, 4,
      0, 4, 1, 5, 3, 7, 2, 6,
    ];
    // add cone segments
    const numSegments = 6;
    const coneBaseIndex = positions.length / 3;
    const coneTipIndex = coneBaseIndex - 1;
    for (let i = 0; i < numSegments; ++i) {
      const u = i / numSegments;
      const angle = u * Math.PI * 2;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      positions.push(x, y, 0);
      // line from tip to edge
      indices.push(coneTipIndex, coneBaseIndex + i);
      // line from point on edge to next point on edge
      indices.push(coneBaseIndex + i, coneBaseIndex + (i + 1) % numSegments);
    }
    positions.forEach((v, ndx) => {
      positions[ndx] *= scale;
    });
    return G_ShaderFactory.createBufferInfoFromArrays({
      position: positions,
      indices: indices,
    });
  }
  /**
  * 这个函数的目的就是用一个相机去看目标相机
  * 目标相机有两个东西要绘制 一个是相机模型 一个是齐次裁切空间
  * @param projMatrix 当前摄像机的投影矩阵
  * @param cameraMatrix 当前摄像机的相机矩阵
  * @param targetProjMatrix 目标摄像机的投影矩阵
  * @param targetCameraMatrix 目标摄像机的相机矩阵
  */
  public drawCameraModel(projMatrix, cameraMatrix, targetProjMatrix, targetCameraMatrix) {
    var gl = this.gl;
    // draw object to represent first camera
    // Make a view matrix from the camera matrix.
    const viewMatrix = glMatrix.mat4.invert(null, cameraMatrix);
    let mat = glMatrix.mat4.identity(null);
    glMatrix.mat4.multiply(mat, projMatrix, viewMatrix); //投影矩阵X视口矩阵
    // use the first's camera's matrix as the matrix to position
    // the camera's representative in the scene
    //可以这么理解，第一台摄像机上的点乘以它得相机矩阵，可以将位置转换到世界坐标系下
    //通过世界坐标系这个枢纽，再将点转换到其他的视口坐标系下，进行投影
    glMatrix.mat4.multiply(mat, mat, targetCameraMatrix);//投影矩阵xs视口矩阵x第一个摄像机的相机矩阵
    gl.useProgram(this._programInfor.spGlID);

    // ------ Draw the Camera Representation --------绘制相机模型
    // Setup all the needed attributes.
    G_ShaderFactory.setBuffersAndAttributes(this._programInfor.attrSetters, this._modelBuffer);
    // Set the uniforms
    G_ShaderFactory.setUniforms(this._programInfor.uniSetters, {
      u_matrix: mat,
      u_color: [1, 0, 0, 1],
    });
    G_ShaderFactory.drawBufferInfo(this._modelBuffer, gl.LINES);

    // ----- Draw the frustum ------- 绘制齐次裁切空间坐标系
    //一个正方体乘以这个矩阵的逆矩阵可以变成一个棱台
    glMatrix.mat4.multiply(mat, mat, glMatrix.mat4.invert(null, targetProjMatrix));
    // Setup all the needed attributes.
    G_ShaderFactory.setBuffersAndAttributes(this._programInfor.attrSetters, this._clipSpaceBuffer);
    // Set the uniforms
    G_ShaderFactory.setUniforms(this._programInfor.uniSetters, {
      u_matrix: mat,
      u_color: [0, 1, 0, 1],
    });
    G_ShaderFactory.drawBufferInfo(this._clipSpaceBuffer, gl.LINES);

    //原点
    let mat1 = glMatrix.mat4.identity(null);
    //转换到相机坐标系下
    //你可以理解为相机中的点乘以相机坐标系可以转换到世界坐标系
    glMatrix.mat4.multiply(mat1, mat1, targetCameraMatrix);//投影矩阵xs视口矩阵x第一个摄像机的相机矩阵
    this._coordinate.drawLine(projMatrix, cameraMatrix, mat1);
    this._coordinate.drawLine(projMatrix, cameraMatrix);

    this._coordinate.drawPoint(projMatrix, cameraMatrix, mat1);
    this._coordinate.drawPoint(projMatrix, cameraMatrix);
  }



}
class SceneStage {
  private gl: WebGLRenderingContext;
  private settings: any;
  private cameraModel: CameraModel;
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
    this.cameraModel = new CameraModel(this.gl);
    // create buffers and fill with data for a 3D 'F'
    this.fBufferInfo = syPrimitives.create3DFBufferInfo();

    this._camera1Matrix = glMatrix.mat4.identity(null);
    this._camera1Project = glMatrix.mat4.identity(null);
    this._camera1FatherMatrix = glMatrix.mat4.identity(null);
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
   
  private _camera1Matrix:Float32Array;
  private _camera1FatherMatrix:Float32Array;
  private _camera1Project:Float32Array;
  //设置目标相机
  private setTargetCameara(){
    
    //相机的使用
    var cameraUseMode = 1;

    var settings = this.settings;
    var gl = this.gl;
          // we're going to split the view in 2
    const effectiveWidth = gl.canvas.width / 2;
    const aspect = effectiveWidth / gl.canvas.height;
    const near = 1;
    const far = 2000;
    // Compute a projection matrix
     settings.cam1Ortho
      ? glMatrix.mat4.ortho(this._camera1Project,
        -settings.cam1OrthoUnits * aspect,  // left
        settings.cam1OrthoUnits * aspect,  // right
        -settings.cam1OrthoUnits,           // bottom
        settings.cam1OrthoUnits,           // top
        settings.cam1Near,
        settings.cam1Far)
      : glMatrix.mat4.perspective(this._camera1Project, MathUtils.degToRad(settings.cam1FieldOfView),
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

    const cameraMatrixFather = this._camera1FatherMatrix;
    let cameraMatrix = this._camera1Matrix;
    glMatrix.mat4.identity(cameraMatrix);
    glMatrix.mat4.identity(cameraMatrixFather);
    
    if(cameraUseMode==1)
    {
      const target = [0, 0, 0];
      const up = [0, 1, 0];
      glMatrix.mat4.lookAt(cameraMatrix, cameraPosition, target, up);
      glMatrix.mat4.invert(cameraMatrix,cameraMatrix);
      // glMatrix.mat4.rotateX(cameraMatrix, cameraMatrix, MathUtils.degToRad(settings.cam1RotX));
      // glMatrix.mat4.rotateY(cameraMatrix, cameraMatrix, MathUtils.degToRad(settings.cam1RotY));
      // glMatrix.mat4.rotateZ(cameraMatrix, cameraMatrix, MathUtils.degToRad(settings.cam1RotZ));
    }
    else if(cameraUseMode==2)
    {
      const target = [0, 0, 0];
      const up = [0, 1, 0];
      glMatrix.mat4.lookAt2(cameraMatrix, cameraPosition, target, up);
    }
    else if(cameraUseMode==3)
    {
      glMatrix.mat4.rotateX(cameraMatrix, cameraMatrix, MathUtils.degToRad(settings.cam1RotX));
      glMatrix.mat4.rotateY(cameraMatrix, cameraMatrix, MathUtils.degToRad(settings.cam1RotY));
      glMatrix.mat4.rotateZ(cameraMatrix, cameraMatrix, MathUtils.degToRad(settings.cam1RotZ));
      glMatrix.mat4.translate(cameraMatrixFather, cameraMatrixFather, cameraPosition);
      glMatrix.mat4.multiply(cameraMatrix, cameraMatrixFather, cameraMatrix);
    }
   
   
  }
  
  /**
   * 绘制左边
   */
  private drawLeftScene():void{

  }

  public render() {
    var gl = this.gl;
    var settings = this.settings;
    Device.Instance.resizeCanvasToDisplaySize(gl.canvas);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.SCISSOR_TEST);
    this.setTargetCameara();

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
    this.drawScene(this._camera1Project, this._camera1Matrix, worldMatrix);

    // draw on right with perspective camera
    const rightWidth = width - leftWidth;
    gl.viewport(leftWidth, 0, rightWidth, height);
    gl.scissor(leftWidth, 0, rightWidth, height);
    gl.clearColor(0.8, 0.8, 1, 1);

    //这是一个右侧相机
    //此处的相机不做任何的改变
    const effectiveWidth = gl.canvas.width / 2;
    const aspect = effectiveWidth / gl.canvas.height;
    const near = 1;
    const far = 2000;
    const perspectiveProjectionMatrix2 = glMatrix.mat4.perspective(null, MathUtils.degToRad(60), aspect, near, far);
    // Compute the camera's matrix using look at.
    const cameraPosition2 = [-600, 400, -400];
    const target2 = [0, 0, 0];
    const up2 = [0, 1, 0];
    const cameraMatrix2 = glMatrix.mat4.lookAt2(null, cameraPosition2, target2, up2);
    //绘制相机中的物体
    this.drawScene(perspectiveProjectionMatrix2, cameraMatrix2, worldMatrix);

    this.cameraModel.drawCameraModel(perspectiveProjectionMatrix2, cameraMatrix2, this._camera1Project, this._camera1Matrix);
  }
}

export default class CameraTest {
  static run() {

    new SceneStage(Device.Instance.gl).render();
  }
}
