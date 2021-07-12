
precision highp float;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gColor;
varying vec2 v_uv;

void main() {
 gl_FragColor=texture2D(gColor,vec2(v_uv.x,v_uv.y));
}