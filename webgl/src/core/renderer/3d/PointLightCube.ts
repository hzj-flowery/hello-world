import { SY } from "../base/Sprite";
import { CubeData, CubeFace } from "../data/CubeData";


var vertextBaseCode =
  'attribute vec4 a_position;' +
  'attribute vec3 a_normal;' +
  'uniform vec3 u_lightWorldPosition;' +
  'uniform vec3 u_cameraWorldPosition;' +
  'uniform mat4 u_MMatrix;' +
  'uniform mat4 u_PMatrix;' +
  'uniform mat4 u_VMatrix;' +
  'uniform mat4 u_MITMatrix;' +
  'varying vec3 v_normal;' +
  'varying vec3 v_surfaceToLight;' +
  'varying vec3 v_surfaceToView;' +
  'void main() {' +
  'gl_Position = u_PMatrix *u_VMatrix*u_MMatrix* a_position;' +
  'v_normal = mat3(u_MITMatrix) * a_normal;' +
  'vec3 surfaceWorldPosition = (u_MMatrix * a_position).xyz;' +
  'v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;' +
  'v_surfaceToView = u_cameraWorldPosition - surfaceWorldPosition;' +
  '}'
var fragBaseCode =
  'precision mediump float;' +
  'varying vec3 v_normal;' +
  'varying vec3 v_surfaceToLight;' +   //物体表面到光位置的方向
  'varying vec3 v_surfaceToView;' +    //物体表面到摄像机位置的方向
  'uniform vec4 u_color;' +            //物体的表面颜色
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
  'gl_FragColor = u_color;' +        //顶点颜色
  // 'gl_FragColor.rgb *= light;' +     //反射的颜色
  // 'gl_FragColor.rgb += specular;' +  //加上高光

  // Lets multiply just the color portion (not the alpha)
  // by the light
  'vec4 lightColor = light * u_lightColor;'+   //光的强度*光的颜色
  'gl_FragColor.rgb *= lightColor.rgb;'+           //光的颜色和点的颜色混合
  // Just add in the specular
  'gl_FragColor.rgb += specular * u_specularColor.rgb;'+ //加上高光的颜色

  '}'

//   var vertextBaseCode =
//     'attribute vec3 a_position;' +
//     'attribute vec2 a_uv;' +

//     'uniform mat4 u_MMatrix;' +
//     'uniform mat4 u_VMatrix;' +
//     'uniform mat4 u_PMatrix;' +
//     'varying vec2 vTextureCoordinates;' +

//     'void main() {' +
//     'gl_Position = u_PMatrix * u_VMatrix *u_MMatrix* vec4(a_position, 1.0);' +
//     'vTextureCoordinates = a_uv;' +
//     '}'
// //基础的shader的片段着色器
// var fragBaseCode =
//     'precision mediump float;' +

//     'varying vec2 vTextureCoordinates;' +
//     'uniform sampler2D u_texCoord;' +

//     'void main() {' +
//     'gl_FragColor = texture2D(u_texCoord, vTextureCoordinates);' +
//     '}'



export default class PointLightCube extends SY.SpriteBase {
    constructor() {
        super();
    }
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex,rd.dF.vertex_item_size);
        this.createUVsBuffer(rd.uvData,rd.dF.uv_item_size);
        this.createIndexsBuffer(rd.indexs);
        this._vertStr = vertextBaseCode;
        this._fragStr = fragBaseCode;
        this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
    }
    protected onShader(){
    
    }
}