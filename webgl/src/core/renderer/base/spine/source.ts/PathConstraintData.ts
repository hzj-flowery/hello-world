import { ConstraintData } from "./ConstraintData";

export class PathConstraintData extends ConstraintData {

    public bones: Array<any>;
    constructor(name) {
        super(name, 0, false);
        this.bones = new Array();
    }
}