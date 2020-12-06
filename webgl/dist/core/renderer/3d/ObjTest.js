"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("../../../Device");
var Matrix_1 = require("../../Matrix");
var OBJParseHelper_1 = require("../parse/OBJParseHelper");
var Shader_1 = require("../shader/Shader");
var vs = "\n  attribute vec4 a_position;\n  attribute vec3 a_normal;\n  attribute vec3 a_tangent;\n  attribute vec2 a_texcoord;\n  attribute vec4 a_color;\n\n  uniform mat4 u_projection;\n  uniform mat4 u_view;\n  uniform mat4 u_world;\n  uniform vec3 u_viewWorldPosition;\n\n  varying vec3 v_normal;\n  varying vec3 v_tangent;\n  varying vec3 v_surfaceToView;\n  varying vec2 v_texcoord;\n  varying vec4 v_color;\n\n  void main() {\n    vec4 worldPosition = u_world * a_position;\n    gl_Position = u_projection * u_view * worldPosition;\n    v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;\n    mat3 normalMat = mat3(u_world);\n    v_normal = normalize(normalMat * a_normal);\n    v_tangent = normalize(normalMat * a_tangent);\n\n    v_texcoord = a_texcoord;\n    v_color = a_color;\n  }\n  ";
var fs = "\n  precision highp float;\n\n  varying vec3 v_normal;\n  varying vec3 v_tangent;\n  varying vec3 v_surfaceToView;\n  varying vec2 v_texcoord;\n  varying vec4 v_color;\n\n  uniform vec3 diffuse;\n  uniform sampler2D diffuseMap;\n  uniform vec3 ambient;\n  uniform vec3 emissive;\n  uniform vec3 specular;\n  uniform sampler2D specularMap;\n  uniform float shininess;\n  uniform sampler2D normalMap;\n  uniform float opacity;\n  uniform vec3 u_lightDirection;\n  uniform vec3 u_ambientLight;\n\n  void main () {\n    vec3 normal = normalize(v_normal) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n    vec3 tangent = normalize(v_tangent) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n    vec3 bitangent = normalize(cross(normal, tangent));\n\n    mat3 tbn = mat3(tangent, bitangent, normal);\n    normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.;\n    normal = normalize(tbn * normal);\n\n    vec3 surfaceToViewDirection = normalize(v_surfaceToView);\n    vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);\n\n    float fakeLight = dot(u_lightDirection, normal) * .5 + .5;\n    float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);\n    vec4 specularMapColor = texture2D(specularMap, v_texcoord);\n    vec3 effectiveSpecular = specular * specularMapColor.rgb;\n\n    vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord);\n    vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;\n    float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;\n\n    gl_FragColor = vec4(\n        emissive +\n        ambient * u_ambientLight +\n        effectiveDiffuse * fakeLight +\n        effectiveSpecular * pow(specularLight, shininess),\n        effectiveOpacity);\n  }\n  ";
function main() {
    return __awaiter(this, void 0, void 0, function () {
        function getExtents(positions) {
            var min = positions.slice(0, 3);
            var max = positions.slice(0, 3);
            for (var i = 3; i < positions.length; i += 3) {
                for (var j = 0; j < 3; ++j) {
                    var v = positions[i + j];
                    min[j] = Math.min(v, min[j]);
                    max[j] = Math.max(v, max[j]);
                }
            }
            return { min: min, max: max };
        }
        function getGeometriesExtents(geometries) {
            return geometries.reduce(function (_a, _b) {
                var min = _a.min, max = _a.max;
                var data = _b.data;
                var minMax = getExtents(data.position);
                return {
                    min: min.map(function (min, ndx) { return Math.min(minMax.min[ndx], min); }),
                    max: max.map(function (max, ndx) { return Math.max(minMax.max[ndx], max); }),
                };
            }, {
                min: Array(3).fill(Number.POSITIVE_INFINITY),
                max: Array(3).fill(Number.NEGATIVE_INFINITY),
            });
        }
        function degToRad(deg) {
            return deg * Math.PI / 180;
        }
        function render(time) {
            time *= 0.001; // convert to seconds
            Device_1.default.Instance.resizeCanvasToDisplaySize(gl.canvas);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.enable(gl.DEPTH_TEST);
            var fieldOfViewRadians = degToRad(60);
            var aspect = gl.canvas.width / gl.canvas.height;
            var projection = Matrix_1.glMatrix.mat4.perspective(null, fieldOfViewRadians, aspect, zNear, zFar);
            var up = [0, 1, 0];
            // Compute the camera's matrix using look at.
            var camera = Matrix_1.glMatrix.mat4.lookAt2(null, cameraPosition, cameraTarget, up);
            // Make a view matrix from the camera matrix.
            var view = Matrix_1.glMatrix.mat4.invert(null, camera);
            var sharedUniforms = {
                u_lightDirection: Matrix_1.glMatrix.vec3.normalize(null, [-1, 3, 5]),
                u_view: view,
                u_projection: projection,
                u_viewWorldPosition: cameraPosition,
            };
            gl.useProgram(meshProgramInfo.spGlID);
            // calls gl.uniform
            Shader_1.G_ShaderFactory.setUniforms(meshProgramInfo.uniSetters, sharedUniforms);
            // compute the world matrix once since all parts
            // are at the same space.
            var u_world = Matrix_1.glMatrix.mat4.rotateY(null, Matrix_1.glMatrix.mat4.identity(null), time);
            Matrix_1.glMatrix.mat4.translate(u_world, u_world, objOffset);
            for (var _i = 0, _a = objData.parts; _i < _a.length; _i++) {
                var _b = _a[_i], bufferInfo = _b.bufferInfo, material = _b.material;
                // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
                Shader_1.G_ShaderFactory.setBuffersAndAttributes(meshProgramInfo.attrSetters, bufferInfo);
                // calls gl.uniform
                Shader_1.G_ShaderFactory.setUniforms(meshProgramInfo.uniSetters, {
                    u_world: u_world,
                });
                Shader_1.G_ShaderFactory.setUniforms(meshProgramInfo.uniSetters, material);
                // calls gl.drawArrays or gl.drawElements
                Shader_1.G_ShaderFactory.drawBufferInfo(bufferInfo);
            }
            requestAnimationFrame(render);
        }
        var gl, meshProgramInfo, str, str1, str2, str3, objData, extents, range, objOffset, cameraTarget, radius, cameraPosition, zNear, zFar;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gl = Device_1.default.Instance.gl;
                    if (!gl) {
                        return [2 /*return*/];
                    }
                    meshProgramInfo = Shader_1.G_ShaderFactory.createProgramInfo(vs, fs);
                    str = "http:localhost:3000/res/models/windmill/windmill.obj";
                    str1 = "http:localhost:3000/res/models/chair/chair.obj";
                    str2 = "https://webglfundamentals.org/webgl/resources/models/book-vertex-chameleon-study/book.obj";
                    str3 = "http:localhost:3000/res/models/book/book.obj";
                    return [4 /*yield*/, OBJParseHelper_1.OBJParseHelper.load(gl, str3)];
                case 1:
                    objData = _a.sent();
                    extents = getGeometriesExtents(objData.obj.geometries);
                    range = Matrix_1.glMatrix.mat4.subtractVectors(null, extents.max, extents.min);
                    objOffset = Matrix_1.glMatrix.mat4.scaleVector(null, Matrix_1.glMatrix.mat4.addVectors(null, extents.min, Matrix_1.glMatrix.mat4.scaleVector(null, range, 0.5)), -1);
                    cameraTarget = [0, 0, 0];
                    radius = Matrix_1.glMatrix.vec3.length(range) * 0.5;
                    cameraPosition = Matrix_1.glMatrix.mat4.addVectors(null, cameraTarget, [
                        0,
                        0,
                        radius,
                    ]);
                    zNear = radius / 100;
                    zFar = radius * 30;
                    requestAnimationFrame(render);
                    return [2 /*return*/];
            }
        });
    });
}
var ObjTest = /** @class */ (function () {
    function ObjTest() {
    }
    ObjTest.run = function () {
        main();
    };
    return ObjTest;
}());
exports.default = ObjTest;
//# sourceMappingURL=ObjTest.js.map