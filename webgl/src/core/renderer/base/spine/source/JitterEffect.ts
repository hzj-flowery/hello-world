import { MathUtils } from "./MathUtils"
import { Utils } from "./Utils"
export class JitterEffect{
public jitterX:number;
public jitterY:number;

        constructor(jitterX, jitterY){
            this.jitterX = 0;
            this.jitterY = 0;
            this.jitterX = jitterX;
            this.jitterY = jitterY;
        }
        public begin(skeleton) {
        };
        public transform(position, uv, light, dark) {
            position.x += MathUtils.randomTriangular(-this.jitterX, this.jitterY);
            position.y += MathUtils.randomTriangular(-this.jitterX, this.jitterY);
        };
        public end() {
        };
       
    }
