import Device from "../../../Device";
import { glMatrix } from "../../Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { SY } from "../base/Sprite";
import { syPrimitives } from "../shader/Primitives";
import { BufferAttribsData, G_ShaderFactory, ShaderData } from "../shader/Shader";


var vertexColorVertexShader =
  'attribute vec4 a_position;' +
  'attribute vec4 a_color;' +
  'uniform mat4 u_worldViewProjection;' +
  'varying vec4 v_color;' +
  'void main() {' +
  'gl_Position = u_worldViewProjection * a_position;' +
  'v_color = a_color;' +
  '}'

var vertexColorFragmentShader =
  'precision mediump float;' +
  'uniform vec4 u_color;' +
  'varying vec4 v_color;' +
  'void main() {' +
  'gl_FragColor = u_color * v_color;' +
  '}'

var baseVertexShader =
  'attribute vec4 a_position;' +
  'attribute vec4 a_color;' +
  'uniform mat4 u_worldViewProjection;' +
  'uniform mat4 u_exampleWorldViewProjection;' +
  'varying vec4 v_color;' +
  'varying vec4 v_position;' +
  'void main() {' +
  'gl_Position = u_worldViewProjection * a_position;' +
  'v_position = u_exampleWorldViewProjection * a_position;' +
  'v_position = v_position / v_position.w;' +
  'v_color = a_color;' +
  '}'
var colorFragmentShader =
  'precision mediump float;' +
  'varying vec4 v_color;' +
  'varying vec4 v_position;' +
  'uniform vec4 u_color;' +
  'void main() {' +
  'bool blend = (v_position.x < -1.0 || v_position.x > 1.0 ||' +
  'v_position.y < -1.0 || v_position.y > 1.0 ||' +
  'v_position.z < -1.0 || v_position.z > 1.0);' +
  'vec4 blendColor = blend ? vec4(0.35, 0.35, 0.35, 1.0) : vec4(1, 1, 1, 1);' +
  'gl_FragColor = v_color * u_color * blendColor;' +
  '}'

  
var darkColors = {
    lines: [1, 1, 1, 1],
};
var lightColors = {
    lines: [0, 0, 0, 1],
};

var darkMatcher = window.matchMedia("(prefers-color-scheme: dark)");
var isDarkMode = darkMatcher.matches;
var colors = isDarkMode ? darkColors : lightColors;
var eyeElem: any = document.querySelector("#eye");

  var wireCubeArrays = {
    position: [
      -1, 1, -1,
      1, 1, -1,
      1, -1, -1,
      -1, -1, -1,
  
      -1, 1, 1,
      1, 1, 1,
      1, -1, 1,
      -1, -1, 1,
    ],
    color: [
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
  
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
    ],
    indices: [
      0, 1, 1, 2, 2, 3, 3, 0,
      4, 5, 5, 6, 6, 7, 7, 4,
      0, 4, 1, 5, 2, 6, 3, 7,
    ],
  };
  var tempColor = [
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
  ]
  for (var j = 0; j < 4; j++)
    tempColor.push.apply(tempColor, colors.lines);
  var cubeRaysArrays = {
    position: wireCubeArrays.position,
    color: tempColor,
    indices: [
      0, 4, 1, 5, 2, 6, 3, 7,
    ],
  };

  var faceColors = [
    [1, 0, 0, 1,],
    [0, 1, 0, 1,],
    [1, 1, 0, 1,],
    [0, 0, 1, 1,],
    [1, 0, 1, 1,],
    [0, 1, 1, 1,],
  ];
  var colorVerts = [];
  for (var f = 0; f < 6; ++f) {
    for (var v = 0; v < 4; ++v) {
      colorVerts.push.apply(colorVerts, faceColors[f]);
    }
  }

  
// globals
var pixelRatio = window.devicePixelRatio || 1;

export  class CameraFrustum extends SY.Sprite {

    private zNear = 10;//相机最近能看到的距离
    private zFar = 50;//相机最远能看到的距离
    private fieldOfView = 30;//相机张开的角度
    private aspect: number;
    // uniforms.
    private sharedUniforms = {
    };
    private frustumCubeUniforms = {
        u_color: [1, 1, 1, 0.4],
        u_worldViewProjection: new Float32Array(16),
        u_exampleWorldViewProjection: new Float32Array(16),
    };
    private cubeRaysUniforms = {
        u_color: colors.lines,
        u_worldViewProjection: new Float32Array(16),
    };
    private wireFrustumUniforms = {
        u_color: colors.lines,
        u_worldViewProjection: new Float32Array(16),
    };

