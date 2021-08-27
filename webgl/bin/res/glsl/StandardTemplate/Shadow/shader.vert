attribute vec4 a_position;
    attribute vec2 a_texcoord;
    attribute vec3 a_normal;

    uniform vec3 u_lightWorldPosition; //光的位置
    uniform vec3 u_cameraWorldPosition;  //相机的位置
    varying vec3 v_surfaceToLight;     //表面到光的方向 
    varying vec3 v_surfaceToView;      //表面到相机的方向

    uniform mat4 u_projection;           
    uniform mat4 u_view;
    uniform mat4 u_world;
    uniform mat4 u_mat;                         //纹理矩阵 主要作用就是去算出投影的uv坐标 上一次光照的投影矩阵*视口矩阵
    varying vec2 v_uv;                              //当前顶点的uv坐标
    varying vec4 v_projectedTexcoord;
    varying vec3 v_normal;
    void main() {
    vec4 worldPosition = u_world * a_position;            //将当前顶点的坐标转换到世界空间坐标系中
    gl_Position = u_projection * u_view * worldPosition;  //将顶点转换到其次裁切空间下
    v_uv = a_texcoord;
    v_projectedTexcoord = u_mat * worldPosition; //算出投影纹理的uv
    v_normal = mat3(u_world) * a_normal;
    v_surfaceToLight = u_lightWorldPosition - worldPosition.rgb;  
    v_surfaceToView = u_cameraWorldPosition - worldPosition.rgb;
    }