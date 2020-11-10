"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sprite_1 = require("../base/Sprite");
var vertextBaseCode = 'attribute vec3 a_position;' +
    'attribute vec2 a_uv;' +
    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'varying vec2 vTextureCoordinates;' +
    'void main() {' +
    'gl_Position = u_PMatrix * u_MVMatrix * vec4(a_position, 1.0);' +
    'vTextureCoordinates = a_uv;' +
    '}';
//基础的shader的片段着色器
var fragBaseCode = 'precision mediump float;' +
    'varying vec2 vTextureCoordinates;' +
    'uniform sampler2D u_texCoord;' +
    'void main() {' +
    'gl_FragColor = texture2D(u_texCoord, vTextureCoordinates);' +
    '}';
var CustomTextureCube = /** @class */ (function (_super) {
    __extends(CustomTextureCube, _super);
    function CustomTextureCube(gl) {
        var _this = _super.call(this, gl) || this;
        _this.init();
        return _this;
    }
    CustomTextureCube.prototype.init = function () {
        var positions = [
            -0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,
            //背面是个矩形 竖着放 斜角切开
            -0.5, 0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            //前面是个矩形 竖着放 斜角切开
            -0.5, 0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, 0.5,
            -0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5,
            0.5, 0.5, -0.5,
            //上面是个矩形 平铺  斜角切开（/）
            -0.5, 0.5, 0.5,
            0.5, 0.5, 0.5,
            0.5, 0.5, -0.5,
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            //下面是个矩形 平铺 斜角切开（/）
            -0.5, -0.5, 0.5,
            0.5, -0.5, -0.5,
            0.5, -0.5, 0.5,
            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, -0.5,
            //左面是个矩形 面朝左右 斜角切开
            -0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            -0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, -0.5, 0.5,
            //右面是个矩形 面朝左右 斜角切开
            0.5, -0.5, 0.5,
            0.5, 0.5, -0.5,
            0.5, 0.5, 0.5,
        ];
        positions.forEach(function (v, index) {
            positions[index] = positions[index] * 2;
        });
        var uvs = [
            0, 0,
            0, 1,
            1, 0,
            0, 1,
            1, 1,
            1, 0,
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
            0, 0,
            0, 1,
            1, 0,
            0, 1,
            1, 1,
            1, 0,
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
            0, 0,
            0, 1,
            1, 0,
            0, 1,
            1, 1,
            1, 0,
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
        this.createVertexsBuffer(positions, 3, positions.length / 3);
        this.createUVsBuffer(uvs, 2, uvs.length / 2);
        this._glPrimitiveType = 4 /* TRIANGLES */;
        this.setShader(vertextBaseCode, fragBaseCode);
    };
    return CustomTextureCube;
}(Sprite_1.SY.Sprite));
exports.default = CustomTextureCube;
//# sourceMappingURL=CustomTextureCube.js.map