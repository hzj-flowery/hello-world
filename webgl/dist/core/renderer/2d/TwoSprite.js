"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sprite_1 = require("../base/Sprite");
var GLapi_1 = require("../gfx/GLapi");
var vertexshader3d = 'attribute vec4 a_position;' +
    'attribute vec4 color;' +
    'attribute mat4 matrix;' +
    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_Position =u_PMatrix*u_MVMatrix* matrix * a_position;' +
    'v_color = color;' +
    '}';
var fragmentshader3d = 'precision mediump float;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_FragColor = v_color;' +
    '}';
var TwoSprite = /** @class */ (function (_super) {
    __extends(TwoSprite, _super);
    function TwoSprite(gl) {
        var _this = _super.call(this, gl) || this;
        _this.ColorTest = [1, 0, 0, 1,
            0, 1, 0, 1,
            0, 0, 1, 1,
            1, 0, 1, 1,
            0, 1, 1, 1,
        ];
        _this.init();
        return _this;
    }
    TwoSprite.prototype.init = function () {
        var z = 1;
        var positions = [-0.1, 0.4, z,
            -0.1, -0.4, z,
            0.1, -0.4, z,
            0.1, -0.4, z,
            -0.1, 0.4, z,
            0.1, 0.4, z,
            0.4, -0.1, z,
            -0.4, -0.1, z,
            -0.4, 0.1, z,
            -0.4, 0.1, z,
            0.4, -0.1, z,
            0.4, 0.1, z,
        ];
        positions.forEach(function (value, index) {
            positions[index];
        });
        this.createVertexsBuffer(positions, 3, 12);
        this.setShader(vertexshader3d, fragmentshader3d);
        var gl = this.gl;
        // setup matrixes, one per instance
        this.numInstances = 3;
        // make a typed array with one view per matrix
        this.matrixData = new Float32Array(this.numInstances * 16);
        this.matrices = [];
        for (var i = 0; i < this.numInstances; ++i) {
            var byteOffsetToMatrix = i * 16 * 4;
            var numFloatsForView = 16;
            this.matrices.push(new Float32Array(this.matrixData.buffer, byteOffsetToMatrix, numFloatsForView));
        }
        this.matrixBuffer = gl.createBuffer();
        GLapi_1.GLapi.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
        // just allocate the buffer
        GLapi_1.GLapi.bufferDataLength(gl.ARRAY_BUFFER, this.matrixData.byteLength, gl.DYNAMIC_DRAW);
        // setup colors, one per instance
        this.colorBuffer = gl.createBuffer();
        GLapi_1.GLapi.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        var colorData = [];
        for (var j = 0; j < this.numInstances; j++) {
            var res = this.getRandowColor();
            colorData.push(res[0]);
            colorData.push(res[1]);
            colorData.push(res[2]);
            colorData.push(res[3]);
        }
        console.log(colorData);
        GLapi_1.GLapi.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
    };
    TwoSprite.prototype.getRandowColor = function () {
        var p = Math.floor(Math.random() * 10 / 2);
        if (p >= 5)
            p = 4;
        var data = this.ColorTest.slice(p * 4, p * 4 + 4);
        return data;
    };
    TwoSprite.prototype.draw = function (time) {
        var _this = this;
        var gl = this.gl;
        var ext = gl.getExtension('ANGLE_instanced_arrays');
        var numVertices = 12;
        time *= 0.001; // seconds
        var colorLoc = this._shader.getCustomAttributeLocation("color");
        var matrixLoc = this._shader.getCustomAttributeLocation('matrix');
        this._shader.active();
        this._shader.setUseVertexAttribPointerForVertex(this.getGLID(Sprite_1.SY.GLID_TYPE.VERTEX), this.getBufferItemSize(Sprite_1.SY.GLID_TYPE.VERTEX));
        this._shader.setUseModelViewMatrix(this._modelMatrix);
        this._shader.setUseProjectionMatrix(this._projectionMatrix);
        // update all the matrices
        this.matrices.forEach(function (mat, ndx) {
            /**
             * 构造一个节点空间坐标系
             */
            _this._glMatrix.mat4.identity(mat);
            if (Math.random() > 0.5)
                _this._glMatrix.mat4.translate(mat, mat, [-0.5 + ndx * 0.025, 0, 0]);
            else
                _this._glMatrix.mat4.translate(mat, mat, [-0.5, -0.5 + ndx * 0.025, 0]);
            _this._glMatrix.mat4.rotateZ(mat, mat, time * (0.1 + 0.1 * ndx));
        });
        // upload the new matrix data
        GLapi_1.GLapi.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
        GLapi_1.GLapi.bufferSubData(gl.ARRAY_BUFFER, 0, this.matrixData);
        // set all 4 attributes for matrix
        var bytesPerMatrix = 4 * 16;
        for (var i = 0; i < 4; ++i) {
            var loc = matrixLoc + i;
            gl.enableVertexAttribArray(loc);
            // note the stride and offset
            var offset = i * 16; // 4 floats per row, 4 bytes per float
            gl.vertexAttribPointer(loc, // location
            4, // size (num values to pull from buffer per iteration)
            gl.FLOAT, // type of data in buffer
            false, // normalize
            bytesPerMatrix, // stride, num bytes to advance to get to next set of values
            offset);
            // this line says this attribute only changes for each 1 instance
            ext.vertexAttribDivisorANGLE(loc, 1);
        }
        // set attribute for color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        // this line says this attribute only changes for each 1 instance
        ext.vertexAttribDivisorANGLE(colorLoc, 1);
        ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, // offset
        numVertices, // num vertices per instance
        this.numInstances);
    };
    return TwoSprite;
}(Sprite_1.SY.Sprite));
exports.default = TwoSprite;
//# sourceMappingURL=TwoSprite.js.map