export class PathAttachment extends spine.VertexAttachment{

        
        constructor(name){
            var _this = _super.call(this, name) || this;
            _this.closed = false;
            _this.constantSpeed = false;
            _this.color = new spine.Color(1, 1, 1, 1);
            return _this;
        }
        public copy() {
            var copy = new PathAttachment(name);
            this.copyTo(copy);
            copy.lengths = new Array(this.lengths.length);
            spine.Utils.arrayCopy(this.lengths, 0, copy.lengths, 0, this.lengths.length);
            copy.closed = closed;
            copy.constantSpeed = this.constantSpeed;
            copy.color.setFromColor(this.color);
            return copy;
        };
        return PathAttachment;
    }