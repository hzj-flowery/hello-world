import { State } from "./State";
import Entity from "../unit/Entity";

export class StateAction extends State {
    private actionTime: number = 0.3;
    private action: string;
    private during = 0;

    constructor(entity: Entity, action: string) {
        super(entity);
        this.action = action;
        this.entity.setAction(this.action);
        this.during = 0;
        this.cName = "StateAction";
    }

    public update(f) {
        if (this.isStart) {
            if (this.during >= this.actionTime) {
                this.onFinish();
            }
            this.during += f;
        }
    }
}