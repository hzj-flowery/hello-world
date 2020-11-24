import Device from "../../../Device";
import { glMatrix } from "../../Matrix";
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
    let scale = 6;
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

export class CameraModel {
  constructor(gl) {
    this.gl = gl;
    this.init();
  }
  private gl: WebGLRenderingContext;
  private _frustumCube:ShaderData;
  private _programInfor: ShaderData;
  private _modelBuffer: BufferAttribsData;
  private _clipSpaceBuffer: BufferAttribsData;
  private _cubeBufferInfo:BufferAttribsData;
  private _coordinate: Graphic;
  private _worldTemp:Float32Array;
  private _worldTemp1:Float32Array;
  private _worldTemp2:Float32Array;
  private _pvTemp1:Float32Array;
  private _loacalInvertProj:Float32Array;
  private _viewMatrix:Float32Array;
  private _originPos:Array<number>;
  // uniforms.
  private sharedUniforms = {
  };
  private _frustumCubeUniforms = {
    u_color: [1, 1, 1, 0.4],
    u_worldViewProjection: new Float32Array(16),
    u_exampleWorldViewProjection: new Float32Array(16),
  };

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
    this._frustumCube = G_ShaderFactory.createProgramInfo(baseVertexShader, colorFragmentShader);
    this._modelBuffer = this.createCameraBufferInfo();
    this._clipSpaceBuffer = this.createClipspaceCubeBufferInfo();

    this._coordinate = new Graphic(this.gl);//绘制线
    
    this._worldTemp = glMatrix.mat4.identity(null);
    this._worldTemp1 = glMatrix.mat4.identity(null);
    this._worldTemp2 = glMatrix.mat4.identity(null);
    this._loacalInvertProj = glMatrix.mat4.identity(null);
    this._pvTemp1 = glMatrix.mat4.identity(null);
    this._viewMatrix = glMatrix.mat4.identity(null);
    this._originPos = [0,0,0];
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
    var cubeArrays: any = syPrimitives.createCubeVertices(2);
    delete cubeArrays.normal;
    delete cubeArrays.texcoord;
    cubeArrays.color = colorVerts;
    this._cubeBufferInfo = G_ShaderFactory.createBufferInfoFromArrays(cubeArrays);

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
  private createCameraBufferInfo(scale = 1) {
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
  public draw(projMatrix, cameraMatrix, targetProjMatrix, targetCameraMatrix) {
    var gl = this.gl;
    // draw object to represent first camera
    // Make a view matrix from the camera matrix.
    glMatrix.mat4.invert(this._viewMatrix, cameraMatrix);
    glMatrix.mat4.multiply(this._worldTemp1, projMatrix, this._viewMatrix); //投影矩阵X视口矩阵
    // use the first's camera's matrix as the matrix to position
    // the camera's representative in the scene
    //可以这么理解，第一台摄像机上的点乘以它得相机矩阵，可以将位置转换到世界坐标系下
    //通过世界坐标系这个枢纽，再将点转换到其他的视口坐标系下，进行投影
    glMatrix.mat4.multiply(this._worldTemp1, this._worldTemp1, targetCameraMatrix);//投影矩阵xs视口矩阵x第一个摄像机的相机矩阵
    gl.useProgram(this._programInfor.spGlID);

    // ------ Draw the Camera Representation --------绘制相机模型
    // Setup all the needed attributes.
    G_ShaderFactory.setBuffersAndAttributes(this._programInfor.attrSetters, this._modelBuffer);
    // Set the uniforms
    G_ShaderFactory.setUniforms(this._programInfor.uniSetters, {
      u_matrix: this._worldTemp1,
      u_color: [1, 0, 0, 1],
    });
    G_ShaderFactory.drawBufferInfo(this._modelBuffer, gl.LINES);

    // ----- Draw the frustum ------- 绘制齐次裁切空间坐标系
    //一个正方体乘以这个矩阵的逆矩阵可以变成一个棱台
    glMatrix.mat4.multiply(this._worldTemp1, this._worldTemp1, glMatrix.mat4.invert(null, targetProjMatrix));
    // Setup all the needed attributes.
    G_ShaderFactory.setBuffersAndAttributes(this._programInfor.attrSetters, this._clipSpaceBuffer);
    // Set the uniforms
    G_ShaderFactory.setUniforms(this._programInfor.uniSetters, {
      u_matrix: this._worldTemp1,
      u_color: [0, 1, 0, 1],
    });
    G_ShaderFactory.drawBufferInfo(this._clipSpaceBuffer, gl.LINES);

    //原点
    glMatrix.mat4.identity(this._worldTemp2);
    //转换到相机坐标系下
    //你可以理解为相机中的点乘以相机坐标系可以转换到世界坐标系
    glMatrix.mat4.multiply(this._worldTemp2, this._worldTemp2, targetCameraMatrix);//投影矩阵xs视口矩阵x第一个摄像机的相机矩阵
    this._coordinate.drawLine(projMatrix, cameraMatrix, this._worldTemp2);
    this._coordinate.drawLine(projMatrix, cameraMatrix);

    this._coordinate.drawPoint(projMatrix, cameraMatrix, this._worldTemp2);
    this._coordinate.drawPoint(projMatrix, cameraMatrix);

    this.drawFrustumCube(projMatrix, cameraMatrix, targetProjMatrix, targetCameraMatrix);
  }

  // Draw Frustum Cube behind
  private drawFrustumCube(projMatrix, cameraMatrix, targetProjMatrix, targetCameraMatrix) {

     //绘制齐次裁切空间 六个面
     glMatrix.mat4.invert(this._viewMatrix, cameraMatrix);
     glMatrix.mat4.multiply(this._pvTemp1,projMatrix,this._viewMatrix);
     glMatrix.mat4.multiply(this._pvTemp1,this._pvTemp1,targetCameraMatrix);
     glMatrix.mat4.invert(this._loacalInvertProj,targetProjMatrix);

    var gl = this.gl;
    Device.Instance.cullFace(false);
    gl.useProgram(this._frustumCube.spGlID);
    G_ShaderFactory.setBuffersAndAttributes(this._frustumCube.attrSetters, this._cubeBufferInfo);
    glMatrix.mat4.translation(this._worldTemp, this._originPos[0],this._originPos[1],this._originPos[2]);
    glMatrix.mat4.multiply(this._worldTemp, this._loacalInvertProj, this._worldTemp);
    glMatrix.mat4.multiply(this._frustumCubeUniforms.u_worldViewProjection, this._pvTemp1, this._worldTemp); //pvm
    G_ShaderFactory.setUniforms(this._frustumCube.uniSetters, this.sharedUniforms);
    G_ShaderFactory.setUniforms(this._frustumCube.uniSetters, this._frustumCubeUniforms);
    G_ShaderFactory.drawBufferInfo(this._cubeBufferInfo);
    Device.Instance.closeCullFace();
  }
}