precision mediump float;

varying vec2 v_uv;
uniform float u_time;
uniform sampler2D u_texture;

void main(){
    vec2 uv=v_uv; 
    float time=mod(u_time/100.,90.);
    float sinX=sin(time);//0-1
    if(uv.x>sinX)discard;
    vec4 normal=texture2D(u_texture,uv);
    #ifdef SY_USE_ALPHA_TEST
    if(normal.a>SY_USE_ALPHA_TEST)
    gl_FragColor=normal*normal.a;
    else discard;
    #else
    gl_FragColor=normal;
    #endif
}