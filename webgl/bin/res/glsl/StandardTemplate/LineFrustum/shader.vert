attribute vec4 a_position;
    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform mat4 u_world;
    uniform mat4 u_mat;
void main() {
gl_Position = u_projection * u_view * u_world*u_mat * a_position;
}