attribute vec4 a_position;
attribute vec4 a_normal;
uniform mat4 u_projection_view;
uniform mat4 u_world;
varying vec3 v_position;
varying vec3 v_normal;

void main() {
    v_position = (u_world * a_position).xyz;
    v_normal = vec3(u_world * a_normal);
    gl_Position = u_projection_view * u_world * a_position;
}