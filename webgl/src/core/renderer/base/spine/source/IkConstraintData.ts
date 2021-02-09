import { ConstraintData } from "./ConstraintData"
export class IkConstraintData extends ConstraintData{

        
        constructor(name){
            super( name, 0, false);
 var _this = this;

            _this.bones = new Array();
            _this.bendDirection = 1;
            _this.compress = false;
            _this.stretch = false;
            _this.uniform = false;
            _this.mix = 1;
            _this.softness = 0;
            return _this;
        }
       
    }
