import { VertexAttachment } from "./VertexAttachment"
import { Color } from "./Color"
import { Attachment } from "./Attachment"
export class BoundingBoxAttachment extends VertexAttachment{

        
        constructor(name){
            super( name);
 var _this = this;

            _this.color = new Color(1, 1, 1, 1);
            return _this;
        }
        public copy() {
            var copy = new BoundingBoxAttachment(name);
            this.copyTo(copy);
            copy.color.setFromColor(this.color);
            return copy;
        };
       
    }
