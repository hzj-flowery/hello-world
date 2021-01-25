// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

import enums from "../camera/enums";
import { glMatrix } from "../../math/Matrix";
import FrameBuffer from "../gfx/FrameBuffer";
import Vec3, { sy_v3 } from "../../value-types/vec3";
import { sy_mat4, Mat4 } from "../../value-types/mat4";
import { Mat3 } from "../../value-types/mat3";
import { toRadian } from "../../value-types/utils";


const _forward = sy_v3(0, 0, -1);

let _m4_tmp = sy_mat4();
let _m3_tmp = Mat3.create();
let _transformedLightDirection = sy_v3(0, 0, 0);

// compute light viewProjMat for shadow.
function _computeSpotLightViewProjMatrix(light, outView, outProj) {
  // view matrix
  light._node.getWorldRT(outView);
  glMatrix.mat4.invert(outView, outView);

  // proj matrix
  glMatrix.mat4.perspective(outProj, light._spotAngle * light._spotAngleScale, 1, light._shadowMinDepth, light._shadowMaxDepth);
}

function _computeDirectionalLightViewProjMatrix(light, outView, outProj) {
  // view matrix
  light._node.getWorldRT(outView);
  glMatrix.mat4.invert(outView, outView);

  // TODO: should compute directional light frustum based on rendered meshes in scene.
  // proj matrix
  let halfSize = light._shadowFrustumSize / 2;
  glMatrix.mat4.ortho(outProj, -halfSize, halfSize, -halfSize, halfSize, light._shadowMinDepth, light._shadowMaxDepth);
}

function _computePointLightViewProjMatrix(light, outView, outProj) {
  // view matrix
  light._node.getWorldRT(outView);
  glMatrix.mat4.invert(outView, outView);

  // The transformation from Cartesian to polar coordinates is not a linear function,
  // so it cannot be achieved by means of a fixed matrix multiplication.
  // Here we just use a nearly 180 degree perspective matrix instead.
  glMatrix.mat4.perspective(outProj, glMatrix.glMatrix.toRadian(179), 1, light._shadowMinDepth, light._shadowMaxDepth);
}

/**
 * A representation of a light source.
 * Could be a point light, a spot light or a directional light.
 */
export default class Light  extends Node{
  /**
   * Setup a default directional light with no shadows
   */
  private _poolID:number;
  private _node:Node;
  private _type:number;
  private _color:Vec3;
  private _intensity:number;
  private _range:number;
  private _spotAngle:number;
  private _spotExp:number;
  private _directionUniform:Float32Array;
  private _positionUniform:Float32Array;
  private _colorUniform:Float32Array;
  private _spotUniform:Float32Array;

  // shadow params
   private  _shadowType:number;
   private  _shadowFrameBuffer:FrameBuffer;
   private  _shadowMap:any;
   private  _shadowMapDirty:boolean;
   private  _shadowDepthBuffer:any;
   private  _shadowResolution:number;
   private  _shadowBias:number;
   private  _shadowDarkness:number;
   private  _shadowMinDepth:number;
   private  _shadowMaxDepth:number;
   private  _frustumEdgeFalloff:number; // used by directional and spot light.
   private  _viewProjMatrix:Mat4;
   private  _spotAngleScale:number; // used for spot light.
   private  _shadowFrustumSize:number; // used for directional light.

   /**
   * Setup a default directional light with no shadows
   */
  constructor() {
    super();
    this._poolID = -1;
    this._node = null;

    this._type = enums.LIGHT_DIRECTIONAL;

    this._color = new Vec3(1, 1, 1);
    this._intensity = 1;

    // used for spot and point light
    this._range = 1;
    // used for spot light, default to 60 degrees
    this._spotAngle = toRadian(60);
    this._spotExp = 1;
    // cached for uniform
    this._directionUniform = new Float32Array(3);
    this._positionUniform = new Float32Array(3);
    this._colorUniform = new Float32Array([this._color.x * this._intensity, this._color.y * this._intensity, this._color.z * this._intensity]);
    this._spotUniform = new Float32Array([Math.cos(this._spotAngle * 0.5), this._spotExp]);

    // shadow params
    this._shadowType = enums.SHADOW_NONE;
    this._shadowFrameBuffer = null;
    this._shadowMap = null;
    this._shadowMapDirty = false;
    this._shadowDepthBuffer = null;
    this._shadowResolution = 1024;
    this._shadowBias = 0.0005;
    this._shadowDarkness = 1;
    this._shadowMinDepth = 1;
    this._shadowMaxDepth = 1000;
    this._frustumEdgeFalloff = 0; // used by directional and spot light.
    this._viewProjMatrix = sy_mat4();
    this._spotAngleScale = 1; // used for spot light.
    this._shadowFrustumSize = 50; // used for directional light.
  }

  /**
   * Get the hosting node of this camera
   * @returns {Node} the hosting node
   */
  getNode() {
    return this._node;
  }

