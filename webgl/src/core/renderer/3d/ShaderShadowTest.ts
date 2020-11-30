
'use strict';

import Device from "../../../Device";
import { glMatrix } from "../../Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { syPrimitives } from "../shader/Primitives";
import { G_ShaderFactory, ShaderData } from "../shader/Shader";

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
 */

var vertexshader3d =
  'attribute vec4 a_position;' +
  'attribute vec2 a_texcoord;' +
  'attribute vec3 a_normal;' +
  'uniform mat4 u_projection;' +
  'uniform mat4 u_view;' +
  'uniform mat4 u_world;' +
  'uniform mat4 u_textureMatrix;' +                         //纹理矩阵 主要作用就是去算出投影的uv坐标
  'varying vec2 v_texcoord;' +                              //当前顶点的uv坐标
  'varying vec4 v_projectedTexcoord;' +
  'varying vec3 v_normal;' +
  'void main() {' +
  'vec4 worldPosition = u_world * a_position;' +            //将当前顶点的坐标转换到世界空间坐标系中
  'gl_Position = u_projection * u_view * worldPosition;' +  //将顶点转换到其次裁切空间下
  'v_texcoord = a_texcoord;' +
  'v_projectedTexcoord = u_textureMatrix * worldPosition;' + //算出投影纹理的uv
  // 'v_projectedTexcoord =  v_projectedTexcoord.xyz / v_projectedTexcoord.w;' +
  // 'v_projectedTexcoord = v_projectedTexcoord.xyz / 2.0 + 0.5;'+
  'v_normal = mat3(u_world) * a_normal;' +
  '}'
var fragmentshader3d =
  'precision mediump float;' +
  'varying vec2 v_texcoord;' +
  'varying vec4 v_projectedTexcoord;' +
  'varying vec3 v_normal;' +
  'uniform vec4 u_colorMult;' +
  'uniform sampler2D u_texture;' +
  'uniform sampler2D u_projectedTexture;' + //投影纹理，第一次站在光的位置进行绘制，将结果存在这里，这个纹理只用于存储深度
  'uniform float u_bias;' +
  'uniform vec3 u_reverseLightDirection;' +          //光的反方向
  'void main() {' +
  'vec3 normal = normalize(v_normal);' +             //归一化法线
  'float light = dot(normal, u_reverseLightDirection);' +
  'vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;' +   //手动进行齐次除法
  'projectedTexcoord = v_projectedTexcoord.xyz / 2.0 + 0.5;'+                     //转为屏幕坐标
  'float currentDepth = projectedTexcoord.z + u_bias;' +                          //Z2  当前顶点的深度值                  
  'bool inRange = projectedTexcoord.x >= 0.0 && projectedTexcoord.x <= 1.0 && projectedTexcoord.y >= 0.0 && projectedTexcoord.y <= 1.0;' + //uv纹理坐标必须处于【0，1】
  'float projectedDepth = texture2D(u_projectedTexture, projectedTexcoord.xy).r;' + //取出深度z值 Z1
  'float shadowLight = (inRange && projectedDepth <= currentDepth) ? 0.0 : 1.0;' +//小于说明光看不见，则处于阴影中，否则正常显示
  'vec4 texColor = texture2D(u_texture, v_texcoord) * u_colorMult;' +
  'gl_FragColor = vec4(texColor.rgb * light * shadowLight,texColor.a);' +
  '}'
var colorvertexshader =
  'attribute vec4 a_position;' +
  'uniform mat4 u_projection;' +
  'uniform mat4 u_view;' +
  'uniform mat4 u_world;' +
  'void main() {' +
  'gl_Position = u_projection * u_view * u_world * a_position;' +
  '}'
var colorfragmentshader =
  'precision mediump float;' +
  'uniform vec4 u_color;' +
  'void main() {' +
  'gl_FragColor = u_color;' +
  '}'

/**
 * 阴影光照
 */
