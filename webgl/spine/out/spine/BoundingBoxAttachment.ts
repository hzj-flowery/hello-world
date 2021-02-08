export class BoundingBoxAttachment extends spine.VertexAttachment{

        
        constructor(name){
            var _this = _super.call(this, name) || this;
            _this.color = new spine.Color(1, 1, 1, 1);
            return _this;
        }
        public copy() {
            var copy = new BoundingBoxAttachment(name);
            this.copyTo(copy);
            copy.color.setFromColor(this.color);
            return copy;
        };
        return BoundingBoxAttachment;
    }