  /**
   * Set the hosting node of this camera
   * @param {Node} node the hosting node
   */
  setNode(node) {
    this._node = node;
  }

  /**
   * set the color of the light source
   * @param {number} r red channel of the light color
   * @param {number} g green channel of the light color
   * @param {number} b blue channel of the light color
   */
  setColor(r, g, b) {
    Vec3.set(this._color, r, g, b);
    this._colorUniform[0] = r * this._intensity;
    this._colorUniform[1] = g * this._intensity;
    this._colorUniform[2] = b * this._intensity;
  }

  /**
   * get the color of the light source
   * @returns {Vec3} the light color
   */
  get color() {
    return this._color;
  }

  /**
   * set the intensity of the light source
   * @param {number} val the light intensity
   */
  setIntensity(val) {
    this._intensity = val;
    this._colorUniform[0] = val * this._color.x;
    this._colorUniform[1] = val * this._color.y;
    this._colorUniform[2] = val * this._color.z;
  }

  /**
   * get the intensity of the light source
   * @returns {number} the light intensity
   */
  get intensity() {
    return this._intensity;
  }

  /**
   * set the type of the light source
   * @param {number} type light source type
   */
  setType(type) {
    this._type = type;
  }

  /**
   * get the type of the light source
   * @returns {number} light source type
   */
  get type() {
    return this._type;
  }

  /**
   * set the spot light angle
   * @param {number} val spot light angle
   */
  setSpotAngle(val) {
    this._spotAngle = val;
    this._spotUniform[0] = Math.cos(this._spotAngle * 0.5);
  }

  /**
   * get the spot light angle
   * @returns {number} spot light angle
   */
  get spotAngle() {
    return this._spotAngle;
  }

  /**
   * set the spot light exponential
   * @param {number} val spot light exponential
   */
  setSpotExp(val) {
    this._spotExp = val;
    this._spotUniform[1] = val;
  }

  /**
   * get the spot light exponential
   * @returns {number} spot light exponential
   */
  get spotExp() {
    return this._spotExp;
  }

  /**
   * set the range of the light source
   * @param {number} val light source range
   */
  setRange(val) {
    this._range = val;
  }

  /**
   * get the range of the light source
   * @returns {number} range of the light source
   */
  get range() {
    return this._range;
  }

  /**
   * set the shadow type of the light source
   * @param {number} type light source shadow type
   */
  setShadowType(type) {
    if (this._shadowType === enums.SHADOW_NONE && type !== enums.SHADOW_NONE) {
      this._shadowMapDirty = true;
    }
    this._shadowType = type;
  }

  /**
   * get the shadow type of the light source
   * @returns {number} light source shadow type
   */
  get shadowType() {
    return this._shadowType;
  }

  /**
   * get the shadowmap of the light source
   * @returns {Texture2D} light source shadowmap
   */
  get shadowMap() {
    return this._shadowMap;
  }

  /**
   * get the view-projection matrix of the light source
   * @returns {Mat4} light source view-projection matrix
   */
  get viewProjMatrix() {
    return this._viewProjMatrix;
  }

  /**
   * set the shadow resolution of the light source
   * @param {number} val light source shadow resolution
   */
  setShadowResolution(val) {
    if (this._shadowResolution !== val) {
      this._shadowMapDirty = true;
    }
    this._shadowResolution = val;
  }

  /**
   * get the shadow resolution of the light source
   * @returns {number} light source shadow resolution
   */
  get shadowResolution() {
    return this._shadowResolution;
  }

  /**
   * set the shadow bias of the light source
   * @param {number} val light source shadow bias
   */
  setShadowBias(val) {
    this._shadowBias = val;
  }

  /**
   * get the shadow bias of the light source
   * @returns {number} light source shadow bias
   */
  get shadowBias() {
    return this._shadowBias;
  }

  /**
   * set the shadow darkness of the light source
   * @param {number} val light source shadow darkness
   */
  setShadowDarkness(val) {
    this._shadowDarkness = val;
  }

  /**
   * get the shadow darkness of the light source
   * @returns {number} light source shadow darkness
   */
  get shadowDarkness() {
    return this._shadowDarkness;
  }

  /**
   * set the shadow min depth of the light source
   * @param {number} val light source shadow min depth
   */
  setShadowMinDepth(val) {
    this._shadowMinDepth = val;
  }

  /**
   * get the shadow min depth of the light source
   * @returns {number} light source shadow min depth
   */
  get shadowMinDepth() {
    if (this._type === enums.LIGHT_DIRECTIONAL) {
      return 1.0;
    }
    return this._shadowMinDepth;
  }

  /**
   * set the shadow max depth of the light source
   * @param {number} val light source shadow max depth
   */
  setShadowMaxDepth(val) {
    this._shadowMaxDepth = val;
  }

