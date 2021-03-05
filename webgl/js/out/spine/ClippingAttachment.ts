export class ClippingAttachment extends spine.VertexAttachment{

        
        constructor(name){
            var _this = _super.call(this, name) || this;
            _this.color = new spine.Color(0.2275, 0.2275, 0.8078, 1);
            return _this;
        }
        public copy() {
            var copy = new ClippingAttachment(name);
            this.copyTo(copy);
            copy.endSlot = this.endSlot;
            copy.color.setFromColor(this.color);
            return copy;
        };
        return ClippingAttachment;
    }