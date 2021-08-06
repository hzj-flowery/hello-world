precision mediump float;
varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;
uniform sampler2D u_texture;
uniform vec4 u_color;//节点的颜色
uniform float u_specular_shininess;
uniform vec4 u_specular;//高光入射光颜色

uniform vec4 u_ambient;//环境光入射光的颜色

uniform vec3 u_spotDirection;//聚光的方向
uniform vec4 u_spot;//聚光入射光的颜色
uniform float u_spotInnerLimit;//聚光的内部限制
uniform float u_spotOuterLimit;//聚光的外部限制

void main(){
  vec4 materialColor=texture2D(u_texture,v_uv);//材质颜色
  vec4 surfaceBaseColor=u_color*materialColor;//表面基底颜色
  vec3 normal=normalize(v_normal);// 因为 v_normal 是可变量，被插值过，所以不是单位向量，单位可以让它成为再次成为单位向量
  vec3 spotDirection=normalize(u_spotDirection);
  vec3 surfaceToLightDirection=normalize(v_surfaceToLight);//表面指向光位置的方向
  vec3 surfaceToViewDirection=normalize(v_surfaceToView);//表面指向摄像机位置的方向
  vec3 halfVector=normalize(surfaceToLightDirection+surfaceToViewDirection);//高光方向
  
  //聚光灯是一个倒立的环状锥形的灯
  //计算这个点指向光的方向与聚光灯最中间方向的夹角，或者说投影吧
  //cos($)=斜边/直角边
  float dotFromDirection=dot(surfaceToLightDirection,spotDirection);
  float limitRange=(u_spotOuterLimit-u_spotInnerLimit);
  
  //算出一个可变范围 越居中值越大
  float inLight=smoothstep(u_spotOuterLimit,u_spotInnerLimit,dotFromDirection);
  
  float light=inLight*max(dot(normal,surfaceToLightDirection),0.);//算出点光的入射强度
  float specular=0.;//高光强度
  if(light>0.){specular=inLight*pow(dot(normal,halfVector),u_specular_shininess);}
  vec4 diffuseColor=surfaceBaseColor*u_spot*light;//漫反射颜色
  vec4 specularColor=u_specular*specular;//高光颜色
  vec4 ambientColor=u_ambient*surfaceBaseColor;//环境光
  gl_FragColor=diffuseColor+specularColor+ambientColor;
  
}