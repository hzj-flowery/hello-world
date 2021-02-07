export class MathUtils {
    constructor() {
    }
    static clamp(value, min, max) {
        if (value < min)
            return min;
        if (value > max)
            return max;
        return value;
    };
    static cosDeg(degrees) {
        return Math.cos(degrees * MathUtils.degRad);
    };
    static sinDeg(degrees) {
        return Math.sin(degrees * MathUtils.degRad);
    };
    static signum(value) {
        return value > 0 ? 1 : value < 0 ? -1 : 0;
    };
    static toInt(x) {
        return x > 0 ? Math.floor(x) : Math.ceil(x);
    };
    static cbrt(x) {
        var y = Math.pow(Math.abs(x), 1 / 3);
        return x < 0 ? -y : y;
    };
    static randomTriangular(min, max) {
        return MathUtils.randomTriangularWith(min, max, (min + max) * 0.5);
    };
    static randomTriangularWith(min, max, mode) {
        var u = Math.random();
        var d = max - min;
        if (u <= (mode - min) / d)
            return min + Math.sqrt(u * d * (mode - min));
        return max - Math.sqrt((1 - u) * d * (max - mode));
    };
    static PI = 3.1415927;
    static PI2 = MathUtils.PI * 2;
    static radiansToDegrees = 180 / MathUtils.PI;
    static radDeg = MathUtils.radiansToDegrees;
    static degreesToRadians = MathUtils.PI / 180;
    static degRad = MathUtils.degreesToRadians;
}