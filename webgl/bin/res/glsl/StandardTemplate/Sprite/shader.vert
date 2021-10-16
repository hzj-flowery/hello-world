
attribute vec3 a_position;


uniform mat4 u_world;
uniform mat4 u_world_I_T;
uniform mat4 u_view;
uniform mat4 u_projection;


//使用纹理
#if defined(SY_USE_TEXTURE)
      attribute vec2 a_texcoord;
      varying vec2 v_uv;
#endif

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
#if defined(SY_USE_SHADOW_PARALLEL)
    varying vec4 v_shadowProjectedTexcoord;
#endif

//使用雾
#if defined(SY_USE_FOG)
    varying vec3 v_fog_position;
#endif

void main(){
    
    //强行塞入一个位置空间
    #if defined(SY_USE_ADD_POSITION_SPACE) && defined(SY_USE_MAT)
        vec4 worldPosition=u_world*u_mat*vec4(a_position,1.0);
    #else
         vec4 worldPosition=u_world*vec4(a_position,1.0);
    #endif
    gl_Position=u_projection*u_view*worldPosition;
    
    //设置点的大小
    #ifdef SY_USE_POINT_SIZE
         //glsl es 是一个强类型的语言 int() bool() float()
         //必须要求等式两边类型一样才可以赋值
         //此处外界传来的宏 是不确定的 整数就是 const int ,const float等 
         gl_PointSize = float(SY_USE_POINT_SIZE); 
    #endif
    
    //传递-----值到片元着色器
    
    //传递纹理坐标
    #if defined(SY_USE_TEXTURE)
        v_uv=a_texcoord;
    #endif
    
    
    //法线
    #if defined(SY_USE_NORMAL)
        //将法线转换到世界空间坐标系下
        //乘以世界矩阵的逆矩阵的转置矩阵 可以防止物体被放大而带来的法线变形
        v_normal=mat3(u_world_I_T)*a_normal;
    #endif

    //三种光
    //聚光 点光 高光
    #if defined(SY_USE_LIGHT_SPOT)||defined(SY_USE_LIGHT_POINT)||defined(SY_USE_LIGHT_SPECULAR)
        //将当前顶点的坐标转换到世界空间坐标系中
        v_surfaceToLight=u_lightWorldPosition-worldPosition.rgb;
        v_surfaceToView=u_cameraWorldPosition-worldPosition.rgb;
    #endif

    //阴影
    #if defined(SY_USE_SHADOW_PARALLEL)
        //算出投影纹理的uv
        v_shadowProjectedTexcoord = u_mat * worldPosition; 
    #endif
    
    #if defined(SY_USE_FOG)
        //算出雾的在视口坐标系下的位置
        v_fog_position=(u_view*u_world*vec4(a_position,1.0)).xyz;
    #endif
}