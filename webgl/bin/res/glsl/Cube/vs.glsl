attribute vec3 a_position;
attribute vec2 a_uv;

uniform mat4 u_MMatrix;
uniform mat4 u_VMatrix;
uniform mat4 u_PMatrix;
varying vec2 vTextureCoordinates;

void main() {
gl_Position = u_PMatrix * u_VMatrix *u_MMatrix* vec4(a_position, 1.0);
vTextureCoordinates = a_uv;
}