class ShadowLight_WebGl1 {
  private gl: WebGLRenderingContext
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }
  private textureProgramInfo: ShaderData;
  private colorProgramInfo: ShaderData;
  private sphereBufferInfo: any;
  private planeBufferInfo: any;
  private cubeBufferInfo: any;
  private cubeLinesBufferInfo: any;

  private settings: any;
  public run(): void {
    // setup GLSL programs
    this.textureProgramInfo = G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);
    this.colorProgramInfo = G_ShaderFactory.createProgramInfo(colorvertexshader, colorfragmentshader);
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
    this.cubeLinesBufferInfo = G_ShaderFactory.createBufferInfoFromArrays({
      position: [
        -1, -1, -1,
        1, -1, -1,
        -1, 1, -1,
        1, 1, -1,
        -1, -1, 1,
        1, -1, 1,
        -1, 1, 1,
        1, 1, 1,
      ],
      indices: [
        0, 1,
        1, 3,
        3, 2,
        2, 0,

        4, 5,
        5, 7,
        7, 6,
        6, 4,

        0, 4,
        1, 5,
        3, 7,
        2, 6,
      ],
    });
    this.createTexture();
    this.setUI();
    this.createUniform();
    this.render();
  }
  private depthTexture: WebGLTexture;
  private checkerboardTexture: WebGLTexture;
  private depthFramebuffer: WebGLFramebuffer;
  private depthTextureSize: number
  private createTexture(): void {
    var gl = this.gl;
    // make a 8x8 checkerboard texture
    this.checkerboardTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.checkerboardTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,                // mip level
      gl.LUMINANCE,     // internal format
      8,                // width
      8,                // height
      0,                // border
      gl.LUMINANCE,     // format
      gl.UNSIGNED_BYTE, // type
      new Uint8Array([  // data
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
      ]));
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    //创建帧缓冲
    this.depthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
    //深度纹理附件
    this.depthTexture = gl.createTexture();
    this.depthTextureSize = 512;//设置这张纹理的尺寸512*512
    gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,      // target
      0,                  // mip level
      gl.DEPTH_COMPONENT, // internal format
      this.depthTextureSize,   // width
      this.depthTextureSize,   // height
      0,                  // border
      gl.DEPTH_COMPONENT, // format
      gl.UNSIGNED_INT,    // type  //通道数是4 每一位大小是1个字节
      null);              // data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,       // target
      gl.DEPTH_ATTACHMENT,  // attachment point 将指定的纹理绑定到帧缓冲的深度附件中
      gl.TEXTURE_2D,        // texture target
      this.depthTexture,    // texture
      0);                   // mip level

    //颜色纹理附件
    // create a color texture of the same size as the depth texture
    // see article why this is needed_
    var unusedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.depthTextureSize,
      this.depthTextureSize,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // attach it to the framebuffer
    //将颜色纹理附件附加到帧缓存
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,        // target
      gl.COLOR_ATTACHMENT0,  // attachment point 将指定的纹理绑定到帧缓冲的颜色附件中
      gl.TEXTURE_2D,         // texture target
      unusedTexture,         // texture
      0);                    // mip level
  }
  private setUI(): void {
    this.settings = {
      cameraX: 6, //普通摄像机的x轴坐标
      cameraY: 12, //普通摄像机的y轴坐标
      cameraZ: 15,//普通摄像机的z轴坐标
      posX: 2.5, //光照摄像机的x轴坐标
      posY: 4.8, //光照摄像机的y轴坐标
      posZ: 7,   //光照摄像机的z轴坐标
      targetX: 3.5, //光照摄像机看向的目标的x轴坐标
      targetY: 0,   //光照摄像机看向的目标的y轴坐标
      targetZ: 3.5, //光照摄像机看向的目标的z轴坐标
      projWidth: 10, //光照摄像机渲染的屏幕宽度
      projHeight: 10, //光照摄像机渲染的屏幕高度
      perspective: false, //是否为透视投影
      fieldOfView: 120,   //视角fov
      bias: -0.006,
    };
    var webglLessonsUI = window["webglLessonsUI"]
    webglLessonsUI.setupUI(document.querySelector('#ui'), this.settings, [
      { type: 'slider', key: 'cameraX', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'cameraY', min: 1, max: 20, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'cameraZ', min: 10, max: 200, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'posX', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'posY', min: 1, max: 20, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'posZ', min: 1, max: 20, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'targetX', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'targetY', min: 0, max: 20, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'targetZ', min: -10, max: 20, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'projWidth', min: 0, max: 100, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'projHeight', min: 0, max: 100, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'checkbox', key: 'perspective', change: this.render.bind(this), },
      { type: 'slider', key: 'fieldOfView', min: 1, max: 179, change: this.render.bind(this), },
      { type: 'slider', key: 'bias', min: -0.01, max: 0.00001, change: this.render.bind(this), precision: 4, step: 0.0001, },
    ]);
  }

  /**
   * 绘制场景
   * @param pMatrix 投影矩阵
   * @param vMatrix  相机矩阵
   * @param texMatrix 纹理矩阵 主要作用就是去算出投影的uv坐标
   * @param lightReverseDir 光的反射反向
   * @param programInfo 
   */
  drawScene(pMatrix, vMatrix, texMatrix, lightReverseDir, programInfo: ShaderData) {
    // Make a view matrix from the camera matrix.
    var gl = this.gl;
    const viewMatrix = glMatrix.mat4.invert(null, vMatrix);

    gl.useProgram(programInfo.spGlID);

    // set uniforms that are the same for both the sphere and plane
    // note: any values with no corresponding uniform in the shader
    // are ignored.
    G_ShaderFactory.setUniforms(programInfo.uniSetters, {
      u_view: viewMatrix,
      u_projection: pMatrix,
      u_bias: this.settings.bias,
      u_textureMatrix: texMatrix,
      u_projectedTexture: this.depthTexture,
      u_reverseLightDirection: lightReverseDir,
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
      u_colorMult: [0.5, 0.5, 1, 1],  // lightblue
      u_color: [1, 0, 0, 1],
      u_texture: this.checkerboardTexture,
      u_world: glMatrix.mat4.translation(null,0, 0, 0),
    };
    this.sphereUniforms = {
      u_colorMult: [1, 0.5, 0.5, 1],  // pink
      u_color: [0, 0, 1, 1],
      u_texture: this.checkerboardTexture,
      u_world: glMatrix.mat4.translation(null,2, 3, 4),
    };
    this.cubeUniforms = {
      u_colorMult: [0.5, 1, 0.5, 1],  // lightgreen
      u_color: [0, 0, 1, 1],
      u_texture: this.checkerboardTexture,
      u_world: glMatrix.mat4.translation(null,3, 1, 0),
    };
  }

 /**
  * 绘制光源
  * @param projectionMatrix 
  * @param cameraMatrix 
  * @param worldMatrix 
  */
  private drawFrustum(projectionMatrix,cameraMatrix,worldMatrix) {
    var gl = this.gl;
    const viewMatrix = glMatrix.mat4.invert(null, cameraMatrix);
    gl.useProgram(this.colorProgramInfo.spGlID);
    // Setup all the needed attributes.
    G_ShaderFactory.setBuffersAndAttributes(this.colorProgramInfo.attrSetters, this.cubeLinesBufferInfo);
    // scale the cube in Z so it's really long
    // to represent the texture is being projected to
    // infinity
    // Set the uniforms we just computed
    G_ShaderFactory.setUniforms(this.colorProgramInfo.uniSetters, {
      u_color: [1, 1, 1, 1],
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_world: worldMatrix,
    });
    // calls gl.drawArrays or gl.drawElements
    G_ShaderFactory.drawBufferInfo(this.cubeLinesBufferInfo, gl.LINES);
  }


  // Draw the scene.
  public render() {
    var gl = this.gl;
    Device.Instance.resizeCanvasToDisplaySize(gl.canvas);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    // first draw from the POV of the light
    /**
     * lightWorldMatrix是光照摄像机的视野坐标系
     * x轴：0 1 2 3
     * y轴：4 5 6 7
     * z轴：8 9 10 11 这个其实是光照方向
     * w:  12 13 14 15 
     */
    const lightWorldMatrix = glMatrix.mat4.lookAt2(null,
      [this.settings.posX, this.settings.posY, this.settings.posZ],          // position
      [this.settings.targetX, this.settings.targetY, this.settings.targetZ], // target
      [0, 1, 0],                                              // up
    )
    let lightReverseDir = lightWorldMatrix.slice(8, 11);
    const lightProjectionMatrix = this.settings.perspective ? glMatrix.mat4.perspective(null,
      MathUtils.degToRad(this.settings.fieldOfView),
      this.settings.projWidth / this.settings.projHeight,
      0.5,  // near
      100)   // far
      : glMatrix.mat4.ortho(null,
        -this.settings.projWidth / 2,   // left
        this.settings.projWidth / 2,   // right
        -this.settings.projHeight / 2,  // bottom
        this.settings.projHeight / 2,  // top
        0.5,                      // near
        100);                      // far

    // draw to the depth texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
    gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
    //c创建一个标准的纹理矩阵，其实这个纹理矩阵所形成的空间坐标系是一个废话
    //因为一个点的位置与这个矩阵相乘，这个点的位置不会发生任何变化
    //它真正发挥作用的是在第二次绘制的时候对他的赋值
    let texMatrix = glMatrix.mat4.identity(null);
    this.drawScene(lightProjectionMatrix, lightWorldMatrix, texMatrix, lightReverseDir, this.colorProgramInfo);

    // now draw scene to the canvas projecting the depth texture into the scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let textureMatrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.multiply(textureMatrix, textureMatrix, lightProjectionMatrix);
    // use the inverse of this world matrix to make
    // a matrix that will transform other positions
    // to be relative this this world space.
    glMatrix.mat4.multiply(textureMatrix, textureMatrix, glMatrix.mat4.invert(null, lightWorldMatrix));

    // Compute the projection matrix
    const aspect = gl.canvas.width / gl.canvas.height;
    const projectionMatrix = glMatrix.mat4.perspective(null, this.fieldOfViewRadians, aspect, 1, 200);
    // Compute the camera's matrix using look at.
    const cameraPosition = [this.settings.cameraX, this.settings.cameraY, this.settings.cameraZ];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const cameraMatrix = glMatrix.mat4.lookAt2(null, cameraPosition, target, up);
    this.drawScene(projectionMatrix, cameraMatrix, textureMatrix, lightReverseDir, this.textureProgramInfo);
    // ------ Draw the frustum ------
    let matMatrix = glMatrix.mat4.multiply(null, lightWorldMatrix, glMatrix.mat4.invert(null, lightProjectionMatrix));
    this.drawFrustum(projectionMatrix,cameraMatrix, matMatrix);
    
  }
}

