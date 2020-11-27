import { glMatrix } from "../../Matrix";
import { SY } from "../base/Sprite";
import { CameraData } from "../data/CameraData";
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


export class PointLight extends SY.Sprite {
  constructor() {
    super();
  }
  private shininess:number = 150;
  protected onInit(): void {
    this._uniformsData = {
      u_worldViewProjection: {},
      u_worldInverseTranspose: {},
      u_color: {},
      u_shininess: {},
      u_lightWorldPosition: {},
      u_viewWorldPosition: {},
      u_world: {}
    }
    this.setShader(vertexshader3d,fragmentshader3d);
  }

  //加载数据完成
  protected onLoadFinish(datas): void {
    let cubeDatas: any = {};
    cubeDatas.position = new Float32Array(datas.position);
    cubeDatas.normal = new Float32Array(datas.normal);

    var matrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.rotateX(matrix, matrix, Math.PI);
    glMatrix.mat4.translate(matrix, matrix, [-50, -75, -15]);

    for (var ii = 0; ii < cubeDatas.position.length; ii += 3) {
      var vector = glMatrix.mat4.transformPoint(null, matrix, [cubeDatas.position[ii + 0], cubeDatas.position[ii + 1], cubeDatas.position[ii + 2], 1]);
      cubeDatas.position[ii + 0] = vector[0];
      cubeDatas.position[ii + 1] = vector[1];
      cubeDatas.position[ii + 2] = vector[2];
    }
    this._attrData = G_ShaderFactory.createBufferInfoFromArrays(cubeDatas);
  }
  //更新unifoms变量
  public updateUniformsData(cameraData:CameraData):void{
    // glMatrix.mat4.identity(this._modelMatrix);
    // // Multiply the matrices.
    // var worldViewProjectionMatrix = glMatrix.mat4.multiply(null, cameraData.viewProjectionMat,  this._modelMatrix);
    // var worldInverseMatrix = glMatrix.mat4.invert(null,  this._modelMatrix);
    // var worldInverseTransposeMatrix = glMatrix.mat4.identity(null);
    // glMatrix.mat4.transpose(worldInverseTransposeMatrix, worldInverseMatrix);


    // this._uniformsData.u_worldViewProjection = worldViewProjectionMatrix;  //投影矩阵 x 视口矩阵 x 世界矩阵
    // this._uniformsData.u_worldInverseTranspose = worldInverseTransposeMatrix;//世界矩阵逆矩阵的转置矩阵
    // this._uniformsData.u_world =  this._modelMatrix;//世界矩阵
    // this._uniformsData.u_color = [0.2, 1, 0.2, 1];//光的颜色
    // this._uniformsData.u_lightWorldPosition = [20, 30, 60];//光的位置
    // this._uniformsData.u_viewWorldPosition = cameraData.position;//摄像机的位置
    // this._uniformsData.u_shininess = this.shininess;

     // Draw a F at the origin
     var worldMatrix = glMatrix.mat4.identity(null);
     glMatrix.mat4.rotateY(worldMatrix, worldMatrix, 1);
 
     // Multiply the matrices.
     var worldViewProjectionMatrix = glMatrix.mat4.multiply(null, cameraData.viewProjectionMat, worldMatrix);
     var worldInverseMatrix = glMatrix.mat4.invert(null, worldMatrix);
     var worldInverseTransposeMatrix = glMatrix.mat4.identity(null);
     glMatrix.mat4.transpose(worldInverseTransposeMatrix, worldInverseMatrix);
 
 
     this._uniformsData.u_worldViewProjection = worldViewProjectionMatrix;  //投影矩阵 x 视口矩阵 x 世界矩阵
     this._uniformsData.u_worldInverseTranspose = worldInverseTransposeMatrix;//世界矩阵逆矩阵的转置矩阵
     this._uniformsData.u_world = worldMatrix;//世界矩阵
     this._uniformsData.u_color = [0.2, 1, 0.2, 1];//光的颜色
     this._uniformsData.u_lightWorldPosition = [20, 30, 60];//光的位置
     this._uniformsData.u_viewWorldPosition = cameraData.position;//摄像机的位置
     this._uniformsData.u_shininess = this.shininess;

  }
}