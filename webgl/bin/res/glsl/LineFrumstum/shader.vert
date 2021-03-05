attribute vec4 a_position;
    uniform mat4 u_PMatrix;
    uniform mat4 u_VMatrix;
    uniform mat4 u_MMatrix;
    uniform mat4 u_Matrix;
void main() {
// gl_Position = u_PMatrix * u_VMatrix * u_MMatrix*u_Matrix * a_position;
gl_Position = u_PMatrix * u_VMatrix *u_Matrix * a_position;
}