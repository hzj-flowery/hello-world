import Entity from "../unit/Entity";
import { StateFlash } from "./StateFlash";
import BuffManager from "../BuffManager";

export class StateDying extends StateFlash {
    constructor(entity: Entity, actionID) {
        super(entity);
        this.cName = "StateDying";
        this.setAction(actionID);
    }

    public onFinish() {
        super.onFinish();
        BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_DIE, this.entity.stageID);
    }
}