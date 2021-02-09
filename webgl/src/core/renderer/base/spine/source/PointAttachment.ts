import { VertexAttachment } from "./VertexAttachment"
import { Color } from "./Color"
import { MathUtils } from "./MathUtils"
import { Utils } from "./Utils"
import { Attachment } from "./Attachment"
export class PointAttachment extends VertexAttachment{

        
        constructor(name){
            super( name);
 var _this = this;

            _this.color = new Color(0.38, 0.94, 0, 1);
            return _this;
        }
        public computeWorldPosition(bone, point) {
            point.x = this.x * bone.a + this.y * bone.b + bone.worldX;
            point.y = this.x * bone.c + this.y * bone.d + bone.worldY;
            return point;
        };
        public computeWorldRotation(bone) {
            var cos = MathUtils.cosDeg(this.rotation), sin = MathUtils.sinDeg(this.rotation);
            var x = cos * bone.a + sin * bone.b;
            var y = cos * bone.c + sin * bone.d;
            return Math.atan2(y, x) * MathUtils.radDeg;
        };
        public copy() {
            var copy = new PointAttachment(name);
            copy.x = this.x;
            copy.y = this.y;
            copy.rotation = this.rotation;
            copy.color.setFromColor(this.color);
            return copy;
        };
       
    }
