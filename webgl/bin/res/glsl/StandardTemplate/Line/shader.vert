attribute vec4 a_position;
uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_mat;
uniform float SY_USE_MAT;
void main(){
        if(SY_USE_MAT>0.)
        gl_Position=u_projection*u_view*u_world*u_mat*a_position;
        else
        gl_Position=u_projection*u_view*u_world*a_position;
}