export class MathUtils{

        function MathUtils() {
        }public static clamp (value, min, max){
            if (value < min)
                return min;
            if (value > max)
                return max;
            return value;
        };public static cosDeg (degrees){
            return Math.cos(degrees * MathUtils.degRad);
        };public static sinDeg (degrees){
            return Math.sin(degrees * MathUtils.degRad);
        };public static signum (value){
            return value > 0 ? 1 : value < 0 ? -1 : 0;
        };public static toInt (x){
            return x > 0 ? Math.floor(x) : Math.ceil(x);
        };public static cbrt (x){
            var y = Math.pow(Math.abs(x), 1 / 3);
            return x < 0 ? -y : y;
        };public static randomTriangular (min, max){
            return MathUtils.randomTriangularWith(min, max, (min + max) * 0.5);
        };public static randomTriangularWith (min, max, mode){
            var u = Math.random();
            var d = max - min;
            if (u <= (mode - min) / d)
                return min + Math.sqrt(u * d * (mode - min));
            return max - Math.sqrt((1 - u) * d * (max - mode));
        };public static PI = 3.1415927;
public static PI2 = MathUtils.PI * 2;
public static radiansToDegrees = 180 / MathUtils.PI;
public static radDeg = MathUtils.radiansToDegrees;
public static degreesToRadians = MathUtils.PI / 180;
public static degRad = MathUtils.degreesToRadians;

        return MathUtils;
    }