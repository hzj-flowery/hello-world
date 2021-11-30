#version 300 es
precision mediump float;

uniform vec4 u_color;//节点的颜色

uniform float u_alpha;

uniform float u_time;

uniform vec4 u_resolution;

uniform vec4 u_mouse;

layout (location = 0) out vec4 FragColor;   // 颜色


#ifndef saturate
// <tonemapping_pars_fragment> may have defined saturate() already
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif

//传递数组        
#ifdef SY_USE_FLOAT_ARRAY_LENGTH
       if(SY_USE_FLOAT_ARRAY_LENGTH>0)
       uniform float u_float_array[SY_USE_FLOAT_ARRAY_LENGTH];
#endif

//使用法线
#if defined(SY_USE_NORMAL)
      in vec3 v_normal;
#endif

#if defined(SY_USE_TANGENT)
      //世界空间下的切线
      in vec3 v_tangent;
#endif

//自发光
#if defined(SY_USE_EMISSIVE)
    uniform vec4 u_emissive;
#endif

//使用纹理0号单元
#if defined(SY_USE_TEXTURE)
      uniform sampler2D u_texture;
#endif
//使用纹理坐标
#if defined(SY_USE_UV)
      in vec2 v_uv;
#endif

//使用纹理1号单元
#if defined(SY_USE_TEXTURE_ONE)
      uniform sampler2D u_texture1;
#endif


//环境光
#if defined(SY_USE_LIGHT_AMBIENT)
      uniform vec4 u_ambient;
#endif

//平行光
#ifdef SY_USE_LIGHT_PARALLEL_NUM
      struct DirLight {
            vec3 direction;
            vec3 ambient;
            vec3 diffuse;
            vec3 specular;
      };  
      uniform DirLight u_dirLights[SY_USE_LIGHT_PARALLEL_NUM];
      /*
      计算平行光
      */
      vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir,float mShininess,vec2 TexCoords,sampler2D mapDiffuse,sampler2D mapSpecular)
      {
            vec3 lightDir = normalize(-light.direction);
            // 计算漫反射强度
            float diff = max(dot(normal, lightDir), 0.0);
            // 计算镜面反射强度
            vec3 reflectDir = reflect(-lightDir, normal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), mShininess);
            // 合并各个光照分量
            vec3 ambient  = light.ambient  * vec3(texture(mapDiffuse, TexCoords));
            vec3 diffuse  = light.diffuse  * diff * vec3(texture(mapDiffuse, TexCoords));
            vec3 specular = light.specular * spec * vec3(texture(mapSpecular, TexCoords));
            return (ambient + diffuse + specular);
      }
      /*
      计算平行光
      */
      vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir,float mShininess,vec3 cDiffuse,vec3 cSpecular)
      {
            //确定此值是否取反
            vec3 lightDir = normalize(light.direction);
            // 计算漫反射强度
            float diff = max(dot(normal, lightDir), 0.0);
            // 计算镜面反射强度
            vec3 reflectDir = reflect(-lightDir, normal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), mShininess);
            // 合并各个光照分量
            vec3 ambient  = light.ambient  * cDiffuse;
            vec3 diffuse  = light.diffuse  * diff * cDiffuse;
            vec3 specular = light.specular * spec * cSpecular;
            return (ambient + diffuse + specular);
      } 

#endif

