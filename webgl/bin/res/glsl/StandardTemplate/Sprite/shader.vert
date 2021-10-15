
attribute vec3 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;
varying vec2 v_uv;

//法线
#if defined(SY_USE_NORMAL)
    attribute vec3 a_normal;
    varying vec3 v_normal;
#endif

//万能矩阵
#if defined(SY_USE_MAT)
    uniform mat4 u_mat;
#endif

//使用点光或者聚光会用到下面的数据
#if defined(SY_USE_LIGHT_SPOT)||defined(SY_USE_LIGHT_POINT)||defined(SY_USE_LIGHT_SPECULAR)
    //光的位置
    uniform vec3 u_lightWorldPosition;
    //相机的位置
    uniform vec3 u_cameraWorldPosition;
    //顶点到光的方向
    varying vec3 v_surfaceToLight;
    //顶点到相机的方向
    varying vec3 v_surfaceToView;
#endif

//使用阴影会用到投影纹理的uv
#if defined(SY_USE_SHADOW)
    varying vec4 v_projectedTexcoord;
#endif

void main(){

    vec4 worldPosition=u_world*vec4(a_position,1.0);
    gl_Position=u_projection*u_view*worldPosition;
    
    //传递-----值到片元着色器
    v_uv=a_texcoord;
    
    //法线
    #if defined(SY_USE_NORMAL)
        v_normal=mat3(u_world)*a_normal;
    #endif

    //三种光
    //聚光 点光 高光
    #if defined(SY_USE_LIGHT_SPOT)||defined(SY_USE_LIGHT_POINT)||defined(SY_USE_LIGHT_SPECULAR)
        //将当前顶点的坐标转换到世界空间坐标系中
        v_surfaceToLight=u_lightWorldPosition-worldPosition.rgb;
        v_surfaceToView=u_cameraWorldPosition-worldPosition.rgb;
    #endif

    //阴影
    #if defined(SY_USE_SHADOW)
        //算出投影纹理的uv
        v_projectedTexcoord = u_mat * worldPosition; 
    #endif
}