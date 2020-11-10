"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rectangle = void 0;
var Sprite_1 = require("../base/Sprite");
var Device_1 = require("../../../Device");
//屏幕中間位置為（0.0,0.0）
//屏幕左上角為（-1.0，1.0）
//屏幕左下角為（-1.0，-1.0）
//屏幕右上角位（1.0,1.0）
//屏幕右下角為（1.0，-1.0）
var screenPoint = [
    { x: 0.0, y: 0.0, z: 0.0 },
    { x: -1.0, y: 1.0, z: 0.0 },
    { x: -1.0, y: -1.0, z: 0.0 },
    { x: 1.0, y: -1.0, z: 0.0 },
    { x: 1.0, y: 1.0, z: 0.0 },
];
var getRandomScaleVert = function () {
    var newPoint = [];
    // var scale = Math.random();
    var scale = 0.5;
    for (var j = 1; j < screenPoint.length; j++) {
        newPoint.push(screenPoint[j].x * scale);
        newPoint.push(screenPoint[j].y * scale);
        newPoint.push(screenPoint[j].z * scale);
    }
    return newPoint;
};
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
var Rectangle = /** @class */ (function (_super) {
    __extends(Rectangle, _super);
    function Rectangle(gl) {
        var _this = _super.call(this, gl) || this;
        _this._lt = []; //左上
        _this._lb = []; //左下
        _this._rt = []; //右上
        _this._rb = []; //右下
        _this.init();
        return _this;
    }
    Rectangle.prototype.init = function () {
        this.setContentSize(120, 240);
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
        this.setShader(vertextBaseCode, fragBaseCode);
    };
    /**
     *
     * @param width
     * @param height
     */
    Rectangle.prototype.setContentSize = function (width, height) {
        this.width = width;
        this.height = height;
        this.anchorX = 0;
        this.anchorY = 0;
        var clipW = this.width / Device_1.default.Instance.Width;
        var clipH = this.height / Device_1.default.Instance.Height;
        var z = -0.1;
        //[-1,1] = >[0,1]
        var w = 2 * clipW;
        var h = 2 * clipH;
        this._lb = [];
        this._lb.push(-this.anchorX * w);
        this._lb.push(-this.anchorY * h);
        this._lb.push(z); //左下角
        this._rb = [];
        this._rb.push(w - this.anchorX * w); //右下角
        this._rb.push(-this.anchorY * h);
        this._rb.push(z);
        this._rt = [];
        this._rt.push(w - this.anchorX * w); //右上角
        this._rt.push(h - this.anchorY * h);
        this._rt.push(z);
        this._lt = [];
        this._lt.push(-this.anchorX * w);
        this._lt.push(h - this.anchorY * h); //左上角
        this._lt.push(z);
        var floorVertexPosition = [].concat(this._lb, this._rb, this._rt, this._lt);
        this.createVertexsBuffer(floorVertexPosition, 3, 4);
    };
    return Rectangle;
}(Sprite_1.SY.Sprite));
exports.Rectangle = Rectangle;
//# sourceMappingURL=Rectangle.js.map