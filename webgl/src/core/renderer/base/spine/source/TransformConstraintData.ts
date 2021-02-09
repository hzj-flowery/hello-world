import { ConstraintData } from "./ConstraintData"
export class TransformConstraintData extends ConstraintData{

        
        constructor(name){
            super( name, 0, false);
 var _this = this;

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
       
    }
