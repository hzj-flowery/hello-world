import { State } from "./State";
import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";

export class StateIdle extends State {

    private buffAction: string;
    private flashAction: string;

    private hasCombineSkill: boolean;

    constructor(entity) {
        super(entity);
        this.cName = "StateIdle";
        this.buffAction = null;
        this.flashAction = null;

        let buffList = this.entity.buffList;

        //如果有buff的情况，优先播放buff动作
        if (!this.entity.isPet) {
            buffList.forEach(v => {
                let buffData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(v.configId);
                if (buffData.buff_action != "") {
                    this.buffAction = buffData.buff_action;
                }
                if (buffData.flash_action != "") {
                    this.flashAction = buffData.flash_action;
                }
            });
        }

        if (this.entity.isPet) {
            return;
        }

        this.hasCombineSkill = false;
        if (!this.entity.enterStage) {
            this.bShowName = false;
        }
    }

    public start() {
        super.start();

        this.entity.setAction("idle", true);

        if (this.entity.isPet) {
            return;
        }

        if (this.buffAction) {
            this.entity.setAction(this.buffAction, true);
        }

        if (this.flashAction) {
            this.entity.doMoving(this.flashAction);
        }
    }

    public update(f) {
        super.update(f);
    }

    public onFinish() {
        this.entity.stopMoving();
        super.onFinish();
    }
}