//聚光
#ifdef SY_USE_LIGHT_SPOT_NUM
      /*
      获取聚光灯的光照强度
      @param normal 法线
      @param spotDirection 聚光灯的方向
      @param surfaceToLightDirection 表面指向聚光灯位置的方向
      @param spotInnerLimit  聚光灯的最小范围
      @param spotOuterLimit  聚光灯的最大范围
      */
      float getSpotLightDot(vec3 normal,vec3 spotDirection,vec3 surfaceToLightDirection,float spotInnerLimit,float spotOuterLimit){
            float dotFromDirection=dot(surfaceToLightDirection,spotDirection);
            float inLight=smoothstep(spotOuterLimit,spotInnerLimit,dotFromDirection);
            //算出点光的入射强度
            float light=inLight*max(dot(normal,surfaceToLightDirection),0.);
            return light;
      }
      struct SpotLight {
             //聚光的内部限制
            float innerLimit;
            //聚光的外部限制
            float outerLimit;
            //聚光灯的中间方向
            vec3 direction;
            //光的位置
            vec3 position;
            //0.5 此值越小 越亮
            float constant;
            //0.09
            float linear;
            //0.032
            float quadratic;
              
            vec3 ambient;
            vec3 diffuse;
            vec3 specular;
      };  
      uniform SpotLight u_spotLights[SY_USE_LIGHT_SPOT_NUM];
      /*
        PointLight light:光的信息
        vec3 normal:世界法线
        vec3 fragPos:片元在世界空间下的位置
        vec3 surfaceToView: 片元位置指向相机位置
        float mShininess：高光强度
        vec3 cDiffuse:漫反射颜色
        vec3 cSpecular：高光颜色
      */
      vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 surfaceToView,float mShininess,vec3 cDiffuse,vec3 cSpecular)
      {
            vec3 lightDir = normalize(light.position - fragPos);

            float dotFromDirection=dot(lightDir,normalize(light.direction));
            float inLight=smoothstep(light.outerLimit,light.innerLimit,dotFromDirection);
            //算出点光的入射强度
            float dotLight=inLight*max(dot(normal,lightDir),0.);

            vec3 viewDir = normalize(surfaceToView);
            // 计算漫反射强度
            float diff = max(dot(normal, lightDir), 0.0);
            // 计算镜面反射
            vec3 reflectDir = reflect(-lightDir, normal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), mShininess);
            // 计算衰减
            float dis    = length(light.position - fragPos);
            float attenuation = 1.0f / (light.constant + light.linear * dis + light.quadratic * (dis * dis));
            // 将各个分量合并
            vec3 ambient  = light.ambient  * cDiffuse;
            vec3 diffuse  = light.diffuse  * diff * cDiffuse;
            vec3 specular = light.specular * spec * cSpecular;
            ambient  *= attenuation;
            diffuse  *= attenuation;
            specular *= attenuation;
            return (ambient + diffuse + specular)*dotLight;
      }
#endif

#ifdef SY_USE_LIGHT_POINT_NUM
      struct PointLight {
            //光的位置
            vec3 position;
            //0.5 此值越小 越亮
            float constant;
            //0.09
            float linear;
            //0.032
            float quadratic;

            vec3 ambient;
            vec3 diffuse;
            vec3 specular;
      };  
      uniform PointLight u_pointLights[SY_USE_LIGHT_POINT_NUM];
      // 计算定点光在确定位置的光照颜色
      /*
        PointLight light:光的信息
        vec3 normal:世界法线
        vec3 fragPos：片元位置
        vec3 viewDir:视线方向
        vec2 TexCoords：uv坐标
        float mShininess：高光强度
        sampler2D mapDiffuse：漫反射贴图
        sampler2D mapSpecular：高光贴图
      */
      vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir,vec2 TexCoords,float mShininess,sampler2D mapDiffuse,sampler2D mapSpecular)
      {
            vec3 lightDir = normalize(light.position - fragPos);
            // 计算漫反射强度
            float diff = max(dot(normal, lightDir), 0.0);
            // 计算镜面反射
            vec3 reflectDir = reflect(-lightDir, normal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), mShininess);
            // 计算衰减
            float dis    = length(light.position - fragPos);
            float attenuation = 1.0f / (light.constant + light.linear * dis + light.quadratic * (dis * dis));
            // 将各个分量合并
            vec3 ambient  = light.ambient  * vec3(texture(mapDiffuse, TexCoords));
            vec3 diffuse  = light.diffuse  * diff * vec3(texture(mapDiffuse, TexCoords));
            vec3 specular = light.specular * spec * vec3(texture(mapSpecular, TexCoords));
            ambient  *= attenuation;
            diffuse  *= attenuation;
            specular *= attenuation;
            return (ambient + diffuse + specular);
      }
      /*
        PointLight light:光的信息
        vec3 normal:世界法线
        vec3 fragPos:片元在世界空间下的位置
        vec3 surfaceToView: 片元位置指向相机位置
        float mShininess：高光强度
        vec3 cDiffuse:漫反射颜色
        vec3 cSpecular：高光颜色
      */
      vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 surfaceToView,float mShininess,vec3 cDiffuse,vec3 cSpecular)
      {
            vec3 lightDir = normalize(light.position - fragPos);
            vec3 viewDir = normalize(surfaceToView);
            // 计算漫反射强度
            float diff = max(dot(normal, lightDir), 0.0);
            // 计算镜面反射
            vec3 reflectDir = reflect(-lightDir, normal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), mShininess);
            // 计算衰减
            float dis    = length(light.position - fragPos);
            float attenuation = 1.0f / (light.constant + light.linear * dis + light.quadratic * (dis * dis));
            // 将各个分量合并
            vec3 ambient  = light.ambient  * cDiffuse;
            vec3 diffuse  = light.diffuse  * diff * cDiffuse;
            vec3 specular = light.specular * spec * cSpecular;
            ambient  *= attenuation;
            diffuse  *= attenuation;
            specular *= attenuation;
            return (ambient + diffuse + specular);
      }
