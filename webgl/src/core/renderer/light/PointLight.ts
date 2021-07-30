import { glMatrix } from "../../math/Matrix";
import { SY } from "../base/Sprite";
import { CameraData } from "../data/CameraData";
import { LightData } from "../data/LightData";
import { G_ShaderFactory } from "../shader/ShaderFactory";


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
  'varying vec3 v_surfaceToLight;' +   //物体表面到光位置的方向
  'varying vec3 v_surfaceToView;' +    //物体表面到摄像机位置的方向
  'uniform vec4 u_color;' +            //物体表面的颜色
  'uniform float u_shininess;' +       //高光的指数
  'uniform vec3 u_light;'+        //光的颜色
  'uniform vec3 u_specular;'+     //高光的颜色
  'void main() {' +
  'vec3 normal = normalize(v_normal);' +  //法线
  'vec3 surfaceToLightDirection = normalize(v_surfaceToLight);' +
  'vec3 surfaceToViewDirection = normalize(v_surfaceToView);' +
  'vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);' + //高光的方向
  'float light = dot(normal, surfaceToLightDirection);' + //法线*光的方向 算出光的反射强度
  'float specular = 0.0;' +
  'if (light > 0.0) {specular = pow(dot(normal, halfVector), u_shininess);}' +//法线*高光方向 算出高光的反射强度
  'gl_FragColor = u_color;' +        //顶点颜色
  // 'gl_FragColor.rgb *= light;' +     //反射的颜色
  // 'gl_FragColor.rgb += specular;' +  //加上高光

  // Lets multiply just the color portion (not the alpha)
  // by the light
  'vec3 lightColor = light * u_light;'+   //光的强度*光的颜色
  'gl_FragColor.rgb *= lightColor;'+           //光的颜色和点的颜色混合
  // Just add in the specular
  'gl_FragColor.rgb += specular * u_specular;'+ //加上高光的颜色

  '}'


export class PointLight extends SY.Sprite {
  constructor() {
    super();
  }
  protected onInit(): void {
    this._uniformData = {
      u_worldViewProjection: {},
      u_worldInverseTranspose: {},
      u_color: {},
      u_shininess: {},
      u_light:{},
      u_specular:{},
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
  public updateUniformsData(cData:CameraData,lightData:LightData):any{
    // Multiply the matrices.
    var worldViewProjectionMatrix = glMatrix.mat4.multiply(null, cData.viewProjectionMat,  this.modelMatrix);
    var worldInverseMatrix = glMatrix.mat4.invert(null,  this.modelMatrix);
    var worldInverseTransposeMatrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.transpose(worldInverseTransposeMatrix, worldInverseMatrix);


    this._uniformData.u_worldViewProjection = worldViewProjectionMatrix;  //投影矩阵 x 视口矩阵 x 世界矩阵
    this._uniformData.u_worldInverseTranspose = worldInverseTransposeMatrix;//世界矩阵逆矩阵的转置矩阵
    this._uniformData.u_world =  this.modelMatrix;//世界矩阵
    this._uniformData.u_color = [0.2, 1, 0.2, 1];//点的颜色
    this._uniformData.u_lightWorldPosition = lightData.position;//光的位置
    this._uniformData.u_viewWorldPosition = cData.position;//摄像机的位置
    this._uniformData.u_shininess = lightData.specular.specularShininess;//高光的指数
    this._uniformData.u_light = lightData.parallel.color;
    this._uniformData.u_specular = lightData.specular.color;
    super.updateRenderData();
    return this._uniformData;
  }
}