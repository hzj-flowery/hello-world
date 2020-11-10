"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inverseLerp = exports.pingPong = exports.repeat = exports.nextPow2 = exports.pseudoRandomRangeInt = exports.pseudoRandomRange = exports.pseudoRandom = exports.randomRangeInt = exports.randomRange = exports.random = exports.toDegree = exports.toRadian = exports.lerp = exports.clamp01 = exports.clamp = exports.approx = exports.equals = exports.FLOAT_BYTES = exports.FLOAT_ARRAY_TYPE = exports.INT_MIN = exports.INT_MAX = exports.INT_BITS = exports.EPSILON = void 0;
/**
 * @ignore
 */
var _d2r = Math.PI / 180.0;
/**
 * @ignore
 */
var _r2d = 180.0 / Math.PI;
/**
 * @property {number} EPSILON
 */
exports.EPSILON = 0.000001;
// Number of bits in an integer
exports.INT_BITS = 32;
exports.INT_MAX = 0x7fffffff;
exports.INT_MIN = -1 << (exports.INT_BITS - 1);
/**
 * 在本机平台上使用单精度浮点，以便与本机数学库兼容。
 * 在Web平台和编辑器中使用双精度浮点来减少类型转换的开销
 * Use single-precision floating point on native platforms to be compatible with native math libraries.
 * Double precision floating point is used on Web platforms and editors to reduce the overhead of type conversion.
 */
// export const FLOAT_ARRAY_TYPE = (CC_JSB && CC_NATIVERENDERER) ? Float32Array : Float64Array;
// export const FLOAT_BYTES = (CC_JSB && CC_NATIVERENDERER) ? 4 : 8;
exports.FLOAT_ARRAY_TYPE = Float32Array;
exports.FLOAT_BYTES = 4;
/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */
function equals(a, b) {
    return Math.abs(a - b) <= exports.EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
}
exports.equals = equals;
/**
 * Tests whether or not the arguments have approximately the same value by given maxDiff
 *
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @param {Number} maxDiff Maximum difference.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */
function approx(a, b, maxDiff) {
    maxDiff = maxDiff || exports.EPSILON;
    return Math.abs(a - b) <= maxDiff;
}
exports.approx = approx;
/**
 * Clamps a value between a minimum float and maximum float value.
 *
 * @method clamp
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function clamp(val, min, max) {
    return val < min ? min : val > max ? max : val;
}
exports.clamp = clamp;
/**
 * Clamps a value between 0 and 1.
 *
 * @method clamp01
 * @param {number} val
 * @return {number}
 */
function clamp01(val) {
    return val < 0 ? 0 : val > 1 ? 1 : val;
}
exports.clamp01 = clamp01;
/**
 * @method lerp
 * @param {number} from
 * @param {number} to
 * @param {number} ratio - the interpolation coefficient
 * @return {number}
 */
function lerp(from, to, ratio) {
    return from + (to - from) * ratio;
}
exports.lerp = lerp;
/**
* Convert Degree To Radian
*
* @param {Number} a Angle in Degrees
*/
function toRadian(a) {
    return a * _d2r;
}
exports.toRadian = toRadian;
/**
* Convert Radian To Degree
*
* @param {Number} a Angle in Radian
*/
function toDegree(a) {
    return a * _r2d;
}
exports.toDegree = toDegree;
/**
* @method random
*/
exports.random = Math.random;
/**
 * Returns a floating-point random number between min (inclusive) and max (exclusive).
 *
 * @method randomRange
 * @param {number} min
 * @param {number} max
 * @return {number} the random number
 */
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}
exports.randomRange = randomRange;
/**
 * Returns a random integer between min (inclusive) and max (exclusive).
 *
 * @method randomRangeInt
 * @param {number} min
 * @param {number} max
 * @return {number} the random integer
 */
function randomRangeInt(min, max) {
    return Math.floor(randomRange(min, max));
}
exports.randomRangeInt = randomRangeInt;
/**
 * Linear congruential generator using Hull-Dobell Theorem.
 *
 * @method pseudoRandom
 * @param {number} seed the random seed
 * @return {number} the pseudo random
 */
function pseudoRandom(seed) {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280.0;
}
exports.pseudoRandom = pseudoRandom;
/**
 * Returns a floating-point pseudo-random number between min (inclusive) and max (exclusive).
 *
 * @method pseudoRandomRange
 * @param {number} seed
 * @param {number} min
 * @param {number} max
 * @return {number} the random number
 */
function pseudoRandomRange(seed, min, max) {
    return pseudoRandom(seed) * (max - min) + min;
}
exports.pseudoRandomRange = pseudoRandomRange;
/**
 * Returns a pseudo-random integer between min (inclusive) and max (exclusive).
 *
 * @method pseudoRandomRangeInt
 * @param {number} seed
 * @param {number} min
 * @param {number} max
 * @return {number} the random integer
 */
function pseudoRandomRangeInt(seed, min, max) {
    return Math.floor(pseudoRandomRange(seed, min, max));
}
exports.pseudoRandomRangeInt = pseudoRandomRangeInt;
/**
 * Returns the next power of two for the value
 *
 * @method nextPow2
 * @param {number} val
 * @return {number} the the next power of two
 */
function nextPow2(val) {
    --val;
    val = (val >> 1) | val;
    val = (val >> 2) | val;
    val = (val >> 4) | val;
    val = (val >> 8) | val;
    val = (val >> 16) | val;
    ++val;
    return val;
}
exports.nextPow2 = nextPow2;
/**
 * Returns float remainder for t / length
 *
 * @method repeat
 * @param {number} t time start at 0
 * @param {number} length time of one cycle
 * @return {number} the time wrapped in the first cycle
 */
function repeat(t, length) {
    return t - Math.floor(t / length) * length;
}
exports.repeat = repeat;
/**
 * Returns time wrapped in ping-pong mode
 *
 * @method repeat
 * @param {number} t time start at 0
 * @param {number} length time of one cycle
 * @return {number} the time wrapped in the first cycle
 */
function pingPong(t, length) {
    t = repeat(t, length * 2);
    t = length - Math.abs(t - length);
    return t;
}
exports.pingPong = pingPong;
/**
 * Returns ratio of a value within a given range
 *
 * @method repeat
 * @param {number} from start value
 * @param {number} to end value
 * @param {number} value given value
 * @return {number} the ratio between [from,to]
 */
function inverseLerp(from, to, value) {
    return (value - from) / (to - from);
}
exports.inverseLerp = inverseLerp;
/**
 * Returns -1, 0, +1 depending on sign of x.
 *
 * @method sign
 * @param {number} v
 */
// export function sign (v) {
//   return (v > 0) - (v < 0);
// }
//# sourceMappingURL=utils.js.map