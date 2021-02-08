export class PointAttachment extends spine.VertexAttachment{

        
        constructor(name){
            var _this = _super.call(this, name) || this;
            _this.color = new spine.Color(0.38, 0.94, 0, 1);
            return _this;
        }
        public computeWorldPosition(bone, point) {
            point.x = this.x * bone.a + this.y * bone.b + bone.worldX;
            point.y = this.x * bone.c + this.y * bone.d + bone.worldY;
            return point;
        };
        public computeWorldRotation(bone) {
            var cos = spine.MathUtils.cosDeg(this.rotation), sin = spine.MathUtils.sinDeg(this.rotation);
            var x = cos * bone.a + sin * bone.b;
            var y = cos * bone.c + sin * bone.d;
            return Math.atan2(y, x) * spine.MathUtils.radDeg;
        };
        public copy() {
            var copy = new PointAttachment(name);
            copy.x = this.x;
            copy.y = this.y;
            copy.rotation = this.rotation;
            copy.color.setFromColor(this.color);
            return copy;
        };
        return PointAttachment;
    }