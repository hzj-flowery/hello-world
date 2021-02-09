export class SwirlEffect{

        constructor(radius, interpolation){
            this.centerX = 0;
            this.centerY = 0;
            this.radius = 0;
            this.angle = 0;
            this.worldX = 0;
            this.worldY = 0;
            this.radius = radius;
            this.interpolation = interpolation;
        }
        public begin(skeleton) {
            this.worldX = skeleton.x + this.centerX;
            this.worldY = skeleton.y + this.centerY;
        };
        public transform(position, uv, light, dark) {
            var radAngle = this.angle * spine.MathUtils.degreesToRadians;
            var x = position.x - this.worldX;
            var y = position.y - this.worldY;
            var dist = Math.sqrt(x * x + y * y);
            if (dist < this.radius) {
                var theta = this.interpolation.apply(0, radAngle, (this.radius - dist) / this.radius);
                var cos = Math.cos(theta);
                var sin = Math.sin(theta);
                position.x = cos * x - sin * y + this.worldX;
                position.y = sin * x + cos * y + this.worldY;
            }
        };
        public end() {
        };public static interpolation = new spine.PowOut(2);

        return SwirlEffect;
    }