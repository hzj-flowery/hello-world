"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Label = void 0;
var Sprite_1 = require("../base/Sprite");
var vertexshader3d = 'attribute vec4 a_position;' +
    'attribute vec4 a_color;' +
    'uniform mat4 u_matrix;' +
    'varying vec4 v_color;' +
    'void main() {' +
    // Multiply the position by the matrix.
    'gl_Position = u_matrix * a_position;' +
    // Pass the color to the fragment shader.
    'v_color = a_color;' +
    '}';
var fragmentshader3d = 'precision mediump float;' +
    // Passed in from the vertex shader.
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_FragColor = v_color;' +
    '}';
var textvertexshader = 'attribute vec4 a_position;' +
    'attribute vec2 a_texcoord;' +
    'uniform mat4 u_matrix;' +
    'varying vec2 v_texcoord;' +
    'void main() {' +
    // Multiply the position by the matrix.
    'gl_Position = u_matrix * a_position;' +
    // Pass the texcoord to the fragment shader.
    'v_texcoord = a_texcoord;';
var textfragmentshader = 'precision mediump float;' +
    // Passed in from the vertex shader.
    'varying vec2 v_texcoord;' +
    'uniform sampler2D u_texture;' +
    'void main() {' +
    'gl_FragColor = texture2D(u_texture, v_texcoord);' +
    '}';
