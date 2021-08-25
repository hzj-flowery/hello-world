#version 300 es
precision mediump float;

in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;
in vec2 v_uv;                  //uv坐标
in vec4 v_projectedTexcoord;
in vec3 v_normal;
layout (location = 0) out vec4 FragColor;   // 输出颜色

uniform vec4 u_color;//节点的颜色
uniform sampler2D u_texture;
uniform sampler2D gDepth;//投影纹理，第一次站在光的位置进行绘制，将结果存在这里，这个纹理只用于存储深度
uniform vec4 u_shadowInfo;  
uniform vec3  u_spotDirection;//聚光的方向
uniform float u_specular_shininess;//光照因子

bool inRange(vec3 coordP){
    return coordP.x>=0.&&coordP.x<=1.&&coordP.y>=0.&&coordP.y<=1.;//uv纹理坐标必须处于【0，1】
}
//普通计算阴影
// float getShadowLight(vec4 coordP){
//     vec3 projectedTexcoord=coordP.xyz/coordP.w;//手动进行齐次除法
//     projectedTexcoord=projectedTexcoord.xyz/2.+.5;//转为屏幕坐标
//     float currentDepth=projectedTexcoord.z+u_shadowInfo.x;//Z2  当前顶点的深度值
//     float projectedDepth=texture(gDepth,projectedTexcoord.xy).r;//取出深度z值 Z1
//     float shadowLight=(inRange(projectedTexcoord)&&projectedDepth<=currentDepth)?0.:1.;//小于说明光看不见，则处于阴影中，否则正常显示
//     return shadowLight;
// }
// float unpack(const in vec4 rgbaDepth){
//     const vec4 bitShift=vec4(1.,1./256.,1./(256.*256.),1./(256.*256.*256.));
//     return dot(rgbaDepth,bitShift);
// }
//软阴影
//coordP在光照下的顶点坐标
float getShadowLightRYY(vec4 coordP){
    vec3 projectedTexcoord=coordP.xyz/coordP.w;//手动进行齐次除法
    projectedTexcoord=projectedTexcoord.xyz/2.+.5;//转为屏幕坐标
    // float shadows=u_shadowInfo.z;  //0
    // float opacity=u_shadowInfo.w;// 阴影alpha值, 值越小暗度越深
    // float texelSize=u_shadowInfo.y;// 阴影像素尺寸,值越小阴影越逼真

    float shadows =0.0;
    float opacity=0.1;// 阴影alpha值, 值越小暗度越深
    float texelSize=1.0/1024.0;// 阴影像素尺寸,值越小阴影越逼真

    vec4 rgbaDepth;
    bool isInRange=inRange(projectedTexcoord);
    float curDepth=projectedTexcoord.z-u_shadowInfo.x;//马赫带 0.005
    //消除阴影边缘的锯齿
    for(float y=-1.5;y<=1.5;y+=1.){
        for(float x=-1.5;x<=1.5;x+=1.){
            //找出光照条件下的当前位置的最大深度
            rgbaDepth=texture(gDepth,projectedTexcoord.xy+vec2(x,y)*texelSize);
            //如果当前深度大于光照的最大深度 则表明处于阴影中
            //否则可以看见
            shadows+=(isInRange&&curDepth>(rgbaDepth).r)?1.:0.;
        }
    }
    shadows/=16.;// 4*4的样本
    float visibility=min(opacity+(1.-shadows),1.);
    return visibility;
}
//处理高光
//normal法线
// vec3 getSpecular(vec3 normal){
//     vec3 surfaceToLightDirection=normalize(v_surfaceToLight);
//     vec3 surfaceToViewDirection=normalize(v_surfaceToView);
//     vec3 specularColor=vec3(1.,1.,1.);
//     vec3 halfVector=normalize(surfaceToLightDirection+surfaceToViewDirection);//算出高光的方向
//     float specularWeighting=pow(dot(normal,halfVector),u_specular_shininess);
//     vec3 specular=specularColor.rgb*specularWeighting;
//     return specular;
// }
// //宾式模型高光
// vec3 getSpecularBingShi(vec3 normal){
//     // 计算法向量和光线的点积
//     float cosTheta=max(dot(normal,u_spotDirection),0.);
//     vec3 surfaceToLightDirection=normalize(v_surfaceToLight);
//     vec3 surfaceToViewDirection=normalize(v_surfaceToView);
//     vec3 specularColor=vec3(1.,1.,1.);
//     vec3 halfVector=normalize(surfaceToLightDirection+surfaceToViewDirection);//算出高光的方向
//     float specularWeighting=pow(dot(normal,halfVector),u_specular_shininess);
//     vec3 specular=specularColor.rgb*specularWeighting*step(cosTheta,0.);
//     return specular;
// }
// //冯氏模型高光
vec3 getSpecularFengShi(vec3 normal){
    vec3 surfaceToLightDirection=normalize(v_surfaceToLight);
    vec3 surfaceToViewDirection=normalize(v_surfaceToView);
    vec3 specularColor=vec3(1.,1.,1.);
    // 计算法向量和光线的点积
    float cosTheta=max(dot(normal,u_spotDirection),0.);
    vec3 reflectionDirection=reflect(-surfaceToLightDirection,normal);
    float specularWeighting=pow(max(dot(reflectionDirection,surfaceToViewDirection),0.),u_specular_shininess);
    vec3 specular=specularColor.rgb*specularWeighting*step(cosTheta,0.);
    return specular;
}
void main(){
    vec3 normal=normalize(v_normal);//归一化法线
    float light=clamp(dot(normal,u_spotDirection),0.,1.);//算出光照强度
    float shadowLight=getShadowLightRYY(v_projectedTexcoord);
    //通过uv贴图找出当前片元的颜色 该颜色常被称为自发光颜色或是当前顶点的颜色
    vec4 texColor=texture(u_texture,v_uv)*u_color;
    //漫反射光  顶点颜色* 光照强度 * 阴影bool值
    vec3 diffuse=texColor.rgb*light*shadowLight;
    //环境光 （它的值rgb最好都限定在0.2以下）
    //环境光的照亮范围是全部 他是要和其余光照结果进行叠加的，将会让光线更加强亮
    vec4 ambientLight=vec4(.1,.1,.1,1.);
    vec4 ambient=vec4(texColor.rgb*ambientLight.rgb,1.);//环境光的颜色需要和漫反射颜色融合
    vec3 specular=shadowLight<1.?vec3(0.0,0.,0.):getSpecularFengShi(normal);//阴影处没有高光
    FragColor=vec4(diffuse+ambient.rgb+specular,texColor.a);
}