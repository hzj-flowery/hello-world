import { SY } from "../base/Sprite";
import { CubeData, CubeFace } from "../data/CubeData";
import { ShaderUseVariantType } from "../shader/ShaderUseVariantType";


var vertextBaseCode =
    `attribute vec4 a_position;
  attribute vec3 a_normal;
  uniform vec3 u_lightWorldPosition;
  uniform vec3 u_cameraWorldPosition;
  uniform mat4 u_MMatrix;
  uniform mat4 u_PMatrix;
  uniform mat4 u_VMatrix;
  uniform mat4 u_MITMatrix;
  varying vec3 v_normal;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;
  void main() {
  gl_Position = u_PMatrix *u_VMatrix*u_MMatrix* a_position;
  v_normal = mat3(u_MITMatrix) * a_normal;
  vec3 surfaceWorldPosition = (u_MMatrix * a_position).xyz;
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
  v_surfaceToView = u_cameraWorldPosition - surfaceWorldPosition;
  }`
var fragBaseCode =
    `precision mediump float;
  varying vec3 v_normal;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;
  uniform vec4 u_color;
  uniform float u_shininess;
  uniform vec4 u_lightColor;
  
  uniform vec4 u_specularColor;
  void main() {
  vec3 normal = normalize(v_normal);
  vec3 surfaceToLightDirection = normalize(v_surfaceToLight); //表面指向光位置的方向
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);   //表面指向摄像机位置的方向
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);//高光方向
  float light = dot(normal, surfaceToLightDirection);
  light = 0.01;
  float specular = 0.0;                                                  //高光强度
  if (light > 0.0) {specular = pow(dot(normal, halfVector), u_shininess);}
  gl_FragColor = u_color;
  
//   gl_FragColor.rgb *= light;
  // gl_FragColor.rgb += specular;

  // Lets multiply just the color portion (not the alpha)
  // by the light
  vec4 lightColor = light * u_lightColor;
  gl_FragColor.rgb *= lightColor.rgb;
  // Just add in the specular
  gl_FragColor.rgb += specular * u_specularColor.rgb;

  }`



export default class PointLightCube extends SY.SpriteBase {
    constructor() {
        super();
    }
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
        this.createIndexsBuffer(rd.indexs);
        this._vertStr = vertextBaseCode;
        this._fragStr = fragBaseCode;
        this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
        this.color = [1, 1.0, 1.0, 1.0];
    }
    protected onShader() {
        this._shader.pushShaderVariant(ShaderUseVariantType.SpecularColor);
        this._shader.pushShaderVariant(ShaderUseVariantType.LightColor);
        this._shader.pushShaderVariant(ShaderUseVariantType.LightWorldPosition);
        this._shader.pushShaderVariant(ShaderUseVariantType.CameraWorldPosition);

    }
}