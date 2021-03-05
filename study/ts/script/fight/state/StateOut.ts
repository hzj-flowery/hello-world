import Entity from "../unit/Entity";
import { StateIdle } from "./StateIdle";
import BuffManager from "../BuffManager";

//站在场外的状态
export class StateOut extends StateIdle
{
    private _attackId: any;
    constructor(entity:Entity,attackId?)
    {
        super(entity);
        this.cName = "StateOut";
        this._attackId = attackId;
    }

    public start()
    {
        super.start();
        BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_HIT_BACK, this._attackId, [this.entity.stageID]);
    }
}