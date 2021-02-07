import { Pow } from "./Pow";

export class PowOut extends Pow {

    constructor(power) {
        super(power);
    }
    public applyInternal(a) {
        return Math.pow(a - 1, this.power) * (this.power % 2 == 0 ? -1 : 1) + 1;
    };
}