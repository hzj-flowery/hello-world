"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mat3 = void 0;
var vec3_1 = require("./vec3");
var utils_1 = require("./utils");
/**
 * Mathematical 3x3 matrix.
 *
 * NOTE: we use column-major matrix for all matrix calculation.
 *
 * This may lead to some confusion when referencing OpenGL documentation,
 * however, which represents out all matricies in column-major format.
 * This means that while in code a matrix may be typed out as:
 *
 * [1, 0, 0, 0,
 *  0, 1, 0, 0,
 *  0, 0, 1, 0,
 *  x, y, z, 0]
 *
 * The same matrix in the [OpenGL documentation](https://www.khronos.org/registry/OpenGL-Refpages/gl2.1/xhtml/glTranslate.xml)
 * is written as:
 *
 *  1 0 0 x
 *  0 1 0 y
 *  0 0 1 z
 *  0 0 0 0
 *
 * Please rest assured, however, that they are the same thing!
 * This is not unique to glMatrix, either, as OpenGL developers have long been confused by the
 * apparent lack of consistency between the memory layout and the documentation.
 *
 * @class Mat3
 * @extends ValueType
 */
var Mat3 = /** @class */ (function () {
    /**
     * @method constructor
     * @typescript
     * constructor (m00?: number | Float32Array, m01?: number, m02?: number, m03?: number, m04?: number, m05?: number, m06?: number, m07?: number, m08?: number)
     */
    function Mat3(m00, m01, m02, m03, m04, m05, m06, m07, m08) {
        if (m00 === void 0) { m00 = 1; }
        if (m01 === void 0) { m01 = 0; }
        if (m02 === void 0) { m02 = 0; }
        if (m03 === void 0) { m03 = 0; }
        if (m04 === void 0) { m04 = 1; }
        if (m05 === void 0) { m05 = 0; }
        if (m06 === void 0) { m06 = 0; }
        if (m07 === void 0) { m07 = 0; }
        if (m08 === void 0) { m08 = 1; }
        if (m00 instanceof utils_1.FLOAT_ARRAY_TYPE) {
            this.m = m00;
        }
        else {
            this.m = new utils_1.FLOAT_ARRAY_TYPE(9);
            var m = this.m;
            /**
             * The element at column 0 row 0.
             * @type {number}
             * */
            m[0] = m00;
            /**
             * The element at column 0 row 1.
             * @type {number}
             * */
            m[1] = m01;
            /**
             * The element at column 0 row 2.
             * @type {number}
             * */
            m[2] = m02;
            /**
             * The element at column 1 row 0.
             * @type {number}
             * */
            m[3] = m03;
            /**
             * The element at column 1 row 1.
             * @type {number}
             * */
            m[4] = m04;
            /**
             * The element at column 1 row 2.
             * @type {number}
             * */
            m[5] = m05;
            /**
             * The element at column 2 row 0.
             * @type {number}
             * */
            m[6] = m06;
            /**
             * The element at column 2 row 1.
             * @type {number}
             * */
            m[7] = m07;
            /**
             * The element at column 2 row 2.
             * @type {number}
             * */
            m[8] = m08;
        }
    }
    /**
     * Creates a matrix, with elements specified separately.
     *
     * @param {Number} m00 - Value assigned to element at column 0 row 0.
     * @param {Number} m01 - Value assigned to element at column 0 row 1.
     * @param {Number} m02 - Value assigned to element at column 0 row 2.
     * @param {Number} m03 - Value assigned to element at column 1 row 0.
     * @param {Number} m04 - Value assigned to element at column 1 row 1.
     * @param {Number} m05 - Value assigned to element at column 1 row 2.
     * @param {Number} m06 - Value assigned to element at column 2 row 0.
     * @param {Number} m07 - Value assigned to element at column 2 row 1.
     * @param {Number} m08 - Value assigned to element at column 2 row 2.
     * @returns {Mat3} The newly created matrix.
     * @static
     */
    Mat3.create = function (m00, m01, m02, m03, m04, m05, m06, m07, m08) {
        if (m00 === void 0) { m00 = 1; }
        if (m01 === void 0) { m01 = 0; }
        if (m02 === void 0) { m02 = 0; }
        if (m03 === void 0) { m03 = 0; }
        if (m04 === void 0) { m04 = 1; }
        if (m05 === void 0) { m05 = 0; }
        if (m06 === void 0) { m06 = 0; }
        if (m07 === void 0) { m07 = 0; }
        if (m08 === void 0) { m08 = 1; }
        return new Mat3(m00, m01, m02, m03, m04, m05, m06, m07, m08);
    };
    /**
     * Clone a matrix.
     *
     * @param {Mat3} a - Matrix to clone.
     * @returns {Mat3} The newly created matrix.
     * @static
     */
    Mat3.clone = function (a) {
        var am = a.m;
        return new Mat3(am[0], am[1], am[2], am[3], am[4], am[5], am[6], am[7], am[8]);
    };
    /**
     * Copy content of a matrix into another.
     *
     * @param {Mat3} out - Matrix to modified.
     * @param {Mat3} a - The specified matrix.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.copy = function (out, a) {
        out.m.set(a.m);
        return out;
    };
    /**
     * Sets the elements of a matrix to the given values.
     *
     * @param {Mat3} out - The matrix to modified.
     * @param {Number} m00 - Value assigned to element at column 0 row 0.
     * @param {Number} m01 - Value assigned to element at column 0 row 1.
     * @param {Number} m02 - Value assigned to element at column 0 row 2.
     * @param {Number} m10 - Value assigned to element at column 1 row 0.
     * @param {Number} m11 - Value assigned to element at column 1 row 1.
     * @param {Number} m12 - Value assigned to element at column 1 row 2.
     * @param {Number} m20 - Value assigned to element at column 2 row 0.
     * @param {Number} m21 - Value assigned to element at column 2 row 1.
     * @param {Number} m22 - Value assigned to element at column 2 row 2.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.set = function (out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
        var outm = out.m;
        outm[0] = m00;
        outm[1] = m01;
        outm[2] = m02;
        outm[3] = m10;
        outm[4] = m11;
        outm[5] = m12;
        outm[6] = m20;
        outm[7] = m21;
        outm[8] = m22;
        return out;
    };
    /**
     * return an identity matrix.
     *
     * @returns {Mat3} out.
     * @static
     */
    Mat3.identity = function (out) {
        var outm = out.m;
        outm[0] = 1;
        outm[1] = 0;
        outm[2] = 0;
        outm[3] = 0;
        outm[4] = 1;
        outm[5] = 0;
        outm[6] = 0;
        outm[7] = 0;
        outm[8] = 1;
        return out;
    };
    /**
     * Transposes a matrix.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {Mat3} a - Matrix to transpose.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.transpose = function (out, a) {
        var am = a.m, outm = out.m;
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (out === a) {
            var a01 = am[1], a02 = am[2], a12 = am[5];
            outm[1] = am[3];
            outm[2] = am[6];
            outm[3] = a01;
            outm[5] = am[7];
            outm[6] = a02;
            outm[7] = a12;
        }
        else {
            outm[0] = am[0];
            outm[1] = am[3];
            outm[2] = am[6];
            outm[3] = am[1];
            outm[4] = am[4];
            outm[5] = am[7];
            outm[6] = am[2];
            outm[7] = am[5];
            outm[8] = am[8];
        }
        return out;
    };
    /**
     * Inverts a matrix.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {Mat3} a - Matrix to invert.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.invert = function (out, a) {
        var am = a.m, outm = out.m;
        var a00 = am[0], a01 = am[1], a02 = am[2], a10 = am[3], a11 = am[4], a12 = am[5], a20 = am[6], a21 = am[7], a22 = am[8];
        var b01 = a22 * a11 - a12 * a21;
        var b11 = -a22 * a10 + a12 * a20;
        var b21 = a21 * a10 - a11 * a20;
        // Calculate the determinant
        var det = a00 * b01 + a01 * b11 + a02 * b21;
        if (!det) {
            return out;
        }
        det = 1.0 / det;
        outm[0] = b01 * det;
        outm[1] = (-a22 * a01 + a02 * a21) * det;
        outm[2] = (a12 * a01 - a02 * a11) * det;
        outm[3] = b11 * det;
        outm[4] = (a22 * a00 - a02 * a20) * det;
        outm[5] = (-a12 * a00 + a02 * a10) * det;
        outm[6] = b21 * det;
        outm[7] = (-a21 * a00 + a01 * a20) * det;
        outm[8] = (a11 * a00 - a01 * a10) * det;
        return out;
    };
    /**
     * Calculates the adjugate of a matrix.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {Mat3} a - Matrix to calculate.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.adjoint = function (out, a) {
        var am = a.m, outm = out.m;
        var a00 = am[0], a01 = am[1], a02 = am[2], a10 = am[3], a11 = am[4], a12 = am[5], a20 = am[6], a21 = am[7], a22 = am[8];
        outm[0] = (a11 * a22 - a12 * a21);
        outm[1] = (a02 * a21 - a01 * a22);
        outm[2] = (a01 * a12 - a02 * a11);
        outm[3] = (a12 * a20 - a10 * a22);
        outm[4] = (a00 * a22 - a02 * a20);
        outm[5] = (a02 * a10 - a00 * a12);
        outm[6] = (a10 * a21 - a11 * a20);
        outm[7] = (a01 * a20 - a00 * a21);
        outm[8] = (a00 * a11 - a01 * a10);
        return out;
    };
    /**
     * Calculates the determinant of a matrix.
     *
     * @param {Mat3} a - Matrix to calculate.
     * @returns {Number} Determinant of a.
     * @static
     */
    Mat3.determinant = function (a) {
        var am = a.m;
        var a00 = am[0], a01 = am[1], a02 = am[2], a10 = am[3], a11 = am[4], a12 = am[5], a20 = am[6], a21 = am[7], a22 = am[8];
        return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
    };
    /**
     * Multiply two matrices explicitly.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {Mat3} a - The first operand.
     * @param {Mat3} b - The second operand.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.multiply = function (out, a, b) {
        var am = a.m, bm = b.m, outm = out.m;
        var a00 = am[0], a01 = am[1], a02 = am[2], a10 = am[3], a11 = am[4], a12 = am[5], a20 = am[6], a21 = am[7], a22 = am[8];
        var b00 = bm[0], b01 = bm[1], b02 = bm[2];
        var b10 = bm[3], b11 = bm[4], b12 = bm[5];
        var b20 = bm[6], b21 = bm[7], b22 = bm[8];
        outm[0] = b00 * a00 + b01 * a10 + b02 * a20;
        outm[1] = b00 * a01 + b01 * a11 + b02 * a21;
        outm[2] = b00 * a02 + b01 * a12 + b02 * a22;
        outm[3] = b10 * a00 + b11 * a10 + b12 * a20;
        outm[4] = b10 * a01 + b11 * a11 + b12 * a21;
        outm[5] = b10 * a02 + b11 * a12 + b12 * a22;
        outm[6] = b20 * a00 + b21 * a10 + b22 * a20;
        outm[7] = b20 * a01 + b21 * a11 + b22 * a21;
        outm[8] = b20 * a02 + b21 * a12 + b22 * a22;
        return out;
    };
    /**
     * !#en Take the first third order of the fourth order matrix and multiply by the third order matrix
     * !#zh 取四阶矩阵的前三阶，与三阶矩阵相乘
     * @param {Mat3} out - Matrix to store result.
     * @param {Mat3} a - The first operand.
     * @param {Mat3} b - The second operand.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.multiplyMat4 = function (out, a, b) {
        var am = a.m, bm = b.m, outm = out.m;
        var a00 = am[0], a01 = am[1], a02 = am[2], a10 = am[3], a11 = am[4], a12 = am[5], a20 = am[6], a21 = am[7], a22 = am[8];
        var b00 = bm[0], b01 = bm[1], b02 = bm[2];
        var b10 = bm[4], b11 = bm[5], b12 = bm[6];
        var b20 = bm[8], b21 = bm[9], b22 = bm[10];
        outm[0] = b00 * a00 + b01 * a10 + b02 * a20;
        outm[1] = b00 * a01 + b01 * a11 + b02 * a21;
        outm[2] = b00 * a02 + b01 * a12 + b02 * a22;
        outm[3] = b10 * a00 + b11 * a10 + b12 * a20;
        outm[4] = b10 * a01 + b11 * a11 + b12 * a21;
        outm[5] = b10 * a02 + b11 * a12 + b12 * a22;
        outm[6] = b20 * a00 + b21 * a10 + b22 * a20;
        outm[7] = b20 * a01 + b21 * a11 + b22 * a21;
        outm[8] = b20 * a02 + b21 * a12 + b22 * a22;
        return out;
    };
    /**
     * Multiply a matrix with a translation matrix given by a translation offset.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {Mat3} a - Matrix to multiply.
     * @param {vec2} v - The translation offset.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.translate = function (out, a, v) {
        var am = a.m, outm = out.m;
        var a00 = am[0], a01 = am[1], a02 = am[2], a10 = am[3], a11 = am[4], a12 = am[5], a20 = am[6], a21 = am[7], a22 = am[8];
        var x = v.x, y = v.y;
        outm[0] = a00;
        outm[1] = a01;
        outm[2] = a02;
        outm[3] = a10;
        outm[4] = a11;
        outm[5] = a12;
        outm[6] = x * a00 + y * a10 + a20;
        outm[7] = x * a01 + y * a11 + a21;
        outm[8] = x * a02 + y * a12 + a22;
        return out;
    };
    /**
     * Rotates a matrix by the given angle.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {Mat3} a - Matrix to rotate.
     * @param {Number} rad - The rotation angle.
     * @returns {Mat3} out
     * @static
     */
    Mat3.rotate = function (out, a, rad) {
        var am = a.m, outm = out.m;
        var a00 = am[0], a01 = am[1], a02 = am[2], a10 = am[3], a11 = am[4], a12 = am[5], a20 = am[6], a21 = am[7], a22 = am[8];
        var s = Math.sin(rad);
        var c = Math.cos(rad);
        outm[0] = c * a00 + s * a10;
        outm[1] = c * a01 + s * a11;
        outm[2] = c * a02 + s * a12;
        outm[3] = c * a10 - s * a00;
        outm[4] = c * a11 - s * a01;
        outm[5] = c * a12 - s * a02;
        outm[6] = a20;
        outm[7] = a21;
        outm[8] = a22;
        return out;
    };
    /**
     * Multiply a matrix with a scale matrix given by a scale vector.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {Mat3} a - Matrix to multiply.
     * @param {vec2} v - The scale vector.
     * @returns {Mat3} out
     **/
    Mat3.scale = function (out, a, v) {
        var x = v.x, y = v.y;
        var am = a.m, outm = out.m;
        outm[0] = x * am[0];
        outm[1] = x * am[1];
        outm[2] = x * am[2];
        outm[3] = y * am[3];
        outm[4] = y * am[4];
        outm[5] = y * am[5];
        outm[6] = am[6];
        outm[7] = am[7];
        outm[8] = am[8];
        return out;
    };
    /**
     * Copies the upper-left 3x3 values of a 4x4 matrix into a 3x3 matrix.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {mat4} a - The 4x4 matrix.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.fromMat4 = function (out, a) {
        var am = a.m, outm = out.m;
        outm[0] = am[0];
        outm[1] = am[1];
        outm[2] = am[2];
        outm[3] = am[4];
        outm[4] = am[5];
        outm[5] = am[6];
        outm[6] = am[8];
        outm[7] = am[9];
        outm[8] = am[10];
        return out;
    };
    /**
     * Creates a matrix from a translation offset.
     * This is equivalent to (but much faster than):
     *
     *     mat3.identity(dest);
     *     mat3.translate(dest, dest, vec);
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {vec2} v - The translation offset.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.fromTranslation = function (out, v) {
        var outm = out.m;
        outm[0] = 1;
        outm[1] = 0;
        outm[2] = 0;
        outm[3] = 0;
        outm[4] = 1;
        outm[5] = 0;
        outm[6] = v.x;
        outm[7] = v.y;
        outm[8] = 1;
        return out;
    };
    /**
     * Creates a matrix from a given angle.
     * This is equivalent to (but much faster than):
     *
     *     mat3.identity(dest);
     *     mat3.rotate(dest, dest, rad);
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {Number} rad - The rotation angle.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.fromRotation = function (out, rad) {
        var s = Math.sin(rad), c = Math.cos(rad);
        var outm = out.m;
        outm[0] = c;
        outm[1] = s;
        outm[2] = 0;
        outm[3] = -s;
        outm[4] = c;
        outm[5] = 0;
        outm[6] = 0;
        outm[7] = 0;
        outm[8] = 1;
        return out;
    };
    /**
     * Creates a matrix from a scale vector.
     * This is equivalent to (but much faster than):
     *
     *     mat3.identity(dest);
     *     mat3.scale(dest, dest, vec);
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {vec2} v - Scale vector.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.fromScaling = function (out, v) {
        var outm = out.m;
        outm[0] = v.x;
        outm[1] = 0;
        outm[2] = 0;
        outm[3] = 0;
        outm[4] = v.y;
        outm[5] = 0;
        outm[6] = 0;
        outm[7] = 0;
        outm[8] = 1;
        return out;
    };
    /**
     * Calculates a 3x3 matrix from the given quaternion.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {quat} q - The quaternion.
     *
     * @returns {Mat3} out.
     * @static
     */
    Mat3.fromQuat = function (out, q) {
        var outm = out.m;
        var x = q.x, y = q.y, z = q.z, w = q.w;
        var x2 = x + x;
        var y2 = y + y;
        var z2 = z + z;
        var xx = x * x2;
        var yx = y * x2;
        var yy = y * y2;
        var zx = z * x2;
        var zy = z * y2;
        var zz = z * z2;
        var wx = w * x2;
        var wy = w * y2;
        var wz = w * z2;
        outm[0] = 1 - yy - zz;
        outm[3] = yx - wz;
        outm[6] = zx + wy;
        outm[1] = yx + wz;
        outm[4] = 1 - xx - zz;
        outm[7] = zy - wx;
        outm[2] = zx - wy;
        outm[5] = zy + wx;
        outm[8] = 1 - xx - yy;
        return out;
    };
    /**
     * Calculates a 3x3 matrix from view direction and up direction.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {vec3} view - View direction (must be normalized).
     * @param {vec3} [up] - Up direction, default is (0,1,0) (must be normalized).
     *
     * @returns {Mat3} out
     * @static
     */
    Mat3.fromViewUp = function (out, view, up) {
        var _fromViewUpIIFE = (function () {
            var default_up = new vec3_1.default(0, 1, 0);
            var x = new vec3_1.default();
            var y = new vec3_1.default();
            return function (out, view, up) {
                if (vec3_1.default.lengthSqr(view) < utils_1.EPSILON * utils_1.EPSILON) {
                    Mat3.identity(out);
                    return out;
                }
                up = up || default_up;
                vec3_1.default.normalize(x, vec3_1.default.cross(x, up, view));
                if (vec3_1.default.lengthSqr(x) < utils_1.EPSILON * utils_1.EPSILON) {
                    Mat3.identity(out);
                    return out;
                }
                vec3_1.default.cross(y, view, x);
                Mat3.set(out, x.x, x.y, x.z, y.x, y.y, y.z, view.x, view.y, view.z);
                return out;
            };
        })();
        return _fromViewUpIIFE(out, view, up);
    };
    /**
     * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {mat4} a - A 4x4 matrix to derive the normal matrix from.
     *
     * @returns {Mat3} out.
     * @static
     */
    Mat3.normalFromMat4 = function (out, a) {
        var am = a.m, outm = out.m;
        var a00 = am[0], a01 = am[1], a02 = am[2], a03 = am[3], a10 = am[4], a11 = am[5], a12 = am[6], a13 = am[7], a20 = am[8], a21 = am[9], a22 = am[10], a23 = am[11], a30 = am[12], a31 = am[13], a32 = am[14], a33 = am[15];
        var b00 = a00 * a11 - a01 * a10;
        var b01 = a00 * a12 - a02 * a10;
        var b02 = a00 * a13 - a03 * a10;
        var b03 = a01 * a12 - a02 * a11;
        var b04 = a01 * a13 - a03 * a11;
        var b05 = a02 * a13 - a03 * a12;
        var b06 = a20 * a31 - a21 * a30;
        var b07 = a20 * a32 - a22 * a30;
        var b08 = a20 * a33 - a23 * a30;
        var b09 = a21 * a32 - a22 * a31;
        var b10 = a21 * a33 - a23 * a31;
        var b11 = a22 * a33 - a23 * a32;
        // Calculate the determinant
        var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) {
            return out;
        }
        det = 1.0 / det;
        outm[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        outm[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        outm[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        outm[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        outm[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        outm[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        outm[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        outm[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        outm[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        return out;
    };
    /**
     * Returns Frobenius norm of a matrix.
     *
     * @param {Mat3} a - Matrix to calculate Frobenius norm of.
     * @returns {Number} - The frobenius norm.
     * @static
     */
    Mat3.frob = function (a) {
        var am = a.m;
        return (Math.sqrt(Math.pow(am[0], 2) + Math.pow(am[1], 2) + Math.pow(am[2], 2) + Math.pow(am[3], 2) + Math.pow(am[4], 2) + Math.pow(am[5], 2) + Math.pow(am[6], 2) + Math.pow(am[7], 2) + Math.pow(am[8], 2)));
    };
    /**
     * Adds two matrices.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {Mat3} a - The first operand.
     * @param {Mat3} b - The second operand.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.add = function (out, a, b) {
        var am = a.m, bm = b.m, outm = out.m;
        outm[0] = am[0] + bm[0];
        outm[1] = am[1] + bm[1];
        outm[2] = am[2] + bm[2];
        outm[3] = am[3] + bm[3];
        outm[4] = am[4] + bm[4];
        outm[5] = am[5] + bm[5];
        outm[6] = am[6] + bm[6];
        outm[7] = am[7] + bm[7];
        outm[8] = am[8] + bm[8];
        return out;
    };
    /**
     * Subtracts matrix b from matrix a.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {Mat3} a - The first operand.
     * @param {Mat3} b - The second operand.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.subtract = function (out, a, b) {
        var am = a.m, bm = b.m, outm = out.m;
        outm[0] = am[0] - bm[0];
        outm[1] = am[1] - bm[1];
        outm[2] = am[2] - bm[2];
        outm[3] = am[3] - bm[3];
        outm[4] = am[4] - bm[4];
        outm[5] = am[5] - bm[5];
        outm[6] = am[6] - bm[6];
        outm[7] = am[7] - bm[7];
        outm[8] = am[8] - bm[8];
        return out;
    };
    /**
     * Multiply each element of a matrix by a scalar number.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {Mat3} a - Matrix to scale
     * @param {Number} b - The scale number.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.multiplyScalar = function (out, a, b) {
        var am = a.m, outm = out.m;
        outm[0] = am[0] * b;
        outm[1] = am[1] * b;
        outm[2] = am[2] * b;
        outm[3] = am[3] * b;
        outm[4] = am[4] * b;
        outm[5] = am[5] * b;
        outm[6] = am[6] * b;
        outm[7] = am[7] * b;
        outm[8] = am[8] * b;
        return out;
    };
    /**
     * Adds two matrices after multiplying each element of the second operand by a scalar number.
     *
     * @param {Mat3} out - Matrix to store result.
     * @param {Mat3} a - The first operand.
     * @param {Mat3} b - The second operand.
     * @param {Number} scale - The scale number.
     * @returns {Mat3} out.
     * @static
     */
    Mat3.multiplyScalarAndAdd = function (out, a, b, scale) {
        var am = a.m, bm = b.m, outm = out.m;
        outm[0] = am[0] + (bm[0] * scale);
        outm[1] = am[1] + (bm[1] * scale);
        outm[2] = am[2] + (bm[2] * scale);
        outm[3] = am[3] + (bm[3] * scale);
        outm[4] = am[4] + (bm[4] * scale);
        outm[5] = am[5] + (bm[5] * scale);
        outm[6] = am[6] + (bm[6] * scale);
        outm[7] = am[7] + (bm[7] * scale);
        outm[8] = am[8] + (bm[8] * scale);
        return out;
    };
    /**
     * Returns whether the specified matrices are equal. (Compared using ===)
     *
     * @param {Mat3} a - The first matrix.
     * @param {Mat3} b - The second matrix.
     * @returns {Boolean} True if the matrices are equal, false otherwise.
     * @static
     */
    Mat3.exactEquals = function (a, b) {
        var am = a.m, bm = b.m;
        return am[0] === bm[0] && am[1] === bm[1] && am[2] === bm[2] &&
            am[3] === bm[3] && am[4] === bm[4] && am[5] === bm[5] &&
            am[6] === bm[6] && am[7] === bm[7] && am[8] === bm[8];
    };
    /**
     * Returns whether the specified matrices are approximately equal.
     *
     * @param {Mat3} a - The first matrix.
     * @param {Mat3} b - The second matrix.
     * @returns {Boolean} True if the matrices are equal, false otherwise.
     * @static
     */
    Mat3.equals = function (a, b) {
        var am = a.m, bm = b.m;
        var a0 = am[0], a1 = am[1], a2 = am[2], a3 = am[3], a4 = am[4], a5 = am[5], a6 = am[6], a7 = am[7], a8 = am[8];
        var b0 = bm[0], b1 = bm[1], b2 = bm[2], b3 = bm[3], b4 = bm[4], b5 = bm[5], b6 = bm[6], b7 = bm[7], b8 = bm[8];
        return (Math.abs(a0 - b0) <= utils_1.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= utils_1.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= utils_1.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= utils_1.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
            Math.abs(a4 - b4) <= utils_1.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
            Math.abs(a5 - b5) <= utils_1.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
            Math.abs(a6 - b6) <= utils_1.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
            Math.abs(a7 - b7) <= utils_1.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
            Math.abs(a8 - b8) <= utils_1.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)));
    };
    /**
     * !#zh 矩阵转数组
     * !#en Matrix transpose array
     * @method toArray
     * @typescript
     * toArray <Out extends IWritableArrayLike<number>> (out: Out, mat: IMat3Like, ofs?: number): Out
     * @param ofs 数组内的起始偏移量
     * @static
     */
    Mat3.toArray = function (out, mat, ofs) {
        if (ofs === void 0) { ofs = 0; }
        var m = mat.m;
        for (var i = 0; i < 9; i++) {
            out[ofs + i] = m[i];
        }
        return out;
    };
    /**
     * !#zh 数组转矩阵
     * !#en Transfer matrix array
     * @method fromArray
     * @typescript
     * fromArray <Out extends IMat3Like> (out: Out, arr: IWritableArrayLike<number>, ofs?: number): Out
     * @param ofs 数组起始偏移量
     * @static
     */
    Mat3.fromArray = function (out, arr, ofs) {
        if (ofs === void 0) { ofs = 0; }
        var m = out.m;
        for (var i = 0; i < 9; i++) {
            m[i] = arr[ofs + i];
        }
        return out;
    };
    /**
     * Returns a string representation of a matrix.
     *
     * @param {Mat3} a - The matrix.
     * @returns {String} String representation of this matrix.
     */
    Mat3.prototype.toString = function () {
        var am = this.m;
        return "mat3(" + am[0] + ", " + am[1] + ", " + am[2] + ", " + am[3] + ", " + am[4] + ", " + am[5] + ", " + am[6] + ", " + am[7] + ", " + am[8] + ")";
    };
    Mat3.sub = Mat3.subtract;
    Mat3.mul = Mat3.multiply;
    /**
     * Identity  of Mat3
     * @property {Mat3} IDENTITY
     * @static
     */
    Mat3.IDENTITY = Object.freeze(new Mat3());
    return Mat3;
}());
exports.Mat3 = Mat3;
//# sourceMappingURL=mat3.js.map