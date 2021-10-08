#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 FragColor;
in vec3 v_surfaceToView;
in vec3 v_normal;
void main(){
    float ddot = dot(v_surfaceToView,v_normal);
    if(ddot>=0.0)
    {
       discard;
    }
    FragColor=vec4(0.0,0.5,0.0,1.0);
}