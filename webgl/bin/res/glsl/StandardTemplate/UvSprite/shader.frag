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
uniform float u_time;
uniform sampler2D u_texture;

void main() {
    vec2 uv = v_uv;
    float time = mod(u_time/100.0,90.0);
    float sinX = sin(time); //0-1
    if(uv.x>sinX)discard;
    vec4 normal  = texture2D(u_texture, uv);
    if(normal.a>0.1)
    gl_FragColor = normal*normal.a;
    else
    discard;
}