#endif

//高光
#ifdef SY_USE_LIGHT_SPECULAR
    //普通高光
    /*
    @param normal 法线
    @param specularColor 高光的颜色
    @param specular_shininess 高光的因子
    @param surfaceToLight 表面点指向光位置的方向
    @param surfaceToView  表面点指向摄像机位置的方向
    */
    vec3 getSpecular(vec3 normal,vec4 specularColor,float specular_shininess,vec3 surfaceToLight,vec3 surfaceToView){
      vec3 surfaceToLightDirection = normalize(surfaceToLight);
      vec3 surfaceToViewDirection = normalize(surfaceToView);
      vec3 halfVector = normalize((surfaceToLightDirection + surfaceToViewDirection)); //算出高光的方向
      float specularWeighting = pow(dot(normal, halfVector), specular_shininess);
      vec3 specular = specularColor.rgb * specularWeighting;
      return specular;
    }
    //宾式模型高光
    /*
    @param normal 法线
    @param specularColor 高光的颜色
    @param specular_shininess 高光的因子
    @param surfaceToLight 表面点指向光位置的方向
    @param surfaceToView  表面点指向摄像机位置的方向
    @param lightDir 光的方向
    */
    vec3 getSpecularBingShi(vec3 normal,vec4 specularColor,float specular_shininess,vec3 surfaceToLight,vec3 surfaceToView,vec3 lightDir){
      // 计算法向量和光线的点积
      float cosTheta = max(dot(normal,lightDir), 0.0);
      vec3 surfaceToLightDirection = normalize(surfaceToLight);
      vec3 surfaceToViewDirection = normalize(surfaceToView);
      vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection); //算出高光的方向
      float specularWeighting = pow(dot(normal, halfVector), specular_shininess);
      vec3 specular = specularColor.rgb * specularWeighting * step(cosTheta,0.0);
      return specular;
    }
    //冯氏模型高光
    /*
    @param normal 法线
    @param specularColor 高光的颜色
    @param specular_shininess 高光的因子
    @param surfaceToLight 表面点指向光位置的方向
    @param surfaceToView  表面点指向摄像机位置的方向
    @param lightDir 光的方向
    */
    vec3 getSpecularFengShi(vec3 normal,vec4 specularColor,float specular_shininess,vec3 surfaceToLight,vec3 surfaceToView,vec3 lightDir){
      vec3 surfaceToLightDirection = normalize(surfaceToLight);
      vec3 surfaceToViewDirection = normalize(surfaceToView);
      // 计算法向量和光线的点积
      float cosTheta = max(dot(normal,lightDir), 0.0);
      vec3 reflectionDirection = reflect(-surfaceToLightDirection, normal);
      float specularWeighting = pow(max(dot(reflectionDirection, surfaceToViewDirection), 0.0), specular_shininess);
      vec3 specular = specularColor.rgb * specularWeighting * step(cosTheta,0.0);
      return specular;
    }
#endif

//使用点光或者聚光会用到下面的数据
#if defined(SY_USE_LIGHT_SPOT_NUM)||defined(SY_USE_LIGHT_POINT_NUM)||defined(SY_USE_LIGHT_PARALLEL_NUM)
      //顶点到光的方向
      in vec3 v_surfaceToLight;
      //顶点到相机的方向
      in vec3 v_surfaceToView;
      //顶点在世界空间下的位置
      in vec3 v_surfacePosition;
#endif

