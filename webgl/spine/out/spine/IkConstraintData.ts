export class IkConstraintData extends spine.ConstraintData{

        
        constructor(name){
            var _this = _super.call(this, name, 0, false) || this;
            _this.bones = new Array();
            _this.bendDirection = 1;
            _this.compress = false;
            _this.stretch = false;
            _this.uniform = false;
            _this.mix = 1;
            _this.softness = 0;
            return _this;
        }
        return IkConstraintData;
    }