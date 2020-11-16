'use strict';

import Device from "../../../Device";
import { glMatrix } from "../../Matrix";
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
class GraphicLine{
   constructor(gl){
       this.gl = gl;
       this.init();
   }
   private gl:WebGLRenderingContext;
   private vert =
  'attribute vec4 a_position;' +
  'attribute vec4 a_color;' +
  'uniform mat4 u_worldViewProjection;' +
  'varying vec4 v_color;' +
  'void main() {' +
  'gl_Position = u_worldViewProjection * a_position;' +
  'gl_PointSize = 10.0;'+
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
    position:[
    0,0,0,         //原点0   //0
    1,0,0,   //x   //1
    0,1,0,   //y   //2
    0,0,1,    //z  //3
    0,0,0,         //原点1  //4
    0,0,0,         //原点2  //5
    0,0,0,         //原点3  //6

    1.2,0,0,   //x轴延申    //7
    0,1.2,0,   //y轴延申    //8
    0,0,1.2,    //z轴延申   //9
    
    0,0,0,0,
    0,1,1,0
    ],
    color:[
    0,0,0,1,       //  0 原点
    1,0,0,1,       //  1  x     red    红色
    0,1,0,1,       //  2  y     green  绿色
    0,0,1,1,       //  3  z     blue   蓝色
    1,0,0,1,       //  4  原点x     red
    0,1,0,1,       //  5  原点y     green
    0,0,1,1,        // 6  原点z     blue
    0,0,0,1,        // 9
    0,0,0,1,        // 10
    0,0,0,1,        // 11
    1,1,0,0,        // 12
    1,1,0,0         // 13
    ],
    indices:[
    4,1,5,2,6,3,1,7,2,8,3,9,10,11 //11 12 13
    ]
}

   private init():void{
     let scale = 60;
    for(var j = 0;j<this._coordinateArrays.position.length;j++)
    {
       this._coordinateArrays.position[j] = this._coordinateArrays.position[j]*scale;
    }
    //创建shader
    this._programInfor = G_ShaderFactory.createProgramInfo(this.vert,this.frag);
    //创建attribuffer
    this._coordinateBufferInfo = G_ShaderFactory.createBufferInfoFromArrays(this._coordinateArrays);
   }
   private _programInfor:ShaderData;
   private _coordinateBufferInfo:BufferAttribsData;
   /**
    * 绘制世界坐标系
    * 你想在上面位置来观察世界坐标系
    * @param proj 投影矩阵
    * @param camera 相机矩阵
    * @param world 世界矩阵  当前模型中的点需要乘以这个矩阵转换到世界坐标系下
    * 
    */
   public draw(proj:Float32Array,camera:Float32Array,world = glMatrix.mat4.identity(null)):void{
    var view = glMatrix.mat4.invert(null,camera)
    let pv = glMatrix.mat4.multiply(null,proj,view);
    glMatrix.mat4.multiply(pv,pv,world);
    this.gl.useProgram(this._programInfor.spGlID);
    G_ShaderFactory.setBuffersAndAttributes(this._programInfor.attrSetters,this._coordinateBufferInfo);
    G_ShaderFactory.setUniforms(this._programInfor.uniSetters,{u_worldViewProjection:pv});
    G_ShaderFactory.setUniforms(this._programInfor.uniSetters,{u_color:[1,1,1,1]});
    G_ShaderFactory.drawBufferInfo(this._coordinateBufferInfo,this.gl.LINES);
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
  private _coordinate:GraphicLine;
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
    this._programInfor = G_ShaderFactory.createProgramInfo(this.solidcolorvertexshader,this.solidcolorfragmentshader);
    this._modelBuffer = this.createCameraBufferInfo();
    this._clipSpaceBuffer = this.createClipspaceCubeBufferInfo();
    this._coordinate = new GraphicLine(this.gl);//绘制线
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
      0,0,-1,//后节点 8
      0,0,1 //前节点 9
    ];
    const indices = [
      0, 1, 1, 3, 3, 2, 2, 0, // cube indices
      4, 5, 5, 7, 7, 6, 6, 4,
      0, 4, 1, 5, 3, 7, 2, 6,
      8,9,9,8
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
    this._coordinate.draw(projMatrix,cameraMatrix,mat1);

    this._coordinate.draw(projMatrix,cameraMatrix);
  }



}

