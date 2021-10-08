precision mediump float;

varying vec2 v_uv;
uniform sampler2D u_texture;
uniform float u_alpha;
void main(){
    vec4 texcolor=texture2D(u_texture,v_uv);
    texcolor=vec4(texcolor.rgb,u_alpha*texcolor.a);
    #ifdef SY_USE_ALPHA_TEST
          if(texcolor.a<SY_USE_ALPHA_TEST)discard;
    #elif defined(SY_USE_RGB_TEST)
          if(texcolor.r+texcolor.g+texcolor.b<SY_USE_RGB_TEST)discard;
    #endif
    gl_FragColor=texcolor;
}