attribute vec4 a_position;
    attribute vec4 a_color;
    attribute mat4 a_matrix;

    uniform mat4 u_world;
    uniform mat4 u_view;
    uniform mat4 u_projection;

    varying vec4 v_color;
    void main() {
    gl_Position =u_projection*u_view*u_world* a_matrix * a_position;
    v_color = a_color;
    }