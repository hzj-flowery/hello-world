"use strict";
// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
Object.defineProperty(exports, "__esModule", { value: true });
var enums_1 = require("../camera/enums");
var Matrix_1 = require("../../Matrix");
var vec3_1 = require("../../value-types/vec3");
var mat4_1 = require("../../value-types/mat4");
var mat3_1 = require("../../value-types/mat3");
var utils_1 = require("../../value-types/utils");
var _forward = vec3_1.sy_v3(0, 0, -1);
var _m4_tmp = mat4_1.sy_mat4();
var _m3_tmp = mat3_1.Mat3.create();
var _transformedLightDirection = vec3_1.sy_v3(0, 0, 0);
// compute light viewProjMat for shadow.
function _computeSpotLightViewProjMatrix(light, outView, outProj) {
    // view matrix
    light._node.getWorldRT(outView);
    Matrix_1.glMatrix.mat4.invert(outView, outView);
    // proj matrix
    Matrix_1.glMatrix.mat4.perspective(outProj, light._spotAngle * light._spotAngleScale, 1, light._shadowMinDepth, light._shadowMaxDepth);
}
function _computeDirectionalLightViewProjMatrix(light, outView, outProj) {
    // view matrix
    light._node.getWorldRT(outView);
    Matrix_1.glMatrix.mat4.invert(outView, outView);
    // TODO: should compute directional light frustum based on rendered meshes in scene.
    // proj matrix
    var halfSize = light._shadowFrustumSize / 2;
    Matrix_1.glMatrix.mat4.ortho(outProj, -halfSize, halfSize, -halfSize, halfSize, light._shadowMinDepth, light._shadowMaxDepth);
}
function _computePointLightViewProjMatrix(light, outView, outProj) {
    // view matrix
    light._node.getWorldRT(outView);
    Matrix_1.glMatrix.mat4.invert(outView, outView);
    // The transformation from Cartesian to polar coordinates is not a linear function,
    // so it cannot be achieved by means of a fixed matrix multiplication.
    // Here we just use a nearly 180 degree perspective matrix instead.
    Matrix_1.glMatrix.mat4.perspective(outProj, Matrix_1.glMatrix.glMatrix.toRadian(179), 1, light._shadowMinDepth, light._shadowMaxDepth);
}
/**
 * A representation of a light source.
 * Could be a point light, a spot light or a directional light.
 */
