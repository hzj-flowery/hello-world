import { glMatrix } from "../../Matrix";
import { SY } from "../base/Sprite";
import { CameraData } from "../data/CameraData";
import { LightData } from "../data/LightData";
import { NormalRenderData } from "../data/RenderData";
import { G_ShaderFactory } from "../shader/ShaderFactory";


var vertexshader3d =
  'attribute vec4 a_position;' +
  'attribute vec3 a_normal;' +
  'uniform vec3 u_lightWorldPosition;' +
  'uniform vec3 u_cameraWorldPosition;' +
  'uniform mat4 u_MMatrix;' +
  'uniform mat4 u_PVMMatrix;' +
  'uniform mat4 u_MITMatrix;' +
  'varying vec3 v_normal;' +
  'varying vec3 v_surfaceToLight;' +
  'varying vec3 v_surfaceToView;' +
  'void main() {' +
  'gl_Position = u_PVMMatrix * a_position;' +
  'v_normal = mat3(u_MITMatrix) * a_normal;' +
  'vec3 surfaceWorldPosition = (u_MMatrix * a_position).xyz;' +
  'v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;' +
  'v_surfaceToView = u_cameraWorldPosition - surfaceWorldPosition;' +
  '}'
var fragmentshader3d =
  'precision mediump float;' +
  'varying vec3 v_normal;' +
  'varying vec3 v_surfaceToLight;' +   //物体表面到光位置的方向
  'varying vec3 v_surfaceToView;' +    //物体表面到摄像机位置的方向
  'uniform vec4 a_color;' +            //物体的表面颜色
  'uniform float u_shininess;' +       //高光的指数
  'uniform vec4 u_lightColor;'+        //光的颜色
  'uniform vec4 u_specularColor;'+     //高光的颜色
  'void main() {' +
  'vec3 normal = normalize(v_normal);' +  //法线
  'vec3 surfaceToLightDirection = normalize(v_surfaceToLight);' +
  'vec3 surfaceToViewDirection = normalize(v_surfaceToView);' +
  'vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);' + //高光的方向
  'float light = dot(normal, surfaceToLightDirection);' + //法线*光的方向 算出光的反射强度
  'float specular = 0.0;' +
  'if (light > 0.0) {specular = pow(dot(normal, halfVector), u_shininess);}' +//法线*高光方向 算出高光的反射强度
  'gl_FragColor = a_color;' +        //顶点颜色
  // 'gl_FragColor.rgb *= light;' +     //反射的颜色
  // 'gl_FragColor.rgb += specular;' +  //加上高光

  // Lets multiply just the color portion (not the alpha)
  // by the light
  'vec4 lightColor = light * u_lightColor;'+   //光的强度*光的颜色
  'gl_FragColor.rgb *= lightColor.rgb;'+           //光的颜色和点的颜色混合
  // Just add in the specular
  'gl_FragColor.rgb += specular * u_specularColor.rgb;'+ //加上高光的颜色

  '}'


export class PointLightFCube extends SY.Sprite {
  constructor() {
    super();
  }
  protected onInit(): void {
    this._uniformData = {
      u_PVMMatrix: {},
      u_MITMatrix: {},
      a_color: {},
      u_shininess: {},
      u_lightColor:{},
      u_specularColor:{},
      u_lightWorldPosition: {},
      u_cameraWorldPosition: {},
      u_MMatrix: {}
    }
    this.setShader(vertexshader3d,fragmentshader3d);
  }

  //加载数据完成
  protected onLoadFinish(datas): void {
    let cubeDatas: any = {};
    cubeDatas.position = new Float32Array(datas.position);
    cubeDatas.normal = new Float32Array(datas.normal);

    // var matrix = glMatrix.mat4.identity(null);
    // glMatrix.mat4.rotateX(matrix, matrix, Math.PI);
    // glMatrix.mat4.translate(matrix, matrix, [-50, -75, -15]);

    // for (var ii = 0; ii < cubeDatas.position.length; ii += 3) {
    //   var vector = glMatrix.mat4.transformPoint(null,matrix, [cubeDatas.position[ii + 0], cubeDatas.position[ii + 1], cubeDatas.position[ii + 2], 1]);
    //   cubeDatas.position[ii + 0] = vector[0];
    //   cubeDatas.position[ii + 1] = vector[1];
    //   cubeDatas.position[ii + 2] = vector[2];
    // }
    this._attrData = G_ShaderFactory.createBufferInfoFromArrays(cubeDatas);
  }
  //更新unifoms变量
  public updateUniformsData(cData:CameraData,lightData:LightData):any{
    this.rotateX;
    // Multiply the matrices.
    var worldViewProjectionMatrix = glMatrix.mat4.multiply(null, cData.viewProjectionMat,  this.modelMatrix);
    var worldInverseMatrix = glMatrix.mat4.invert(null,  this.modelMatrix);
    var worldInverseTransposeMatrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.transpose(worldInverseTransposeMatrix, worldInverseMatrix);


    this._uniformData.u_PVMMatrix = worldViewProjectionMatrix;  //投影矩阵 x 视口矩阵 x 世界矩阵
    this._uniformData.u_MITMatrix = worldInverseTransposeMatrix;//世界矩阵逆矩阵的转置矩阵
    this._uniformData.u_MMatrix =  this.modelMatrix;//世界矩阵
    this._uniformData.a_color = [0.2, 1, 0.2, 1];//点的颜色
    this._uniformData.u_lightWorldPosition = lightData.position;//光的位置
    this._uniformData.u_cameraWorldPosition = cData.position;//摄像机的位置
    this._uniformData.u_shininess = lightData.specularShininess;//高光的指数
    this._uniformData.u_lightColor = lightData.color;
    this._uniformData.u_specularColor = lightData.specularColor;
    super.updateRenderData();
    return this._uniformData;
  }
}