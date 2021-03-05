export class JitterEffect{

        constructor(jitterX, jitterY){
            this.jitterX = 0;
            this.jitterY = 0;
            this.jitterX = jitterX;
            this.jitterY = jitterY;
        }
        public begin(skeleton) {
        };
        public transform(position, uv, light, dark) {
            position.x += spine.MathUtils.randomTriangular(-this.jitterX, this.jitterY);
            position.y += spine.MathUtils.randomTriangular(-this.jitterX, this.jitterY);
        };
        public end() {
        };
        return JitterEffect;
    }