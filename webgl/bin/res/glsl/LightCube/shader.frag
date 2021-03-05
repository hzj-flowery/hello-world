precision mediump float;
// Passed in from the vertex shader.
varying vec3 v_normal;                //法线
uniform vec3 u_lightColorDir; //光的方向
uniform vec4 u_lightColor;               //光照
uniform sampler2D u_texture;     //纹理
varying vec2 v_uv;

void main() {

   vec4 texColor = texture2D(u_texture, v_uv);
  // because v_normal is a varying its interpolated
  // so it will not be a unit vector. Normalizing it
  // will make it a unit vector again
  vec3 normal = normalize(v_normal);

  float light = dot(normal, -u_lightColorDir); //算出光照强度

  gl_FragColor = u_lightColor*texColor; //将光的颜色和纹理的颜色相乘 

  // Lets multiply just the color portion (not the alpha)
  // by the light
  gl_FragColor.rgb *= light; 
}