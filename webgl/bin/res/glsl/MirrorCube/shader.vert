attribute vec4 a_position;
attribute vec4 a_normal;
uniform mat4 u_PVMatrix;
uniform mat4 u_MMatrix;
varying vec3 v_position;
varying vec3 v_normal;

void main() {
    v_position = (u_MMatrix * a_position).xyz;
    v_normal = vec3(u_MMatrix * a_normal);
    gl_Position = u_PVMatrix * u_MMatrix * a_position;
}