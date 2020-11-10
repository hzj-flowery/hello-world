"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderSprite = void 0;
var Sprite_1 = require("../base/Sprite");
var RenderTexture_1 = require("../assets/RenderTexture");
var vertextBaseCode = 'attribute vec3 a_position;' +
    'attribute vec3 a_normal;' +
    'attribute vec2 a_uv;' +
    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'varying vec2 vTextureCoordinates;' +
    'void main() {' +
    'gl_Position = u_PMatrix * u_MVMatrix * vec4(a_position, 1.0);' +
    'vTextureCoordinates = vec2(a_uv.x,a_uv.y);' + //取反
    '}';
//基础的shader的片段着色器
var fragBaseCode = 'precision mediump float;' +
    'varying vec2 vTextureCoordinates;' +
    'uniform sampler2D u_texCoord;' +
    'void main() {' +
    'gl_FragColor = texture2D(u_texCoord, vTextureCoordinates);' +
    '}';
var RenderSprite = /** @class */ (function (_super) {
    __extends(RenderSprite, _super);
    function RenderSprite(gl) {
        var _this = _super.call(this, gl) || this;
        _this.init();
        return _this;
    }
    RenderSprite.prototype.init = function () {
        // 顶点数据
        var floorVertexPosition = [
            // Plane in z=0
            0.25, 0.25, -0.1,
            -0.25, 0.25, -0.1,
            -0.25, -0.25, -0.1,
            0.25, -0.25, -0.1
        ]; //v3
        this.createVertexsBuffer(floorVertexPosition, 3, 4);
        //uv 数据
        var floorVertexTextureCoordinates = [
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ];
        this.createUVsBuffer(floorVertexTextureCoordinates, 2, 4);
        // 索引数据
        var floorVertexIndices = [0, 1, 2, 3];
        this.createIndexsBuffer(floorVertexIndices, 1, 4);
        this.createRenderTexture();
        this.setShader(vertextBaseCode, fragBaseCode);
    };
    //创建渲染纹理
    RenderSprite.prototype.createRenderTexture = function () {
        this._texture = new RenderTexture_1.RenderTexture(this.gl);
    };
    RenderSprite.prototype.getFrameBuffer = function () {
        return this._texture._frameBuffer;
    };
    return RenderSprite;
}(Sprite_1.SY.Sprite));
exports.RenderSprite = RenderSprite;
//# sourceMappingURL=RenderSprite.js.map