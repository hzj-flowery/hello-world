"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FrameBuffer = /** @class */ (function () {
    /**
     * @constructor
     * @param {WebGLContext} gl
     * @param {Number} width
     * @param {Number} height
     * @param {Object} options
     * @param {Array} options.colors
     * @param {RenderBuffer|Texture2D|TextureCube} options.depth
     * @param {RenderBuffer|Texture2D|TextureCube} options.stencil
     * @param {RenderBuffer|Texture2D|TextureCube} options.depthStencil
     */
    function FrameBuffer(gl, width, height, options) {
        this._gl = gl;
        this._width = width;
        this._height = height;
        this._colors = options.colors || [];
        this._depth = options.depth || null;
        this._stencil = options.stencil || null;
        this._depthStencil = options.depthStencil || null;
        this._glID = gl.createFramebuffer();
    }
    /**
     * @method destroy
     */
    FrameBuffer.prototype.destroy = function () {
        if (this._glID === null) {
            console.error('The frame-buffer already destroyed');
            return;
        }
        var gl = this._gl;
        gl.deleteFramebuffer(this._glID);
        this._glID = null;
    };
    FrameBuffer.prototype.getHandle = function () {
        return this._glID;
    };
    return FrameBuffer;
}());
exports.default = FrameBuffer;
//# sourceMappingURL=FrameBuffer.js.map