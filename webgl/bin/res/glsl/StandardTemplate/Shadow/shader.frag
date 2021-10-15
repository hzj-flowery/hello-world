precision mediump float;

    varying vec3 v_surfaceToLight; 
    varying vec3 v_surfaceToView;
 

    varying vec2 v_uv;
    
    varying vec3 v_normal;
    uniform vec4 u_color;            //节点的颜色
    uniform sampler2D u_texture;
    uniform sampler2D gDepth; //投影纹理，第一次站在光的位置进行绘制，将结果存在这里，这个纹理只用于存储深度
    uniform sampler2D gUv;
    uniform sampler2D gColor;

    uniform sampler2D u_shadowMap;
    uniform vec4 u_shadowInfo;
    varying vec4 v_projectedTexcoord;

    
    uniform vec4 u_spot;//聚光的颜色
    uniform vec3 u_spotCenterDirection;  //聚光的方向
    uniform vec3 u_parallelDirection;//平行光的方向
    uniform float u_spotInnerLimit;//聚光的内部限制
    uniform float u_spotOuterLimit;//聚光的外部限制
    
    uniform float u_specular_shininess;//光照因子
    uniform vec4 u_specular;//高光的颜色

    uniform vec4 u_ambient;//环境光

    bool inRange(vec3 coordP){
       return coordP.x >= 0.0 && coordP.x <= 1.0 && coordP.y >= 0.0 && coordP.y <= 1.0; //uv纹理坐标必须处于【0，1】
    }
    //普通计算阴影
    float getShadowLight(vec4 coordP){
      vec3 projectedTexcoord = coordP.xyz / coordP.w;   //手动进行齐次除法
      projectedTexcoord = projectedTexcoord.xyz / 2.0 + 0.5;                     //转为屏幕坐标
      float currentDepth = projectedTexcoord.z + u_shadowInfo.x;                          //Z2  当前顶点的深度值                  
      float projectedDepth = texture2D(gDepth, projectedTexcoord.xy).r; //取出深度z值 Z1
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
      vec3 projectedTexcoord = coordP.xyz / coordP.w;   //手动进行齐次除法
      projectedTexcoord = projectedTexcoord.xyz / 2.0 + 0.5;       //转为屏幕坐标

      float shadows=shadowInfo.z;  //0
      float opacity=shadowInfo.w;// 阴影alpha值, 值越小暗度越深
      float texelSize=shadowInfo.y;// 阴影像素尺寸,值越小阴影越逼真

      vec4 rgbaDepth;
      bool isInRange = inRange(projectedTexcoord);
      float curDepth = projectedTexcoord.z-shadowInfo.x;
      //消除阴影边缘的锯齿
      for(float y=-1.5; y <= 1.5; y += 1.0){
          for(float x=-1.5; x <=1.5; x += 1.0){
              //找出光照条件下的当前位置的最大深度
                rgbaDepth = texture2D(shadowMap, projectedTexcoord.xy+vec2(x,y)*texelSize);
                //如果当前深度大于光照的最大深度 则表明处于阴影中
                //否则可以看见
                #ifdef SY_USE_FUNC_UNPACK
                     shadows += (isInRange&&curDepth>unpack(rgbaDepth)) ? 1.0 : 0.0;
                #else
                     shadows += (isInRange&&curDepth>rgbaDepth.r) ? 1.0 : 0.0;
                #endif
          }
      }

      shadows/=16.0;// 4*4的样本
      float visibility=min(opacity+(1.0-shadows),1.0);
      return visibility;

    }
    //处理高光
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
    
    /*
    获取聚光灯的光照强度
    @param normal 法线
    @param spotDirection 聚光灯的方向
    @param surfaceToLightDirection 表面指向聚光灯位置的方向
    @param spotInnerLimit  聚光灯的最小范围
    @param spotOuterLimit  聚光灯的最大范围
    */
    float getSpotLightDot(vec3 normal,vec3 spotDirection,vec3 surfaceToLightDirection,float spotInnerLimit,float spotOuterLimit){
      float dotFromDirection = dot(surfaceToLightDirection,spotDirection);
      float inLight = smoothstep(spotOuterLimit, spotInnerLimit, dotFromDirection);
      float light =inLight* max(dot(normal, surfaceToLightDirection),0.0); //算出点光的入射强度
      return light;
    }
    /*
    获取平行光的光照强度
    */
    float getParallelLightDot(vec3 normal,vec3 lightDirection){
      float lightDot = clamp(dot(normal,lightDirection),0.0,1.0);    //算出光照强度
      return lightDot;
    }
    void main() {
        vec3 normal = normalize(v_normal);             //归一化法线
        vec3 surfaceToLightDirection = normalize(v_surfaceToLight); //表面指向光位置的方向
        vec3 surfaceToViewDirection = normalize(v_surfaceToView);   //表面指向摄像机位置的方向
        vec3 spotDirection = normalize(u_spotCenterDirection);
        vec3 parallelDirection = normalize(u_parallelDirection);

        // float lightDot = getParallelLightDot(normal,spotDirection);    //算出平行光强度
        float lightDot = getSpotLightDot(normal,spotDirection,surfaceToLightDirection,u_spotInnerLimit,u_spotOuterLimit);    //算出聚光强度

        float shadowLight = getShadowLightRYY(v_projectedTexcoord,u_shadowMap,u_shadowInfo);
        //通过uv贴图找出当前片元的纹理颜色*顶点颜色=表面基底色
        vec4 surfaceBaseColor = texture2D(u_texture, v_uv) * u_color;
        //漫反射光  表面基底色 *入射光颜色* 光照强度 * 阴影bool值  
        vec3 diffuse = surfaceBaseColor.rgb*u_spot.rgb * lightDot * shadowLight; 
        //环境光 （它的值rgb最好都限定在0.2以下）
        //环境光的照亮范围是全部 他是要和其余光照结果进行叠加的，将会让光线更加强亮
        vec4 ambient = vec4(surfaceBaseColor.rgb *u_ambient.rgb,1.0); //环境光的颜色需要和漫反射颜色融合
        //vec3 specular = shadowLight<1.0?vec3(0.0,0.0,0.0):getSpecular(normal,u_specular,u_specular_shininess,v_surfaceToLight,v_surfaceToView);//阴影处没有高光
        vec3 specular = shadowLight<1.0?vec3(0.0,0.0,0.0):getSpecularFengShi(normal,u_specular,u_specular_shininess,v_surfaceToLight,v_surfaceToView,u_spotCenterDirection);//阴影处没有高光
        gl_FragColor = vec4(diffuse+ambient.rgb+specular,surfaceBaseColor.a);
    }