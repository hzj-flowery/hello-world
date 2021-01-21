import { SY } from "../base/Sprite";
import { CubeData, CubeFace } from "../data/CubeData";
import { ShaderUseVariantType } from "../shader/ShaderUseVariantType";



/**
 * 物体呈现出颜色亮度就是表面的反射光导致，计算反射光公式如下：
<表面的反射光颜色> = <漫反射光颜色> + <环境反射光颜色> + <镜面反射光颜色>

1. 其中漫反射公式如下：
<漫反射光颜色> = <入射光颜色> * <表面基底色> * <光线入射角度>

光线入射角度可以由光线方向和表面的法线进行点积求得：
<光线入射角度> = <光线方向> * <法线方向>

最后的漫反射公式如下：
<漫反射光颜色> = <入射光颜色> * <表面基底色> * (<光线方向> * <法线方向>)

2. 环境反射光颜色根据如下公式得到：
<环境反射光颜色> = <入射光颜色> * <表面基底色>

3. 镜面（高光）反射光颜色公式，这里使用的是冯氏反射原理
<镜面反射光颜色> = <高光颜色> * <镜面反射亮度权重> 

其中镜面反射亮度权重又如下
<镜面反射亮度权重> = (<观察方向的单位向量> * <入射光反射方向>) ^ 光泽度
 */

/**
* 光照知识1：
* 使用环境光源的时候，需要注意颜色的亮度。环境光照的是全部，比如上面的代码中指定的0.1，如果全都换成1.0的话，模型就会变成全白了。和平行光源不一样，所以要注意。
  环境光的颜色，最好是限制在0.2左右以下
* 环境光，模拟了自然界的光的漫反射，弥补了平行光源的缺点。一般，这两种光会同时使用。只使用环境光的话，无法表现出模型的凹凸，只使用平行光源的话，阴影过于严重无法分清模型的轮廓
  环境光是没有方向的
*/
var vertextBaseCode =
  `attribute vec4 a_position;
  attribute vec3 a_normal;
  attribute vec2 a_uv;
  uniform vec3 u_lightWorldPosition;
  uniform vec3 u_cameraWorldPosition;
  uniform mat4 u_MMatrix;
  uniform mat4 u_PMatrix;
  uniform mat4 u_VMatrix;
  uniform mat4 u_MITMatrix;
  varying vec3 v_normal;
  varying vec2 v_uv;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;
  void main() {
  
  v_normal = mat3(u_MITMatrix) * a_normal;
  vec3 surfaceWorldPosition = (u_MMatrix * a_position).xyz;
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
  v_surfaceToView = u_cameraWorldPosition - surfaceWorldPosition;
  v_uv = a_uv;
  gl_Position = u_PMatrix *u_VMatrix*u_MMatrix* a_position;
  }`
var fragBaseCode =
  `precision mediump float;
    varying vec2 v_uv;
  varying vec3 v_normal;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;
  uniform sampler2D u_texCoord;
  uniform vec4 u_color;     //节点的颜色
  uniform float u_shininess;
  uniform vec4 u_specularColor;//高光入射光颜色
  
  uniform vec4 u_ambientColor;//环境光入射光的颜色
  
  uniform vec3  u_spotDirection;//聚光的方向
  uniform vec4  u_spotColor;//聚光入射光的颜色
  uniform float u_spotInnerLimit;//聚光的内部限制
  uniform float u_spotOuterLimit;//聚光的外部限制

  void main() {
  vec4 materialColor = texture2D(u_texCoord, v_uv);//材质颜色
  vec4 surfaceBaseColor = u_color*materialColor;//表面基底颜色
  vec3 normal = normalize(v_normal);
  vec3 spotDirection = normalize(u_spotDirection);
  vec3 surfaceToLightDirection = normalize(v_surfaceToLight); //表面指向光位置的方向
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);   //表面指向摄像机位置的方向
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);//高光方向

  float dotFromDirection = dot(surfaceToLightDirection,spotDirection);
  float limitRange = u_spotOuterLimit - u_spotInnerLimit;
  float inLight = clamp((dotFromDirection - u_spotOuterLimit) / limitRange, 0.0, 1.0);

  float light =inLight* max(dot(normal, surfaceToLightDirection),0.0); //算出点光的入射强度
  float specular = 0.0;                                                  //高光强度
  if (light > 0.0) {specular = inLight*pow(dot(normal, halfVector), u_shininess);}
  vec4 diffuseColor = surfaceBaseColor*u_spotColor*light;//漫反射颜色
  vec4 specularColor = u_specularColor*specular;//高光颜色
  vec4 ambientColor = u_ambientColor*surfaceBaseColor;//环境光
  gl_FragColor = diffuseColor +specularColor+ambientColor;

  }`



export default class SpotLightCube extends SY.SpriteBase {
  constructor() {
    super();
  }
  protected onInit() {
    var rd = CubeData.getData();
    this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
    this.createIndexsBuffer(rd.indexs);
    this.createNormalsBuffer(rd.normals, rd.dF.normal_item_size);
    this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size);
    this._vertStr = vertextBaseCode;
    this._fragStr = fragBaseCode;
    this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
    this.color = [1, 1.0, 1.0, 1.0];
  }
  protected onShader() {
    this._shader.pushShaderVariant(ShaderUseVariantType.SpecularColor);
    this._shader.pushShaderVariant(ShaderUseVariantType.Spot);
    this._shader.pushShaderVariant(ShaderUseVariantType.AmbientColor);
    this._shader.pushShaderVariant(ShaderUseVariantType.LightWorldPosition);
    this._shader.pushShaderVariant(ShaderUseVariantType.CameraWorldPosition);
    this._shader.pushShaderVariant(ShaderUseVariantType.ModelInverseTransform);

  }
}