#extension GL_EXT_draw_buffers : require

precision mediump float;

 varying vec2 v_uv;
 uniform sampler2D u_texture;

 void main() {
//  gl_FragColor = texture2D(u_texture, v_uv);
 gl_FragData[1] = texture2D(u_texture, v_uv);
 }