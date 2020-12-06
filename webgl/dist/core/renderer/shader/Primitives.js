"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syPrimitives = void 0;
var Matrix_1 = require("../../Matrix");
var Shader_1 = require("./Shader");
/**
 * 绘制中心
 */
var syPrimitives;
(function (syPrimitives) {
    function applyFuncToV3Array(array, matrix, fn) {
        var len = array.length;
        var tmp = new Float32Array(3);
        for (var ii = 0; ii < len; ii += 3) {
            fn(tmp, matrix, [array[ii], array[ii + 1], array[ii + 2]]);
            array[ii] = tmp[0];
            array[ii + 1] = tmp[1];
            array[ii + 2] = tmp[2];
        }
    }
    function transformNormal(dst, mi, v) {
        dst = dst || new Float32Array(3);
        var v0 = v[0];
        var v1 = v[1];
        var v2 = v[2];
        dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
        dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
        dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];
        return dst;
    }
    /**
     * Reorients directions by the given matrix..
     * @param {number[]|TypedArray} array The array. Assumes value floats per element.
     * @param {Matrix} matrix A matrix to multiply by.
     * @return {number[]|TypedArray} the same array that was passed in
     * @memberOf module:primitives
     */
    function reorientDirections(array, matrix) {
        applyFuncToV3Array(array, matrix, Matrix_1.glMatrix.mat4.transformDirection);
        return array;
    }
    /**
     * Reorients normals by the inverse-transpose of the given
     * matrix..
     * @param {number[]|TypedArray} array The array. Assumes value floats per element.
     * @param {Matrix} matrix A matrix to multiply by.
     * @return {number[]|TypedArray} the same array that was passed in
     * @memberOf module:primitives
     */
    function reorientNormals(array, matrix) {
        var invertM = Matrix_1.glMatrix.mat4.create();
        Matrix_1.glMatrix.mat4.invert(invertM, matrix);
        applyFuncToV3Array(array, invertM, transformNormal);
        return array;
    }
    /**
     * Reorients positions by the given matrix. In other words, it
     * multiplies each vertex by the given matrix.
     * @param {number[]|TypedArray} array The array. Assumes value floats per element.
     * @param {Matrix} matrix A matrix to multiply by.
     * @return {number[]|TypedArray} the same array that was passed in
     * @memberOf module:primitives
     */
    function reorientPositions(array, matrix) {
        applyFuncToV3Array(array, matrix, Matrix_1.glMatrix.mat4.transformPoint);
        return array;
    }
    /**
     * Reorients arrays by the given matrix. Assumes arrays have
     * names that contains 'pos' could be reoriented as positions,
     * 'binorm' or 'tan' as directions, and 'norm' as normals.
     *
     * @param {Object.<string, (number[]|TypedArray)>} arrays The vertices to reorient
     * @param {Matrix} matrix matrix to reorient by.
     * @return {Object.<string, (number[]|TypedArray)>} same arrays that were passed in.
     * @memberOf module:primitives
     */
    function reorientVertices(arrays, matrix) {
        Object.keys(arrays).forEach(function (name) {
            var array = arrays[name];
            if (name.indexOf('pos') >= 0) {
                reorientPositions(array, matrix);
            }
            else if (name.indexOf('tan') >= 0 || name.indexOf('binorm') >= 0) {
                reorientDirections(array, matrix);
            }
            else if (name.indexOf('norm') >= 0) {
                reorientNormals(array, matrix);
            }
        });
        return arrays;
    }
    /**
     * creates a random integer between 0 and range - 1 inclusive.
     * @param {number} range
     * @return {number} random value between 0 and range - 1 inclusive.
     */
    function randInt(range) {
        return Math.random() * range | 0;
    }
    /**
     * Creates XZ plane vertices.
     * The created plane has position, normal and uv streams.
     *
     * @param {number} [width] Width of the plane. Default = 1
     * @param {number} [depth] Depth of the plane. Default = 1
     * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
     * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
     * @param {Matrix4} [matrix] A matrix by which to multiply all the vertices.
     * @return {Object.<string, TypedArray>} The
     *         created plane vertices.
     * @memberOf module:primitives
     */
    function createPlaneVertices(width, depth, subdivisionsWidth, subdivisionsDepth, matrix) {
        width = width || 1;
        depth = depth || 1;
        subdivisionsWidth = subdivisionsWidth || 1;
        subdivisionsDepth = subdivisionsDepth || 1;
        matrix = matrix || Matrix_1.glMatrix.mat4.identity(null);
        var numVertices = (subdivisionsWidth + 1) * (subdivisionsDepth + 1);
        var positions = Shader_1.G_ShaderFactory.createAugmentedTypedArray(3, numVertices);
        var normals = Shader_1.G_ShaderFactory.createAugmentedTypedArray(3, numVertices);
        var texcoords = Shader_1.G_ShaderFactory.createAugmentedTypedArray(2, numVertices);
        for (var z = 0; z <= subdivisionsDepth; z++) {
            for (var x = 0; x <= subdivisionsWidth; x++) {
                var u = x / subdivisionsWidth;
                var v = z / subdivisionsDepth;
                positions.push(width * u - width * 0.5, 0, depth * v - depth * 0.5);
                normals.push(0, 1, 0);
                texcoords.push(u, v);
            }
        }
        var numVertsAcross = subdivisionsWidth + 1;
        var indices = Shader_1.G_ShaderFactory.createAugmentedTypedArray(3, subdivisionsWidth * subdivisionsDepth * 2, Uint16Array);
        for (var z = 0; z < subdivisionsDepth; z++) {
            for (var x = 0; x < subdivisionsWidth; x++) {
                // Make triangle 1 of quad.
                indices.push((z + 0) * numVertsAcross + x, (z + 1) * numVertsAcross + x, (z + 0) * numVertsAcross + x + 1);
                // Make triangle 2 of quad.
                indices.push((z + 1) * numVertsAcross + x, (z + 1) * numVertsAcross + x + 1, (z + 0) * numVertsAcross + x + 1);
            }
        }
        var arrays = reorientVertices({
            position: positions,
            normal: normals,
            texcoord: texcoords,
            indices: indices,
        }, matrix);
        return arrays;
    }
    syPrimitives.createPlaneVertices = createPlaneVertices;
    /**
     * Creates sphere vertices.
     * The created sphere has position, normal and uv streams.
     * @param {number} radius radius of the sphere.
     * @param {number} subdivisionsAxis number of steps around the sphere.
     * @param {number} subdivisionsHeight number of vertically on the sphere.
     * @param {number} [opt_startLatitudeInRadians] where to start the
     *     top of the sphere. Default = 0.
     * @param {number} [opt_endLatitudeInRadians] Where to end the
     *     bottom of the sphere. Default = Math.PI.
     * @param {number} [opt_startLongitudeInRadians] where to start
     *     wrapping the sphere. Default = 0.
     * @param {number} [opt_endLongitudeInRadians] where to end
     *     wrapping the sphere. Default = 2 * Math.PI.
     * @return {Object.<string, TypedArray>} The
     *         created plane vertices.
     * @memberOf module:primitives
     */
    function createSphereVertices(radius, subdivisionsAxis, subdivisionsHeight, opt_startLatitudeInRadians, opt_endLatitudeInRadians, opt_startLongitudeInRadians, opt_endLongitudeInRadians) {
        if (subdivisionsAxis <= 0 || subdivisionsHeight <= 0) {
            throw Error('subdivisionAxis and subdivisionHeight must be > 0');
        }
        opt_startLatitudeInRadians = opt_startLatitudeInRadians || 0;
        opt_endLatitudeInRadians = opt_endLatitudeInRadians || Math.PI;
        opt_startLongitudeInRadians = opt_startLongitudeInRadians || 0;
        opt_endLongitudeInRadians = opt_endLongitudeInRadians || (Math.PI * 2);
        var latRange = opt_endLatitudeInRadians - opt_startLatitudeInRadians;
        var longRange = opt_endLongitudeInRadians - opt_startLongitudeInRadians;
        // We are going to generate our sphere by iterating through its
        // spherical coordinates and generating 2 triangles for each quad on a
        // ring of the sphere.
        var numVertices = (subdivisionsAxis + 1) * (subdivisionsHeight + 1);
        var positions = Shader_1.G_ShaderFactory.createAugmentedTypedArray(3, numVertices);
        var normals = Shader_1.G_ShaderFactory.createAugmentedTypedArray(3, numVertices);
        var texCoords = Shader_1.G_ShaderFactory.createAugmentedTypedArray(2, numVertices);
        // Generate the individual vertices in our vertex buffer.
        for (var y = 0; y <= subdivisionsHeight; y++) {
            for (var x = 0; x <= subdivisionsAxis; x++) {
                // Generate a vertex based on its spherical coordinates
                var u = x / subdivisionsAxis;
                var v = y / subdivisionsHeight;
                var theta = longRange * u;
                var phi = latRange * v;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);
                var ux = cosTheta * sinPhi;
                var uy = cosPhi;
                var uz = sinTheta * sinPhi;
                positions.push(radius * ux, radius * uy, radius * uz);
                normals.push(ux, uy, uz);
                texCoords.push(1 - u, v);
            }
        }
        var numVertsAround = subdivisionsAxis + 1;
        var indices = Shader_1.G_ShaderFactory.createAugmentedTypedArray(3, subdivisionsAxis * subdivisionsHeight * 2, Uint16Array);
        for (var x = 0; x < subdivisionsAxis; x++) {
            for (var y = 0; y < subdivisionsHeight; y++) {
                // Make triangle 1 of quad.
                indices.push((y + 0) * numVertsAround + x, (y + 0) * numVertsAround + x + 1, (y + 1) * numVertsAround + x);
                // Make triangle 2 of quad.
                indices.push((y + 1) * numVertsAround + x, (y + 0) * numVertsAround + x + 1, (y + 1) * numVertsAround + x + 1);
            }
        }
        return {
            position: positions,
            normal: normals,
            texcoord: texCoords,
            indices: indices,
        };
    }
    syPrimitives.createSphereVertices = createSphereVertices;
    /**
    * Array of the indices of corners of each face of a cube.
    * @type {Array.<number[]>}
    */
    var CUBE_FACE_INDICES = [
        [3, 7, 5, 1],
        [6, 2, 0, 4],
        [6, 7, 3, 2],
        [0, 1, 5, 4],
        [7, 6, 4, 5],
        [2, 3, 1, 0],
    ];
    /**
     * Creates the vertices and indices for a cube. The
     * cube will be created around the origin. (-size / 2, size / 2)
     *
     * @param {number} size Width, height and depth of the cube.
     * @return {Object.<string, TypedArray>} The
     *         created plane vertices.
     * @memberOf module:primitives
     */
    function createCubeVertices(size) {
        var k = size / 2;
        var cornerVertices = [
            [-k, -k, -k],
            [+k, -k, -k],
            [-k, +k, -k],
            [+k, +k, -k],
            [-k, -k, +k],
            [+k, -k, +k],
            [-k, +k, +k],
            [+k, +k, +k],
        ];
        var faceNormals = [
            [+1, +0, +0],
            [-1, +0, +0],
            [+0, +1, +0],
            [+0, -1, +0],
            [+0, +0, +1],
            [+0, +0, -1],
        ];
        var uvCoords = [
            [1, 0],
            [0, 0],
            [0, 1],
            [1, 1],
        ];
        var numVertices = 6 * 4;
        var positions = Shader_1.G_ShaderFactory.createAugmentedTypedArray(3, numVertices);
        var normals = Shader_1.G_ShaderFactory.createAugmentedTypedArray(3, numVertices);
        var texCoords = Shader_1.G_ShaderFactory.createAugmentedTypedArray(2, numVertices);
        var indices = Shader_1.G_ShaderFactory.createAugmentedTypedArray(3, 6 * 2, Uint16Array);
        for (var f = 0; f < 6; ++f) {
            var faceIndices = CUBE_FACE_INDICES[f];
            for (var v = 0; v < 4; ++v) {
                var position = cornerVertices[faceIndices[v]];
                var normal = faceNormals[f];
                var uv = uvCoords[v];
                // Each face needs all four vertices because the normals and texture
                // coordinates are not all the same.
                positions.push(position);
                normals.push(normal);
                texCoords.push(uv);
            }
            // Two triangles make a square face.
            var offset = 4 * f;
            indices.push(offset + 0, offset + 1, offset + 2);
            indices.push(offset + 0, offset + 2, offset + 3);
        }
        return {
            position: positions,
            normal: normals,
            texcoord: texCoords,
            indices: indices,
        };
    }
    syPrimitives.createCubeVertices = createCubeVertices;
    /**
    * Expands RLE data
    * @param {number[]} rleData data in format of run-length, x, y, z, run-length, x, y, z
    * @param {number[]} [padding] value to add each entry with.
    * @return {number[]} the expanded rleData
    */
    function expandRLEData(rleData, padding) {
        padding = padding || [];
        var data = [];
        for (var ii = 0; ii < rleData.length; ii += 4) {
            var runLength = rleData[ii];
            var element = rleData.slice(ii + 1, ii + 4);
            element.push.apply(element, padding);
            for (var jj = 0; jj < runLength; ++jj) {
                data.push.apply(data, element);
            }
        }
        return data;
    }
    syPrimitives.expandRLEData = expandRLEData;
    /**
    * Creates 3D 'F' vertices.
    * An 'F' is useful because you can easily tell which way it is oriented.
    * The created 'F' has position, normal and uv streams.
    *
    * @return {Object.<string, TypedArray>} The
    *         created plane vertices.
    * @memberOf module:primitives
    */
    function create3DFVertices() {
        var positions = [
            // left column front
            0, 0, 0,
            0, 150, 0,
            30, 0, 0,
            0, 150, 0,
            30, 150, 0,
            30, 0, 0,
            // top rung front
            30, 0, 0,
            30, 30, 0,
            100, 0, 0,
            30, 30, 0,
            100, 30, 0,
            100, 0, 0,
            // middle rung front
            30, 60, 0,
            30, 90, 0,
            67, 60, 0,
            30, 90, 0,
            67, 90, 0,
            67, 60, 0,
            // left column back
            0, 0, 30,
            30, 0, 30,
            0, 150, 30,
            0, 150, 30,
            30, 0, 30,
            30, 150, 30,
            // top rung back
            30, 0, 30,
            100, 0, 30,
            30, 30, 30,
            30, 30, 30,
            100, 0, 30,
            100, 30, 30,
            // middle rung back
            30, 60, 30,
            67, 60, 30,
            30, 90, 30,
            30, 90, 30,
            67, 60, 30,
            67, 90, 30,
            // top
            0, 0, 0,
            100, 0, 0,
            100, 0, 30,
            0, 0, 0,
            100, 0, 30,
            0, 0, 30,
            // top rung right
            100, 0, 0,
            100, 30, 0,
            100, 30, 30,
            100, 0, 0,
            100, 30, 30,
            100, 0, 30,
            // under top rung
            30, 30, 0,
            30, 30, 30,
            100, 30, 30,
            30, 30, 0,
            100, 30, 30,
            100, 30, 0,
            // between top rung and middle
            30, 30, 0,
            30, 60, 30,
            30, 30, 30,
            30, 30, 0,
            30, 60, 0,
            30, 60, 30,
            // top of middle rung
            30, 60, 0,
            67, 60, 30,
            30, 60, 30,
            30, 60, 0,
            67, 60, 0,
            67, 60, 30,
            // right of middle rung
            67, 60, 0,
            67, 90, 30,
            67, 60, 30,
            67, 60, 0,
            67, 90, 0,
            67, 90, 30,
            // bottom of middle rung.
            30, 90, 0,
            30, 90, 30,
            67, 90, 30,
            30, 90, 0,
            67, 90, 30,
            67, 90, 0,
            // right of bottom
            30, 90, 0,
            30, 150, 30,
            30, 90, 30,
            30, 90, 0,
            30, 150, 0,
            30, 150, 30,
            // bottom
            0, 150, 0,
            0, 150, 30,
            30, 150, 30,
            0, 150, 0,
            30, 150, 30,
            30, 150, 0,
            // left side
            0, 0, 0,
            0, 0, 30,
            0, 150, 30,
            0, 0, 0,
            0, 150, 30,
            0, 150, 0,
        ];
        var texcoords = [
            // left column front
            0.22, 0.19,
            0.22, 0.79,
            0.34, 0.19,
            0.22, 0.79,
            0.34, 0.79,
            0.34, 0.19,
            // top rung front
            0.34, 0.19,
            0.34, 0.31,
            0.62, 0.19,
            0.34, 0.31,
            0.62, 0.31,
            0.62, 0.19,
            // middle rung front
            0.34, 0.43,
            0.34, 0.55,
            0.49, 0.43,
            0.34, 0.55,
            0.49, 0.55,
            0.49, 0.43,
            // left column back
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,
            // top rung back
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,
            // middle rung back
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,
            // top
            0, 0,
            1, 0,
            1, 1,
            0, 0,
            1, 1,
            0, 1,
            // top rung right
            0, 0,
            1, 0,
            1, 1,
            0, 0,
            1, 1,
            0, 1,
            // under top rung
            0, 0,
            0, 1,
            1, 1,
            0, 0,
            1, 1,
            1, 0,
            // between top rung and middle
            0, 0,
            1, 1,
            0, 1,
            0, 0,
            1, 0,
            1, 1,
            // top of middle rung
            0, 0,
            1, 1,
            0, 1,
            0, 0,
            1, 0,
            1, 1,
            // right of middle rung
            0, 0,
            1, 1,
            0, 1,
            0, 0,
            1, 0,
            1, 1,
            // bottom of middle rung.
            0, 0,
            0, 1,
            1, 1,
            0, 0,
            1, 1,
            1, 0,
            // right of bottom
            0, 0,
            1, 1,
            0, 1,
            0, 0,
            1, 0,
            1, 1,
            // bottom
            0, 0,
            0, 1,
            1, 1,
            0, 0,
            1, 1,
            1, 0,
            // left side
            0, 0,
            0, 1,
            1, 1,
            0, 0,
            1, 1,
            1, 0,
        ];
        var normals = expandRLEData([
            // left column front
            // top rung front
            // middle rung front
            18, 0, 0, 1,
            // left column back
            // top rung back
            // middle rung back
            18, 0, 0, -1,
            // top
            6, 0, 1, 0,
            // top rung right
            6, 1, 0, 0,
            // under top rung
            6, 0, -1, 0,
            // between top rung and middle
            6, 1, 0, 0,
            // top of middle rung
            6, 0, 1, 0,
            // right of middle rung
            6, 1, 0, 0,
            // bottom of middle rung.
            6, 0, -1, 0,
            // right of bottom
            6, 1, 0, 0,
            // bottom
            6, 0, -1, 0,
            // left side
            6, -1, 0, 0,
        ]);
        var colors = expandRLEData([
            // left column front
            // top rung front
            // middle rung front
            18, 200, 70, 120,
            // left column back
            // top rung back
            // middle rung back
            18, 80, 70, 200,
            // top
            6, 70, 200, 210,
            // top rung right
            6, 200, 200, 70,
            // under top rung
            6, 210, 100, 70,
            // between top rung and middle
            6, 210, 160, 70,
            // top of middle rung
            6, 70, 180, 210,
            // right of middle rung
            6, 100, 70, 210,
            // bottom of middle rung.
            6, 76, 210, 100,
            // right of bottom
            6, 140, 210, 80,
            // bottom
            6, 90, 130, 110,
            // left side
            6, 160, 160, 220,
        ], [255]);
        var numVerts = positions.length / 3;
        var arrays = {
            position: Shader_1.G_ShaderFactory.createAugmentedTypedArray(3, numVerts),
            texcoord: Shader_1.G_ShaderFactory.createAugmentedTypedArray(2, numVerts),
            normal: Shader_1.G_ShaderFactory.createAugmentedTypedArray(3, numVerts),
            color: Shader_1.G_ShaderFactory.createAugmentedTypedArray(4, numVerts, Uint8Array),
            indices: Shader_1.G_ShaderFactory.createAugmentedTypedArray(3, numVerts / 3, Uint16Array),
        };
        arrays.position.push(positions);
        arrays.texcoord.push(texcoords);
        arrays.normal.push(normals);
        arrays.color.push(colors);
        for (var ii = 0; ii < numVerts; ++ii) {
            arrays.indices.push(ii);
        }
        return arrays;
    }
    syPrimitives.create3DFVertices = create3DFVertices;
    /**
     * creates a function that calls fn to create vertices and then
     * creates a bufferInfo object for them
     */
    function createBufferInfoFunc(fn) {
        return function () {
            var arrays = fn.apply(null, Array.prototype.slice.call(arguments, 1));
            return Shader_1.G_ShaderFactory.createBufferInfoFromArrays(arrays);
        };
    }
    function createSphereBufferInfo(radius, subdivisionsAxis, subdivisionsHeight, opt_startLatitudeInRadians, opt_endLatitudeInRadians, opt_startLongitudeInRadians, opt_endLongitudeInRadians) {
        var arrays = createSphereVertices.apply(null, Array.prototype.slice.call(arguments, 0));
        return Shader_1.G_ShaderFactory.createBufferInfoFromArrays(arrays);
    }
    syPrimitives.createSphereBufferInfo = createSphereBufferInfo;
    function createPlaneBufferInfo(width, depth, subdivisionsWidth, subdivisionsDepth, matrix) {
        var arrays = createPlaneVertices.apply(null, Array.prototype.slice.call(arguments, 0));
        return Shader_1.G_ShaderFactory.createBufferInfoFromArrays(arrays);
    }
    syPrimitives.createPlaneBufferInfo = createPlaneBufferInfo;
    function createCubeBufferInfo(size) {
        var arrays = createCubeVertices.apply(null, Array.prototype.slice.call(arguments, 0));
        return Shader_1.G_ShaderFactory.createBufferInfoFromArrays(arrays);
    }
    syPrimitives.createCubeBufferInfo = createCubeBufferInfo;
    function create3DFBufferInfo() {
        var arrays = create3DFVertices.apply(null, Array.prototype.slice.call(arguments, 0));
        return Shader_1.G_ShaderFactory.createBufferInfoFromArrays(arrays);
    }
    syPrimitives.create3DFBufferInfo = create3DFBufferInfo;
    /**
     * return {
    create3DFBufferInfo: createBufferInfoFunc(create3DFVertices),
    create3DFBuffer: createBufferFunc(create3DFVertices),
    create3DFVertices,
    create3DFWithVertexColorsBufferInfo: createFlattenedFunc(create3DFVertices),
    createCubeBufferInfo: createBufferInfoFunc(createCubeVertices),
    createCubeBuffers: createBufferFunc(createCubeVertices),
    createCubeVertices,
    createCubeWithVertexColorsBufferInfo: createFlattenedFunc(createCubeVertices),
    createPlaneBufferInfo: createBufferInfoFunc(createPlaneVertices),
    createPlaneBuffers: createBufferFunc(createPlaneVertices),
    createPlaneVertices,
    createPlaneWithVertexColorsBufferInfo: createFlattenedFunc(createPlaneVertices),
    createXYQuadBufferInfo: createBufferInfoFunc(createXYQuadVertices),
    createXYQuadBuffers: createBufferFunc(createXYQuadVertices),
    createXYQuadVertices,
    createXYQuadWithVertexColorsBufferInfo: createFlattenedFunc(createXYQuadVertices),
    createSphereBufferInfo: createBufferInfoFunc(createSphereVertices),
    createSphereBuffers: createBufferFunc(createSphereVertices),
    createSphereVertices,
    createSphereWithVertexColorsBufferInfo: createFlattenedFunc(createSphereVertices),
    createTruncatedConeBufferInfo: createBufferInfoFunc(createTruncatedConeVertices),
    createTruncatedConeBuffers: createBufferFunc(createTruncatedConeVertices),
    createTruncatedConeVertices,
    createTruncatedConeWithVertexColorsBufferInfo: createFlattenedFunc(createTruncatedConeVertices),
    deindexVertices,
    flattenNormals,
    makeRandomVertexColors,
    reorientDirections,
    reorientNormals,
    reorientPositions,
    reorientVertices,
  };
     */
})(syPrimitives = exports.syPrimitives || (exports.syPrimitives = {}));
//# sourceMappingURL=Primitives.js.map