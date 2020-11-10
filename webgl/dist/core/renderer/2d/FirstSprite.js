"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sprite_1 = require("../base/Sprite");
var vertexshader3d = 'attribute vec4 a_position;' +
    'uniform mat4 u_PVM_Matrix;' +
    'void main() {' +
    'gl_Position = u_PVM_Matrix * a_position;' +
    '}';
var fragmentshader3d = 'precision mediump float;' +
    'uniform vec4 u_color;' +
    'void main() {' +
    'gl_FragColor = u_color;' +
    '}';
var FirstSprite = /** @class */ (function (_super) {
    __extends(FirstSprite, _super);
    function FirstSprite(gl) {
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
    FirstSprite.prototype.init = function () {
        var z = 0;
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
        this.createVertexsBuffer(positions, 3, 12);
        this.setShader(vertexshader3d, fragmentshader3d);
    };
    FirstSprite.prototype.draw = function (time) {
        var _this = this;
        var numInstances = 10000;
        var matrices = [];
        for (var j = 0; j < numInstances; j++) {
            var out = this._glMatrix.mat4.create();
            this._glMatrix.mat4.identity(out);
            matrices.push(out);
        }
        var colors = [
            [1, 0, 0, 1,],
            [0, 1, 0, 1,],
            [0, 0, 1, 1,],
            [1, 0, 1, 1,],
            [0, 1, 1, 1,],
        ];
        for (var j = 0; j < numInstances; j++) {
            var res = this.getRandowColor();
            colors.push(res);
        }
        time *= 0.001; // seconds
        var gl = this.gl;
        this._shader.active();
        this._shader.setUseVertexAttribPointerForVertex(this.getGLID(Sprite_1.SY.GLID_TYPE.VERTEX), this.getBufferItemSize(Sprite_1.SY.GLID_TYPE.VERTEX));
        // matrices.forEach((mat, ndx) => {
        //     this._glMatrix.mat4.translate(mat, mat, [-0.5 + ndx * 0.25, 0, 0])
        //     this._glMatrix.mat4.rotateZ(mat, mat, time * (0.1 + 0.1 * ndx))
        //     const color = colors[ndx];
        //     this._shader.setUseColor(color);
        //     this._shader.setUseProjectViewModelMatrix(mat);
        //     gl.drawArrays(
        //         gl.TRIANGLES,
        //         0,             // offset
        //         12,   // num vertices per instance
        //     );
        // });
        matrices.forEach(function (mat, ndx) {
            _this._glMatrix.mat4.identity(mat);
            if (Math.random() > 0.5)
                _this._glMatrix.mat4.translate(mat, mat, [-0.5 + ndx * 0.025, 0, 0]);
            else
                _this._glMatrix.mat4.translate(mat, mat, [-0.5, -0.5 + ndx * 0.025, 0]);
            _this._glMatrix.mat4.rotateZ(mat, mat, time * (0.1 + 0.1 * ndx));
            var color = colors[ndx];
            _this._shader.setUseColor(color);
            _this._shader.setUseProjectViewModelMatrix(mat);
            gl.drawArrays(gl.TRIANGLES, 0, // offset
            12);
        });
    };
    FirstSprite.prototype.getRandowColor = function () {
        var p = Math.floor(Math.random() * 10 / 2);
        if (p >= 5)
            p = 4;
        var data = this.ColorTest.slice(p * 4, p * 4 + 4);
        return data;
    };
    return FirstSprite;
}(Sprite_1.SY.Sprite));
exports.default = FirstSprite;
//# sourceMappingURL=FirstSprite.js.map