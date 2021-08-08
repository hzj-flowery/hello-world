attribute vec4 a_position;
        uniform mat4 u_Mmat;
        uniform mat4 u_Vmat;
        uniform mat4 u_Pmat;
        void main() {
        gl_Position = u_Pmat * u_Vmat * u_Mmat * a_position;
        }