    private vertexColorProgramInfo: ShaderData;
    private colorProgramInfo: ShaderData;
    private cubeRaysBufferInfo: BufferAttribsData;
    private wireCubeBufferInfo: BufferAttribsData;
    private cubeBufferInfo: BufferAttribsData;
    constructor(gl) {
        super(gl);
    }
    public static create(){
           return new CameraFrustum(Device.Instance.gl);
    }
    protected onInit(){
        this.vertexColorProgramInfo = G_ShaderFactory.createProgramInfo(vertexColorVertexShader, vertexColorFragmentShader);
        this.colorProgramInfo = G_ShaderFactory.createProgramInfo(baseVertexShader, colorFragmentShader);
        this.cubeRaysBufferInfo = G_ShaderFactory.createBufferInfoFromArrays(cubeRaysArrays);
        this.wireCubeBufferInfo = G_ShaderFactory.createBufferInfoFromArrays(wireCubeArrays);
        var cubeArrays: any = syPrimitives.createCubeVertices(2);
        delete cubeArrays.normal;
        delete cubeArrays.texcoord;
        cubeArrays.color = colorVerts;
        this.cubeBufferInfo = G_ShaderFactory.createBufferInfoFromArrays(cubeArrays);

        this.aspect = this.gl.canvas.width / (this.gl.canvas.width / 2);
        this.zFar = 50;
        this.zNear = 10;
        this.fieldOfView = 30;
    }
    public testDraw(vp:Float32Array,aspect:number,zNear:number,zFar:number,fieldOfView:number) {
        this.aspect = aspect;
        this.zNear = zNear;
        this.zFar = zFar;
        this.fieldOfView = fieldOfView;
        //绘制齐次裁切空间 六个面
        this.drawFrustumCube(vp, this.colorProgramInfo, this.cubeBufferInfo);
        //绘制四条射线
        this.drawViewCone(vp, this.vertexColorProgramInfo, this.cubeRaysBufferInfo);
        //绘制四个金属线
        this.drawFrustumWire(vp, this.vertexColorProgramInfo, this.wireCubeBufferInfo);
    }
    // Draw view cone.
    //绘制齐次裁切空间的四条射线
    private drawViewCone(vp: Float32Array, sd: ShaderData, buffAttr: BufferAttribsData) {
        const halfHeight = this.gl.canvas.height / 2;
        const width = this.gl.canvas.width;
        let proj = glMatrix.mat4.create();
        let worldTemp = glMatrix.mat4.create();
        glMatrix.mat4.perspective(
            proj,
            MathUtils.degToRad(this.fieldOfView),
            this.aspect,
            1,
            5000);
        glMatrix.mat4.invert(proj, proj);
        glMatrix.mat4.translation(worldTemp, 0, 0, 0);
        glMatrix.mat4.multiply(worldTemp, worldTemp, proj);
        glMatrix.mat4.multiply(this.cubeRaysUniforms.u_worldViewProjection, vp, worldTemp);
        this.gl.useProgram(sd.spGlID);
        G_ShaderFactory.setBuffersAndAttributes(sd.attrSetters, buffAttr);
        G_ShaderFactory.setUniforms(sd.uniSetters, this.sharedUniforms);
        G_ShaderFactory.setUniforms(sd.uniSetters, this.cubeRaysUniforms);
        G_ShaderFactory.drawBufferInfo(buffAttr, this.gl.LINES);

        const eyePosition = glMatrix.mat4.transformPoint(null, this.cubeRaysUniforms.u_worldViewProjection, [0, 0, 0]);
        const ex = (eyePosition[0] * .5 + .5) * width / pixelRatio;
        const ey = (eyePosition[1] * -.5 + .5) * halfHeight / pixelRatio;
        eyeElem.style.left = MathUtils.px(ex - eyeElem.width / 2);
        eyeElem.style.top = MathUtils.px(ey - eyeElem.height / 2);
    }
    // Draw Frustum Wire
    //绘制齐次裁切空间远近平面的边缘线
    private drawFrustumWire(vp: Float32Array, sdData: ShaderData, buffAttrData: BufferAttribsData) {
        let worldTemp = glMatrix.mat4.create();
        let proj = glMatrix.mat4.create();
        glMatrix.mat4.perspective(
            proj,
            MathUtils.degToRad(this.fieldOfView),
            this.aspect,
            this.zNear,
            this.zFar);
        glMatrix.mat4.invert(proj, proj);
        glMatrix.mat4.translation(worldTemp, 0, 0, 0);
        glMatrix.mat4.multiply(worldTemp, worldTemp, proj);
        glMatrix.mat4.multiply(this.wireFrustumUniforms.u_worldViewProjection, vp, worldTemp);
        G_ShaderFactory.setBuffersAndAttributes(sdData.attrSetters, buffAttrData);
        G_ShaderFactory.setUniforms(sdData.uniSetters, this.sharedUniforms);
        G_ShaderFactory.setUniforms(sdData.uniSetters, this.wireFrustumUniforms);
        G_ShaderFactory.drawBufferInfo(buffAttrData, this.gl.LINES);
    }
    // Draw Frustum Cube behind
    private drawFrustumCube(vp: Float32Array, shaderD: ShaderData, buffAttData: BufferAttribsData) {
        var gl = this.gl;
        Device.Instance.cullFace(false);

        let worldTemp = glMatrix.mat4.create();
        let tempProj = glMatrix.mat4.create();
        gl.useProgram(shaderD.spGlID);
        G_ShaderFactory.setBuffersAndAttributes(shaderD.attrSetters, buffAttData);
        glMatrix.mat4.perspective(
            tempProj,
            MathUtils.degToRad(this.fieldOfView),
            this.aspect,
            this.zNear,
            this.zFar);
        glMatrix.mat4.invert(tempProj, tempProj);
        glMatrix.mat4.translation(worldTemp, 0, 0, 0);
        glMatrix.mat4.multiply(worldTemp, tempProj, worldTemp);
        glMatrix.mat4.multiply(this.frustumCubeUniforms.u_worldViewProjection, vp, worldTemp);
        G_ShaderFactory.setUniforms(shaderD.uniSetters, this.sharedUniforms);
        G_ShaderFactory.setUniforms(shaderD.uniSetters, this.frustumCubeUniforms);
        G_ShaderFactory.drawBufferInfo(buffAttData);
        Device.Instance.closeCullFace();
    }
}