  /**
   * get the shadow max depth of the light source
   * @returns {number} light source shadow max depth
   */
  get shadowMaxDepth() {
    if (this._type === enums.LIGHT_DIRECTIONAL) {
      return 1.0;
    }
    return this._shadowMaxDepth;
  }

  /**
   * set the frustum edge falloff of the light source
   * @param {number} val light source frustum edge falloff
   */
  setFrustumEdgeFalloff(val) {
    this._frustumEdgeFalloff = val;
  }

  /**
   * get the frustum edge falloff of the light source
   * @returns {number} light source frustum edge falloff
   */
  get frustumEdgeFalloff() {
    return this._frustumEdgeFalloff;
  }

  /**
   * set the shadow frustum size of the light source
   * @param {number} val light source shadow frustum size
   */
  setShadowFrustumSize(val) {
    this._shadowFrustumSize = val;
  }

  /**
   * get the shadow frustum size of the light source
   * @returns {number} light source shadow frustum size
   */
  get shadowFrustumSize() {
    return this._shadowFrustumSize;
  }

  /**
   * extract a view of this light source
   * @param {View} out the receiving view
   * @param {string[]} stages the stages using the view
   */
  extractView(out, stages) {
    // TODO: view should not handle light.
    out._shadowLight = this;

    // priority. TODO: use varying value for shadow view?
    out._priority = -1;

    // rect
    out._rect.x = 0;
    out._rect.y = 0;
    out._rect.w = this._shadowResolution;
    out._rect.h = this._shadowResolution;

    // clear opts
    Vec3.set(out._color, 1, 1, 1);
    out._depth = 1;
    out._stencil = 1;
    out._clearFlags = enums.CLEAR_COLOR | enums.CLEAR_DEPTH;

    // stages & framebuffer
    out._stages = stages;
    out._framebuffer = this._shadowFrameBuffer;

    // view projection matrix
    switch(this._type) {
      case enums.LIGHT_SPOT:
        _computeSpotLightViewProjMatrix(this, out._matView, out._matProj);
        break;

      case enums.LIGHT_DIRECTIONAL:
        _computeDirectionalLightViewProjMatrix(this, out._matView, out._matProj);
        break;

      case enums.LIGHT_POINT:
        _computePointLightViewProjMatrix(this, out._matView, out._matProj);
        break;
      case enums.LIGHT_AMBIENT:
        break;
      default:
        console.warn('shadow of this light type is not supported');
    }

    // view-projection
    Mat4.mul(out._matViewProj, out._matProj, out._matView);
    this._viewProjMatrix = out._matViewProj;
    Mat4.invert(out._matInvViewProj, out._matViewProj);

    // update view's frustum
    // out._frustum.update(out._matViewProj, out._matInvViewProj);

    out._cullingMask = 0xffffffff;
  }

  //更新光的位置和方向
  _updateLightPositionAndDirection() {
    // this._node.getWorldMatrix(_m4_tmp);
    // Mat3.fromMat4(_m3_tmp, _m4_tmp);
    // Vec3.transformMat3(_transformedLightDirection, _forward, _m3_tmp);
    // Vec3.toArray(this._directionUniform, _transformedLightDirection);
    // let pos = this._positionUniform;
    // let m = _m4_tmp.m;
    // pos[0] = m[12];
    // pos[1] = m[13];
    // pos[2] = m[14];
  }

  _generateShadowMap(device) {
    // this._shadowMap = new gfx.Texture2D(device, {
    //   width: this._shadowResolution,
    //   height: this._shadowResolution,
    //   format: gfx.TEXTURE_FMT_RGBA8,
    //   wrapS: gfx.WRAP_CLAMP,
    //   wrapT: gfx.WRAP_CLAMP,
    // });
    // this._shadowDepthBuffer = new gfx.RenderBuffer(device,
    //   gfx.RB_FMT_D16,
    //   this._shadowResolution,
    //   this._shadowResolution
    // );
    // this._shadowFrameBuffer = new gfx.FrameBuffer(device, this._shadowResolution, this._shadowResolution, {
    //   colors: [this._shadowMap],
    //   depth: this._shadowDepthBuffer,
    // });
  }

  _destroyShadowMap() {
    if (this._shadowMap) {
      this._shadowMap.destroy();
      this._shadowDepthBuffer.destroy();
      this._shadowFrameBuffer.destroy();
      this._shadowMap = null;
      this._shadowDepthBuffer = null;
      this._shadowFrameBuffer = null;
    }
  }

  /**
   * update the light source
   * @param {Device} device the rendering device
   */
  update(device) {
    this._updateLightPositionAndDirection();

    if (this._shadowType === enums.SHADOW_NONE) {
      this._destroyShadowMap();
    } else if (this._shadowMapDirty) {
      this._destroyShadowMap();
      this._generateShadowMap(device);
      this._shadowMapDirty = false;
    }

  }
}
