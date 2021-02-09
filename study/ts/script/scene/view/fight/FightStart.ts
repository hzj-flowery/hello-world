import { AudioConst } from "../../../const/AudioConst";
import { FightSignalManager } from "../../../fight/FightSignalManager";
import { FightSignalConst } from "../../../fight/FightSignConst";
import { G_AudioManager, G_EffectGfxMgr, G_SceneManager } from "../../../init";
import { BattleDataHelper } from "../../../utils/data/BattleDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import ArenaFightStartAnimation from "../arena/ArenaFightStartAnimation";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FightStart extends cc.Component {

    private _isFinish: boolean;
    private _battleData;
    private _battleSpeed: number;
    private _animationPopup:ArenaFightStartAnimation;

    public init(battleData, battleSpeed) {
        this._isFinish = false;
        this._battleData = battleData;
        this._battleSpeed = battleSpeed;
    }

    public start() {
        this.playStartGfx();
    }

    public playStartGfx() {
        if (this._battleData && this._battleData.battleType == BattleDataHelper.BATTLE_TYPE_ARENA) {
            G_SceneManager.openPopup(Path.getPrefab("ArenaFightStartAnimation","arena"),(animationPopup:ArenaFightStartAnimation)=>{
                this._animationPopup = animationPopup;
                this._animationPopup.setInitData(this._battleData, handler(this, this._onFinish));
                this._animationPopup.open();
            })
        } else {
            this._playCG();
        }
    }

    public onDestroy() {
        if (this._animationPopup) {
            this._animationPopup.node.destroy();
        }
    }

    private _playCG() {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_START_CG, this._battleSpeed);
        function eventFunction(event) {
            if (event == 'finish') {
                this._onFinish();
            }
        }
        var gfxEffect = G_EffectGfxMgr.createPlayGfx(this.node, 'effect_zhandou_duijue', eventFunction.bind(this), true);
        gfxEffect.node.setPosition(0, 0);
    }

    private _onFinish() {
        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_CHECK_LEAD);
        this._isFinish = true;
    }

    public isFinish() {
        return this._isFinish;
    }
}