class ShadowLight_WebGl2 {
  private gl: WebGLRenderingContext
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }
  private textureProgramInfo: ShaderData;
  private colorProgramInfo: ShaderData;
  private sphereBufferInfo: any;
  private planeBufferInfo: any;
  private cubeBufferInfo: any;
  private cubeLinesBufferInfo: any;

  private settings: any;
  public run(): void {
    // setup GLSL programs
    this.textureProgramInfo = G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);
    this.colorProgramInfo = G_ShaderFactory.createProgramInfo(colorvertexshader, colorfragmentshader);
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
    this.cubeLinesBufferInfo = G_ShaderFactory.createBufferInfoFromArrays({
      position: [
        -1, -1, -1,
        1, -1, -1,
        -1, 1, -1,
        1, 1, -1,
        -1, -1, 1,
        1, -1, 1,
        -1, 1, 1,
        1, 1, 1,
      ],
      indices: [
        0, 1,
        1, 3,
        3, 2,
        2, 0,

        4, 5,
        5, 7,
        7, 6,
        6, 4,

        0, 4,
        1, 5,
        3, 7,
        2, 6,
      ],
    });
    this.createTexture();
    this.setUI();
    this.createUniform();
    this.render();
  }
  private depthTexture: WebGLTexture;
  private checkerboardTexture: WebGLTexture;
  private depthFramebuffer: WebGLFramebuffer;
  private depthTextureSize: number
  private createTexture(): void {
    var gl = this.gl;
    // make a 8x8 checkerboard texture
    this.checkerboardTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.checkerboardTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,                // mip level
      gl.LUMINANCE,     // internal format
      8,                // width
      8,                // height
      0,                // border
      gl.LUMINANCE,     // format
      gl.UNSIGNED_BYTE, // type
      new Uint8Array([  // data
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
      ]));
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    //创建帧缓冲
    this.depthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
    //深度纹理附件
    this.depthTexture = gl.createTexture();
    this.depthTextureSize = 512;//设置这张纹理的尺寸512*512
    gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,      // target
      0,                  // mip level
      gl.DEPTH_COMPONENT, // internal format
      this.depthTextureSize,   // width
      this.depthTextureSize,   // height
      0,                  // border
      gl.DEPTH_COMPONENT, // format
      gl.UNSIGNED_INT,    // type  //通道数是4 每一位大小是1个字节
      null);              // data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,       // target
      gl.DEPTH_ATTACHMENT,  // attachment point 将指定的纹理绑定到帧缓冲的深度附件中
      gl.TEXTURE_2D,        // texture target
      this.depthTexture,    // texture
      0);                   // mip level

    //颜色纹理附件
    // create a color texture of the same size as the depth texture
    // see article why this is needed_
    var unusedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.depthTextureSize,
      this.depthTextureSize,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // attach it to the framebuffer
    //将颜色纹理附件附加到帧缓存
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,        // target
      gl.COLOR_ATTACHMENT0,  // attachment point 将指定的纹理绑定到帧缓冲的颜色附件中
      gl.TEXTURE_2D,         // texture target
      unusedTexture,         // texture
      0);                    // mip level
  }
  private setUI(): void {
    this.settings = {
      cameraX: 6, //普通摄像机的x轴坐标
      cameraY: 12, //普通摄像机的y轴坐标
      cameraZ: 15,//普通摄像机的z轴坐标
      posX: 2.5, //光照摄像机的x轴坐标
      posY: 4.8, //光照摄像机的y轴坐标
      posZ: 7,   //光照摄像机的z轴坐标
      targetX: 3.5, //光照摄像机看向的目标的x轴坐标
      targetY: 0,   //光照摄像机看向的目标的y轴坐标
      targetZ: 3.5, //光照摄像机看向的目标的z轴坐标
      projWidth: 10, //光照摄像机渲染的屏幕宽度
      projHeight: 10, //光照摄像机渲染的屏幕高度
      perspective: false, //是否为透视投影
      fieldOfView: 120,   //视角fov
      bias: -0.006,
    };
    var webglLessonsUI = window["webglLessonsUI"]
    webglLessonsUI.setupUI(document.querySelector('#ui'), this.settings, [
      { type: 'slider', key: 'cameraX', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'cameraY', min: 1, max: 20, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'cameraZ', min: 10, max: 200, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'posX', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'posY', min: 1, max: 20, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'posZ', min: 1, max: 20, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'targetX', min: -10, max: 10, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'targetY', min: 0, max: 20, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'targetZ', min: -10, max: 20, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'projWidth', min: 0, max: 100, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'slider', key: 'projHeight', min: 0, max: 100, change: this.render.bind(this), precision: 2, step: 0.001, },
      { type: 'checkbox', key: 'perspective', change: this.render.bind(this), },
      { type: 'slider', key: 'fieldOfView', min: 1, max: 179, change: this.render.bind(this), },
      { type: 'slider', key: 'bias', min: -0.01, max: 0.00001, change: this.render.bind(this), precision: 4, step: 0.0001, },
    ]);
  }

  /**
   * 绘制场景
   * @param pMatrix 投影矩阵
   * @param vMatrix  相机矩阵
   * @param texMatrix 纹理矩阵 主要作用就是去算出投影的uv坐标
   * @param lightReverseDir 光的反射反向
   * @param programInfo 
   */
  drawScene(pMatrix, vMatrix, texMatrix, lightReverseDir, programInfo: ShaderData) {
    // Make a view matrix from the camera matrix.
    var gl = this.gl;
    const viewMatrix = glMatrix.mat4.invert(null, vMatrix);

    gl.useProgram(programInfo.spGlID);

    // set uniforms that are the same for both the sphere and plane
    // note: any values with no corresponding uniform in the shader
    // are ignored.
    G_ShaderFactory.setUniforms(programInfo.uniSetters, {
      u_view: viewMatrix,
      u_projection: pMatrix,
      u_bias: this.settings.bias,
      u_textureMatrix: texMatrix,
      u_projectedTexture: this.depthTexture,
      u_reverseLightDirection: lightReverseDir,
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
      u_colorMult: [0.5, 0.5, 1, 1],  // lightblue
      u_color: [1, 0, 0, 1],
      u_texture: this.checkerboardTexture,
      u_world: glMatrix.mat4.translation(null,0, 0, 0),
    };
    this.sphereUniforms = {
      u_colorMult: [1, 0.5, 0.5, 1],  // pink
      u_color: [0, 0, 1, 1],
      u_texture: this.checkerboardTexture,
      u_world: glMatrix.mat4.translation(null,2, 3, 4),
    };
    this.cubeUniforms = {
      u_colorMult: [0.5, 1, 0.5, 1],  // lightgreen
      u_color: [0, 0, 1, 1],
      u_texture: this.checkerboardTexture,
      u_world: glMatrix.mat4.translation(null,3, 1, 0),
    };
  }

 /**
  * 绘制光源
  * @param projectionMatrix 
  * @param cameraMatrix 
  * @param worldMatrix 
  */
  private drawFrustum(projectionMatrix,cameraMatrix,worldMatrix) {
    var gl = this.gl;
    const viewMatrix = glMatrix.mat4.invert(null, cameraMatrix);
    gl.useProgram(this.colorProgramInfo.spGlID);
    // Setup all the needed attributes.
    G_ShaderFactory.setBuffersAndAttributes(this.colorProgramInfo.attrSetters, this.cubeLinesBufferInfo);
    // scale the cube in Z so it's really long
    // to represent the texture is being projected to
    // infinity
    // Set the uniforms we just computed
    G_ShaderFactory.setUniforms(this.colorProgramInfo.uniSetters, {
      u_color: [1, 1, 1, 1],
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_world: worldMatrix,
    });
    // calls gl.drawArrays or gl.drawElements
    G_ShaderFactory.drawBufferInfo(this.cubeLinesBufferInfo, gl.LINES);
  }


  // Draw the scene.
  public render() {
    var gl = this.gl;
    Device.Instance.resizeCanvasToDisplaySize(gl.canvas);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    // first draw from the POV of the light
    /**
     * lightWorldMatrix是光照摄像机的视野坐标系
     * x轴：0 1 2 3
     * y轴：4 5 6 7
     * z轴：8 9 10 11 这个其实是光照方向
     * w:  12 13 14 15 
     */
    const lightWorldMatrix = glMatrix.mat4.lookAt2(null,
      [this.settings.posX, this.settings.posY, this.settings.posZ],          // position
      [this.settings.targetX, this.settings.targetY, this.settings.targetZ], // target
      [0, 1, 0],                                              // up
    )
    let lightReverseDir = lightWorldMatrix.slice(8, 11);
    const lightProjectionMatrix = this.settings.perspective ? glMatrix.mat4.perspective(null,
      MathUtils.degToRad(this.settings.fieldOfView),
      this.settings.projWidth / this.settings.projHeight,
      0.5,  // near
      100)   // far
      : glMatrix.mat4.ortho(null,
        -this.settings.projWidth / 2,   // left
        this.settings.projWidth / 2,   // right
        -this.settings.projHeight / 2,  // bottom
        this.settings.projHeight / 2,  // top
        0.5,                      // near
        100);                      // far

    // draw to the depth texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
    gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
    //c创建一个标准的纹理矩阵，其实这个纹理矩阵所形成的空间坐标系是一个废话
    //因为一个点的位置与这个矩阵相乘，这个点的位置不会发生任何变化
    //它真正发挥作用的是在第二次绘制的时候对他的赋值
    let texMatrix = glMatrix.mat4.identity(null);
    this.drawScene(lightProjectionMatrix, lightWorldMatrix, texMatrix, lightReverseDir, this.colorProgramInfo);

    // now draw scene to the canvas projecting the depth texture into the scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let textureMatrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.multiply(textureMatrix, textureMatrix, lightProjectionMatrix);
    // use the inverse of this world matrix to make
    // a matrix that will transform other positions
    // to be relative this this world space.
    glMatrix.mat4.multiply(textureMatrix, textureMatrix, glMatrix.mat4.invert(null, lightWorldMatrix));

    // Compute the projection matrix
    const aspect = gl.canvas.width / gl.canvas.height;
    const projectionMatrix = glMatrix.mat4.perspective(null, this.fieldOfViewRadians, aspect, 1, 200);
    // Compute the camera's matrix using look at.
    const cameraPosition = [this.settings.cameraX, this.settings.cameraY, this.settings.cameraZ];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const cameraMatrix = glMatrix.mat4.lookAt2(null, cameraPosition, target, up);
    this.drawScene(projectionMatrix, cameraMatrix, textureMatrix, lightReverseDir, this.textureProgramInfo);
    // ------ Draw the frustum ------
    let matMatrix = glMatrix.mat4.multiply(null, lightWorldMatrix, glMatrix.mat4.invert(null, lightProjectionMatrix));
    this.drawFrustum(projectionMatrix,cameraMatrix, matMatrix);
    
  }
}




export default class ShaderShadowTest {
  static run() {
    // main();
    new ShadowLight_WebGl2(Device.Instance.gl).run();
  }

}