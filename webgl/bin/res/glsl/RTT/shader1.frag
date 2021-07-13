
precision highp float;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gColor;
varying vec2 v_uv;

void main() {
 vec4 nor = texture2D(gNormal,vec2(v_uv.x,v_uv.y));
 vec4 cor = texture2D(gColor,vec2(v_uv.x,v_uv.y));
 vec4 pos = texture2D(gPosition,vec2(v_uv.x,v_uv.y));
 gl_FragColor = pos;
}