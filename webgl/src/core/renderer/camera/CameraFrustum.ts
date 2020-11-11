import Device from "../../../Device";
import { glMatrix } from "../../Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { SY } from "../base/Sprite";
import { syPrimitives } from "../shader/Primitives";
import { BufferAttribsData, G_ShaderFactory, ShaderData } from "../shader/Shader";


var vertexColorVertexShader =
  'attribute vec4 a_position;' +
  'attribute vec4 a_color;' +
  'uniform mat4 u_worldViewProjection;' +
  'varying vec4 v_color;' +
  'void main() {' +
  'gl_Position = u_worldViewProjection * a_position;' +
  'v_color = a_color;' +
  '}'

var vertexColorFragmentShader =
  'precision mediump float;' +
  'uniform vec4 u_color;' +
  'varying vec4 v_color;' +
  'void main() {' +
  'gl_FragColor = u_color * v_color;' +
  '}'

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


var darkColors = {
  lines: [1, 1, 1, 1],
};
var lightColors = {
  lines: [0, 0, 0, 1],
};

var darkMatcher = window.matchMedia("(prefers-color-scheme: dark)");
var isDarkMode = darkMatcher.matches;
var colors = isDarkMode ? darkColors : lightColors;
var eyeElem: any = document.querySelector("#eye");

var worldCoordinateArrays = {
    position:[
    0,0,0,         //原点
    1,0,0,   //x
    0,1,0,   //y
    0,0,1    //z
    ],
    color:[
    1,0,0,1,       //原点
    1,1,0,0,       //x
    0,0,1,1,       //y
    0,1,1,0        //z
    ],
    indices:[
    0,1,0,2,0,3
    ]
}

for(var j = 0;j<worldCoordinateArrays.position.length;j++)
{
  worldCoordinateArrays.position[j] = worldCoordinateArrays.position[j]*3;
}

var wireCubeArrays = {
  position: [
    -1, 1, -1,
    1, 1, -1,
    1, -1, -1,
    -1, -1, -1,

    -1, 1, 1,
    1, 1, 1,
    1, -1, 1,
    -1, -1, 1,
  ],
  color: [
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,

    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
  ],
  indices: [
    0, 1, 1, 2, 2, 3, 3, 0,
    4, 5, 5, 6, 6, 7, 7, 4,
    0, 4, 1, 5, 2, 6, 3, 7,
  ],
};
var tempColor = [
  1, 1, 1, 1,
  1, 1, 1, 1,
  1, 1, 1, 1,
  1, 1, 1, 1,
]
for (var j = 0; j < 4; j++)
  tempColor.push.apply(tempColor, colors.lines);
var cubeRaysArrays = {
  position: wireCubeArrays.position,
  color: tempColor,
  indices: [
    0, 4, 1, 5, 2, 6, 3, 7,
  ],
};

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

export class CameraFrustum extends SY.Sprite {

  private zNear = 10;//相机最近能看到的距离
  private zFar = 50;//相机最远能看到的距离
  private fieldOfView = 30;//相机张开的角度
  private aspect: number;

  private _localProj: Float32Array;//本地的投影矩阵
  private _loacalInvertProj: Float32Array;//本地投影的逆矩阵
  private _localRayProj: Float32Array;//本地的射线投影矩阵
  private _loacalRayInvertProj: Float32Array;//本地射线投影的逆矩阵
  private _worldTemp:Float32Array;//这是一个临时的矩阵 若使用请先初始化
  private _originPos:Array<number>;//原点位置 
  // uniforms.
  private sharedUniforms = {
  };
  private frustumCubeUniforms = {
    u_color: [1, 1, 1, 0.4],
    u_worldViewProjection: new Float32Array(16),
    u_exampleWorldViewProjection: new Float32Array(16),
  };
  private cubeRaysUniforms = {
    u_color: colors.lines,
    u_worldViewProjection: new Float32Array(16),
  };
  private wireFrustumUniforms = {
    u_color: colors.lines,
    u_worldViewProjection: new Float32Array(16),
  };

