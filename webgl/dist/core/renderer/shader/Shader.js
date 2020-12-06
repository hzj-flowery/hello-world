"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shader = exports.G_ShaderFactory = exports.BufferAttribsData = exports.ShaderData = void 0;
var GLEnums_1 = require("../gfx/GLEnums");
var GLapi_1 = require("../gfx/GLapi");
var ShaderType;
(function (ShaderType) {
    ShaderType[ShaderType["VERTEX"] = 1] = "VERTEX";
    ShaderType[ShaderType["FRAGMENT"] = 2] = "FRAGMENT";
})(ShaderType || (ShaderType = {}));
var vertextBaseCode = 'attribute vec3 a_position;' +
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
    '}';
//基础的shader的片段着色器
var fragBaseCode = 'precision mediump float;' +
    'varying vec2 v_uv;' +
    'uniform samplerCube u_skybox;' +
    'uniform sampler2D u_texCoord;' +
    'uniform mat4 u_PVM_Matrix_Inverse;' +
    'uniform vec4 u_color;' +
    'uniform vec4 u_color_dir;' +
    'void main() {' +
    'gl_FragColor = texture2D(u_texCoord, v_uv);' +
    '}';
var ShaderData = /** @class */ (function () {
    function ShaderData(spGLID, index) {
        this._textureUnit = 0;
        this._index = -1;
        this._spGLID = spGLID;
        this._textureUnit = 0;
        this._index = index;
    }
    Object.defineProperty(ShaderData.prototype, "spGlID", {
        get: function () {
            return this._spGLID;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderData.prototype, "textureUnit", {
        get: function () {
            return this._textureUnit;
        },
        enumerable: false,
        configurable: true
    });
    ShaderData.prototype.addTextureUnit = function () {
        var before = this._textureUnit;
        this._textureUnit++;
        return before;
    };
    Object.defineProperty(ShaderData.prototype, "uniSetters", {
        get: function () {
            return this._uniformSetters;
        },
        set: function (set) {
            this._uniformSetters = set;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderData.prototype, "attrSetters", {
        get: function () {
            return this._attribSetters;
        },
        set: function (set) {
            this._attribSetters = set;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderData.prototype, "Index", {
        get: function () {
            return this._index;
        },
        enumerable: false,
        configurable: true
    });
    return ShaderData;
}());
exports.ShaderData = ShaderData;
var BufferAttribsData = /** @class */ (function () {
    function BufferAttribsData(attribs, numElements, indices) {
        this.attribs = attribs;
        this.numElements = numElements;
        this.indices = indices;
    }
    return BufferAttribsData;
}());
exports.BufferAttribsData = BufferAttribsData;
/**
 * shader工厂
 */
var ShaderFactory = /** @class */ (function () {
    function ShaderFactory() {
        this.texcoordRE = /coord|texture/i;
        this.colorRE = /color|colour/i;
        /**
         * tries to get the number of elements from a set of arrays.
         */
        this.positionKeys = ['position', 'positions', 'a_position'];
    }
    ShaderFactory.prototype.init = function (gl) {
        this._gl = gl;
        this._shaderData = [];
    };
    /**
     * 获取一个shaderData
     * @param index
     */
    ShaderFactory.prototype.getShareDataByIndex = function (index) {
        var ret;
        this._shaderData.forEach(function (value, index) {
            if (value.Index == index) {
                ret = value;
            }
        });
        return ret;
    };
    /**
     * 获取一个shaderData
     * @param glID
     */
    ShaderFactory.prototype.getShareDataByGlID = function (glID) {
        var ret;
        this._shaderData.forEach(function (value, index) {
            if (value.spGlID == glID) {
                ret = value;
            }
        });
        return ret;
    };
    /**
     * 生成一个shaderData
     * @param GLID
     * @param textureUnit
     * @param USet
     * @param ASet
     */
    ShaderFactory.prototype.createShaderData = function (GLID) {
        var ret = this.getShareDataByGlID(GLID);
        if (ret == null) {
            var index = this._shaderData.length;
            var res = new ShaderData(GLID, index);
            this._shaderData.push(res);
            return res;
        }
        return ret;
    };
    /**
    *
    * @param shaderType shader的类型 1代表顶点着色器 2代表像素着色器
    * @param shaderSource shader的源码
    */
    ShaderFactory.prototype.loadShader = function (shaderType, shaderSource) {
        // 创建着色器
        var shader;
        if (shaderType == ShaderType.FRAGMENT) {
            shader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
        }
        else if (shaderType == ShaderType.VERTEX) {
            shader = this._gl.createShader(this._gl.VERTEX_SHADER);
        }
        else {
            return null;
        }
        // 编译着色器
        this._gl.shaderSource(shader, shaderSource);
        this._gl.compileShader(shader);
        // 判断编译是否成功
        if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
            alert(this._gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
    /**
     *
     * @param vertextCode 顶点shader
     * @param fragCode 片段shader
     */
    ShaderFactory.prototype.createShader = function (vertextCode, fragCode) {
        if (vertextCode === void 0) { vertextCode = vertextBaseCode; }
        if (fragCode === void 0) { fragCode = fragBaseCode; }
        // 从 DOM 上创建对应的着色器
        var vertexShader = this.loadShader(ShaderType.VERTEX, vertextCode);
        var fragmentShader = this.loadShader(ShaderType.FRAGMENT, fragCode);
        // 创建程序并连接着色器
        var shaderGLID = this._gl.createProgram();
        this._gl.attachShader(shaderGLID, vertexShader);
        this._gl.attachShader(shaderGLID, fragmentShader);
        this._gl.linkProgram(shaderGLID);
        // 连接失败的检测
        if (!this._gl.getProgramParameter(shaderGLID, this._gl.LINK_STATUS)) {
            alert("Failed to setup shaders");
        }
        return shaderGLID;
    };
    ShaderFactory.prototype.onCreateShader = function () {
    };
    ShaderFactory.prototype.destroyShder = function (shaderProgram) {
    };
    ShaderFactory.prototype.createAttribSetter = function (index) {
        var gl = this._gl;
        return function (b) {
            if (b.value) {
                gl.disableVertexAttribArray(index);
                switch (b.value.length) {
                    case 4:
                        gl.vertexAttrib4fv(index, b.value);
                        break;
                    case 3:
                        gl.vertexAttrib3fv(index, b.value);
                        break;
                    case 2:
                        gl.vertexAttrib2fv(index, b.value);
                        break;
                    case 1:
                        gl.vertexAttrib1fv(index, b.value);
                        break;
                    default:
                        throw new Error('the length of a float constant value must be between 1 and 4!');
                }
            }
            else {
                gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
                gl.enableVertexAttribArray(index);
                gl.vertexAttribPointer(index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
            }
        };
    };
    ShaderFactory.prototype.createAttributeSetters = function (shaderData) {
        var gl = this._gl;
        var program = shaderData.spGlID;
        var attribSetters = {};
        var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (var ii = 0; ii < numAttribs; ++ii) {
            var attribInfo = gl.getActiveAttrib(program, ii);
            if (!attribInfo) {
                break;
            }
            var index = gl.getAttribLocation(program, attribInfo.name);
            attribSetters[attribInfo.name] = this.createAttribSetter(index);
        }
        return attribSetters;
    };
    /**
   * Returns the corresponding bind point for a given sampler type
   */
    ShaderFactory.prototype.getBindPointForSamplerType = function (gl, type) {
        if (type === gl.SAMPLER_2D)
            return gl.TEXTURE_2D; // eslint-disable-line
        if (type === gl.SAMPLER_CUBE)
            return gl.TEXTURE_CUBE_MAP; // eslint-disable-line
        return undefined;
    };
    /**
       * Creates a setter for a uniform of the given program with it's
       * location embedded in the setter.
       * @param {WebGLProgram} program
       * @param {WebGLUniformInfo} uniformInfo
       * @returns {function} the created setter.
       */
    ShaderFactory.prototype.createUniformSetter = function (uniformInfo, shaderData) {
        var gl = this._gl;
        var program = shaderData.spGlID;
        var location = gl.getUniformLocation(program, uniformInfo.name);
        var type = uniformInfo.type;
        // Check if this uniform is an array
        var isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === '[0]');
        if (type === gl.FLOAT && isArray) {
            return function (v) {
                gl.uniform1fv(location, v);
            };
        }
        if (type === gl.FLOAT) {
            return function (v) {
                gl.uniform1f(location, v);
            };
        }
        if (type === gl.FLOAT_VEC2) {
            return function (v) {
                gl.uniform2fv(location, v);
            };
        }
        if (type === gl.FLOAT_VEC3) {
            return function (v) {
                gl.uniform3fv(location, v);
            };
        }
        if (type === gl.FLOAT_VEC4) {
            return function (v) {
                gl.uniform4fv(location, v);
            };
        }
        if (type === gl.INT && isArray) {
            return function (v) {
                gl.uniform1iv(location, v);
            };
        }
        if (type === gl.INT) {
            return function (v) {
                gl.uniform1i(location, v);
            };
        }
        if (type === gl.INT_VEC2) {
            return function (v) {
                gl.uniform2iv(location, v);
            };
        }
        if (type === gl.INT_VEC3) {
            return function (v) {
                gl.uniform3iv(location, v);
            };
        }
        if (type === gl.INT_VEC4) {
            return function (v) {
                gl.uniform4iv(location, v);
            };
        }
        if (type === gl.BOOL) {
            return function (v) {
                gl.uniform1iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC2) {
            return function (v) {
                gl.uniform2iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC3) {
            return function (v) {
                gl.uniform3iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC4) {
            return function (v) {
                gl.uniform4iv(location, v);
            };
        }
        if (type === gl.FLOAT_MAT2) {
            return function (v) {
                gl.uniformMatrix2fv(location, false, v);
            };
        }
        if (type === gl.FLOAT_MAT3) {
            return function (v) {
                gl.uniformMatrix3fv(location, false, v);
            };
        }
        if (type === gl.FLOAT_MAT4) {
            return function (v) {
                gl.uniformMatrix4fv(location, false, v);
            };
        }
        if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
            var units = [];
            for (var ii = 0; ii < uniformInfo.size; ++ii) {
                units.push(shaderData.addTextureUnit());
            }
            return function (bindPoint, units) {
                return function (textures) {
                    gl.uniform1iv(location, units);
                    textures.forEach(function (texture, index) {
                        gl.activeTexture(gl.TEXTURE0 + units[index]);
                        gl.bindTexture(bindPoint, texture);
                    });
                };
            }(this.getBindPointForSamplerType(gl, type), units);
        }
        if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
            return function (bindPoint, unit) {
                return function (texture) {
                    gl.uniform1i(location, unit);
                    gl.activeTexture(gl.TEXTURE0 + unit);
                    gl.bindTexture(bindPoint, texture);
                };
            }(this.getBindPointForSamplerType(gl, type), shaderData.addTextureUnit());
        }
        throw ('unknown type: 0x' + type.toString(16)); // we should never get here.
    };
    /**
     * uniform变量设置器
     */
    ShaderFactory.prototype.createUniformSetters = function (shaderData) {
        var program = shaderData.spGlID;
        var gl = this._gl;
        var uniformSetters = {};
        var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (var ii = 0; ii < numUniforms; ++ii) {
            var uniformInfo = gl.getActiveUniform(program, ii);
            if (!uniformInfo) {
                break;
            }
            var name_1 = uniformInfo.name;
            // remove the array suffix.
            if (name_1.substr(-3) === '[0]') {
                name_1 = name_1.substr(0, name_1.length - 3);
            }
            var setter = this.createUniformSetter(uniformInfo, shaderData);
            uniformSetters[name_1] = setter;
        }
        return uniformSetters;
    };
    /**
     * 创建一个shader
     * @param vs
     * @param fs
     */
    ShaderFactory.prototype.createProgramInfo = function (vs, fs) {
        var glID = this.createShader(vs, fs);
        var shaderData = this.createShaderData(glID);
        var uniformSetters = this.createUniformSetters(shaderData);
        var attribSetters = this.createAttributeSetters(shaderData);
        shaderData.uniSetters = uniformSetters;
        shaderData.attrSetters = attribSetters;
        return shaderData;
    };
    ShaderFactory.prototype.getShaderProgram = function (index) {
        return this.getShareDataByIndex(index).spGlID;
    };
    //设置attribute变量
    ShaderFactory.prototype.setBuffersAndAttributes = function (attribSetters, buffers) {
        var gl = this._gl;
        var attribs = buffers.attribs;
        var setters = attribSetters;
        Object.keys(attribs).forEach(function (name) {
            var setter = setters[name];
            if (setter) {
                setter(attribs[name]);
            }
            else {
                // console.log("error  绑定attribute变量失败-----",name);
            }
        });
        if (buffers.indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        }
    };
    //设置uniform变量
    ShaderFactory.prototype.setUniforms = function (uniformSetters) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        var setters = uniformSetters;
        var _loop_1 = function (uniforms) {
            Object.keys(uniforms).forEach(function (name) {
                var setter = setters[name];
                if (setter) {
                    setter(uniforms[name]);
                }
                else {
                    // console.log("error  绑定uniform变量失败------",name);
                }
            });
        };
        for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
            var uniforms = values_1[_a];
            _loop_1(uniforms);
        }
    };
    //启动顶点着色器绘制
    ShaderFactory.prototype.drawBufferInfo = function (bufferInfo, primitiveType, count, offset) {
        var gl = this._gl;
        var indices = bufferInfo.indices;
        primitiveType = primitiveType === undefined ? gl.TRIANGLES : primitiveType;
        var numElements = count === undefined ? bufferInfo.numElements : count;
        offset = offset === undefined ? 0 : offset;
        if (indices) {
            gl.drawElements(primitiveType, numElements, gl.UNSIGNED_SHORT, offset);
        }
        else {
            gl.drawArrays(primitiveType, offset, numElements);
        }
    };
    //ext---------------------------------------------------------------------------------
    // Add `push` to a typed array. It just keeps a 'cursor'
    // and allows use to `push` values into the array so we
    // don't have to manually compute offsets
    ShaderFactory.prototype.augmentTypedArray = function (typedArray, numComponents) {
        var cursor = 0;
        typedArray.push = function () {
            for (var ii = 0; ii < arguments.length; ++ii) {
                var value = arguments[ii];
                if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
                    for (var jj = 0; jj < value.length; ++jj) {
                        typedArray[cursor++] = value[jj];
                    }
                }
                else {
                    typedArray[cursor++] = value;
                }
            }
        };
        typedArray.reset = function (opt_index) {
            cursor = opt_index || 0;
        };
        typedArray.numComponents = numComponents;
        Object.defineProperty(typedArray, 'numElements', {
            get: function () {
                return this.length / this.numComponents | 0;
            },
        });
        return typedArray;
    };
    /**
    * creates a typed array with a `push` function attached
    * so that you can easily *push* values.
    *
    * `push` can take multiple arguments. If an argument is an array each element
    * of the array will be added to the typed array.
    *
    * Example:
    *
    *     let array = createAugmentedTypedArray(3, 2);  // creates a Float32Array with 6 values
    *     array.push(1, 2, 3);
    *     array.push([4, 5, 6]);
    *     // array now contains [1, 2, 3, 4, 5, 6]
    *
    * Also has `numComponents` and `numElements` properties.
    *
    * @param {number} numComponents number of components
    * @param {number} numElements number of elements. The total size of the array will be `numComponents * numElements`.
    * @param {constructor} opt_type A constructor for the type. Default = `Float32Array`.
    * @return {ArrayBuffer} A typed array.
    * @memberOf module:webgl-utils
    */
    ShaderFactory.prototype.createAugmentedTypedArray = function (numComponents, numElements, opt_type) {
        var Type = opt_type || Float32Array;
        return this.augmentTypedArray(new Type(numComponents * numElements), numComponents);
    };
    ShaderFactory.prototype.getArray = function (array) {
        return array.length ? array : array.data;
    };
    ShaderFactory.prototype.guessNumComponentsFromName = function (name, length) {
        var numComponents;
        if (this.texcoordRE.test(name)) {
            numComponents = 2;
        }
        else if (this.colorRE.test(name)) {
            numComponents = 4;
        }
        else {
            numComponents = 3; // position, normals, indices ...
        }
        if (length % numComponents > 0) {
            throw new Error("Can not guess numComponents for attribute '" + name + "'. Tried " + numComponents + " but " + length + " values is not evenly divisible by " + numComponents + ". You should specify it.");
        }
        return numComponents;
    };
    ShaderFactory.prototype.getNumComponents = function (array, arrayName) {
        return array.numComponents || array.size || this.guessNumComponentsFromName(arrayName, this.getArray(array).length);
    };
    ShaderFactory.prototype.getNumElementsFromNonIndexedArrays = function (arrays) {
        var key;
        for (var _i = 0, _a = this.positionKeys; _i < _a.length; _i++) {
            var k = _a[_i];
            if (k in arrays) {
                key = k;
                break;
            }
        }
        key = key || Object.keys(arrays)[0];
        var array = arrays[key];
        var length = this.getArray(array).length;
        var numComponents = this.getNumComponents(array, key);
        var numElements = length / numComponents;
        if (length % numComponents > 0) {
            throw new Error("numComponents " + numComponents + " not correct for length " + length);
        }
        return numElements;
    };
    ShaderFactory.prototype.getGLTypeForTypedArray = function (gl, typedArray) {
        if (typedArray instanceof Int8Array) {
            return gl.BYTE;
        } // eslint-disable-line
        if (typedArray instanceof Uint8Array) {
            return gl.UNSIGNED_BYTE;
        } // eslint-disable-line
        if (typedArray instanceof Int16Array) {
            return gl.SHORT;
        } // eslint-disable-line
        if (typedArray instanceof Uint16Array) {
            return gl.UNSIGNED_SHORT;
        } // eslint-disable-line
        if (typedArray instanceof Int32Array) {
            return gl.INT;
        } // eslint-disable-line
        if (typedArray instanceof Uint32Array) {
            return gl.UNSIGNED_INT;
        } // eslint-disable-line
        if (typedArray instanceof Float32Array) {
            return gl.FLOAT;
        } // eslint-disable-line
        throw 'unsupported typed array type';
    };
    // This is really just a guess. Though I can't really imagine using
    // anything else? Maybe for some compression?
    ShaderFactory.prototype.getNormalizationForTypedArray = function (typedArray) {
        if (typedArray instanceof Int8Array) {
            return true;
        } // eslint-disable-line
        if (typedArray instanceof Uint8Array) {
            return true;
        } // eslint-disable-line
        return false;
    };
    ShaderFactory.prototype.isArrayBuffer = function (a) {
        return a.buffer && a.buffer instanceof ArrayBuffer;
    };
    ShaderFactory.prototype.createBufferFromTypedArray = function (gl, array, type, drawType) {
        type = type || gl.ARRAY_BUFFER;
        var buffer = gl.createBuffer();
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
        return buffer;
    };
    ShaderFactory.prototype.allButIndices = function (name) {
        return name !== 'indices';
    };
    ShaderFactory.prototype.createMapping = function (obj) {
        var mapping = {};
        Object.keys(obj).filter(this.allButIndices).forEach(function (key) {
            mapping['a_' + key] = key;
        });
        return mapping;
    };
    ShaderFactory.prototype.makeTypedArray = function (array, name) {
        if (this.isArrayBuffer(array)) {
            return array;
        }
        if (array.data && this.isArrayBuffer(array.data)) {
            return array.data;
        }
        if (Array.isArray(array)) {
            array = {
                data: array,
            };
        }
        if (!array.numComponents) {
            array.numComponents = this.guessNumComponentsFromName(name, array.length);
        }
        var type = array.type;
        if (!type) {
            if (name === 'indices') {
                type = Uint16Array;
            }
        }
        var typedArray = this.createAugmentedTypedArray(array.numComponents, array.data.length / array.numComponents | 0, type);
        typedArray.push(array.data);
        return typedArray;
    };
    ShaderFactory.prototype.createAttribsFromArrays = function (gl, arrays, opt_mapping) {
        var _this = this;
        var mapping = opt_mapping || this.createMapping(arrays);
        var attribs = {};
        Object.keys(mapping).forEach(function (attribName) {
            var bufferName = mapping[attribName];
            var origArray = arrays[bufferName];
            if (origArray.value) {
                attribs[attribName] = {
                    value: origArray.value,
                };
            }
            else {
                var array = _this.makeTypedArray(origArray, bufferName);
                attribs[attribName] = {
                    buffer: _this.createBufferFromTypedArray(gl, array),
                    numComponents: origArray.numComponents || array.numComponents || _this.guessNumComponentsFromName(bufferName),
                    type: _this.getGLTypeForTypedArray(gl, array),
                    normalize: _this.getNormalizationForTypedArray(array),
                };
            }
        });
        return attribs;
    };
    ShaderFactory.prototype.createBufferInfoFromArrays = function (arrays, opt_mapping) {
        var gl = this._gl;
        var bufferInfo = {
            attribs: this.createAttribsFromArrays(gl, arrays, opt_mapping),
        };
        var indices = arrays.indices;
        if (indices) {
            indices = this.makeTypedArray(indices, 'indices');
            bufferInfo.indices = this.createBufferFromTypedArray(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
            bufferInfo.numElements = indices.length;
        }
        else {
            bufferInfo.numElements = this.getNumElementsFromNonIndexedArrays(arrays);
        }
        return new BufferAttribsData(bufferInfo.attribs, bufferInfo.numElements, bufferInfo.indices);
    };
    return ShaderFactory;
}());
exports.G_ShaderFactory = new ShaderFactory();
var Shader = /** @class */ (function () {
    function Shader(gl, glID) {
        this.USE_NORMAL = false; //法线
        this.USE_LIGHT = false; //光照
        this.USE_SKYBOX = false; //天空盒
        this._gl = gl;
        this._spGLID = glID;
        this.onCreateShader();
    }
    /**
     * 创建一个shader
     * @param vert
     * @param frag
     */
    Shader.create = function (vert, frag) {
        var glID = exports.G_ShaderFactory.createShader(vert, frag);
        return new Shader(exports.G_ShaderFactory._gl, glID);
    };
    Shader.prototype.onCreateShader = function () {
        var shaderProgramGLID = this._spGLID;
        var gl = this._gl;
        this.a_position_loc = gl.getAttribLocation(shaderProgramGLID, "a_position" /* POSITION */);
        this.a_normal_loc = gl.getAttribLocation(shaderProgramGLID, "a_normal" /* NORMAL */);
        this.a_uv_loc = gl.getAttribLocation(shaderProgramGLID, "a_uv" /* UV */);
        this.a_tangent_loc = gl.getAttribLocation(shaderProgramGLID, "a_tangent" /* TANGENT */);
        this.u_color_loc = gl.getUniformLocation(shaderProgramGLID, "u_color" /* COLOR */);
        this.u_color_dir_loc = gl.getUniformLocation(shaderProgramGLID, "u_color_dir" /* COLOR_DIR */);
        this.u_MVMatrix_loc = gl.getUniformLocation(shaderProgramGLID, "u_MVMatrix" /* MVMatrix */);
        this.u_PMatrix_loc = gl.getUniformLocation(shaderProgramGLID, "u_PMatrix" /* PMatrix */);
        this.u_texCoord_loc = gl.getUniformLocation(shaderProgramGLID, "u_texCoord" /* TEX_COORD */);
        this.u_skybox_loc = gl.getUniformLocation(shaderProgramGLID, "u_skybox" /* SKYBOX */);
        this.u_pvm_matrix_loc = gl.getUniformLocation(shaderProgramGLID, "u_PVM_Matrix" /* PMV_MATRIX */);
        this.u_pvm_matrix_inverse_loc = gl.getUniformLocation(shaderProgramGLID, "u_PVM_Matrix_Inverse" /* PMV_MATRIX_INVERSE */);
        this.u_MMatrix_loc = gl.getUniformLocation(shaderProgramGLID, "u_MMatrix" /* MMatrix */);
        this.u_VMatrix_loc = gl.getUniformLocation(shaderProgramGLID, "u_VMatrix" /* VMatrix */);
    };
    Shader.prototype.getCustomAttributeLocation = function (varName) {
        return this._gl.getAttribLocation(this._spGLID, varName);
    };
    Shader.prototype.getGLID = function () {
        return this._spGLID;
    };
    /**
     * 检查shader中变量的位置是否有效
     * @param loc
     */
    Shader.prototype.checklocValid = function (loc, tagName) {
        var result = !(loc == null || loc < 0);
        if (!result && this.isShowDebugLog) {
            console.error("err-------", loc, tagName);
        }
        return result;
    };
    Shader.prototype.checkGLIDValid = function (glID) {
        return (glID == null || glID <= 0) ? false : true;
    };
    //启用属性从缓冲区中获取数据的功能
    Shader.prototype.enableVertexAttribute = function () {
        if (this.checklocValid(this.a_position_loc, "a_position_loc")) { // 设定为数组类型的变量数据
            this._gl.enableVertexAttribArray(this.a_position_loc);
        }
        if (this.checklocValid(this.a_uv_loc, "a_uv_loc")) {
            this._gl.enableVertexAttribArray(this.a_uv_loc);
        }
        if (this.checklocValid(this.a_normal_loc, "a_normal_loc")) {
            this._gl.enableVertexAttribArray(this.a_normal_loc);
        }
    };
    //shader中所有的attributes变量
    Shader.prototype.updateAttributes = function (shaderProgramGLID) {
        var gl = this._gl;
        var numAttribs = gl.getProgramParameter(shaderProgramGLID, gl.ACTIVE_ATTRIBUTES);
        for (var ii = 0; ii < numAttribs; ++ii) {
            var attribInfo = gl.getActiveAttrib(shaderProgramGLID, ii);
            if (!attribInfo) {
                break;
            }
            console.log("attribInfo--", attribInfo.name);
            var index = gl.getAttribLocation(shaderProgramGLID, attribInfo.name);
        }
    };
    //激活shader
    Shader.prototype.active = function () {
        this.disableVertexAttribArray();
        this.enableVertexAttribute();
        this._gl.useProgram(this._spGLID);
    };
    /**
     *
     * @param color 光的颜色
     * @param direction 光的方向
     */
    Shader.prototype.setUseLight = function (color, direction) {
        if (color === void 0) { color = [0.2, 1, 0.2, 1]; }
        if (direction === void 0) { direction = [0.5, 0.7, 1]; }
        if (!this.USE_LIGHT || !this.checklocValid(this.u_color_loc, "u_color_loc") || !this.checklocValid(this.u_color_dir_loc, "u_color_dir_loc")) {
            return;
        }
        // Set the color to use
        this._gl.uniform4fv(this.u_color_loc, color); // green
        // set the light direction.
        this._gl.uniform3fv(this.u_color_dir_loc, direction);
    };
    Shader.prototype.setUseSkyBox = function (u_pvm_matrix_inverse) {
        var gl = this._gl;
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        // Set the uniforms
        gl.uniformMatrix4fv(this.u_pvm_matrix_inverse_loc, false, u_pvm_matrix_inverse);
        // Tell the shader to use texture unit 0 for u_skybox
        gl.uniform1i(this.u_skybox_loc, 0);
        // let our quad pass the depth test at 1.0
        gl.depthFunc(gl.LEQUAL);
    };
    //设置使用投影视口模型矩阵
    Shader.prototype.setUseProjectViewModelMatrix = function (pvmMatrix) {
        if (this.checklocValid(this.u_pvm_matrix_loc, "u_pvm_matrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_pvm_matrix_loc, false, pvmMatrix);
        }
    };
    //设置光照
    Shader.prototype.setUseColor = function (uColor) {
        if (this.checklocValid(this.u_color_loc, "u_color_loc")) {
            this._gl.uniform4fv(this.u_color_loc, uColor);
        }
    };
    //设置模型视口矩阵
    Shader.prototype.setUseModelViewMatrix = function (mvMatrix) {
        if (this.checklocValid(this.u_MVMatrix_loc, "u_MVMatrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_MVMatrix_loc, false, mvMatrix);
        }
    };
    //设置透视投影矩阵
    Shader.prototype.setUseProjectionMatrix = function (projMatrix) {
        if (this.checklocValid(this.u_PMatrix_loc, "u_PMatrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_PMatrix_loc, false, projMatrix);
        }
    };
    //设置顶点值
    Shader.prototype.setUseVertexAttribPointerForVertex = function (glID, itemSize) {
        if (!this.checkGLIDValid(glID))
            return;
        if (this.checklocValid(this.a_position_loc, "a_position_loc")) {
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glID);
            this._gl.enableVertexAttribArray(this.a_position_loc);
            GLapi_1.GLapi.vertexAttribPointer(this.a_position_loc, itemSize, this._gl.FLOAT, false, 0, 0);
        }
    };
    //设置法线值
    Shader.prototype.setUseVertexAttriPointerForNormal = function (glID, itemSize) {
        if (!this.checkGLIDValid(glID))
            return;
        /**
         * localtion:shader中attribute声明变量的位置
         * size:每次迭代使用的单位数据
         * type:单位数据类型
         * normallize:单位化（【0-255】--》【0-1】）
         * stride:每次迭代跳多少个数据到下一个数据
         * offset:从绑定缓冲区的偏移位置
         */
        if (this.checklocValid(this.a_normal_loc, "a_normal_loc")) {
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glID);
            this._gl.enableVertexAttribArray(this.a_normal_loc);
            this._gl.vertexAttribPointer(this.a_normal_loc, itemSize, this._gl.FLOAT, false, 0, 0);
        }
    };
    //设置uv值
    Shader.prototype.setUseVertexAttribPointerForUV = function (glID, itemSize) {
        if (!this.checkGLIDValid(glID))
            return;
        if (this.checklocValid(this.a_uv_loc, "a_uv_loc")) {
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glID);
            this._gl.enableVertexAttribArray(this.a_uv_loc);
            this._gl.vertexAttribPointer(this.a_uv_loc, itemSize, this._gl.FLOAT, false, 0, 0);
        }
    };
    //设置使用的纹理
    //注意如果此处不重新设置使用的纹理，那么会默认使用上一次绘制时的纹理
    Shader.prototype.setUseTexture = function (glID, pos) {
        if (pos === void 0) { pos = 0; }
        if (!this.checkGLIDValid(glID))
            return;
        /**
          * activeTexture必须在bindTexture之前。如果没activeTexture就bindTexture，会默认绑定到0号纹理单元
        */
        if (this.checklocValid(this.u_texCoord_loc, "u_texCoord_loc")) {
            // 激活 0 号纹理单元
            this._gl.activeTexture(this._gl[GLEnums_1.glTEXTURE_UNIT_VALID[pos]]);
            // 指定当前操作的贴图
            this._gl.bindTexture(this._gl.TEXTURE_2D, glID);
            this._gl.uniform1i(this.u_texCoord_loc, pos);
        }
    };
    Shader.prototype.disableVertexAttribArray = function () {
        if (this.checklocValid(this.a_position_loc, "a_position_loc")) { // 设定为数组类型的变量数据
            this._gl.disableVertexAttribArray(this.a_position_loc);
        }
        if (this.checklocValid(this.a_uv_loc, "a_uv_loc")) {
            this._gl.disableVertexAttribArray(this.a_uv_loc);
        }
        if (this.checklocValid(this.a_normal_loc, "a_normal_loc")) {
            this._gl.disableVertexAttribArray(this.a_normal_loc);
        }
    };
    return Shader;
}());
exports.Shader = Shader;
//# sourceMappingURL=Shader.js.map