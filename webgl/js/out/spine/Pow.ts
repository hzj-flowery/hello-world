export class Pow extends Interpolation{

        
        constructor(power){
            var _this = _super.call(this) || this;
            _this.power = 2;
            _this.power = power;
            return _this;
        }
        public applyInternal(a) {
            if (a <= 0.5)
                return Math.pow(a * 2, this.power) / 2;
            return Math.pow((a - 1) * 2, this.power) / (this.power % 2 == 0 ? -2 : 2) + 1;
        };
        return Pow;
    }