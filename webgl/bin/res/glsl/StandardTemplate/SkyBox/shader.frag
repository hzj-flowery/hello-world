precision mediump float;

uniform samplerCube u_skybox;
uniform mat4 u_projection_view_I;

varying vec4 v_position;
void main(){
   vec4 t=u_projection_view_I*v_position;
   vec3 pos=normalize(t.xyz/t.w);
   vec4 color=textureCube(u_skybox,pos);
   gl_FragColor=color;
}