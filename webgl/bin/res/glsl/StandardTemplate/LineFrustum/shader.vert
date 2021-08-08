attribute vec4 a_position;
    uniform mat4 u_Pmat;
    uniform mat4 u_Vmat;
    uniform mat4 u_Mmat;
    uniform mat4 u_mat;
void main() {
gl_Position = u_Pmat * u_Vmat * u_Mmat*u_mat * a_position;
}