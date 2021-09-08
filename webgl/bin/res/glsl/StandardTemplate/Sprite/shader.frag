// #extension GL_EXT_draw_buffers : require

precision mediump float;

varying vec2 v_uv;
uniform sampler2D u_texture;
uniform float u_use_apha_test;
uniform float u_alpha;
void main(){
    vec4 texcolor = texture2D(u_texture, v_uv);
    texcolor = vec4(texcolor.rgb,u_alpha*texcolor.a);
    if(u_use_apha_test>0.0)
    // if((texcolor.r+texcolor.g+texcolor.b)<u_use_apha_test) discard;
    if(texcolor.a<u_use_apha_test) discard;
    
    gl_FragColor = texcolor;
}