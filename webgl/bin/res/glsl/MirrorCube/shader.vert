attribute vec4 a_position;
attribute vec4 a_normal;
uniform mat4 u_PVmat;
uniform mat4 u_Mmat;
varying vec3 v_position;
varying vec3 v_normal;

void main() {
    v_position = (u_Mmat * a_position).xyz;
    v_normal = vec3(u_Mmat * a_normal);
    gl_Position = u_PVmat * u_Mmat * a_position;
}