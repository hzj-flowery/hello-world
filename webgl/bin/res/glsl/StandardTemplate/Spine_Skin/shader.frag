precision mediump float;
varying vec3 v_normal;//法线
uniform vec4 u_color;//漫反射
uniform sampler2D u_texture;//纹理
uniform sampler2D u_texture1;//水波纹纹理
uniform vec3 u_spotDirection;//光的方向
uniform float u_time;
varying vec2 v_uv;
void main(){
    vec3 normal=normalize(v_normal);
    float light=dot(u_spotDirection,normal)*.5+.5;
    float time=mod(u_time/1000.,90.);
    vec4 river=texture2D(u_texture1,normalize(v_uv)+sin(time));
    vec4 color=texture2D(u_texture,normalize(v_uv));
    gl_FragColor=color+vec4(u_color.rgb*light,u_color.a)+river;
}