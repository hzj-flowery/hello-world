
#ifdef SY_HIGH_PRECISION
precision highp float;
#elif defined(SY_MEDIUM_PRECISION)
precision mediump float;
#elif defined(SY_LOW_PRECISION)
precision lowp float;
#else
precision mediump float;
#endif


varying vec2 v_uv;
varying vec3 v_position;
uniform sampler2D u_texture;
uniform vec4 u_fog;
uniform float u_fogDensity;
void main(){
  vec4 color=texture2D(u_texture,v_uv);
  float fogDistance=length(v_position);
  float fogAmount=1.-exp2(-u_fogDensity*u_fogDensity*fogDistance*fogDistance*1.442695);
  fogAmount=clamp(fogAmount,0.,1.);
  gl_FragColor=mix(color,u_fog,fogAmount);
}