import { VertexAttachment } from "./VertexAttachment"
import { Slot } from "./Slot"
import { Color } from "./Color"
import { Attachment } from "./Attachment"
export class ClippingAttachment extends VertexAttachment{

        
        constructor(name){
            super( name);
 var _this = this;

            _this.color = new Color(0.2275, 0.2275, 0.8078, 1);
            return _this;
        }
        public copy() {
            var copy = new ClippingAttachment(name);
            this.copyTo(copy);
            copy.endSlot = this.endSlot;
            copy.color.setFromColor(this.color);
            return copy;
        };
       
    }
