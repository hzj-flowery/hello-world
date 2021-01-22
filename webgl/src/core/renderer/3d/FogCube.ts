import { SY } from "../base/Sprite";
import { glprimitive_type } from "../gfx/GLEnums";
import { ShaderUseVariantType } from "../shader/ShaderUseVariantType";


var vertexshader3d =
    `attribute vec4 a_position;
  attribute vec2 a_uv;

  uniform mat4 u_MMatrix;
  uniform mat4 u_VMatrix;
  uniform mat4 u_PMatrix;

  varying vec2 v_texcoord;
  varying vec3 v_position;
  void main() {
  gl_Position = u_PMatrix*u_VMatrix*u_MMatrix*a_position;
  v_texcoord = a_uv;
  v_position = (u_VMatrix*u_MMatrix * a_position).xyz;
  }`
var fragmentshader3d =
    `precision mediump float;
  varying vec2 v_texcoord;
  varying vec3 v_position;
  uniform sampler2D u_texture;
  uniform vec4 u_fogColor;
  uniform float u_fogDensity;
  void main() {
  vec4 color = texture2D(u_texture, v_texcoord);
  float fogDistance = length(v_position);
  float fogAmount = 1. - exp2(-u_fogDensity * u_fogDensity * fogDistance * fogDistance * 1.442695);
  fogAmount = clamp(fogAmount, 0., 1.);
  gl_FragColor = mix(color, u_fogColor, fogAmount);
  }
  `

var positions = [
    -0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,

    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,

    -0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,

    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5, 0.5,

    -0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,

    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, 0.5, 0.5,
]
var texcoord = [
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,

    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,

    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,

    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,

    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,

    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,
]

export class FogCube extends SY.SpriteBase {
    constructor() {
        super();
        this._glPrimitiveType = glprimitive_type.TRIANGLES;
    }
    onInit(): void {
        this.createVertexsBuffer(positions, 3);
        this.createUVsBuffer(texcoord, 2);
        this._vertStr = vertexshader3d;
        this._fragStr = fragmentshader3d;
    }
    onShader() {
        this._shader.pushShaderVariant(ShaderUseVariantType.Fog);
    }
}