attribute vec4 a_position;
 attribute vec4 a_color;
 attribute mat4 a_matrix;

 uniform mat4 u_MMatrix;
 uniform mat4 u_VMatrix;
 uniform mat4 u_PMatrix;

 varying vec4 v_color;
 void main() {
 gl_Position =u_PMatrix*u_VMatrix*u_MMatrix* a_matrix * a_position;
 v_color = a_color;
 }