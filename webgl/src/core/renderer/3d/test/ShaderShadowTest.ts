
'use strict';

import Device from "../../../Device";
import { glMatrix } from "../../../math/Matrix";
import { G_UISetting, UIStatusData } from "../../../ui/UiSetting";
import { MathUtils } from "../../../utils/MathUtils";
import { G_DrawEngine } from "../../base/DrawEngine";
import { RenderTexture } from "../../base/texture/RenderTexture";
import TextureCustom from "../../base/texture/TextureCustom";
import CustomTextureData from "../../data/CustomTextureData";
import { syRender } from "../../data/RenderData";
import { G_LightCenter } from "../../light/LightCenter";
import { G_LightModel } from "../../light/LightModel";
import { syPrimitives } from "../../shader/Primitives";
import { BufferAttribsData, ShaderData } from "../../shader/Shader";
import { G_ShaderFactory } from "../../shader/ShaderFactory";


/**
 * 物体呈现出颜色亮度就是表面的反射光导致，计算反射光公式如下：
<表面的反射光颜色> = <漫反射光颜色> + <环境反射光颜色> + <镜面反射光颜色>

1. 其中漫反射公式如下：
<漫反射光颜色> = <入射光颜色> * <表面基底色> * <光线入射角度>

光线入射角度可以由光线方向和表面的法线进行点积求得：
<光线入射角度> = <光线方向> * <法线方向>

最后的漫反射公式如下：
<漫反射光颜色> = <入射光颜色> * <表面基底色> * (<光线方向> * <法线方向>)

2. 环境反射光颜色根据如下公式得到：
<环境反射光颜色> = <入射光颜色> * <表面基底色>

3. 镜面（高光）反射光颜色公式，这里使用的是冯氏反射原理
<镜面反射光颜色> = <高光颜色> * <镜面反射亮度权重> 

其中镜面反射亮度权重又如下
<镜面反射亮度权重> = (<观察方向的单位向量> * <入射光反射方向>) ^ 光泽度
 */
/**
 * 光照知识1：
 * 使用环境光源的时候，需要注意颜色的亮度。环境光照的是全部，比如上面的代码中指定的0.1，如果全都换成1.0的话，模型就会变成全白了。和平行光源不一样，所以要注意。
   环境光的颜色，最好是限制在0.2左右以下
 * 环境光，模拟了自然界的光的漫反射，弥补了平行光源的缺点。一般，这两种光会同时使用。只使用环境光的话，无法表现出模型的凹凸，只使用平行光源的话，阴影过于严重无法分清模型的轮廓
 */

/**
 * 可以把相机和光照想象成用眼睛去看两次同样一个东西，只是每次看的时候位置不一样
 * 针对同样一个像素位置，第一次看的的时候，它处于10m远的位置，第二次看的时候它可能处于以下几种距离
 * 小于10m的距离：说明光看的远，也就是说光能够看见，那么就正常显示第二次的结果
 * 等于10m的距离：说明两者看的一样，两者都能看见，正常显示第二次绘制结果
 * 大于10m的距离：说明光看不见，相机可以看见，那它就处于阴影中
 * 原理：
 * 第一次使用光的位置进行绘制，将结果存到一张深度纹理中,其实就是光能够照射到的地方
 * 相机在不同的位置，那绘制出来的结果自然就不一样
 * 第二次绘制就是一次常规绘制，取出每一个像素的深度信息和深度纹理中对应位置的值进行比较
 * Z2 > Z1:说明相机能够看到 但是光照射不到，那这个像素就处于阴影中
 * Z2 = Z1:相机和光都可以看到，正常显示第二次绘制结果
 * Z2 < Z1: 相机和光都可以看到，正常显示第二次绘制结果
 * 
 * 媒介就是世界中的点
 * 第一次将世界中的点乘以视口矩阵转到视口坐标系下，再乘以投影矩阵，转到齐次裁切空间坐标系下，最后呢就是以这个坐标存到深度纹理中
 * 第二次想从深度纹理中获取uv坐标取深度，已知的数据是世界中的点，那么只要和第一次一样，乘以光照视口矩阵，乘以光照投影矩阵 就可以获取到当时的uv坐标
 * 注意：细心的网友会看到，其实*V*P,我们只是获取到了齐次裁切的空间坐标
 * 在GPU关于空间变换这块，最后三步是自动操作，
 * 倒数第三步是投影矩阵后，需要进行齐次除法，进行真正的投影，将坐标范围规定到【-1，1】;
 * 倒数第二步是将投影后的坐标转换到标准的设备坐标NDC,NDC的坐标范围是【0，1】，其实到了这一步就可以了啊，GPU会将相关数据存到对应的缓冲中
 * 坐标值（xyz）：会存到深度缓存中
 * 颜色(rgb)：回存到颜色缓存中
 * 模板值：模板缓存
 * 在下面的着色器中看到了相关的手动进行齐次除法和手动进行NDC坐标的转换
 * 倒数第一步就是屏幕映射，就是将NDC坐标映射到屏幕坐标，屏幕的坐标范围是【0，width】【0,height】
 * 
 * 拓展：帧缓冲默认绑定的的对象是窗口，但我们无法取出窗口的数据，帧缓冲其实是一些缓冲的总称，我们如果想要获取这些缓冲的数据，就需要重新创建一个新的帧缓冲
 * 让GPU去绑定他
 * 
 */