//阴影
#if defined(SY_USE_SHADOW_PARALLEL)
      //阴影纹理
      uniform sampler2D u_shadowMap;
      //阴影信息
      uniform vec4 u_shadowInfo;
      //uv
      in vec4 v_shadowProjectedTexcoord;
      bool inRange(vec3 coordP){
            return coordP.x >= 0.0 && coordP.x <= 1.0 && coordP.y >= 0.0 && coordP.y <= 1.0; //uv纹理坐标必须处于【0，1】
      }
      //普通计算阴影
      float getShadowLight(vec4 coordP,sampler2D shadowMap,vec4 shadowInfo){
            vec3 projectedTexcoord = coordP.xyz / coordP.w;   //手动进行齐次除法
            projectedTexcoord = projectedTexcoord.xyz / 2.0 + 0.5;                     //转为屏幕坐标
            float currentDepth = projectedTexcoord.z + shadowInfo.x;                          //Z2  当前顶点的深度值
            float projectedDepth = texture(shadowMap, projectedTexcoord.xy).r; //取出深度z值 Z1
            float shadowLight = (inRange(projectedTexcoord) && projectedDepth <= currentDepth) ? 0.0 : 1.0;//小于说明光看不见，则处于阴影中，否则正常显示
            return shadowLight;
      }
      //软阴影
      //coordP在光照下的顶点坐标
      /*
      @param coordP:裁切坐标
      @param shadowMap:深度贴图
      @param shadowInfo:阴影信息
      */
      float getShadowLightRYY(vec4 coordP,sampler2D shadowMap,vec4 shadowInfo){
            vec3 projectedTexcoord=coordP.xyz/coordP.w;//手动进行齐次除法
            projectedTexcoord=projectedTexcoord.xyz/2.+.5;//转为屏幕坐标
            
            float shadows=shadowInfo.z;//0
            float opacity=shadowInfo.w;// 阴影alpha值, 值越小暗度越深
            float texelSize=shadowInfo.y;// 阴影像素尺寸,值越小阴影越逼真
            
            vec4 rgbaDepth;
            bool isInRange=inRange(projectedTexcoord);
            float curDepth=projectedTexcoord.z-shadowInfo.x;
            //消除阴影边缘的锯齿
            for(float y=-1.5;y<=1.5;y+=1.){
                  for(float x=-1.5;x<=1.5;x+=1.){
                        //找出光照条件下的当前位置的最大深度
                        rgbaDepth=texture(shadowMap,projectedTexcoord.xy+vec2(x,y)*texelSize);
                        //如果当前深度大于光照的最大深度 则表明处于阴影中
                        //否则可以看见
                        #ifdef SY_USE_FUNC_UNPACK
                        shadows+=(isInRange&&curDepth>unpack(rgbaDepth))?1.:0.;
                        #else
                        shadows+=(isInRange&&curDepth>rgbaDepth.r)?1.:0.;
                        #endif
                  }
            }
            
            shadows/=16.;// 4*4的样本
            float visibility=min(opacity+(1.-shadows),1.);
            return visibility;
            
      }
#endif


//使用雾
#if defined(SY_USE_FOG)
    //视口坐标系下的位置
    in vec3 v_fog_view_world_position;
    uniform vec4 u_fog;
    uniform float u_fogDensity;
    vec4 getFogMixColor(vec4 fragColor){
            #ifdef SY_USE_FOG_EXP
                  float fogDepth = -v_fog_view_world_position.z;
		      float fogFactor = 1.0 - exp( - u_fogDensity * u_fogDensity * fogDepth * fogDepth );
            #elif defined(SY_USE_FOG_EXP2)
                  //雾距离眼睛的位置
                  float fogDistance=length(v_fog_view_world_position);
                  float fogFactor=1.-exp2(-u_fogDensity*u_fogDensity*fogDistance*fogDistance*1.442695);
                  fogFactor=clamp(fogFactor,0.,1.);
            #else
                  //能看见的最近距离
                  float fogNear = 1.0;
                  //能看见的最远距离
                  float fogFar = 200.0;
                  float fogDepth = -v_fog_view_world_position.z;
                  float fogFactor = smoothstep( fogNear, fogFar, fogDepth);
            #endif
            return mix(fragColor,u_fog,fogFactor);
    }
#endif

