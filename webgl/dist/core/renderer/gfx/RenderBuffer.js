"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RenderBuffer = /** @class */ (function () {
    /**
     *
     * @param {WebGLContext}gl
     * @param format
     * @param width
     * @param height
     */
    function RenderBuffer(gl, format, width, height) {
        this._gl = gl;
        this._format = format;
        this._glID = gl.createRenderbuffer();
        this.update(width, height);
    }
    RenderBuffer.prototype.update = function (width, height) {
        this._width = width;
        this._height = height;
        var gl = this._gl;
        gl.bindRenderbuffer(gl.RENDERBUFFER, this._glID);
        gl.renderbufferStorage(gl.RENDERBUFFER, this._format, width, height);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    };
    /**
     * @method destroy
     */
    RenderBuffer.prototype.destroy = function () {
        if (this._glID === null) {
            console.error('The render-buffer already destroyed');
            return;
        }
        var gl = this._gl;
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.deleteRenderbuffer(this._glID);
        this._glID = null;
    };
    return RenderBuffer;
}());
exports.default = RenderBuffer;
//# sourceMappingURL=RenderBuffer.js.map