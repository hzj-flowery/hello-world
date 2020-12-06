"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotLight = void 0;
var Matrix_1 = require("../../Matrix");
var MathUtils_1 = require("../../utils/MathUtils");
var Sprite_1 = require("../base/Sprite");
var Shader_1 = require("../shader/Shader");
var vertexshader3d = 'attribute vec4 a_position;' +
    'attribute vec3 a_normal;' +
    'uniform vec3 u_lightWorldPosition;' +
    'uniform vec3 u_viewWorldPosition;' +
    'uniform mat4 u_world;' +
    'uniform mat4 u_worldViewProjection;' +
    'uniform mat4 u_worldInverseTranspose;' +
    'varying vec3 v_normal;' +
    'varying vec3 v_surfaceToLight;' +
    'varying vec3 v_surfaceToView;' +
    'void main() {' +
    'gl_Position = u_worldViewProjection * a_position;' +
    'v_normal = mat3(u_worldInverseTranspose) * a_normal;' +
    'vec3 surfaceWorldPosition = (u_world * a_position).xyz;' +
    'v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;' +
    'v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;' +
    '}';
var fragmentshader3d = 'precision mediump float;' +
    'varying vec3 v_normal;' +
    'varying vec3 v_surfaceToLight;' +
    'varying vec3 v_surfaceToView;' +
    'uniform vec4 u_color;' +
    'uniform float u_shininess;' +
    'uniform vec3 u_lightDirection;' +
    'uniform float u_innerLimit;' + // in dot space
    'uniform float u_outerLimit;' + // in dot space
    'void main() {' +
    'vec3 normal = normalize(v_normal);' +
    'vec3 surfaceToLightDirection = normalize(v_surfaceToLight);' +
    'vec3 surfaceToViewDirection = normalize(v_surfaceToView);' +
    'vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);' +
    'float dotFromDirection = dot(surfaceToLightDirection,' +
    '-u_lightDirection);' +
    'float limitRange = u_innerLimit - u_outerLimit;' +
    'float inLight = clamp((dotFromDirection - u_outerLimit) / limitRange, 0.0, 1.0);' +
    'float light = inLight * dot(normal, surfaceToLightDirection);' +
    'float specular = inLight * pow(dot(normal, halfVector), u_shininess);' +
    'gl_FragColor = u_color;' +
    'gl_FragColor.rgb *= light;' +
    'gl_FragColor.rgb += specular;' +
    '}';
var SpotLight = /** @class */ (function (_super) {
    __extends(SpotLight, _super);
    function SpotLight() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SpotLight.prototype.onInit = function () {
        this._uniformData = {
            u_worldViewProjection: {},
            u_worldInverseTranspose: {},
            u_color: {},
            u_shininess: {},
            u_lightDirection: {},
            u_innerLimit: {},
            u_outerLimit: {},
            u_lightWorldPosition: {},
            u_viewWorldPosition: {},
            u_world: {}
        };
        this.setShader(vertexshader3d, fragmentshader3d);
    };
    //加载数据完成
    SpotLight.prototype.onLoadFinish = function (datas) {
        var cubeDatas = {};
        cubeDatas.position = new Float32Array(datas.position);
        cubeDatas.normal = new Float32Array(datas.normal);
        var matrix = Matrix_1.glMatrix.mat4.identity(null);
        Matrix_1.glMatrix.mat4.rotateX(matrix, matrix, Math.PI);
        Matrix_1.glMatrix.mat4.translate(matrix, matrix, [-50, -75, -15]);
        for (var ii = 0; ii < cubeDatas.position.length; ii += 3) {
            var vector = Matrix_1.glMatrix.mat4.transformPoint(null, matrix, [cubeDatas.position[ii + 0], cubeDatas.position[ii + 1], cubeDatas.position[ii + 2], 1]);
            cubeDatas.position[ii + 0] = vector[0];
            cubeDatas.position[ii + 1] = vector[1];
            cubeDatas.position[ii + 2] = vector[2];
        }
        this._attrData = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(cubeDatas);
    };
    //更新unifoms变量
    SpotLight.prototype.updateUniformsData = function (cameraData) {
        var fieldOfViewRadians = MathUtils_1.MathUtils.degToRad(60);
        var fRotationRadians = 0;
        var shininess = 150;
        var lightRotationX = 0;
        var lightRotationY = 0;
        var lightDirection = [0, 0, 1]; // this is computed in updateScene
        var innerLimit = MathUtils_1.MathUtils.degToRad(10);
        var outerLimit = MathUtils_1.MathUtils.degToRad(20);
        var target = [0, 35, 0];
        var up = [0, 1, 0];
        // Multiply the matrices.
        var worldViewProjectionMatrix = Matrix_1.glMatrix.mat4.multiply(null, cameraData.viewProjectionMat, this._modelMatrix);
        var worldInverseMatrix = Matrix_1.glMatrix.mat4.invert(null, this._modelMatrix);
        var worldInverseTransposeMatrix = Matrix_1.glMatrix.mat4.identity(null);
        Matrix_1.glMatrix.mat4.transpose(worldInverseTransposeMatrix, worldInverseMatrix);
        this._uniformData.u_worldViewProjection = worldViewProjectionMatrix;
        this._uniformData.u_worldInverseTranspose = worldInverseTransposeMatrix;
        this._uniformData.u_world = this._modelMatrix;
        this._uniformData.u_color = [0.2, 1, 0.2, 1];
        // set the light position
        var lightPosition = [40, 60, 120];
        this._uniformData.u_lightWorldPosition = lightPosition;
        this._uniformData.u_viewWorldPosition = cameraData.position;
        this._uniformData.u_shininess = shininess;
        // since we don't have a plane like most spotlight examples
        // let's point the spot light at the F
        {
            var temp1 = Matrix_1.glMatrix.mat4.identity(null);
            var temp2 = Matrix_1.glMatrix.mat4.identity(null);
            var lmat = Matrix_1.glMatrix.mat4.identity(null);
            Matrix_1.glMatrix.mat4.lookAt2(lmat, lightPosition, target, up);
            Matrix_1.glMatrix.mat4.multiply(lmat, Matrix_1.glMatrix.mat4.rotateX(temp1, temp1, lightRotationX), lmat);
            Matrix_1.glMatrix.mat4.multiply(lmat, Matrix_1.glMatrix.mat4.rotateY(temp2, temp2, lightRotationY), lmat);
            // get the zAxis from the matrix
            // negate it because lookAt looks down the -Z axis
            lightDirection = [-lmat[8], -lmat[9], -lmat[10]];
        }
        this._uniformData.u_lightDirection = lightDirection;
        this._uniformData.u_innerLimit = Math.cos(innerLimit);
        this._uniformData.u_outerLimit = Math.cos(outerLimit);
        _super.prototype.updateRenderData.call(this);
    };
    return SpotLight;
}(Sprite_1.SY.Sprite));
exports.SpotLight = SpotLight;
//# sourceMappingURL=SpotLight.js.map