  private vertexColorProgramInfo: ShaderData;
  private colorProgramInfo: ShaderData;
  private cubeRaysBufferInfo: BufferAttribsData;
  private wireCubeBufferInfo: BufferAttribsData;
  private cubeBufferInfo: BufferAttribsData;
  private coordinateBufferInfo:BufferAttribsData; //世界坐标系
  constructor(gl) {
    super(gl);
  }
  public static create() {
    return new CameraFrustum(Device.Instance.gl);
  }
  protected onInit() {
    this.vertexColorProgramInfo = G_ShaderFactory.createProgramInfo(vertexColorVertexShader, vertexColorFragmentShader);
    this.colorProgramInfo = G_ShaderFactory.createProgramInfo(baseVertexShader, colorFragmentShader);
    this.cubeRaysBufferInfo = G_ShaderFactory.createBufferInfoFromArrays(cubeRaysArrays);
    this.wireCubeBufferInfo = G_ShaderFactory.createBufferInfoFromArrays(wireCubeArrays);
    this.coordinateBufferInfo = G_ShaderFactory.createBufferInfoFromArrays(worldCoordinateArrays);
    var cubeArrays: any = syPrimitives.createCubeVertices(2);
    delete cubeArrays.normal;
    delete cubeArrays.texcoord;
    cubeArrays.color = colorVerts;
    this.cubeBufferInfo = G_ShaderFactory.createBufferInfoFromArrays(cubeArrays);

    this.aspect = this.gl.canvas.width / (this.gl.canvas.width / 2);
    this.zFar = 50;
    this.zNear = 10;
    this.fieldOfView = 30;

    this._loacalInvertProj = glMatrix.mat4.identity(null);
    this._localProj = glMatrix.mat4.identity(null);
    this._localRayProj = glMatrix.mat4.identity(null);
    this._loacalRayInvertProj = glMatrix.mat4.identity(null);
    this._worldTemp = glMatrix.mat4.identity(null);
    this._originPos = [0,0,0];
  }

