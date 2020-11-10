"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sprite_1 = require("../base/Sprite");
var CubeData_1 = require("../data/CubeData");
var vertexshader3d = 'attribute vec4 a_position;' +
    'varying vec4 v_position;' +
    'void main() {' +
    'v_position = a_position;' +
    'gl_Position = a_position;' +
    'gl_Position.z = 1.0;' +
    '}';
var fragmentshader3d = 'precision mediump float;' +
    'uniform samplerCube u_skybox;' +
    'uniform mat4 u_PVM_Matrix_Inverse;' +
    'varying vec4 v_position;' +
    'void main() {' +
    'vec4 t = u_PVM_Matrix_Inverse * v_position;' +
    'vec3 pos = normalize(t.xyz / t.w);' +
    'vec4 color =  textureCube(u_skybox,pos);' +
    'gl_FragColor = color;' +
    '}';
var SkyBox = /** @class */ (function (_super) {
    __extends(SkyBox, _super);
    function SkyBox(gl) {
        var _this = _super.call(this, gl) || this;
        _this.defaultPath = [
            'res/skybox/2/right+x.png',
            'res/skybox/2/left-x.png',
            'res/skybox/2/up-y.png',
            'res/skybox/2/down+y.png',
            'res/skybox/2/back-z.png',
            'res/skybox/2/front+z.png'
        ];
        _this.init();
        return _this;
    }
    SkyBox.prototype.init = function () {
        var rd = CubeData_1.CubeData.getData();
        this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size, rd.vertex.length);
        // this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size, rd.uvData.length);
        this.createIndexsBuffer(rd.indexs, rd.dF.indexs_item_size, rd.indexs.length);
        this.setShader(vertexshader3d, fragmentshader3d);
        this._shader.USE_SKYBOX = true;
    };
    SkyBox.prototype.setDefaultUrl = function () {
        this.url = this.defaultPath;
    };
    SkyBox.prototype.addCamera = function (camera) {
        _super.prototype.addCamera.call(this, camera);
        this._camera = camera;
    };
    SkyBox.prototype.updateCamera = function (time) {
        return this._camera.updateLookAt(time);
    };
    return SkyBox;
}(Sprite_1.SY.Sprite));
exports.default = SkyBox;
//# sourceMappingURL=SkyBox.js.map