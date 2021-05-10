precision highp float;
 attribute vec3 a_position;
 uniform mat4 u_Mmat;
 uniform mat4 u_Vmat;
 uniform mat4 u_Pmat;
 varying vec4 color;

 void main() {
 gl_Position = u_Pmat * u_Vmat *u_Mmat* vec4(a_position, 1.0);
 color=vec4(gl_Position.x,gl_Position.y,gl_Position.z,0.8);
 }