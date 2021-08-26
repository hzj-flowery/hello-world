attribute vec4 a_position;
attribute mat4 a_matrix;

uniform mat4 u_Mmat;
uniform mat4 u_Vmat;
uniform mat4 u_Pmat;

varying vec4 v_color;
void main(){
    gl_Position=u_Pmat*u_Vmat*u_Mmat*a_matrix*a_position;
    v_color=vec4(.9,.0,.9,1.);
}