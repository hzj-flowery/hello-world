import Entity from "../unit/Entity";
import { State } from "./State";

// 战斗前展示
export class StatePetShow extends State
{
    constructor(entity:Entity,skillPlay)
    {
        super(entity);
        this.cName = "StatePetShow";
    }

    public start()
    {
        super.start();
        this.entity.showBillBoard(false);
    }
}