
import { SY } from "../../base/Sprite";

/**
 * var vertextBaseCode =
    'attribute vec3 a_position;' +
    'attribute vec3 a_normal;' +
    'attribute vec2 a_uv;' +

    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_Pmat;' +
    'varying vec3 v_normal;' +
    'varying vec2 v_uv;' +

    'void main() {' +
    'gl_Position = u_Pmat * u_MVMatrix * vec4(a_position, 1.0);' +
    'v_uv = a_uv;' +
    '}'
//基础的shader的片段着色器
var fragBaseCode =
    'precision mediump float;' +

    'varying vec2 v_uv;' +
    'uniform samplerCube u_skybox;'+
    'uniform sampler2D u_texture;' +
    'uniform mat4 u_PVMmat_I;'+
    'uniform vec4 u_color;' +
    'uniform vec4 u_color_dir;' +
    
    'void main() {' +
    'gl_FragColor = texture2D(u_texture, v_uv);' +
    '}'

    'uniform mat4 u_Pmat;' +
    'uniform mat4 u_Mmat;' +
    'uniform mat4 u_Vmat;' +
 */
var vs  = 
'attribute vec4 a_position;'+
'attribute vec4 a_weight;'+
'attribute vec4 a_boneNdx;'+

'uniform mat4 u_Pmat;'+
'uniform mat4 u_Vmat;'+
'uniform sampler2D boneMatrixTexture;'+
'uniform float numBones;'+

// these offsets assume the texture is 4 pixels across
// ' #define ROW0_U ((0.5 + 0.0) / 4.)'+
// ' #define ROW1_U ((0.5 + 1.0) / 4.)'+
// ' #define ROW2_U ((0.5 + 2.0) / 4.)'+
// ' #define ROW3_U ((0.5 + 3.0) / 4.)'+

'mat4 getBoneMatrix(float boneNdx) {'+
  'float v = (boneNdx + 0.5) / numBones;'+
  'return mat4('+
    'texture2D(boneMatrixTexture, vec2((0.5 + 0.0) / 4., v)),'+
    'texture2D(boneMatrixTexture, vec2((0.5 + 1.0) / 4., v)),'+
    'texture2D(boneMatrixTexture, vec2((0.5 + 2.0) / 4., v)),'+
    'texture2D(boneMatrixTexture, vec2((0.5 + 3.0) / 4., v)));'+
'}'+

'void main() {'+

  'gl_Position = u_Pmat * u_Vmat *'+
                '(getBoneMatrix(a_boneNdx[0]) * a_position * a_weight[0] +'+
                 'getBoneMatrix(a_boneNdx[1]) * a_position * a_weight[1] +'+
                 'getBoneMatrix(a_boneNdx[2]) * a_position * a_weight[2] +'+
                 'getBoneMatrix(a_boneNdx[3]) * a_position * a_weight[3]);'+

'}'
var fs = 
'precision mediump float;'+
'uniform vec4 color;'+
'void main () {'+
  'gl_FragColor = color;'+
'}'
var vs2 = 
'attribute vec4 a_position;'+

'uniform mat4 u_Pmat;'+
'uniform mat4 u_Vmat;'+
'uniform mat4 u_Mmat;'+

'void main() {'+
  'gl_Position = u_Pmat * u_Vmat * u_Mmat * a_position;'+
'}'



export default class SkinMesh extends SY.SpriteBase{
      constructor(){
           super();
      }
      protected onInit():void{

      }
}