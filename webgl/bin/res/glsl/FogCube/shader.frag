precision mediump float;
varying vec2 v_texcoord;
varying vec3 v_position;
uniform sampler2D u_texture;
uniform vec4 u_fogColor;
uniform float u_fogDensity;
void main(){
  vec4 color=texture2D(u_texture,v_texcoord);
  float fogDistance=length(v_position);
  float fogAmount=1.-exp2(-u_fogDensity*u_fogDensity*fogDistance*fogDistance*1.442695);
  fogAmount=clamp(fogAmount,0.,1.);
  gl_FragColor=mix(color,u_fogColor,fogAmount);
}