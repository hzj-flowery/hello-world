#version 300 es
precision mediump float;
in vec3 a_position;


uniform mat4 u_world;
uniform mat4 u_world_I_T;
uniform mat4 u_view;
uniform mat4 u_projection;

uniform float u_time;

#if defined(SY_USE_UV)
      in vec2 a_texcoord;
      out vec2 v_uv;
#endif

//使用凹凸贴图,法线贴图
#if defined(SY_USE_MAP_BUMP) || defined(SY_USE_TANGENTSPACE_NORMALMAP)
     out vec3 v_vmPosition;
#endif

//法线
#if defined(SY_USE_NORMAL)
    in vec3 a_normal;
    out vec3 v_normal;
#endif

//切线
#if defined(SY_USE_TANGENT)
      in vec3 a_tangent;
      out vec3 v_tangent;
#endif

//万能矩阵
#if defined(SY_USE_MAT)
    uniform mat4 u_mat;
#endif

//使用点光或者聚光会用到下面的数据
#if defined(SY_USE_LIGHT_SPOT_NUM)||defined(SY_USE_LIGHT_POINT_NUM)||defined(SY_USE_LIGHT_PARALLEL_NUM)
    //光的位置
    uniform vec3 u_lightWorldPosition;
    //相机的位置
    uniform vec3 u_cameraWorldPosition;
    //顶点到光的方向
    out vec3 v_surfaceToLight;
    //顶点到相机的方向
    out vec3 v_surfaceToView;
    //顶点世界位置
    out vec3 v_surfacePosition;
#endif

//使用阴影会用到投影纹理的uv
#if defined(SY_USE_SHADOW_PARALLEL)
    out vec4 v_shadowProjectedTexcoord;
#endif

//使用雾
#if defined(SY_USE_FOG)
    out vec3 v_fog_view_world_position;
#endif

//使用变形目标(最多有8个)
#if defined(SY_USE_MORPHTARGETS)
    in vec3 a_morphTarget0;
    in vec3 a_morphTarget1;
    in vec3 a_morphTarget2;
    in vec3 a_morphTarget3;
    in vec3 a_morphTarget4;
    in vec3 a_morphTarget5;
    in vec3 a_morphTarget6;
    in vec3 a_morphTarget7;
    uniform float u_morphTargetInfluences[8];//最多只允许有八个影响
    //获取变形后顶点的位置
    vec3 getMorphPosition(vec3 transformed){
        vec3 ret = transformed;
        #if defined(SY_USE_MORPHTARGETS_RELATIVE)
        ret += (a_morphTarget0-transformed) * u_morphTargetInfluences[ 0 ];
		ret += (a_morphTarget1-transformed) * u_morphTargetInfluences[ 1 ];
		ret += (a_morphTarget2-transformed) * u_morphTargetInfluences[ 2 ];
		ret += (a_morphTarget3-transformed) * u_morphTargetInfluences[ 3 ];
        ret += (a_morphTarget4-transformed) * u_morphTargetInfluences[ 4 ];
        ret += (a_morphTarget5-transformed) * u_morphTargetInfluences[ 5 ];
        ret += (a_morphTarget6-transformed) * u_morphTargetInfluences[ 6 ];
        ret += (a_morphTarget7-transformed) * u_morphTargetInfluences[ 7 ];
        #else
        ret += a_morphTarget0 * u_morphTargetInfluences[ 0 ];
		ret += a_morphTarget1 * u_morphTargetInfluences[ 1 ];
		ret += a_morphTarget2 * u_morphTargetInfluences[ 2 ];
		ret += a_morphTarget3 * u_morphTargetInfluences[ 3 ];
        ret += a_morphTarget4 * u_morphTargetInfluences[ 4 ];
        ret += a_morphTarget5 * u_morphTargetInfluences[ 5 ];
        ret += a_morphTarget6 * u_morphTargetInfluences[ 6 ];
        ret += a_morphTarget7 * u_morphTargetInfluences[ 7 ];
        #endif
        return ret;
    }
#endif






void main(){
    
    vec3 position = a_position;

    

    #if defined(SY_USE_MORPHTARGETS)
        position = getMorphPosition(position);
    #endif

    #if defined(SY_USE_FUNC_RIVER_FLOW)
        float time=mod(u_time/1000.,90.)*5.0;
        position = getRiverFlowPosition(position,time);
    #endif


    //强行塞入一个位置空间
    #if defined(SY_USE_ADD_POSITION_SPACE) && defined(SY_USE_MAT)
        vec4 worldPosition=u_world*u_mat*vec4(position,1.0);
    #else
        vec4 worldPosition=u_world*vec4(position,1.0);
    #endif
    
    //凹凸贴图
    #if defined(SY_USE_MAP_BUMP) || defined(SY_USE_TANGENTSPACE_NORMALMAP)
           v_vmPosition=(u_view*worldPosition).xyz;
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
    #if defined(SY_USE_UV)
        v_uv=a_texcoord;
    #endif
    
    
    //法线
    #if defined(SY_USE_NORMAL)
        //将法线转换到世界空间坐标系下
        //乘以世界矩阵的逆矩阵的转置矩阵 可以防止物体被放大而带来的法线变形
        v_normal=mat3(u_world_I_T)*a_normal;
    #endif
    
    //切线
    #if defined(SY_USE_TANGENT)
        v_tangent = mat3(u_world)*a_tangent.xyz;
    #endif

    //三种光
    //聚光 点光 平行光
    #if defined(SY_USE_LIGHT_SPOT_NUM)||defined(SY_USE_LIGHT_POINT_NUM)||defined(SY_USE_LIGHT_PARALLEL_NUM)
        //将当前顶点的坐标转换到世界空间坐标系中
        v_surfaceToLight=u_lightWorldPosition-worldPosition.rgb;
        v_surfaceToView=u_cameraWorldPosition-worldPosition.rgb;
        v_surfacePosition = worldPosition.rgb;
    #endif

    //阴影
    #if defined(SY_USE_SHADOW_PARALLEL)
        //算出投影纹理的uv
        v_shadowProjectedTexcoord = u_mat * worldPosition; 
    #endif
    
    #if defined(SY_USE_FOG)
        //算出雾的在视口坐标系下的位置
        v_fog_view_world_position=(u_view*u_world*vec4(position,1.0)).xyz;
    #endif
}