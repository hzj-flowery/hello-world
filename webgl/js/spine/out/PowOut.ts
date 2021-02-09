export class PowOut extends Pow{

        
        constructor(power){
            return _super.call(this, power) || this;
        }
        public applyInternal(a) {
            return Math.pow(a - 1, this.power) * (this.power % 2 == 0 ? -1 : 1) + 1;
        };
        return PowOut;
    }