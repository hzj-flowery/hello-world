"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("./Device");
var Scene2D_1 = require("./core/renderer/base/Scene2D");
var Scene3D_1 = require("./core/renderer/base/Scene3D");
var GLapi_1 = require("./core/renderer/gfx/GLapi");
var ImageTestExample = /** @class */ (function () {
    function ImageTestExample() {
        this.gl = Device_1.default.Instance.gl;
        this.canvas = Device_1.default.Instance.canvas;
    }
    ImageTestExample.prototype.startup = function () {
        this._3dScene = new Scene3D_1.default();
        this._3dScene.init();
        this._2dScene = new Scene2D_1.default();
        this._2dScene.init();
        Device_1.default.Instance.setViewPort(this._3dScene.getCamera().rect);
        this.loopScale();
    };
    /**
     * 将结果绘制到UI上
     */
    ImageTestExample.prototype.drawToUI = function (time) {
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._2dScene.getFrameBuffer());
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        var x = this._3dScene.scaleX;
        var y = this._3dScene.scaleY;
        var z = this._3dScene.scaleZ;
        if (x >= 2) {
            this._add = -0.01;
        }
        else if (x <= 0) {
            this._add = 0.01;
        }
        this._3dScene.setScale(x + this._add, y + this._add, z + this._add);
        this._3dScene.readyDraw(time);
        this._2dScene.readyDraw(time);
    };
    //将结果绘制到窗口
    ImageTestExample.prototype.draw2screen = function (time) {
        this.gl.clearColor(1.0, 0.0, 0.0, 1.0);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.commitState();
        var x = this._3dScene.scaleX;
        var y = this._3dScene.scaleY;
        var z = this._3dScene.scaleZ;
        if (x >= 2) {
            this._add = -0.01;
        }
        else if (x <= 0) {
            this._add = 0.01;
        }
        // this._3dScene.setScale(x + this._add, y + this._add, z + this._add);
        // this._3dScene.rotate(0,1,0);
        this._3dScene.readyDraw(time);
        // this._2dScene.readyDraw(time);
    };
    ImageTestExample.prototype.commitState = function () {
        // this._state_cull_face();
        // this.gl.enable(this.gl.DEPTH_TEST);
    };
    /**
    * _commitBlendStates
    */
    ImageTestExample.prototype._commitBlendStates = function (gl, cur, next) {
        // enable/disable blend
        if (cur.blend !== next.blend) {
            if (!next.blend) {
                gl.disable(gl.BLEND);
                return;
            }
            gl.enable(gl.BLEND);
            if (next.blendSrc === GLapi_1.glEnums.BLEND_CONSTANT_COLOR ||
                next.blendSrc === GLapi_1.glEnums.BLEND_ONE_MINUS_CONSTANT_COLOR ||
                next.blendDst === GLapi_1.glEnums.BLEND_CONSTANT_COLOR ||
                next.blendDst === GLapi_1.glEnums.BLEND_ONE_MINUS_CONSTANT_COLOR) {
                gl.blendColor((next.blendColor >> 24) / 255, (next.blendColor >> 16 & 0xff) / 255, (next.blendColor >> 8 & 0xff) / 255, (next.blendColor & 0xff) / 255);
            }
            if (next.blendSep) {
                gl.blendFuncSeparate(next.blendSrc, next.blendDst, next.blendSrcAlpha, next.blendDstAlpha);
                gl.blendEquationSeparate(next.blendEq, next.blendAlphaEq);
            }
            else {
                gl.blendFunc(next.blendSrc, next.blendDst);
                gl.blendEquation(next.blendEq);
            }
            return;
        }
        // nothing to update
        if (next.blend === false) {
            return;
        }
        // blend-color
        if (cur.blendColor !== next.blendColor) {
            gl.blendColor((next.blendColor >> 24) / 255, (next.blendColor >> 16 & 0xff) / 255, (next.blendColor >> 8 & 0xff) / 255, (next.blendColor & 0xff) / 255);
        }
        // separate diff, reset all
        if (cur.blendSep !== next.blendSep) {
            if (next.blendSep) {
                gl.blendFuncSeparate(next.blendSrc, next.blendDst, next.blendSrcAlpha, next.blendDstAlpha);
                gl.blendEquationSeparate(next.blendEq, next.blendAlphaEq);
            }
            else {
                gl.blendFunc(next.blendSrc, next.blendDst);
                gl.blendEquation(next.blendEq);
            }
            return;
        }
        if (next.blendSep) {
            // blend-func-separate
            if (cur.blendSrc !== next.blendSrc ||
                cur.blendDst !== next.blendDst ||
                cur.blendSrcAlpha !== next.blendSrcAlpha ||
                cur.blendDstAlpha !== next.blendDstAlpha) {
                gl.blendFuncSeparate(next.blendSrc, next.blendDst, next.blendSrcAlpha, next.blendDstAlpha);
            }
            // blend-equation-separate
            if (cur.blendEq !== next.blendEq ||
                cur.blendAlphaEq !== next.blendAlphaEq) {
                gl.blendEquationSeparate(next.blendEq, next.blendAlphaEq);
            }
        }
        else {
            // blend-func
            if (cur.blendSrc !== next.blendSrc ||
                cur.blendDst !== next.blendDst) {
                gl.blendFunc(next.blendSrc, next.blendDst);
            }
            // blend-equation
            if (cur.blendEq !== next.blendEq) {
                gl.blendEquation(next.blendEq);
            }
        }
    };
    /**
     * _commitDepthStates
     */
    ImageTestExample.prototype._commitDepthStates = function (gl, cur, next) {
        // enable/disable depth-test
        if (cur.depthTest !== next.depthTest) {
            if (!next.depthTest) {
                gl.disable(gl.DEPTH_TEST);
                return;
            }
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(next.depthFunc);
            gl.depthMask(next.depthWrite);
            return;
        }
        // commit depth-write
        if (cur.depthWrite !== next.depthWrite) {
            gl.depthMask(next.depthWrite);
        }
        // check if depth-write enabled
        if (next.depthTest === false) {
            if (next.depthWrite) {
                next.depthTest = true;
                next.depthFunc = GLapi_1.glEnums.DS_FUNC_ALWAYS;
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(next.depthFunc);
            }
            return;
        }
        // depth-func
        if (cur.depthFunc !== next.depthFunc) {
            gl.depthFunc(next.depthFunc);
        }
    };
    /**
     * mode
       
     * 面剔除
     * 要检查当前的剔除面模式，请查询CULL_FACE_MODE常数。
     * gl.getParameter(gl.CULL_FACE_MODE) === gl.FRONT_AND_BACK
     */
    ImageTestExample.prototype._state_cull_face = function () {
        // this.gl.cullFace(this.gl.CULL_FACE_MODE);
        //开启面剔除
        this.gl.enable(this.gl.CULL_FACE);
        //关闭面剔除
        // this.gl.disable(this.gl.CULL_FACE);
        /**
         * 设置模式mode
         *  gl.FRONT 前面不会被绘制出来
            gl.BACK  后面不会被绘制出来
            gl.FRONT_AND_BACK 多边形不会被绘出，但是其他图元比如点、线会被绘出
            @errors
            如果mode不是被允许的值，将会产生GL_INVALID_ENUM
         */
        this.gl.cullFace(this.gl.FRONT);
        /**
         * CW:代表顺时针缠绕
         * CCW:代表逆时针缠绕，此为默认值
         */
        this.gl.frontFace(this.gl.CCW);
    };
    ImageTestExample.prototype.loopScale = function () {
        this._add = 0.01;
        var loop = function (time) {
            //this.drawToUI();
            var cur = Date.now();
            this.draw2screen(time);
            // console.log("curFrameTime---",(Date.now()-cur)/1000);
            requestAnimationFrame(loop);
        }.bind(this);
        loop(0);
    };
    return ImageTestExample;
}());
exports.default = ImageTestExample;
//# sourceMappingURL=RenderFlow.js.map