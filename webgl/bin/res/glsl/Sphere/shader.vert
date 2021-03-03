precision highp float;
 attribute vec3 a_position;
 uniform mat4 u_MMatrix;
 uniform mat4 u_VMatrix;
 uniform mat4 u_PMatrix;
 varying vec4 color;

 void main() {
 gl_Position = u_PMatrix * u_VMatrix *u_MMatrix* vec4(a_position, 1.0);
 color=vec4(gl_Position.x,gl_Position.y,gl_Position.z,0.8);
 }