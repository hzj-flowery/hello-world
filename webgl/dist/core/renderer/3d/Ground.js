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
var Ground = /** @class */ (function (_super) {
    __extends(Ground, _super);
    function Ground(gl) {
        var _this = _super.call(this, gl) || this;
        _this.init();
        return _this;
    }
    Ground.prototype.init = function () {
        // 顶点数据
        var floorVertexPosition = [
            // Plane in y=0
            5.0, 0.0, 5.0,
            5.0, 0.0, -5.0,
            -5.0, 0.0, -5.0,
            -5.0, 0.0, 5.0
        ]; //v3
        this.createVertexsBuffer(floorVertexPosition, 3, 4);
        //uv 数据
        var floorVertexTextureCoordinates = [
            2.0, 0.0,
            2.0, 2.0,
            0.0, 2.0,
            0.0, 0.0
        ];
        this.createUVsBuffer(floorVertexTextureCoordinates, 2, 4);
        // 索引数据
        var floorVertexIndices = [0, 1, 2, 3];
        this.createIndexsBuffer(floorVertexIndices, 1, 4);
        this.setShader(vertextBaseCode, fragBaseCode);
    };
    return Ground;
}(Sprite_1.SY.Sprite));
exports.default = Ground;
//# sourceMappingURL=Ground.js.map