//----------------------------------------------------法线贴图---------------------------------------------------------------------
//凹凸贴图
#ifdef SY_USE_MAP_BUMP
	uniform sampler2D u_bumpMap;
      //经测试 此值0.02最好
	uniform float u_bumpScale;
      in vec3 v_vmPosition;
      // Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
	// http://api.unrealengine.com/attachments/Engine/Rendering/LightingAndShadows/BumpMappingWithoutTangentSpace/mm_sfgrad_bump.pdf
	// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)
      /*
      vUv:uv坐标
      */
	vec2 dHdxy_fwd(vec2 vUv) {
	      vec2 dSTdx = dFdx( vUv );
		vec2 dSTdy = dFdy( vUv );
		float Hll = u_bumpScale * texture( u_bumpMap, vUv ).x;
		float dBx = u_bumpScale * texture( u_bumpMap, vUv + dSTdx ).x - Hll;
		float dBy = u_bumpScale * texture( u_bumpMap, vUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
      /*
      surf_V_M_pos:视口坐标系下的位置
      surf_norm:法线
      surf_uv:表面顶点对应的uv
      */
	vec3 perturbNormalArb( vec3 surf_V_M_pos, vec3 surf_norm, vec2 surf_uv) {
		// Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988
            float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
            vec2 dHdxy = dHdxy_fwd(surf_uv);
		vec3 vSigmaX = vec3( dFdx( surf_V_M_pos.x ), dFdx( surf_V_M_pos.y ), dFdx( surf_V_M_pos.z ) );
		vec3 vSigmaY = vec3( dFdy( surf_V_M_pos.x ), dFdy( surf_V_M_pos.y ), dFdy( surf_V_M_pos.z ) );
		vec3 vN = surf_norm;		// normalized
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
//切线空间下的法线贴图
#elif defined(SY_USE_TANGENTSPACE_NORMALMAP)
      //切线空间下的法线贴图  没有传入tbn矩阵 需要自己计算
      uniform sampler2D u_normalMap;
      #if defined(SY_USE_TANGENT)
            /*
            surf_norm:世界空间下的切线
            surf_norm:世界空间下的法线
            surf_uv:uv
            */
            vec3 perturbNormal3Arb(vec3 surf_tangent,vec3 surf_norm, vec2 surf_uv) {
                  float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
                  //世界空间下的法线
                  vec3 normal = normalize(surf_norm) * faceDirection;
                  //世界空间下的切线
                  vec3 tangent = normalize(surf_tangent) * faceDirection;
                  //副切线
                  vec3 bitangent = normalize(cross(normal, tangent));
                  //创建一个矩阵 切线 副切线 法线
                  mat3 tbn = mat3(tangent, bitangent, normal);
                  normal = texture(u_normalMap, surf_uv).rgb * 2. - 1.; 
                  normal = normalize(tbn * normal);
                  return normal;
            } 
      #else
            //使用内置的算法求切线
            //经测试 此值0.02最好
            uniform float u_normalMapScale;
            in vec3 v_vmPosition;
            /*
            surf_V_M_pos:视口坐标系下的位置
            surf_norm:法线
            surf_uv:表面顶点对应的uv
            */
            vec3 perturbNormal2Arb( vec3 surf_V_M_pos, vec3 surf_norm, vec2 surf_uv) {
                  vec3 mapN = texture( u_normalMap, surf_uv ).xyz * 2.0 - 1.0;
                  mapN.xy *= u_normalMapScale;
                  // Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988
                  float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
                  vec3 q0 = vec3( dFdx( surf_V_M_pos.x ), dFdx( surf_V_M_pos.y ), dFdx( surf_V_M_pos.z ) );
                  vec3 q1 = vec3( dFdy( surf_V_M_pos.x ), dFdy( surf_V_M_pos.y ), dFdy( surf_V_M_pos.z ) );
                  vec2 st0 = dFdx( surf_uv.st );
                  vec2 st1 = dFdy( surf_uv.st );
                  // normalized
                  vec3 N = surf_norm; 
                  vec3 q1perp = cross( q1, N );
                  vec3 q0perp = cross( N, q0 );
                  vec3 T = q1perp * st0.x + q0perp * st1.x;
                  vec3 B = q1perp * st0.y + q0perp * st1.y;
                  float det = max( dot( T, T ), dot( B, B ) );
                  float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );
                  return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );
            }
      #endif
#endif
//-----------------------------------------------------------------------------------------------------------------


void main(){
      
      //归一化法线
      #ifdef SY_USE_NORMAL
            //顶点着色器传到片元着色器的方向会有插值，所以需要归一化
            vec3 normal=normalize(v_normal);
      #endif
      
      //使用凹凸贴图
      #ifdef SY_USE_MAP_BUMP
             normal = perturbNormalArb(normalize(v_vmPosition),normal,v_uv);
      #elif defined(SY_USE_TANGENTSPACE_NORMALMAP)
            #if defined(SY_USE_TANGENT)
            normal = perturbNormal3Arb(v_tangent,normal,v_uv);
            #else
            normal = perturbNormal2Arb(normalize(v_vmPosition),normal,v_uv);
            #endif
      #endif

      //使用点光或者聚光会用到下面的数据
      #if defined(SY_USE_LIGHT_SPOT_NUM)||defined(SY_USE_LIGHT_POINT_NUM)||defined(SY_USE_LIGHT_PARALLEL_NUM)
          //顶点着色器传到片元着色器的方向会有插值，所以需要归一化
          //表面指向光位置的方向
          vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
          //顶点着色器传到片元着色器的方向会有插值，所以需要归一化
          //表面指向摄像机位置的方向 
          vec3 surfaceToViewDirection = normalize(v_surfaceToView);   
      #endif
      
      //表面基底色
      #ifdef SY_USE_TEXTURE
            #ifdef SY_USE_FUNC_MAGNIFIER
                  vec4 surfaceBaseColor=texture(u_texture,v_uv+getUVOffsetByMagnifier(v_uv,u_resolution.xy,u_mouse.xy,0.1,0.3))*u_color;
            #else
                  vec4 surfaceBaseColor=texture(u_texture,v_uv)*u_color;
            #endif
             
      #else
             vec4 surfaceBaseColor=u_color;
      #endif
      
      //使用1号纹理单元
      #if defined(SY_USE_TEXTURE_ONE)
          float time=mod(u_time/1000.,90.);
          surfaceBaseColor = surfaceBaseColor+texture(u_texture1,v_uv+sin(time));
      #endif
      
      surfaceBaseColor=vec4(surfaceBaseColor.rgb,u_alpha*surfaceBaseColor.a);
      
      //片元颜色
      vec4 fragColor=vec4(0.,0.,0.,surfaceBaseColor.a);
      
      #ifdef SY_USE_LIGHT_AMBIENT
            //环境光的照亮范围是全部 他是要和其余光照结果进行叠加的，将会让光线更加强亮
            vec4 ambient=vec4(surfaceBaseColor.rgb*u_ambient.rgb,1.);//环境光的颜色需要和漫反射颜色融合
            fragColor.rgb=fragColor.rgb+ambient.rgb;
      #endif

      //漫反射
      //最开始 漫反射==表面基底色
      vec3 diffuse = surfaceBaseColor.rgb;
       
      //------------------------开始基于一组光照计算
      //使用点光 
      #ifdef SY_USE_LIGHT_POINT_NUM
            diffuse = CalcPointLight(u_pointLights[0],normal,v_surfacePosition,normalize(v_surfaceToView),32.0,diffuse,vec3(1.0,1.0,1.0));
      //使用平行光
      #elif defined(SY_USE_LIGHT_PARALLEL_NUM)
            diffuse = CalcDirLight(u_dirLights[0],normal,normalize(v_surfaceToView),32.0,diffuse,vec3(1.0,1.0,1.0));
      //使用聚光
      #elif defined(SY_USE_LIGHT_SPOT_NUM)
            diffuse = CalcSpotLight(u_spotLights[0],normal,v_surfacePosition,normalize(v_surfaceToView),32.0,diffuse,vec3(1.0,1.0,1.0));
      #endif
      //-------------------------------------光照计算结束---------------------
      
      //使用阴影
      #ifdef SY_USE_SHADOW_PARALLEL
            float shadowLight = getShadowLightRYY(v_shadowProjectedTexcoord,u_shadowMap,u_shadowInfo);
            diffuse.rgb = diffuse * shadowLight;
      #endif
      
      //自发光
      #if defined(SY_USE_EMISSIVE)
          fragColor.rgb =  fragColor.rgb+u_emissive.rgb;
      #endif
      
      //累加到片元颜色中
      fragColor.rgb = fragColor.rgb+diffuse.rgb;



      #ifdef SY_USE_FOG
           //使用雾
           fragColor=getFogMixColor(fragColor);
      #endif



      
      //做一些基础测试
      #ifdef SY_USE_ALPHA_TEST
            if(fragColor.a<SY_USE_ALPHA_TEST)discard;
      #elif defined(SY_USE_RGB_TEST)
            if(fragColor.r+fragColor.g+fragColor.b<SY_USE_RGB_TEST)discard;
      #endif
      
      #ifdef SY_USE_FUNC_UNPACK_CUSTOM_TONE_MAPPING
             fragColor.rgb = toneMapping(fragColor.rgb);
      #endif
      
      //着火
      #ifdef SY_USE_FUNC_CATCH_FIRE 
            fragColor = getCatchFire(fragColor,v_uv,vec2(0.5, 0.5),vec4(0.0, 0., 0., 1.),mod(u_time/1000.,90.),1.0,1.0);
      #endif
      
     

      

      FragColor=fragColor;
}