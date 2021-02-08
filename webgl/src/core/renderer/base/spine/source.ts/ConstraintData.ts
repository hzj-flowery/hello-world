export class ConstraintData {
    public name:string;
    public order:any;
    public skinRequired:boolean;
    constructor(name, order, skinRequired) {
        this.name = name;
        this.order = order;
        this.skinRequired = skinRequired;
    }
}