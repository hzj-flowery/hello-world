import { Interpolation } from "./Interpolation";

export class Pow extends Interpolation {
        
    public power :number;
    constructor(power) {
super();;
this.power = power;
}
public applyInternal(a) {
if (a <= 0.5)
    return Math.pow(a * 2, this.power) / 2;
return Math.pow((a - 1) * 2, this.power) / (this.power % 2 == 0 ? -2 : 2) + 1;
};

}