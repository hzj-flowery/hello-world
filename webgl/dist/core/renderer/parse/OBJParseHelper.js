"use strict";
// This is not a full .obj parser.
// see http://paulbourke.net/dataformats/obj/
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBJParseHelper = void 0;
var Matrix_1 = require("../../Matrix");
var MathUtils_1 = require("../../utils/MathUtils");
var Shader_1 = require("../shader/Shader");
var OBJParseHelper;
(function (OBJParseHelper) {
    function create1PixelTexture(gl, pixel) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(pixel));
        return texture;
    }
    function createTexture(gl, url) {
        var texture = create1PixelTexture(gl, [128, 192, 255, 255]);
        // Asynchronously load an image
        var image = new Image();
        image.src = url;
        image.addEventListener('load', function () {
            // Now that the image has loaded make copy it to the texture.
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            // Check if the image is a power of 2 in both dimensions.
            if (MathUtils_1.MathUtils.isPowerOf2(image.width) && MathUtils_1.MathUtils.isPowerOf2(image.height)) {
                // Yes, it's a power of 2. Generate mips.
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            else {
                // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        });
        return texture;
    }
    function makeIndexIterator(indices) {
        var ndx = 0;
        var fn = function () { return indices[ndx++]; };
        fn.reset = function () { ndx = 0; };
        fn.numElements = indices.length;
        return fn;
    }
    function makeUnindexedIterator(positions) {
        var ndx = 0;
        var fn = function () { return ndx++; };
        fn.reset = function () { ndx = 0; };
        fn.numElements = positions.length / 3;
        return fn;
    }
    var subtractVector2 = function (a, b) { return a.map(function (v, ndx) { return v - b[ndx]; }); };
    //构造切线
    function generateTangents(position, texcoord, indices) {
        var getNextIndex = indices ? makeIndexIterator(indices) : makeUnindexedIterator(position);
        var numFaceVerts = getNextIndex.numElements;
        var numFaces = numFaceVerts / 3;
        var tangents = [];
        for (var i = 0; i < numFaces; ++i) {
            var n1 = getNextIndex();
            var n2 = getNextIndex();
            var n3 = getNextIndex();
            var p1 = position.slice(n1 * 3, n1 * 3 + 3);
            var p2 = position.slice(n2 * 3, n2 * 3 + 3);
            var p3 = position.slice(n3 * 3, n3 * 3 + 3);
            var uv1 = texcoord.slice(n1 * 2, n1 * 2 + 2);
            var uv2 = texcoord.slice(n2 * 2, n2 * 2 + 2);
            var uv3 = texcoord.slice(n3 * 2, n3 * 2 + 2);
            var dp12 = Matrix_1.glMatrix.mat4.subtractVectors(null, p2, p1);
            var dp13 = Matrix_1.glMatrix.mat4.subtractVectors(null, p3, p1);
            var duv12 = subtractVector2(uv2, uv1);
            var duv13 = subtractVector2(uv3, uv1);
            var f = 1.0 / (duv12[0] * duv13[1] - duv13[0] * duv12[1]);
            var tangent = Number.isFinite(f)
                ? Matrix_1.glMatrix.vec3.normalize(null, Matrix_1.glMatrix.mat4.scaleVector(null, Matrix_1.glMatrix.mat4.subtractVectors(null, Matrix_1.glMatrix.mat4.scaleVector(null, dp12, duv13[1]), Matrix_1.glMatrix.mat4.scaleVector(null, dp13, duv12[1])), f))
                : [1, 0, 0];
            tangents.push.apply(tangents, tangent);
            tangents.push.apply(tangents, tangent);
            tangents.push.apply(tangents, tangent);
        }
        return tangents;
    }
    function parseOBJ(text) {
        // because indices are base 1 let's just fill in the 0th data
        var objPositions = [[0, 0, 0]];
        var objTexcoords = [[0, 0]];
        var objNormals = [[0, 0, 0]];
        var objColors = [[0, 0, 0]];
        // same order as `f` indices
        var objVertexData = [
            objPositions,
            objTexcoords,
            objNormals,
            objColors,
        ];
        // same order as `f` indices
        var webglVertexData = [
            [],
            [],
            [],
            [],
        ];
        var materialLibs = [];
        var geometries = [];
        var geometry;
        var groups = ['default'];
        var material = 'default';
        var object = 'default';
        var noop = function () { };
        function newGeometry() {
            // If there is an existing geometry and it's
            // not empty then start a new one.
            if (geometry && geometry.data.position.length) {
                geometry = undefined;
            }
        }
        function setGeometry() {
            if (!geometry) {
                var position = [];
                var texcoord = [];
                var normal = [];
                var color = [];
                webglVertexData = [
                    position,
                    texcoord,
                    normal,
                    color,
                ];
                geometry = {
                    object: object,
                    groups: groups,
                    material: material,
                    data: {
                        position: position,
                        texcoord: texcoord,
                        normal: normal,
                        color: color,
                    },
                };
                geometries.push(geometry);
            }
        }
        function addVertex(vert) {
            var ptn = vert.split('/');
            ptn.forEach(function (objIndexStr, i) {
                if (!objIndexStr) {
                    return;
                }
                var objIndex = parseInt(objIndexStr);
                var index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
                webglVertexData[i].push.apply(webglVertexData[i], objVertexData[i][index]);
                // if this is the position index (index 0) and we parsed
                // vertex colors then copy the vertex colors to the webgl vertex color data
                if (i === 0 && objColors.length > 1) {
                    geometry.data.color.push.apply(geometry.data.color, objColors[index]);
                }
            });
        }
        var keywords = {
            v: function (parts) {
                // if there are more than 3 values here they are vertex colors
                if (parts.length > 3) {
                    objPositions.push(parts.slice(0, 3).map(parseFloat));
                    objColors.push(parts.slice(3).map(parseFloat));
                }
                else {
                    objPositions.push(parts.map(parseFloat));
                }
            },
            vn: function (parts) {
                objNormals.push(parts.map(parseFloat));
            },
            vt: function (parts) {
                // should check for missing v and extra w?
                objTexcoords.push(parts.map(parseFloat));
            },
            f: function (parts) {
                setGeometry();
                var numTriangles = parts.length - 2;
                for (var tri = 0; tri < numTriangles; ++tri) {
                    addVertex(parts[0]);
                    addVertex(parts[tri + 1]);
                    addVertex(parts[tri + 2]);
                }
            },
            s: noop,
            mtllib: function (parts, unparsedArgs) {
                // the spec says there can be multiple filenames here
                // but many exist with spaces in a single filename
                materialLibs.push(unparsedArgs);
            },
            usemtl: function (parts, unparsedArgs) {
                material = unparsedArgs;
                newGeometry();
            },
            g: function (parts) {
                groups = parts;
                newGeometry();
            },
            o: function (parts, unparsedArgs) {
                object = unparsedArgs;
                newGeometry();
            },
        };
        var keywordRE = /(\w*)(?: )*(.*)/;
        var lines = text.split('\n');
        for (var lineNo = 0; lineNo < lines.length; ++lineNo) {
            var line = lines[lineNo].trim();
            if (line === '' || line.startsWith('#')) {
                continue;
            }
            var m = keywordRE.exec(line);
            if (!m) {
                continue;
            }
            var keyword = m[1], unparsedArgs = m[2];
            var parts = line.split(/\s+/).slice(1);
            var handler = keywords[keyword];
            if (!handler) {
                console.warn('unhandled keyword:', keyword); // eslint-disable-line no-console
                continue;
            }
            handler(parts, unparsedArgs);
        }
        // remove any arrays that have no entries.
        for (var _i = 0, geometries_1 = geometries; _i < geometries_1.length; _i++) {
            var geometry_1 = geometries_1[_i];
            geometry_1.data = Object.entries(Object.entries(geometry_1.data).filter(function (_a) {
                var array = _a[1];
                return array["length"] > 0;
            }));
        }
        // remove any arrays that have no entries.
        for (var _a = 0, geometries_2 = geometries; _a < geometries_2.length; _a++) {
            var geometry_2 = geometries_2[_a];
            {
                // geometry.data = Object.fromEntries(
                // Object.entries(geometry.data).filter(([, array]) => array.length > 0));
                var arrData = Object.entries(geometry_2.data).filter(function (_a) {
                    var array = _a[1];
                    return array["length"] > 0;
                });
                console.log("arrData------", arrData);
                var targetData = {};
                for (var j in arrData) {
                    var curData = arrData[j][1][1];
                    var key = curData[0];
                    var value = curData[1];
                    targetData[key] = value;
                }
                //重新赋值
                geometry_2.data = targetData;
                console.log("targetData------", targetData);
            }
        }
        return {
            geometries: geometries,
            materialLibs: materialLibs,
        };
    }
    function parseMapArgs(unparsedArgs) {
        // TODO: handle options
        return unparsedArgs;
    }
    function parseMTL(text) {
        var materials = {};
        var material;
        var keywords = {
            newmtl: function (parts, unparsedArgs) {
                material = {};
                materials[unparsedArgs] = material;
            },
            /* eslint brace-style:0 */
            Ns: function (parts) { material.shininess = parseFloat(parts[0]); },
            Ka: function (parts) { material.ambient = parts.map(parseFloat); },
            Kd: function (parts) { material.diffuse = parts.map(parseFloat); },
            Ks: function (parts) { material.specular = parts.map(parseFloat); },
            Ke: function (parts) { material.emissive = parts.map(parseFloat); },
            map_Kd: function (parts, unparsedArgs) { material.diffuseMap = parseMapArgs(unparsedArgs); },
            map_Ns: function (parts, unparsedArgs) { material.specularMap = parseMapArgs(unparsedArgs); },
            map_Bump: function (parts, unparsedArgs) { material.normalMap = parseMapArgs(unparsedArgs); },
            Ni: function (parts) { material.opticalDensity = parseFloat(parts[0]); },
            d: function (parts) { material.opacity = parseFloat(parts[0]); },
            illum: function (parts) { material.illum = parseInt(parts[0]); },
        };
        var keywordRE = /(\w*)(?: )*(.*)/;
        var lines = text.split('\n');
        for (var lineNo = 0; lineNo < lines.length; ++lineNo) {
            var line = lines[lineNo].trim();
            if (line === '' || line.startsWith('#')) {
                continue;
            }
            var m = keywordRE.exec(line);
            if (!m) {
                continue;
            }
            var keyword = m[1], unparsedArgs = m[2];
            var parts = line.split(/\s+/).slice(1);
            var handler = keywords[keyword];
            if (!handler) {
                console.warn('unhandled keyword:', keyword); // eslint-disable-line no-console
                continue;
            }
            handler(parts, unparsedArgs);
        }
        return materials;
    }
    function load(gl, path) {
        return __awaiter(this, void 0, void 0, function () {
            var objHref, response, text, obj, baseHref, matTexts, materials, textures, _loop_1, _i, _a, material, defaultMaterial, parts;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        objHref = path;
                        return [4 /*yield*/, fetch(objHref)];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, response.text()];
                    case 2:
                        text = _b.sent();
                        obj = parseOBJ(text);
                        baseHref = new URL(objHref, window.location.href);
                        return [4 /*yield*/, Promise.all(obj.materialLibs.map(function (filename) { return __awaiter(_this, void 0, void 0, function () {
                                var matHref, response;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            matHref = new URL(filename, baseHref).href;
                                            console.log("material----", filename);
                                            return [4 /*yield*/, fetch(matHref)];
                                        case 1:
                                            response = _a.sent();
                                            return [4 /*yield*/, response.text()];
                                        case 2: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }))];
                    case 3:
                        matTexts = _b.sent();
                        materials = parseMTL(matTexts.join('\n'));
                        textures = {
                            defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
                            defaultNormal: create1PixelTexture(gl, [127, 127, 255, 0]),
                        };
                        _loop_1 = function (material) {
                            Object.entries(material)
                                .filter(function (_a) {
                                var key = _a[0];
                                return key.endsWith('Map');
                            })
                                .forEach(function (_a) {
                                var key = _a[0], filename = _a[1];
                                var texture = textures[filename];
                                if (!texture) {
                                    var textureHref = new URL(filename, baseHref).href;
                                    console.log("textures---------", filename);
                                    texture = createTexture(gl, textureHref);
                                    textures[filename] = texture;
                                }
                                material[key] = texture;
                            });
                        };
                        // load texture for materials
                        for (_i = 0, _a = Object.values(materials); _i < _a.length; _i++) {
                            material = _a[_i];
                            _loop_1(material);
                        }
                        // hack the materials so we can see the specular map
                        Object.values(materials).forEach(function (m) {
                            m.shininess = 25;
                            m.specular = [3, 2, 1];
                        });
                        defaultMaterial = {
                            diffuse: [1, 1, 1],
                            diffuseMap: textures.defaultWhite,
                            normalMap: textures.defaultNormal,
                            ambient: [0, 0, 0],
                            specular: [1, 1, 1],
                            specularMap: textures.defaultWhite,
                            shininess: 400,
                            opacity: 1,
                        };
                        parts = obj.geometries.map(function (_a) {
                            // Because data is just named arrays like this
                            //
                            // {
                            //   position: [...],
                            //   texcoord: [...],
                            //   normal: [...],
                            // }
                            //
                            // and because those names match the attributes in our vertex
                            // shader we can pass it directly into `createBufferInfoFromArrays`
                            // from the article "less code more fun".
                            var material = _a.material, data = _a.data;
                            if (data.color) {
                                if (data.position.length === data.color.length) {
                                    // it's 3. The our helper library assumes 4 so we need
                                    // to tell it there are only 3.
                                    data.color = { numComponents: 3, data: data.color };
                                }
                            }
                            else {
                                // there are no vertex colors so just use constant white
                                data.color = { value: [1, 1, 1, 1] };
                            }
                            // generate tangents if we have the data to do so.
                            if (data.texcoord && data.normal) {
                                data.tangent = generateTangents(data.position, data.texcoord);
                            }
                            else {
                                // There are no tangents
                                data.tangent = { value: [1, 0, 0] };
                            }
                            if (!data.texcoord) {
                                data.texcoord = { value: [0, 0] };
                            }
                            if (!data.normal) {
                                // we probably want to generate normals if there are none
                                data.normal = { value: [0, 0, 1] };
                            }
                            // create a buffer for each array by calling
                            // gl.createBuffer, gl.bindBuffer, gl.bufferData
                            var bufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(data);
                            var retData = {};
                            retData.bufferInfo = bufferInfo;
                            retData.material = {};
                            for (var j in defaultMaterial) {
                                retData.material[j] = defaultMaterial[j];
                            }
                            for (var j_1 in materials[material]) {
                                retData.material[j_1] = materials[material][j_1];
                            }
                            return retData;
                        });
                        return [2 /*return*/, { obj: obj, parts: parts }];
                }
            });
        });
    }
    OBJParseHelper.load = load;
})(OBJParseHelper = exports.OBJParseHelper || (exports.OBJParseHelper = {}));
//# sourceMappingURL=OBJParseHelper.js.map