var Light = /** @class */ (function (_super) {
    __extends(Light, _super);
    /**
    * Setup a default directional light with no shadows
    */
    function Light() {
        var _this = _super.call(this) || this;
        _this._poolID = -1;
        _this._node = null;
        _this._type = enums_1.default.LIGHT_DIRECTIONAL;
        _this._color = new vec3_1.default(1, 1, 1);
        _this._intensity = 1;
        // used for spot and point light
        _this._range = 1;
        // used for spot light, default to 60 degrees
        _this._spotAngle = utils_1.toRadian(60);
        _this._spotExp = 1;
        // cached for uniform
        _this._directionUniform = new Float32Array(3);
        _this._positionUniform = new Float32Array(3);
        _this._colorUniform = new Float32Array([_this._color.x * _this._intensity, _this._color.y * _this._intensity, _this._color.z * _this._intensity]);
        _this._spotUniform = new Float32Array([Math.cos(_this._spotAngle * 0.5), _this._spotExp]);
        // shadow params
        _this._shadowType = enums_1.default.SHADOW_NONE;
        _this._shadowFrameBuffer = null;
        _this._shadowMap = null;
        _this._shadowMapDirty = false;
        _this._shadowDepthBuffer = null;
        _this._shadowResolution = 1024;
        _this._shadowBias = 0.0005;
        _this._shadowDarkness = 1;
        _this._shadowMinDepth = 1;
        _this._shadowMaxDepth = 1000;
        _this._frustumEdgeFalloff = 0; // used by directional and spot light.
        _this._viewProjMatrix = mat4_1.sy_mat4();
        _this._spotAngleScale = 1; // used for spot light.
        _this._shadowFrustumSize = 50; // used for directional light.
        return _this;
    }
    /**
     * Get the hosting node of this camera
     * @returns {Node} the hosting node
     */
    Light.prototype.getNode = function () {
        return this._node;
    };
    /**
     * Set the hosting node of this camera
     * @param {Node} node the hosting node
     */
    Light.prototype.setNode = function (node) {
        this._node = node;
    };
    /**
     * set the color of the light source
     * @param {number} r red channel of the light color
     * @param {number} g green channel of the light color
     * @param {number} b blue channel of the light color
     */
    Light.prototype.setColor = function (r, g, b) {
        vec3_1.default.set(this._color, r, g, b);
        this._colorUniform[0] = r * this._intensity;
        this._colorUniform[1] = g * this._intensity;
        this._colorUniform[2] = b * this._intensity;
    };
    Object.defineProperty(Light.prototype, "color", {
        /**
         * get the color of the light source
         * @returns {Vec3} the light color
         */
        get: function () {
            return this._color;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * set the intensity of the light source
     * @param {number} val the light intensity
     */
    Light.prototype.setIntensity = function (val) {
        this._intensity = val;
        this._colorUniform[0] = val * this._color.x;
        this._colorUniform[1] = val * this._color.y;
        this._colorUniform[2] = val * this._color.z;
    };
    Object.defineProperty(Light.prototype, "intensity", {
        /**
         * get the intensity of the light source
         * @returns {number} the light intensity
         */
        get: function () {
            return this._intensity;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * set the type of the light source
     * @param {number} type light source type
     */
    Light.prototype.setType = function (type) {
        this._type = type;
    };
    Object.defineProperty(Light.prototype, "type", {
        /**
         * get the type of the light source
         * @returns {number} light source type
         */
        get: function () {
            return this._type;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * set the spot light angle
     * @param {number} val spot light angle
     */
    Light.prototype.setSpotAngle = function (val) {
        this._spotAngle = val;
        this._spotUniform[0] = Math.cos(this._spotAngle * 0.5);
    };
    Object.defineProperty(Light.prototype, "spotAngle", {
        /**
         * get the spot light angle
         * @returns {number} spot light angle
         */
        get: function () {
            return this._spotAngle;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * set the spot light exponential
     * @param {number} val spot light exponential
     */
    Light.prototype.setSpotExp = function (val) {
        this._spotExp = val;
        this._spotUniform[1] = val;
    };
    Object.defineProperty(Light.prototype, "spotExp", {
        /**
         * get the spot light exponential
         * @returns {number} spot light exponential
         */
        get: function () {
            return this._spotExp;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * set the range of the light source
     * @param {number} val light source range
     */
    Light.prototype.setRange = function (val) {
        this._range = val;
    };
    Object.defineProperty(Light.prototype, "range", {
        /**
         * get the range of the light source
         * @returns {number} range of the light source
         */
        get: function () {
            return this._range;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * set the shadow type of the light source
     * @param {number} type light source shadow type
     */
    Light.prototype.setShadowType = function (type) {
        if (this._shadowType === enums_1.default.SHADOW_NONE && type !== enums_1.default.SHADOW_NONE) {
            this._shadowMapDirty = true;
        }
        this._shadowType = type;
    };
    Object.defineProperty(Light.prototype, "shadowType", {
        /**
         * get the shadow type of the light source
         * @returns {number} light source shadow type
         */
        get: function () {
            return this._shadowType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Light.prototype, "shadowMap", {
        /**
         * get the shadowmap of the light source
         * @returns {Texture2D} light source shadowmap
         */
        get: function () {
            return this._shadowMap;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Light.prototype, "viewProjMatrix", {
        /**
         * get the view-projection matrix of the light source
         * @returns {Mat4} light source view-projection matrix
         */
        get: function () {
            return this._viewProjMatrix;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * set the shadow resolution of the light source
     * @param {number} val light source shadow resolution
     */
    Light.prototype.setShadowResolution = function (val) {
        if (this._shadowResolution !== val) {
            this._shadowMapDirty = true;
        }
        this._shadowResolution = val;
    };
    Object.defineProperty(Light.prototype, "shadowResolution", {
        /**
         * get the shadow resolution of the light source
         * @returns {number} light source shadow resolution
         */
        get: function () {
            return this._shadowResolution;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * set the shadow bias of the light source
     * @param {number} val light source shadow bias
     */
    Light.prototype.setShadowBias = function (val) {
        this._shadowBias = val;
    };
    Object.defineProperty(Light.prototype, "shadowBias", {
        /**
         * get the shadow bias of the light source
         * @returns {number} light source shadow bias
         */
        get: function () {
            return this._shadowBias;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * set the shadow darkness of the light source
     * @param {number} val light source shadow darkness
     */
    Light.prototype.setShadowDarkness = function (val) {
        this._shadowDarkness = val;
    };
    Object.defineProperty(Light.prototype, "shadowDarkness", {
        /**
         * get the shadow darkness of the light source
         * @returns {number} light source shadow darkness
         */
        get: function () {
            return this._shadowDarkness;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * set the shadow min depth of the light source
     * @param {number} val light source shadow min depth
     */
    Light.prototype.setShadowMinDepth = function (val) {
        this._shadowMinDepth = val;
    };
    Object.defineProperty(Light.prototype, "shadowMinDepth", {
        /**
         * get the shadow min depth of the light source
         * @returns {number} light source shadow min depth
         */
        get: function () {
            if (this._type === enums_1.default.LIGHT_DIRECTIONAL) {
                return 1.0;
            }
            return this._shadowMinDepth;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * set the shadow max depth of the light source
     * @param {number} val light source shadow max depth
     */
    Light.prototype.setShadowMaxDepth = function (val) {
        this._shadowMaxDepth = val;
    };
    Object.defineProperty(Light.prototype, "shadowMaxDepth", {
        /**
         * get the shadow max depth of the light source
         * @returns {number} light source shadow max depth
         */
        get: function () {
            if (this._type === enums_1.default.LIGHT_DIRECTIONAL) {
                return 1.0;
            }
            return this._shadowMaxDepth;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * set the frustum edge falloff of the light source
     * @param {number} val light source frustum edge falloff
     */
    Light.prototype.setFrustumEdgeFalloff = function (val) {
        this._frustumEdgeFalloff = val;
    };
    Object.defineProperty(Light.prototype, "frustumEdgeFalloff", {
        /**
         * get the frustum edge falloff of the light source
         * @returns {number} light source frustum edge falloff
         */
        get: function () {
            return this._frustumEdgeFalloff;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * set the shadow frustum size of the light source
     * @param {number} val light source shadow frustum size
     */
    Light.prototype.setShadowFrustumSize = function (val) {
        this._shadowFrustumSize = val;
    };
    Object.defineProperty(Light.prototype, "shadowFrustumSize", {
        /**
         * get the shadow frustum size of the light source
         * @returns {number} light source shadow frustum size
         */
        get: function () {
            return this._shadowFrustumSize;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * extract a view of this light source
     * @param {View} out the receiving view
     * @param {string[]} stages the stages using the view
     */
    Light.prototype.extractView = function (out, stages) {
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
        vec3_1.default.set(out._color, 1, 1, 1);
        out._depth = 1;
        out._stencil = 1;
        out._clearFlags = enums_1.default.CLEAR_COLOR | enums_1.default.CLEAR_DEPTH;
        // stages & framebuffer
        out._stages = stages;
        out._framebuffer = this._shadowFrameBuffer;
        // view projection matrix
        switch (this._type) {
            case enums_1.default.LIGHT_SPOT:
                _computeSpotLightViewProjMatrix(this, out._matView, out._matProj);
                break;
            case enums_1.default.LIGHT_DIRECTIONAL:
                _computeDirectionalLightViewProjMatrix(this, out._matView, out._matProj);
                break;
            case enums_1.default.LIGHT_POINT:
                _computePointLightViewProjMatrix(this, out._matView, out._matProj);
                break;
            case enums_1.default.LIGHT_AMBIENT:
                break;
            default:
                console.warn('shadow of this light type is not supported');
        }
        // view-projection
        mat4_1.Mat4.mul(out._matViewProj, out._matProj, out._matView);
        this._viewProjMatrix = out._matViewProj;
        mat4_1.Mat4.invert(out._matInvViewProj, out._matViewProj);
        // update view's frustum
        // out._frustum.update(out._matViewProj, out._matInvViewProj);
        out._cullingMask = 0xffffffff;
    };
    //更新光的位置和方向
    Light.prototype._updateLightPositionAndDirection = function () {
        // this._node.getWorldMatrix(_m4_tmp);
        // Mat3.fromMat4(_m3_tmp, _m4_tmp);
        // Vec3.transformMat3(_transformedLightDirection, _forward, _m3_tmp);
        // Vec3.toArray(this._directionUniform, _transformedLightDirection);
        // let pos = this._positionUniform;
        // let m = _m4_tmp.m;
        // pos[0] = m[12];
        // pos[1] = m[13];
        // pos[2] = m[14];
    };
    Light.prototype._generateShadowMap = function (device) {
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
    };
    Light.prototype._destroyShadowMap = function () {
        if (this._shadowMap) {
            this._shadowMap.destroy();
            this._shadowDepthBuffer.destroy();
            this._shadowFrameBuffer.destroy();
            this._shadowMap = null;
            this._shadowDepthBuffer = null;
            this._shadowFrameBuffer = null;
        }
    };
    /**
     * update the light source
     * @param {Device} device the rendering device
     */
    Light.prototype.update = function (device) {
        this._updateLightPositionAndDirection();
        if (this._shadowType === enums_1.default.SHADOW_NONE) {
            this._destroyShadowMap();
        }
        else if (this._shadowMapDirty) {
            this._destroyShadowMap();
            this._generateShadowMap(device);
            this._shadowMapDirty = false;
        }
    };
    return Light;
}(Node));
exports.default = Light;
//# sourceMappingURL=Light.js.map