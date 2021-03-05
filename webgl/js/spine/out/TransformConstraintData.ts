export class TransformConstraintData extends spine.ConstraintData{

        
        constructor(name){
            var _this = _super.call(this, name, 0, false) || this;
            _this.bones = new Array();
            _this.rotateMix = 0;
            _this.translateMix = 0;
            _this.scaleMix = 0;
            _this.shearMix = 0;
            _this.offsetRotation = 0;
            _this.offsetX = 0;
            _this.offsetY = 0;
            _this.offsetScaleX = 0;
            _this.offsetScaleY = 0;
            _this.offsetShearY = 0;
            _this.relative = false;
            _this.local = false;
            return _this;
        }
        return TransformConstraintData;
    }