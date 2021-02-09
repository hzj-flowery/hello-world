import { BoutHelper } from "../scene/view/bout/BoutHelper";
import { rawequal } from "../utils/GlobleFunc";
import { BaseData } from "./BaseData";

export interface BoutUnit {
    getId(): number
    setId(value: number): void
    getPos(): number
    setPos(value: number): void
}

let schema = {}
schema["id"]  = ["number", 0]        //阵法Id
schema["pos"] = ["number", 0]        //阵法位

export class BoutUnit extends BaseData{
    static schema = schema;
    constructor(pro)
    {
        super(pro);
    }

    clear(){}
    reset(){}
    getConfig(){
        return BoutHelper.getBoutInfoItem(this.getId(),this.getPos())
    }
    isSpecialBoutPoint():boolean{
        return rawequal(this.getConfig().point_type, 2)
    }
}