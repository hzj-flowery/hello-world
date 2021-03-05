import { AudioConst } from "../../../const/AudioConst";
import { FightConfig } from "../../../fight/FightConfig";
import { G_AudioManager, G_EffectGfxMgr } from "../../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FightEnd extends cc.Component {

    private _callback: Function;

    public init(callback) {
        this._callback = callback;
    }

    public start() {
        this.playStartGfx();
    }

    public playStartGfx() {
        this._playCG();
    }

    public onDestroy() {
    }

    private _playCG() {
        function eventFunction(event) {
            if (event == 'finish') {
                this._onFinish();
            }
        }
        G_AudioManager.playSoundWithId(AudioConst.SOUND_END_CG);
        var gfxEffect = G_EffectGfxMgr.createPlayGfx(this.node, 'effect_zhandou_shengfu', eventFunction.bind(this), true);
        gfxEffect.node.setPosition(0, 0);
    }

    private _onFinish() {
        if (this._callback) {
            var actionDelay = cc.delayTime(FightConfig.END_DELAY_TIME);
            var actionFunc = cc.callFunc(function () {
                this._callback();
            }.bind(this));
            var action = cc.sequence(actionDelay, actionFunc);
            this.node.runAction(action);
        }
    }
}