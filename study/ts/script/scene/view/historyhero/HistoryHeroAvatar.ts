import { G_EffectGfxMgr } from "../../../init";
import CommonHistoryAvatar from "../../../ui/component/CommonHistoryAvatar";
import CommonHistoryHeroName from "../../../ui/component/CommonHistoryHeroName";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryHeroAvatar extends cc.Component {
    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeEffect: cc.Node = null;
    @property({ type: CommonHistoryAvatar, visible: true })
    _nodeAvatar: CommonHistoryAvatar = null;
    @property({ type: CommonHistoryHeroName, visible: true })
    _heroName: CommonHistoryHeroName = null;

    _touchCallback: any;

    onLoad() {
        UIHelper.addEventListenerToNode(this.node, this._panelTouch, 'HistoryHeroAvatar', '_onTouched');
    }
    onExit() {
    }
    updateUI(historyHeroCfgData, isEquiping) {
        if (isEquiping) {
            this._nodeEffect.removeAllChildren();
            this._playHeroPickAnimation(this._nodeEffect, historyHeroCfgData);
        } else {
            this._nodeAvatar.setVisible(true);
            this._nodeAvatar.updateUI(historyHeroCfgData.id);
            this._nodeAvatar.setScale(0.9);
            var params = this._nodeAvatar.getItemParams();
            this._heroName.setName(params.name);
            this._heroName.setColor(params.icon_color);
        }
    }
    setTouchCallback(cb) {
        this._touchCallback = cb;
    }
    _onTouched() {
        if (this._touchCallback) {
            this._touchCallback();
        }
    }
    _playHeroPickAnimation(rootNode, historyHeroCfgData) {
        function effectFunction(effect) {
            var node = new cc.Node();
            if (effect == 'effect_zm_boom') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_zm_boom');
            }
            return node;
        }
        function eventFunction(event) {
            if (event == 'finish') {
            } else if (event == 'hero') {
                this._nodeAvatar.setVisible(true);
                this._nodeAvatar.updateUI(historyHeroCfgData.id);
                this._nodeAvatar.setScale(0.9);
                var params = this._nodeAvatar.getItemParams();
                this._heroName.setName(params.name);
                this._heroName.setColor(params.icon_color);
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(rootNode, 'moving_wuchabiebuzhen_wujiang', effectFunction, eventFunction, false);
    }
}