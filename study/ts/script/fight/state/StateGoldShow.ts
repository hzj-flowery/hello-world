import { State } from "./State";
import Entity from "../unit/Entity";

// 金将入场show（区别吕布新手入场）
export class StateGoldShow extends State {
    private playTime;
    private time;

    constructor(entity: Entity, time) {
        super(entity);
        this.cName = "StateGoldShow";
        this.playTime = 0;
        this.bShowName = false;
        this.time = time;
    }

    public start() {
        super.start();
        this.entity.setVisible(true);
        this.entity.showShadow(true);
        this.playTime = 0;
        this.entity.setAction("coming", false);
    }

    public update(f: number) {
        if (!this.isStart) {
            return;
        }

        if (this.playTime >= this.time) {
            this.onFinish();
        }

        this.playTime += f;
    }
}