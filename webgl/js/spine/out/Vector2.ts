export class Vector2{

        constructor(x, y){
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        public set(x, y) {
            this.x = x;
            this.y = y;
            return this;
        };
        public length() {
            var x = this.x;
            var y = this.y;
            return Math.sqrt(x * x + y * y);
        };
        public normalize() {
            var len = this.length();
            if (len != 0) {
                this.x /= len;
                this.y /= len;
            }
            return this;
        };
        return Vector2;
    }