  //更新本地投影矩阵
  private updateLocalProj(): void {
    glMatrix.mat4.perspective(
      this._localProj,
      MathUtils.degToRad(this.fieldOfView),
      this.aspect,
      this.zNear,
      this.zFar);
    glMatrix.mat4.invert(this._loacalInvertProj, this._localProj);

    glMatrix.mat4.perspective(
      this._localRayProj,
      MathUtils.degToRad(this.fieldOfView),
      this.aspect,
      1,
      5000);

    glMatrix.mat4.invert(this._loacalRayInvertProj, this._localRayProj);
  }
  public testDraw(vp: Float32Array, aspect: number, zNear: number, zFar: number, fieldOfView: number) {

    this.aspect = aspect;
    this.zNear = zNear;
    this.zFar = zFar;
    this.fieldOfView = fieldOfView;

    this.updateLocalProj();
    //绘制齐次裁切空间 六个面
    this.drawFrustumCube(vp, this.colorProgramInfo, this.cubeBufferInfo);
    //绘制四条射线
    this.drawViewCone(vp, this.vertexColorProgramInfo, this.cubeRaysBufferInfo);
    //绘制四个金属线
    this.drawFrustumWire(vp, this.vertexColorProgramInfo, this.wireCubeBufferInfo);

    this.drawWorldCoordinateSystem(vp);
  }
  // Draw view cone.
  //绘制齐次裁切空间的四条射线
  private drawViewCone(vp: Float32Array, sd: ShaderData, buffAttr: BufferAttribsData) {
    const halfHeight = this.gl.canvas.height / 2;
    const width = this.gl.canvas.width;
    glMatrix.mat4.translation(this._worldTemp,this._originPos[0],this._originPos[1],this._originPos[2]);
    glMatrix.mat4.multiply(this._worldTemp, this._worldTemp, this._loacalRayInvertProj);
    glMatrix.mat4.multiply(this.cubeRaysUniforms.u_worldViewProjection, vp, this._worldTemp);//pvm
    this.gl.useProgram(sd.spGlID);
    G_ShaderFactory.setBuffersAndAttributes(sd.attrSetters, buffAttr);
    G_ShaderFactory.setUniforms(sd.uniSetters, this.sharedUniforms);
    G_ShaderFactory.setUniforms(sd.uniSetters, this.cubeRaysUniforms);
    G_ShaderFactory.drawBufferInfo(buffAttr, this.gl.LINES);

    const eyePosition = glMatrix.mat4.transformPoint(null, this.cubeRaysUniforms.u_worldViewProjection, this._originPos);
    const ex = (eyePosition[0] * .5 + .5) * width / pixelRatio;
    const ey = (eyePosition[1] * -.5 + .5) * halfHeight / pixelRatio;
    eyeElem.style.left = MathUtils.px(ex - eyeElem.width / 2);
    eyeElem.style.top = MathUtils.px(ey - eyeElem.height / 2);
  }
  // Draw Frustum Wire
  //绘制齐次裁切空间远近平面的边缘线
  private drawFrustumWire(vp: Float32Array, sdData: ShaderData, buffAttrData: BufferAttribsData) {
    glMatrix.mat4.translation(this._worldTemp, this._originPos[0],this._originPos[1],this._originPos[2]);
    glMatrix.mat4.multiply(this._worldTemp, this._worldTemp, this._loacalInvertProj);
    glMatrix.mat4.multiply(this.wireFrustumUniforms.u_worldViewProjection, vp, this._worldTemp);//pvm
    G_ShaderFactory.setBuffersAndAttributes(sdData.attrSetters, buffAttrData);
    G_ShaderFactory.setUniforms(sdData.uniSetters, this.sharedUniforms);
    G_ShaderFactory.setUniforms(sdData.uniSetters, this.wireFrustumUniforms);
    G_ShaderFactory.drawBufferInfo(buffAttrData, this.gl.LINES);
  }
  // Draw Frustum Cube behind
  private drawFrustumCube(vp: Float32Array, shaderD: ShaderData, buffAttData: BufferAttribsData) {
    var gl = this.gl;
    Device.Instance.cullFace(false);
    gl.useProgram(shaderD.spGlID);
    G_ShaderFactory.setBuffersAndAttributes(shaderD.attrSetters, buffAttData);
    glMatrix.mat4.translation(this._worldTemp, this._originPos[0],this._originPos[1],this._originPos[2]);
    glMatrix.mat4.multiply(this._worldTemp, this._loacalInvertProj, this._worldTemp);
    glMatrix.mat4.multiply(this.frustumCubeUniforms.u_worldViewProjection, vp, this._worldTemp); //pvm
    G_ShaderFactory.setUniforms(shaderD.uniSetters, this.sharedUniforms);
    G_ShaderFactory.setUniforms(shaderD.uniSetters, this.frustumCubeUniforms);
    G_ShaderFactory.drawBufferInfo(buffAttData);
    Device.Instance.closeCullFace();
  }
  
  //世界坐标系
  private drawWorldCoordinateSystem(vp: Float32Array):void{
      this.gl.useProgram(this.vertexColorProgramInfo.spGlID);
      G_ShaderFactory.setBuffersAndAttributes(this.vertexColorProgramInfo.attrSetters,this.coordinateBufferInfo);
      G_ShaderFactory.setUniforms(this.vertexColorProgramInfo.uniSetters,{u_worldViewProjection:vp});
      G_ShaderFactory.setUniforms(this.vertexColorProgramInfo.uniSetters,{u_color:[1,0,0,1]});

      G_ShaderFactory.drawBufferInfo(this.coordinateBufferInfo,this.gl.LINES);
  }
}