import { VertexAttachment } from "./VertexAttachment"
import { Color } from "./Color"
import { Utils } from "./Utils"
import { Attachment } from "./Attachment"
export class PathAttachment extends VertexAttachment{

        
        constructor(name){
            super( name);
 var _this = this;

            _this.closed = false;
            _this.constantSpeed = false;
            _this.color = new Color(1, 1, 1, 1);
            return _this;
        }
        public copy() {
            var copy = new PathAttachment(name);
            this.copyTo(copy);
            copy.lengths = new Array(this.lengths.length);
            Utils.arrayCopy(this.lengths, 0, copy.lengths, 0, this.lengths.length);
            copy.closed = closed;
            copy.constantSpeed = this.constantSpeed;
            copy.color.setFromColor(this.color);
            return copy;
        };
       
    }
