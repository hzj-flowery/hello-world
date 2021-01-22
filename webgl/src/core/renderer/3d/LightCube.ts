import { SY } from "../base/Sprite";
import { CubeData } from "../data/CubeData";
import { glprimitive_type } from "../gfx/GLEnums";
import { ShaderUseVariantType } from "../shader/ShaderUseVariantType";

/**
 * 如果将三维物体的朝向和光的方向点乘， 结果为 1 则物体朝向和光照方向相同，为 -1 则物体朝向和光照方向相反
 * 所以应该是发现和光的反向相乘，再乘以光的颜色，就是光反射的颜色，
 */
var vertexshader3d = 
'attribute vec4 a_position;'+
'attribute vec3 a_normal;'+
'attribute vec2 a_uv;' +
'uniform mat4 u_MMatrix;' +
'uniform mat4 u_VMatrix;' +
'uniform mat4 u_PMatrix;' +
'uniform mat4 u_MITMatrix;' +  //模型的世界矩阵
'varying vec2 v_uv;' +
'varying vec3 v_normal;'+
'void main() {'+
  // Multiply the position by the matrix.
  'gl_Position = u_PMatrix *u_VMatrix*u_MMatrix* a_position;'+
  // Pass the normal to the fragment shader
  'v_normal = mat3(u_MITMatrix)* a_normal;'+
  'v_uv = a_uv;' +
'}' 

var fragmentshader3d = 
'precision mediump float;'+
// Passed in from the vertex shader.
'varying vec3 v_normal;'+                //法线
'uniform vec3 u_lightColorDir;'+ //光的方向
'uniform vec4 u_lightColor;'+               //光照
'uniform sampler2D u_texCoord;' +     //纹理
'varying vec2 v_uv;' +

'void main() {'+

   'vec4 texColor = texture2D(u_texCoord, v_uv);'+
  // because v_normal is a varying it's interpolated
  // so it will not be a unit vector. Normalizing it
  // will make it a unit vector again
  'vec3 normal = normalize(v_normal);'+

  'float light = dot(normal, -u_lightColorDir);'+ //算出光照强度

  'gl_FragColor = u_lightColor*texColor;'+ //将光的颜色和纹理的颜色相乘 

  // Lets multiply just the color portion (not the alpha)
  // by the light
  'gl_FragColor.rgb *= light;'+ 
'}'

/**
 * 光照立方体
 */
export default class LightCube extends SY.SpriteBase {
    constructor() {
        super();
        this.name = "LightCube";
    }
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex,rd.dF.vertex_item_size);
        this.createUVsBuffer(rd.uvData,rd.dF.uv_item_size);
        this.createIndexsBuffer(rd.indexs);
        this.createNormalsBuffer(rd.normals,rd.dF.normal_item_size);
        this._vertStr = vertexshader3d;
        this._fragStr = fragmentshader3d;
        this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
    }
    protected onShader(){
      this._shader.pushShaderVariant(ShaderUseVariantType.ModelInverseTransform);
      this._shader.pushShaderVariant(ShaderUseVariantType.Parallel);
    }
}