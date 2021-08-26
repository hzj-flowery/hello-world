attribute vec4 a_position;
attribute vec2 a_uv;
uniform mat4 u_Pmat;
uniform mat4 u_Vmat;
uniform mat4 u_Mmat;
void main(){
    gl_Position=u_Pmat*u_Vmat*u_Mmat*a_position;
}