function main() {

  var gl = Device.Instance.gl;
  var webglLessonsUI = window["webglLessonsUI"]
  if (!gl) {
    return;
  }

  // setup GLSL programs
  // compiles shaders, links program, looks up locations
  const vertexColorProgramInfo = G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);
  const cameraModel = new CameraModel(gl);
  // create buffers and fill with data for a 3D 'F'
  const fBufferInfo = syPrimitives.create3DFBufferInfo();





  function degToRad(d) {
    return d * Math.PI / 180;
  }

  const settings = {
    posX: -15,
    posY: -35,
    posZ: -5,
    rotation: 150,  // in degrees
    cam1FieldOfView: 60,  // in degrees
    cam1PosX: 0,
    cam1PosY: 0,
    cam1PosZ: -200,
    cam1Near: 30,
    cam1Far: 500,
    cam1Ortho: true,
    cam1OrthoUnits: 120,
  };
  webglLessonsUI.setupUI(document.querySelector('#ui'), settings, [
    { type: 'slider', key: 'rotation', min: 0, max: 360, change: render, precision: 2, step: 0.001, },
    { type: 'slider', key: 'posX', min: -200, max: 200, change: render, },
    { type: 'slider', key: 'posY', min: -200, max: 200, change: render, },
    { type: 'slider', key: 'posZ', min: -2000, max: 2000, change: render, },
    { type: 'slider', key: 'cam1FieldOfView', min: 1, max: 170, change: render, },
    { type: 'slider', key: 'cam1PosX', min: -200, max: 200, change: render, },
    { type: 'slider', key: 'cam1PosY', min: -200, max: 200, change: render, },
    { type: 'slider', key: 'cam1PosZ', min: -2000, max: 2000, change: render, },
    { type: 'slider', key: 'cam1Near', min: 1, max: 500, change: render, },
    { type: 'slider', key: 'cam1Far', min: 1, max: 500, change: render, },
    { type: 'checkbox', key: 'cam1Ortho', change: render, },
    { type: 'slider', key: 'cam1OrthoUnits', min: 1, max: 150, change: render, },
  ]);

  /**
   * 绘制场景
   * @param projectionMatrix 投影矩阵 
   * @param cameraMatrix  相机矩阵
   * @param worldMatrix 世界矩阵
   */
  function drawScene(projectionMatrix, cameraMatrix, worldMatrix) {
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

  function render() {
    Device.Instance.resizeCanvasToDisplaySize(gl.canvas);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.SCISSOR_TEST);

    // we're going to split the view in 2
    const effectiveWidth = gl.canvas.width / 2;
    const aspect = effectiveWidth / gl.canvas.height;
    const near = 1;
    const far = 2000;

    // Compute a projection matrix
    const perspectiveProjectionMatrix = settings.cam1Ortho
      ? glMatrix.mat4.ortho(null,
        -settings.cam1OrthoUnits * aspect,  // left
        settings.cam1OrthoUnits * aspect,  // right
        -settings.cam1OrthoUnits,           // bottom
        settings.cam1OrthoUnits,           // top
        settings.cam1Near,
        settings.cam1Far)
      : glMatrix.mat4.perspective(null, degToRad(settings.cam1FieldOfView),
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
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const cameraMatrix = glMatrix.mat4.lookAt2(null, cameraPosition, target, up);
    
    let fatherMatrix = glMatrix.mat4.identity(null);
    let worldMatrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.rotateY(null, worldMatrix, degToRad(settings.rotation));
    glMatrix.mat4.rotateX(worldMatrix, worldMatrix, degToRad(settings.rotation));
    // center the 'F' around its origin
    glMatrix.mat4.translate(fatherMatrix, fatherMatrix, [settings.posX, settings.posY, settings.posZ]);
    glMatrix.mat4.multiply(worldMatrix,fatherMatrix,worldMatrix);

    const { width, height } = gl.canvas;
    const leftWidth = width / 2 | 0;

    // draw on the left with orthographic camera
    gl.viewport(0, 0, leftWidth, height);
    gl.scissor(0, 0, leftWidth, height);
    gl.clearColor(1, 0.8, 0.8, 1);

    //将相机中的物体单独拿出来绘制
    //左侧将呈现一个单独的F模型
    drawScene(perspectiveProjectionMatrix, cameraMatrix, worldMatrix);

    // draw on right with perspective camera
    const rightWidth = width - leftWidth;
    gl.viewport(leftWidth, 0, rightWidth, height);
    gl.scissor(leftWidth, 0, rightWidth, height);
    gl.clearColor(0.8, 0.8, 1, 1);

    //这是一个右侧相机
    //此处的相机不做任何的改变
    const perspectiveProjectionMatrix2 = glMatrix.mat4.perspective(null, degToRad(60), aspect, near, far);
    // Compute the camera's matrix using look at.
    const cameraPosition2 = [-600, 400, -400];
    const target2 = [0, 0, 0];
    const cameraMatrix2 = glMatrix.mat4.lookAt2(null, cameraPosition2, target2, up);
    //绘制相机中的物体
    drawScene(perspectiveProjectionMatrix2, cameraMatrix2, worldMatrix);

    cameraModel.drawCameraModel(perspectiveProjectionMatrix2, cameraMatrix2, perspectiveProjectionMatrix, cameraMatrix);

    

  }

  render();
}

export default class CameraTest {
  static run() {
    main();
  }
}
