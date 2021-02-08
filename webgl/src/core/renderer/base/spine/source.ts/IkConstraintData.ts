import { ConstraintData } from "./ConstraintData";

export class IkConstraintData extends ConstraintData {
    public bones: Array<any>;
    public bendDirection: number;
    public compress: boolean;
    public stretch: boolean;
    public uniform: boolean;
    public mix: number;
    public softness: number;
    constructor(name) {
        super(name, 0, false);
        this.bones = new Array();
        this.bendDirection = 1;
        this.compress = false;
        this.stretch = false;
        this.uniform = false;
        this.mix = 1;
        this.softness = 0;
    }
}