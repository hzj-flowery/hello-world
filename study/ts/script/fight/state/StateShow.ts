import { State } from "./State";
import Entity from "../unit/Entity";
import { FightConfig } from "../FightConfig";
import { Path } from "../../utils/Path";
import { G_AudioManager } from "../../init";
import UnitHero from "../unit/UnitHero";

// 战斗前展示
export class StateShow extends State {
    private _showTime: number;
    private _skillPlay;
    private _skillType;
    private _prePosition;

    constructor(entity: Entity, skillPlay, skillType, prePosition) {
        super(entity);
        this.cName = "StateShow";
        this._showTime = 0;
        this._skillPlay = skillPlay;
        this._skillType = skillType;
        this._prePosition = prePosition;
        this.bShowName = false;
    }

    public start() {
        super.start();
        if (this._skillType == 2) {
            if (this._skillPlay.txt == 0) {
                this.onFinish();
            }
            this.playSkillVoice();
            if (this._skillPlay && this._skillPlay.txt != 0) {
                (this.entity as UnitHero).showSkill(this._skillPlay.txt);
            }
        }
        else if (this._skillType == 3) {
            let partner = this.entity.getPartner();
            if (partner) {
                partner.startCombineVice(this._skillPlay, this._prePosition)
                this.playSkillVoice();
            }
            (this.entity as UnitHero).playDuang();
        }
    }

    public update(f: number) {
        if (this._showTime > FightConfig.SHOW_TIME) {
            this.onFinish();
        }
        this._showTime += f;
    }

    private playSkillVoice() {
        if (this._skillPlay && this._skillPlay.battle_voice != 0) {
            let mp3 = Path.getSkillVoice(this._skillPlay.battle_voice);
            G_AudioManager.playSound(mp3);
        }
    }
}