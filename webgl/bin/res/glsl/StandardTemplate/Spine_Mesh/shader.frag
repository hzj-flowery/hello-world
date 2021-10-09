precision mediump float;
varying vec3 v_normal;//法线
uniform vec4 u_diffuse;//漫反射
uniform sampler2D u_texture;//骨骼矩阵纹理
uniform vec3 u_spotDirection;//光的方向
varying vec2 v_texcoord;
void main(){
   vec3 normal=normalize(v_normal);
   float light=dot(u_spotDirection,normal)*.5+.5;
   vec4 color=texture2D(u_texture,normalize(v_texcoord));
   gl_FragColor=color+vec4(u_diffuse.rgb*light,u_diffuse.a);
}