/**
 * 阴影光照
 */
class ShadowLight {

  private vertBase =
    `attribute vec4 a_position;
    uniform mat4 u_Pmat;
    uniform mat4 u_Vmat;
    uniform mat4 u_Mmat;
    void main() {
    gl_Position = u_Pmat * u_Vmat * u_Mmat * a_position;
    }`
  private fragBase =
    `precision mediump float;
  
    //分解保存深度值
    vec4 pack (float depth) {
        // 使用rgba 4字节共32位来存储z值,1个字节精度为1/256
        const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
        const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
        // gl_FragCoord:片元的坐标,fract():返回数值的小数部分
        vec4 rgbaDepth = fract(depth * bitShift); //计算每个点的z值 
        rgbaDepth -= rgbaDepth.rgba * bitMask; // Cut off the value which do not fit in 8 bits
        return rgbaDepth;
    }

    void main() {
    gl_FragColor = vec4(gl_FragCoord.z,0.0,0.0,1.0);  //将深度值存在帧缓冲的颜色缓冲中 如果帧缓冲和窗口绑定 那么就显示出来 如果帧缓冲和纹理绑定就存储在纹理中
    }`
  private vertexshader3d =
    `attribute vec4 a_position;
    attribute vec2 a_texcoord;
    attribute vec3 a_normal;

    uniform vec3 u_lightWorldPosition; //光的位置
    uniform vec3 u_cameraWorldPosition;  //相机的位置
    varying vec3 v_surfaceToLight;     //表面到光的方向 
    varying vec3 v_surfaceToView;      //表面到相机的方向

    uniform mat4 u_Pmat;           
    uniform mat4 u_Vmat;
    uniform mat4 u_Mmat;
    uniform mat4 u_textureMatrix;                         //纹理矩阵 主要作用就是去算出投影的uv坐标 上一次光照的投影矩阵*视口矩阵
    varying vec2 v_texcoord;                              //当前顶点的uv坐标
    varying vec4 v_projectedTexcoord;
    varying vec3 v_normal;
    void main() {
    vec4 worldPosition = u_Mmat * a_position;            //将当前顶点的坐标转换到世界空间坐标系中
    gl_Position = u_Pmat * u_Vmat * worldPosition;  //将顶点转换到其次裁切空间下
    v_texcoord = a_texcoord;
    v_projectedTexcoord = u_textureMatrix * worldPosition; //算出投影纹理的uv
    v_normal = mat3(u_Mmat) * a_normal;
    v_surfaceToLight = u_lightWorldPosition - worldPosition.rgb;  
    v_surfaceToView = u_cameraWorldPosition - worldPosition.rgb;
    }`

  
  private fragmentshader3d =
    `precision mediump float;

    varying vec3 v_surfaceToLight; 
    varying vec3 v_surfaceToView;
    uniform float u_specular_shininess;//光照因子

    varying vec2 v_texcoord;
    varying vec4 v_projectedTexcoord;
    varying vec3 v_normal;
    uniform vec4 u_color;            //节点的颜色
    uniform sampler2D u_texture;
    uniform sampler2D gDepth; //投影纹理，第一次站在光的位置进行绘制，将结果存在这里，这个纹理只用于存储深度
    uniform vec4 u_shadowInfo;
    uniform vec3 u_spotDirection;          //聚光的方向

   


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
    float unpack(const in vec4 rgbaDepth) {
      const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
      return dot(rgbaDepth, bitShift);
  }
    //软阴影
    //coordP在光照下的顶点坐标
    float getShadowLightRYY(vec4 coordP){
      vec3 projectedTexcoord = coordP.xyz / coordP.w;   //手动进行齐次除法
      projectedTexcoord = projectedTexcoord.xyz / 2.0 + 0.5;       //转为屏幕坐标
      float shadows =0.0;
      float opacity=0.1;// 阴影alpha值, 值越小暗度越深
      float texelSize=1.0/1024.0;// 阴影像素尺寸,值越小阴影越逼真
      vec4 rgbaDepth;
      bool isInRange = inRange(projectedTexcoord);
      float curDepth = projectedTexcoord.z-u_shadowInfo.x;
      //消除阴影边缘的锯齿
      for(float y=-1.5; y <= 1.5; y += 1.0){
          for(float x=-1.5; x <=1.5; x += 1.0){
              //找出光照条件下的当前位置的最大深度
              rgbaDepth = texture2D(gDepth, projectedTexcoord.xy+vec2(x,y)*texelSize);
              //如果当前深度大于光照的最大深度 则表明处于阴影中
              //否则可以看见
              shadows += (isInRange&&curDepth>(rgbaDepth).r) ? 1.0 : 0.0;
          }
      }
      shadows/=16.0;// 4*4的样本
      float visibility=min(opacity+(1.0-shadows),1.0);
      return visibility;
    }
    //处理高光
    //normal法线
    vec3 getSpecular(vec3 normal){
      vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
      vec3 surfaceToViewDirection = normalize(v_surfaceToView);
      vec3 specularColor =vec3(1.0,1.0,1.0);
      vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection); //算出高光的方向
      float specularWeighting = pow(dot(normal, halfVector), u_specular_shininess);
      vec3 specular = specularColor.rgb * specularWeighting;
      return specular;
    }
    //宾式模型高光
    vec3 getSpecularBingShi(vec3 normal){
      // 计算法向量和光线的点积
      float cosTheta = max(dot(normal,u_spotDirection), 0.0);
      vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
      vec3 surfaceToViewDirection = normalize(v_surfaceToView);
      vec3 specularColor =vec3(1.0,1.0,1.0);
      vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection); //算出高光的方向
      float specularWeighting = pow(dot(normal, halfVector), u_specular_shininess);
      vec3 specular = specularColor.rgb * specularWeighting * step(cosTheta,0.0);
      return specular;
    }
    //冯氏模型高光
    vec3 getSpecularFengShi(vec3 normal){
      vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
      vec3 surfaceToViewDirection = normalize(v_surfaceToView);
      vec3 specularColor =vec3(1.0,1.0,1.0);  
      // 计算法向量和光线的点积
      float cosTheta = max(dot(normal,u_spotDirection), 0.0);
      vec3 reflectionDirection = reflect(-surfaceToLightDirection, normal);
      float specularWeighting = pow(max(dot(reflectionDirection, surfaceToViewDirection), 0.0), u_specular_shininess);
      vec3 specular = specularColor.rgb * specularWeighting * step(cosTheta,0.0);
      return specular;
    }
    void main() {
    vec3 normal = normalize(v_normal);             //归一化法线
    float light = clamp(dot(normal, u_spotDirection),0.0,1.0);    //算出光照强度
    float shadowLight = getShadowLightRYY(v_projectedTexcoord);
    //通过uv贴图找出当前片元的颜色 该颜色常被称为自发光颜色或是当前顶点的颜色
    vec4 texColor = texture2D(u_texture, v_texcoord) * u_color;
    //漫反射光  顶点颜色* 光照强度 * 阴影bool值
    vec3 diffuse = texColor.rgb * light * shadowLight; 
    //环境光 （它的值rgb最好都限定在0.2以下）
    //环境光的照亮范围是全部 他是要和其余光照结果进行叠加的，将会让光线更加强亮
    vec4 ambientLight = vec4(0.1,0.1,0.1,1.0);   
    vec4 ambient = vec4(texColor.rgb *ambientLight.rgb,1.0); //环境光的颜色需要和漫反射颜色融合
    vec3 specular = shadowLight<1.0?vec3(0.0,0.0,0.0):getSpecularFengShi(normal);//阴影处没有高光
    gl_FragColor = vec4(diffuse+ambient.rgb+specular,texColor.a);
    }`
  private gl: WebGLRenderingContext
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }
  private textureProgramInfo: ShaderData;
  private colorProgramInfo: ShaderData;
  private sphereBufferInfo: BufferAttribsData;
  private planeBufferInfo: BufferAttribsData;
  private cubeBufferInfo: BufferAttribsData;

  // private settings: any;
  public run(): void {
    this.textureProgramInfo = G_ShaderFactory.createProgramInfo(this.vertexshader3d, this.fragmentshader3d);
    this.colorProgramInfo = G_ShaderFactory.createProgramInfo(this.vertBase, this.fragBase);
    this.sphereBufferInfo = syPrimitives.createSphereBufferInfo(
      1,  // radius
      32, // subdivisions around
      24, // subdivisions down
    );
    this.planeBufferInfo = syPrimitives.createPlaneBufferInfo(
      20,  // width
      20,  // height
      1,   // subdivisions across
      1,   // subdivisions down
    );

    this.cubeBufferInfo = syPrimitives.createCubeBufferInfo(
      2,  // size
    );

    this.createTexture();
    this.createUniform();
    this.render();
    G_UISetting.pushRenderCallBack(this.render.bind(this));
  }
  private checkerboardTexture: TextureCustom;
  private depthTextureSize: number = 512;
  private renderTexture: RenderTexture;
  private createTexture(): void {
    this.checkerboardTexture = new TextureCustom(); 
    this.checkerboardTexture.url = CustomTextureData.getBoardData(8, 8);
    this.renderTexture = new RenderTexture();
    this.renderTexture.attach(syRender.AttachPlace.Depth, this.depthTextureSize, this.depthTextureSize)
  }



  /**
   * 绘制场景
   * @param pMatrix 投影矩阵
   * @param vMatrix  相机矩阵
   * @param texMatrix 纹理矩阵 主要作用就是去算出投影的uv坐标
   * @param lightReverseDir 光的反射反向
   * @param programInfo 
   */
  drawScene(pMatrix,
    vMatrix,
    texMatrix,
    lightReverseDir,
    programInfo: ShaderData,
    lightPos: Array<number> = [0, 0, 0], cameraPos: Array<number> = [0, 0, 0]) {
    // Make a view matrix from the camera matrix.
    var gl = this.gl;
    const viewMatrix = glMatrix.mat4.invert(null, vMatrix);

    gl.useProgram(programInfo.spGlID);

    // set uniforms that are the same for both the sphere and plane
    // note: any values with no corresponding uniform in the shader
    // are ignored.
    G_ShaderFactory.setUniforms(programInfo.uniSetters, {
      u_Vmat: viewMatrix,
      u_Pmat: pMatrix,
      u_shadowInfo: G_LightCenter.lightData.shadow.info,
      u_textureMatrix: texMatrix,
      gDepth: this.renderTexture.glID,
      u_lightWorldPosition: lightPos,
      u_cameraWorldPosition: cameraPos,
      u_specular_shininess: 150,
      u_spotDirection: lightReverseDir,
    });

    // ------ Draw the sphere --------
    // Setup all the needed attributes.
    G_ShaderFactory.setBuffersAndAttributes(programInfo.attrSetters, this.sphereBufferInfo);
    // Set the uniforms unique to the sphere
    G_ShaderFactory.setUniforms(programInfo.uniSetters, this.sphereUniforms);
    // calls gl.drawArrays or gl.drawElements
    G_ShaderFactory.drawBufferInfo(this.sphereBufferInfo);

    // ------ Draw the cube --------
    // Setup all the needed attributes.
    G_ShaderFactory.setBuffersAndAttributes(programInfo.attrSetters, this.cubeBufferInfo);
    // Set the uniforms unique to the cube
    G_ShaderFactory.setUniforms(programInfo.uniSetters, this.cubeUniforms);
    // calls gl.drawArrays or gl.drawElements
    G_ShaderFactory.drawBufferInfo(this.cubeBufferInfo);

    // ------ Draw the plane --------
    // Setup all the needed attributes.
    G_ShaderFactory.setBuffersAndAttributes(programInfo.attrSetters, this.planeBufferInfo);
    // Set the uniforms unique to the cube
    G_ShaderFactory.setUniforms(programInfo.uniSetters, this.planeUniforms);
    // calls gl.drawArrays or gl.drawElements
    G_ShaderFactory.drawBufferInfo(this.planeBufferInfo);
  }
  private fieldOfViewRadians: number;
  private planeUniforms: any;
  private sphereUniforms: any;
  private cubeUniforms: any;
  private createUniform(): void {
    this.fieldOfViewRadians = MathUtils.degToRad(60);
    // Uniforms for each object.
    this.planeUniforms = {
      u_color: [0.5, 0.5, 1, 1],  // lightblue
      u_texture: this.checkerboardTexture.glID,
      u_Mmat: glMatrix.mat4.translation(null, 0, 0, 0),
    };
    this.sphereUniforms = {
      u_color: [1, 0.5, 0.5, 1],  // pink
      u_texture: this.checkerboardTexture.glID,
      u_Mmat: glMatrix.mat4.translation(null, 2, 6, 4),
    };
    this.cubeUniforms = {
      u_color: [0.5, 1, 0.5, 1],  // lightgreen
      u_texture: this.checkerboardTexture.glID,
      u_Mmat: glMatrix.mat4.translation(null, 3, 1, 0),
    };
  }

  private getCameraData() {
    var gl = this.gl;
    // Compute the projection matrix 
    const aspect = gl.canvas.width / gl.canvas.height;
    const projectionMatrix = glMatrix.mat4.perspective(null, this.fieldOfViewRadians, aspect, 1, 200);
    // Compute the camera's matrix using look at.
    // const cameraPosition = [this.settings.cameraX, this.settings.cameraY, this.settings.cameraZ];
    const cameraPosition = [6, 12, 15];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const cameraMatrix = glMatrix.mat4.lookAt2(null, cameraPosition, target, up);
    return {
      mat: cameraMatrix,
      project: projectionMatrix,
      pos: cameraPosition
    }
  }


  // Draw the scene.
  public render() {


    var gl = this.gl;
    Device.Instance.resizeCanvasToDisplaySize(gl.canvas);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    let lightData = G_LightCenter.updateLightCameraData();
    // draw to the depth texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderTexture.frameBuffer);//将结果绘制到深度纹理中
    gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    /**
     * 此处将结果绘制到深度纹理中
     * 准确来说，渲染完以后，GPU会将深度z值存储在帧缓冲的深度附件中
     * 纹理矩阵
     * 此处是站在光的位置进行绘制的，所以最终的帧缓冲，所有的位置都是通过x光照摄像机的投影矩阵x视野矩阵x世界矩阵得到
     * 有一点是公用的，就是场景中所有的渲染节点的位置信息是相同的
     * 只是这一次渲染，是站在光的位置去渲染，将最终结果存到一张深度纹理中
     * 这张深度纹理就是一个512*512的二维数组，里面每一个元素都是rgba,r存的就是深度
     * pos = P x V x W x pos;==>
     */
    //c创建一个标准的纹理矩阵，其实这个纹理矩阵所形成的空间坐标系是一个标准的空间坐标系
    //因为一个点的位置与这个矩阵相乘，这个点的位置不会发生任何变化
    //它真正发挥作用的是在第二次绘制的时候对他的赋值
    let texMatrix = glMatrix.mat4.identity(null);
    this.drawScene(lightData.project, lightData.mat, texMatrix, lightData.reverseDir, this.colorProgramInfo);

    // Device.Instance.showCurFramerBufferOnCanvas(this.depthTextureSize, this.depthTextureSize);

    // now draw scene to the canvas projecting the depth texture into the scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); //将结果绘制到窗口中
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    let textureMatrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.multiply(textureMatrix, textureMatrix, lightData.project);
    glMatrix.mat4.multiply(textureMatrix, textureMatrix, glMatrix.mat4.invert(null, lightData.mat));

    let cameraData = this.getCameraData();
    this.drawScene(cameraData.project, cameraData.mat, textureMatrix, lightData.reverseDir, this.textureProgramInfo, lightData.pos, cameraData.pos);
    // ------ Draw the frustum ------
    G_LightModel.drawFrustum(cameraData.project, cameraData.mat);

  }


}


export default class ShaderShadowTest {
  static run() {
    new ShadowLight(Device.Instance.gl).run();
  }

}