"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sprite_1 = require("../base/Sprite");
var CubeData_1 = require("../data/CubeData");
/**
 * 如果将三维物体的朝向和光的方向点乘， 结果为 1 则物体朝向和光照方向相同，为 -1 则物体朝向和光照方向相反
 * 所以应该是发现和光的反向相乘，再乘以光的颜色，就是光反射的颜色，
 */
var vertexshader3d = 'attribute vec4 a_position;' +
    'attribute vec3 a_normal;' +
    'attribute vec2 a_uv;' +
    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'varying vec2 v_uv;' +
    'varying vec3 v_normal;' +
    'void main() {' +
    // Multiply the position by the matrix.
    'gl_Position = u_PMatrix *u_MVMatrix* a_position;' +
    // Pass the normal to the fragment shader
    'v_normal = a_normal;' +
    'v_uv = a_uv;' +
    '}';
var fragmentshader3d = 'precision mediump float;' +
    // Passed in from the vertex shader.
    'varying vec3 v_normal;' + //法线
    'uniform vec3 u_color_dir;' + //光的方向
    'uniform vec4 u_color;' + //光照
    'uniform sampler2D u_texCoord;' + //纹理
    'varying vec2 v_uv;' +
    'void main() {' +
    'vec4 colorSource = texture2D(u_texCoord, v_uv);' +
    // because v_normal is a varying it's interpolated
    // so it will not be a unit vector. Normalizing it
    // will make it a unit vector again
    'vec3 normal = normalize(v_normal);' +
    'float light = dot(normal, u_color_dir);' +
    'gl_FragColor = u_color*colorSource;' +
    // Lets multiply just the color portion (not the alpha)
    // by the light
    'gl_FragColor.rgb *= light;' +
    '}';
/**
 * 光照立方体
 */
var LightCube = /** @class */ (function (_super) {
    __extends(LightCube, _super);
    function LightCube(gl) {
        var _this = _super.call(this, gl) || this;
        _this.init();
        _this.name = "LightCube";
        return _this;
    }
    LightCube.prototype.init = function () {
        var rd = CubeData_1.CubeData.getData();
        this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size, rd.vertex.length);
        this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size, rd.uvData.length);
        this.createIndexsBuffer(rd.indexs, rd.dF.indexs_item_size, rd.indexs.length);
        this.createNormalsBuffer(rd.normals, rd.dF.normal_item_size, rd.normals.length);
        this.setShader(vertexshader3d, fragmentshader3d);
        this._shader.USE_LIGHT = true;
    };
    LightCube.prototype.readyDraw = function (time) {
        _super.prototype.readyDraw.call(this, time);
    };
    return LightCube;
}(Sprite_1.SY.Sprite));
exports.default = LightCube;
//# sourceMappingURL=LightCube.js.map