export class MathUtils{

        function MathUtils() {
        }
            if (value < min)
                return min;
            if (value > max)
                return max;
            return value;
        };
            return Math.cos(degrees * MathUtils.degRad);
        };
            return Math.sin(degrees * MathUtils.degRad);
        };
            return value > 0 ? 1 : value < 0 ? -1 : 0;
        };
            return x > 0 ? Math.floor(x) : Math.ceil(x);
        };
            var y = Math.pow(Math.abs(x), 1 / 3);
            return x < 0 ? -y : y;
        };
            return MathUtils.randomTriangularWith(min, max, (min + max) * 0.5);
        };
            var u = Math.random();
            var d = max - min;
            if (u <= (mode - min) / d)
                return min + Math.sqrt(u * d * (mode - min));
            return max - Math.sqrt((1 - u) * d * (max - mode));
        };
public static PI2 = MathUtils.PI * 2;
public static radiansToDegrees = 180 / MathUtils.PI;
public static radDeg = MathUtils.radiansToDegrees;
public static degreesToRadians = MathUtils.PI / 180;
public static degRad = MathUtils.degreesToRadians;

        return MathUtils;
    }