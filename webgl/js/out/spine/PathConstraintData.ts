export class PathConstraintData extends spine.ConstraintData{

        
        constructor(name){
            var _this = _super.call(this, name, 0, false) || this;
            _this.bones = new Array();
            return _this;
        }
        return PathConstraintData;
    }