"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sprite_1 = require("../base/Sprite");
var CubeData_1 = require("../data/CubeData");
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
var Cube = /** @class */ (function (_super) {
    __extends(Cube, _super);
    function Cube(gl) {
        var _this = _super.call(this, gl) || this;
        _this.init();
        return _this;
    }
    Cube.prototype.init = function () {
        var rd = CubeData_1.CubeData.getData();
        this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size, rd.vertex.length);
        this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size, rd.uvData.length);
        this.createIndexsBuffer(rd.indexs, rd.dF.indexs_item_size, rd.indexs.length);
        this.setShader(vertextBaseCode, fragBaseCode);
    };
    return Cube;
}(Sprite_1.SY.Sprite));
exports.default = Cube;
//# sourceMappingURL=Cube.js.map