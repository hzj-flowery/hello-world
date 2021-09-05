precision mediump float;
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