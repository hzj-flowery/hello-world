precision mediump float;

varying vec2 v_uv;
uniform sampler2D u_texture;
uniform float u_alpha;
uniform float u_use_png;
void main(){
    vec4 tex=texture2D(u_texture,v_uv);
    if(u_use_png>0.0)
    gl_FragColor=vec4(tex.rgb*u_use_png,1.0);
    else
    gl_FragColor=vec4(tex.rgb*0.0,u_alpha);
}