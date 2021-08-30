#version 300 es
in vec4 a_position;
in vec3 a_normal;
uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_view_world_I_T;
uniform vec3 u_cameraWorldPosition;  //相机的位置
out vec3 v_surfaceToView;
out vec3 v_normal;
vec4 TransformViewToProjection(vec4 v){
    return u_projection*v;
}

void main(){
    vec4 o=u_projection*u_view*u_world*a_position;
    float _Outline=.01;
    v_normal = mat3(u_world) * a_normal;
    // v_normal = vec3(transpose(inverse(u_world)) * vec4(a_normal,1.0));

    vec4 worldPosition = u_world * a_position;            //将当前顶点的坐标转换到世界空间坐标系中
    v_surfaceToView = u_cameraWorldPosition - worldPosition.rgb;
    float ddot = dot(v_surfaceToView,v_normal);
    if(ddot<=0.0)
    {
        vec3 norm=normalize(mat3(u_view_world_I_T)*normalize(v_normal));
        vec4 offset=TransformViewToProjection(vec4(norm.xyz,1.));
        o.xy+=offset.xy*o.z*_Outline;
    }
    gl_Position=o;
}