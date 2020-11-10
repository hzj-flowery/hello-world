"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sprite_1 = require("../base/Sprite");
/**
 * var vertextBaseCode =
    'attribute vec3 a_position;' +
    'attribute vec3 a_normal;' +
    'attribute vec2 a_uv;' +

    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'uniform mat4 u_MMatrix;' +
    'uniform mat4 u_VMatrix;' +

    'varying vec3 v_normal;' +
    'varying vec2 v_uv;' +

    'void main() {' +
    'gl_Position = u_PMatrix * u_MVMatrix * vec4(a_position, 1.0);' +
    'v_uv = a_uv;' +
    '}'
//基础的shader的片段着色器
var fragBaseCode =
    'precision mediump float;' +

    'varying vec2 v_uv;' +
    'uniform samplerCube u_skybox;'+
    'uniform sampler2D u_texCoord;' +
    'uniform mat4 u_PVM_Matrix_Inverse;'+
    'uniform vec4 u_color;' +
    'uniform vec4 u_color_dir;' +
    
    'void main() {' +
    'gl_FragColor = texture2D(u_texCoord, v_uv);' +
    '}'

 */
var solidcolorvertexshader = 'attribute vec4 a_position;' +
    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'uniform mat4 u_PVMMatrix;' +
    'void main() {' +
    'gl_Position = u_PMatrix*u_MVMatrix*a_position;' +
    '}';
var solidcolorfragmentshader = 'precision mediump float;' +
    'uniform vec4 u_color;' +
    'void main() {' +
    'gl_FragColor = u_color;' +
    '}';
var CameraView = /** @class */ (function (_super) {
    __extends(CameraView, _super);
    function CameraView(gl) {
        var _this = _super.call(this, gl) || this;
        _this.init();
        return _this;
    }
    CameraView.prototype.init = function () {
        var result = this.createCameraBufferInfo(0.2);
        console.log(result);
        this.createVertexsBuffer(result.pos, 3, result.pos.length / 3);
        this.createIndexsBuffer(result.index, 1, result.index.length);
        this.setShader(solidcolorvertexshader, solidcolorfragmentshader);
        this._glPrimitiveType = 1 /* LINES */;
    };
    CameraView.prototype.degToRad = function (d) {
        return d * Math.PI / 180;
    };
    // create geometry for a camera
    CameraView.prototype.createCameraBufferInfo = function (scale) {
        if (scale === void 0) { scale = 1; }
        // first let's add a cube. It goes from 1 to 3
        // because cameras look down -Z so we want
        // the camera to start at Z = 0.
        // We'll put a cone in front of this cube opening
        // toward -Z
        var positions = [];
        var indices = [];
        //add back后座
        var backPos = [
            -1, -1, 1,
            1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
            -1, -1, 3,
            1, -1, 3,
            -1, 1, 3,
            1, 1, 3,
            0, 0, 1,
        ];
        var backIndex = [
            0, 1, 1, 3, 3, 2, 2, 0,
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 3, 7, 2, 6,
        ];
        backPos.forEach(function (v, index) {
            positions.push(v);
        });
        backIndex.forEach(function (v, index) {
            indices.push(v);
        });
        positions.concat(backPos);
        indices.concat(backIndex);
        // add cone segments锥形
        var numSegments = 6;
        var coneBaseIndex = positions.length / 3;
        var coneTipIndex = coneBaseIndex - 1;
        for (var i = 0; i < numSegments; ++i) {
            var u = i / numSegments;
            var angle = u * Math.PI * 2;
            var x = Math.cos(angle);
            var y = Math.sin(angle);
            positions.push(x, y, 0);
            // line from tip to edge
            indices.push(coneTipIndex, coneBaseIndex + i);
            // line from point on edge to next point on edge
            indices.push(coneBaseIndex + i, coneBaseIndex + (i + 1) % numSegments);
        }
        //48
        //add rayZ
        positions.push(0, 0, -50);
        indices.push(coneTipIndex, positions.length / 3 - 1);
        //add rayY
        positions.push(0, 25, 0);
        indices.push(coneTipIndex, positions.length / 3 - 1);
        //add rayX
        positions.push(25, 0, 0);
        indices.push(coneTipIndex, positions.length / 3 - 1);
        //add clip
        var far = -50;
        var near = -1;
        var nearWidth = 2;
        var nearHeight = 2;
        var farHeight = 10;
        var farWidth = 10;
        var clipPos = [
            -(nearWidth / 2), -(nearHeight / 2), near,
            (nearWidth / 2), -(nearHeight / 2), near,
            -(nearWidth / 2), (nearHeight / 2), near,
            (nearWidth / 2), (nearHeight / 2), near,
            -(farWidth / 2), -(farHeight / 2), far,
            (farWidth / 2), -(farHeight / 2), far,
            -(farWidth / 2), (farHeight / 2), far,
            (farWidth / 2), (farHeight / 2), far,
        ];
        var clipIndices = [
            0, 1, 1, 3, 3, 2, 2, 0,
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 3, 7, 2, 6,
        ];
        var lastMaxIndex = positions.length / 3;
        clipIndices.forEach(function (v, index) {
            clipIndices[index] = clipIndices[index] + lastMaxIndex;
        });
        clipPos.forEach(function (v, index) {
            positions.push(v);
        });
        clipIndices.forEach(function (v, index) {
            indices.push(v);
        });
        positions.forEach(function (v, ndx) {
            positions[ndx] *= scale;
        });
        return { pos: positions, index: indices };
    };
    /**
         *
         * @param texture 纹理的GLID
         */
    CameraView.prototype.draw = function (time) {
        //激活shader 并且给shader中的变量赋值
        this._shader.active();
        this._shader.setUseModelViewMatrix(this._modelMatrix);
        this._shader.setUseProjectionMatrix(this._projectionMatrix);
        this._shader.setUseColor([1, 0, 0, 1]);
        this._shader.setUseVertexAttribPointerForVertex(this.getGLID(Sprite_1.SY.GLID_TYPE.VERTEX), this.getBufferItemSize(Sprite_1.SY.GLID_TYPE.VERTEX));
        //绑定操作的索引缓冲
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.getGLID(Sprite_1.SY.GLID_TYPE.INDEX));
        // var buffer = this.getBuffer(SY.GLID_TYPE.INDEX)
        var body = 24;
        var head = 24;
        var ray = 2 * 3;
        var clip = 24;
        this._shader.setUseColor([0, 0, 0, 1]);
        this.gl.drawElements(this._glPrimitiveType, body, this.gl.UNSIGNED_SHORT, 0);
        this._shader.setUseColor([0, 1, 0, 1]);
        this.gl.drawElements(this._glPrimitiveType, head, this.gl.UNSIGNED_SHORT, body * 2);
        this._shader.setUseColor([1, 0, 0, 1]);
        this.gl.drawElements(this._glPrimitiveType, ray, this.gl.UNSIGNED_SHORT, (body + head) * 2);
        this._shader.setUseColor([1, 1, 0, 1]);
        this.gl.drawElements(this._glPrimitiveType, clip, this.gl.UNSIGNED_SHORT, (body + head + ray) * 2);
        //解除缓冲区绑定
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    };
    return CameraView;
}(Sprite_1.SY.Sprite));
exports.default = CameraView;
//# sourceMappingURL=CameraView.js.map