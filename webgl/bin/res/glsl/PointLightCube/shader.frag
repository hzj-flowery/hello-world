precision mediump float;
    varying vec2 v_uv;
  varying vec3 v_normal;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;
  uniform sampler2D u_texture;
  uniform vec4 u_color;     //节点的颜色
  uniform float u_shininess;
  uniform vec4 u_point;//点光入射光的颜色
  uniform vec4 u_ambient;//环境光入射光的颜色
  uniform vec4 u_specular;//高光入射光颜色

  void main() {
  vec4 materialColor = texture2D(u_texture, v_uv);//材质颜色
  vec4 surfaceBaseColor = u_color*materialColor;//表面基底颜色
  vec3 normal = normalize(v_normal);
  vec3 surfaceToLightDirection = normalize(v_surfaceToLight); //表面指向光位置的方向
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);   //表面指向摄像机位置的方向
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);//高光方向
  float light = max(dot(normal, surfaceToLightDirection),0.0); //算出点光的入射强度
  float specular = 0.0;                                                  //高光强度
  if (light > 0.0) {specular = pow(dot(normal, halfVector), u_shininess);}
  vec4 diffuseColor = surfaceBaseColor*u_point*light;//漫反射颜色
  vec4 specularColor = u_specular*specular;//高光颜色
  vec4 ambientColor = u_ambient*surfaceBaseColor;//环境光
  gl_FragColor = diffuseColor + specularColor+ambientColor;

  }