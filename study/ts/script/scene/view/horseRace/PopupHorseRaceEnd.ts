import PopupBase from "../../../ui/PopupBase";
import { G_AudioManager, G_SceneManager, G_SignalManager, G_EffectGfxMgr } from "../../../init";
import { AudioConst } from "../../../const/AudioConst";
import { SignalConst } from "../../../const/SignalConst";
import { Lang } from "../../../lang/Lang";
import NodeHorseReward from "./NodeHorseReward";
import NodeHorseReward2 from "./NodeHorseReward2";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import { handler } from "../../../utils/handler";
import CommonButtonLevel0Normal from "../../../ui/component/CommonButtonLevel0Normal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupHorseRaceEnd extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _effectNode: cc.Node = null;
    @property({ type: cc.Prefab, visible: true })
    _nodeHorseRewardPrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _nodeHorseReward2Prefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _commonButtonLevel0HighlightPrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _commonButtonLevel0NormalPrefab: cc.Prefab = null;

    private _awards;
    private _distance;
    private _point;
    private _isPerfectDis;
    private _isPercentGold;
    public init(distance, point, awards, isPerfectDis, isPercentGold?) {
        this._awards = awards;
        this._distance = distance;
        this._point = point;
        this._isPerfectDis = isPerfectDis;
        this._isPercentGold = isPercentGold;
    }

    public onCreate() {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_HORSE_RACE_SUMMARY);
    }

    public onEnter() {
        this._playEft();
    }

    public onExit() {
    }

    private _onOKClick() {
        G_SceneManager.popScene();
    }

    private _onRetryClick() {
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_REMATCH);
        this.close();
    }

    private _playEft() {
        function effectFunction(effect): cc.Node {
            if (effect == 'shuoming_1') {
                return this._createHorseReward(Lang.get('horse_reward_distance'), Lang.get('horse_race_meter', { count: this._distance }), this._isPerfectDis);
            } else if (effect == 'shuoming_2') {
                return this._createHorseReward(Lang.get('horse_reward_point'), Lang.get('horse_race_point', { count: this._point }), this._isPercentGold);
            } else if (effect == 'shuoming_3') {
                return this._createHorseReward2(Lang.get('horse_reward_reward'), this._awards);
            } else if (effect == 'anniu') {
                return this._createButtons();
            }
            return new cc.Node();
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._effectNode, 'moving_benpaojiesuan', effectFunction.bind(this));
    }

    private _createHorseReward(text, count, isPerfect): cc.Node {
        var nodeHorseReward = cc.instantiate(this._nodeHorseRewardPrefab).getComponent(NodeHorseReward);
        nodeHorseReward.updateUI(text, count, isPerfect);
        return nodeHorseReward.node;
    }

    private _createHorseReward2(text, awards) {
        var nodeHorseReward = cc.instantiate(this._nodeHorseReward2Prefab).getComponent(NodeHorseReward2);
        nodeHorseReward.updateUI(text, awards);
        return nodeHorseReward.node;
    }

    private _createButtons() {
        var node = new cc.Node();
        var btnOk = cc.instantiate(this._commonButtonLevel0HighlightPrefab).getComponent(CommonButtonLevel0Highlight);
        node.addChild(btnOk.node);
        btnOk.node.x = (150);
        btnOk.setString(Lang.get('horse_ok'));
        btnOk.addClickEventListenerEx(handler(this, this._onOKClick));
        var btnRetry =cc.instantiate(this._commonButtonLevel0NormalPrefab).getComponent(CommonButtonLevel0Normal);
        node.addChild(btnRetry.node);
        btnRetry.node.x = (-150);
        btnRetry.setString(Lang.get('horse_retry'));
        btnRetry.addClickEventListenerEx(handler(this, this._onRetryClick));
        return node;
    }
}