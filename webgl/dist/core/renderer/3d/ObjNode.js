"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sprite_1 = require("../base/Sprite");
var OBJParseHelper_1 = require("../parse/OBJParseHelper");
var Shader_1 = require("../shader/Shader");
var vs = "\n  attribute vec4 a_position;\n  attribute vec3 a_normal;\n  attribute vec3 a_tangent;\n  attribute vec2 a_texcoord;\n  attribute vec4 a_color;\n\n  uniform mat4 u_projection;\n  uniform mat4 u_view;\n  uniform mat4 u_world;\n  uniform vec3 u_viewWorldPosition;\n\n  varying vec3 v_normal;\n  varying vec3 v_tangent;\n  varying vec3 v_surfaceToView;\n  varying vec2 v_texcoord;\n  varying vec4 v_color;\n\n  void main() {\n    vec4 worldPosition = u_world * a_position;\n    gl_Position = u_projection * u_view * worldPosition;\n    v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;\n    mat3 normalMat = mat3(u_world);\n    v_normal = normalize(normalMat * a_normal);\n    v_tangent = normalize(normalMat * a_tangent);\n\n    v_texcoord = a_texcoord;\n    v_color = a_color;\n  }\n  ";
var fs = "\n  precision highp float;\n\n  varying vec3 v_normal;\n  varying vec3 v_tangent;\n  varying vec3 v_surfaceToView;\n  varying vec2 v_texcoord;\n  varying vec4 v_color;\n\n  uniform vec3 diffuse;\n  uniform sampler2D diffuseMap;\n  uniform vec3 ambient;\n  uniform vec3 emissive;\n  uniform vec3 specular;\n  uniform sampler2D specularMap;\n  uniform float shininess;\n  uniform sampler2D normalMap;\n  uniform float opacity;\n  uniform vec3 u_lightDirection;\n  uniform vec3 u_ambientLight;\n\n  void main () {\n    vec3 normal = normalize(v_normal) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n    vec3 tangent = normalize(v_tangent) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n    vec3 bitangent = normalize(cross(normal, tangent));\n\n    mat3 tbn = mat3(tangent, bitangent, normal);\n    normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.;\n    normal = normalize(tbn * normal);\n\n    vec3 surfaceToViewDirection = normalize(v_surfaceToView);\n    vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);\n\n    float fakeLight = dot(u_lightDirection, normal) * .5 + .5;\n    float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);\n    vec4 specularMapColor = texture2D(specularMap, v_texcoord);\n    vec3 effectiveSpecular = specular * specularMapColor.rgb;\n\n    vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord);\n    vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;\n    float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;\n\n    gl_FragColor = vec4(\n        emissive +\n        ambient * u_ambientLight +\n        effectiveDiffuse * fakeLight +\n        effectiveSpecular * pow(specularLight, shininess),\n        effectiveOpacity);\n  }\n";
var ObjNode = /** @class */ (function (_super) {
    __extends(ObjNode, _super);
    function ObjNode(gl) {
        return _super.call(this, gl) || this;
    }
    ObjNode.prototype.onInit = function () {
        this._meshProgramInfo = Shader_1.G_ShaderFactory.createProgramInfo(vs, fs);
        this.load();
    };
    ObjNode.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var str, str1, str2, str3, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        str = "http:localhost:3000/res/models/windmill/windmill.obj";
                        str1 = "http:localhost:3000/res/models/chair/chair.obj";
                        str2 = "https://webglfundamentals.org/webgl/resources/models/book-vertex-chameleon-study/book.obj";
                        str3 = "http:localhost:3000/res/models/book/book.obj";
                        _a = this;
                        return [4 /*yield*/, OBJParseHelper_1.OBJParseHelper.load(this.gl, str3)];
                    case 1:
                        _a._objData = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ObjNode.prototype.draw = function (time) {
    };
    return ObjNode;
}(Sprite_1.SY.SpriteBase));
exports.default = ObjNode;
//# sourceMappingURL=ObjNode.js.map