var fontInfo = {
    letterHeight: 8,
    spaceWidth: 8,
    spacing: -1,
    textureWidth: 64,
    textureHeight: 40,
    glyphInfos: {
        'a': { x: 0, y: 0, width: 8, },
        'b': { x: 8, y: 0, width: 8, },
        'c': { x: 16, y: 0, width: 8, },
        'd': { x: 24, y: 0, width: 8, },
        'e': { x: 32, y: 0, width: 8, },
        'f': { x: 40, y: 0, width: 8, },
        'g': { x: 48, y: 0, width: 8, },
        'h': { x: 56, y: 0, width: 8, },
        'i': { x: 0, y: 8, width: 8, },
        'j': { x: 8, y: 8, width: 8, },
        'k': { x: 16, y: 8, width: 8, },
        'l': { x: 24, y: 8, width: 8, },
        'm': { x: 32, y: 8, width: 8, },
        'n': { x: 40, y: 8, width: 8, },
        'o': { x: 48, y: 8, width: 8, },
        'p': { x: 56, y: 8, width: 8, },
        'q': { x: 0, y: 16, width: 8, },
        'r': { x: 8, y: 16, width: 8, },
        's': { x: 16, y: 16, width: 8, },
        't': { x: 24, y: 16, width: 8, },
        'u': { x: 32, y: 16, width: 8, },
        'v': { x: 40, y: 16, width: 8, },
        'w': { x: 48, y: 16, width: 8, },
        'x': { x: 56, y: 16, width: 8, },
        'y': { x: 0, y: 24, width: 8, },
        'z': { x: 8, y: 24, width: 8, },
        '0': { x: 16, y: 24, width: 8, },
        '1': { x: 24, y: 24, width: 8, },
        '2': { x: 32, y: 24, width: 8, },
        '3': { x: 40, y: 24, width: 8, },
        '4': { x: 48, y: 24, width: 8, },
        '5': { x: 56, y: 24, width: 8, },
        '6': { x: 0, y: 32, width: 8, },
        '7': { x: 8, y: 32, width: 8, },
        '8': { x: 16, y: 32, width: 8, },
        '9': { x: 24, y: 32, width: 8, },
        '-': { x: 32, y: 32, width: 8, },
        '*': { x: 40, y: 32, width: 8, },
        '!': { x: 48, y: 32, width: 8, },
        '?': { x: 56, y: 32, width: 8, },
    },
};
var makeVerticesForString = function (fontInfo, s) {
    var len = s.length;
    var numVertices = len * 6;
    var positions = new Float32Array(numVertices * 2);
    var texcoords = new Float32Array(numVertices * 2);
    var offset = 0;
    var x = 0;
    var maxX = fontInfo.textureWidth;
    var maxY = fontInfo.textureHeight;
    for (var ii = 0; ii < len; ++ii) {
        var letter = s[ii];
        var glyphInfo = fontInfo.glyphInfos[letter];
        if (glyphInfo) {
            var x2 = x + glyphInfo.width;
            var u1 = glyphInfo.x / maxX;
            var v1 = 1.0 - (glyphInfo.y + fontInfo.letterHeight - 1) / maxY;
            var u2 = (glyphInfo.x + glyphInfo.width - 1) / maxX;
            var v2 = 1.0 - glyphInfo.y / maxY;
            // 6 vertices per letter
            positions[offset + 0] = x;
            positions[offset + 1] = 0;
            texcoords[offset + 0] = u1;
            texcoords[offset + 1] = v1;
            positions[offset + 2] = x2;
            positions[offset + 3] = 0;
            texcoords[offset + 2] = u2;
            texcoords[offset + 3] = v1;
            positions[offset + 4] = x;
            positions[offset + 5] = fontInfo.letterHeight;
            texcoords[offset + 4] = u1;
            texcoords[offset + 5] = v2;
            positions[offset + 6] = x;
            positions[offset + 7] = fontInfo.letterHeight;
            texcoords[offset + 6] = u1;
            texcoords[offset + 7] = v2;
            positions[offset + 8] = x2;
            positions[offset + 9] = 0;
            texcoords[offset + 8] = u2;
            texcoords[offset + 9] = v1;
            positions[offset + 10] = x2;
            positions[offset + 11] = fontInfo.letterHeight;
            texcoords[offset + 10] = u2;
            texcoords[offset + 11] = v2;
            x += glyphInfo.width + fontInfo.spacing;
            offset += 12;
        }
        else {
            // we don't have this character so just advance
            x += fontInfo.spaceWidth;
        }
    }
    // return ArrayBufferViews for the portion of the TypedArrays
    // that were actually used.
    return {
        arrays: {
            position: new Float32Array(positions.buffer, 0, offset),
            texcoord: new Float32Array(texcoords.buffer, 0, offset),
        },
        numVertices: offset / 2,
    };
};
var vertextBaseCode = 'attribute vec3 a_position;' +
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
    'vec4 texcolor = texture2D(u_texCoord, vTextureCoordinates);' +
    'if((texcolor.x+texcolor.y+texcolor.z)<0.1) discard;' +
    'gl_FragColor = texcolor;' +
    '}';
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);
    function Label(gl) {
        var _this = _super.call(this, gl) || this;
        _this._realCharWidth = 0;
        _this._realCharHeight = 0;
        _this._content = "";
        _this.init();
        return _this;
    }
    Object.defineProperty(Label.prototype, "content", {
        set: function (str) {
            this._content = str;
            this.init();
        },
        enumerable: false,
        configurable: true
    });
    Label.prototype.handleFontInfo = function () {
        //默认在字符表中字符的宽高相等
        var hang = fontInfo.textureHeight / fontInfo.letterHeight;
        var lie = fontInfo.textureWidth / fontInfo.letterHeight;
        var totalChar = hang * lie;
        this._realCharHeight = fontInfo.letterHeight;
        this._realCharWidth = fontInfo.letterHeight;
    };
    Label.prototype.init = function () {
        var data = makeVerticesForString(fontInfo, this._content);
        var arrPos = [];
        var arrUV = [];
        var posData = (data.arrays.position.toString()).split(',');
        var uvData = (data.arrays.texcoord.toString()).split(',');
        for (var j = 0; j < posData.length; j++) {
            if (j % 2 == 0) {
                arrPos.push(parseFloat(posData[j]) / fontInfo.textureWidth);
            }
            else if (j % 2 == 1) {
                arrPos.push(parseFloat(posData[j]) / fontInfo.textureHeight);
            }
            arrUV.push(parseFloat(uvData[j]));
            if (j % 2 != 0) {
                arrPos.push(-0.1);
            }
        }
        var itemNums = arrPos.length / 3;
        this.createVertexsBuffer(arrPos, 3, itemNums);
        this.createUVsBuffer(arrUV, 2, itemNums);
        // 索引数据
        var floorVertexIndices = [];
        for (var j = 0; j < itemNums; j++) {
            floorVertexIndices.push(j);
        }
        this.createIndexsBuffer(floorVertexIndices, 1, itemNums);
        this.setShader(vertextBaseCode, fragBaseCode);
        this._glPrimitiveType = 4 /* TRIANGLES */;
    };
    return Label;
}(Sprite_1.SY.Sprite));
exports.Label = Label;
//# sourceMappingURL=Label.js.map