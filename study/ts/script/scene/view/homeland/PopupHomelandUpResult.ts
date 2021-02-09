const { ccclass, property } = cc._decorator;

import CommonContinueNode from '../../../ui/component/CommonContinueNode'

import CommonPowerPrompt from '../../../ui/component/CommonPowerPrompt'
import { G_AudioManager, G_UserData, Colors, G_EffectGfxMgr } from '../../../init';
import { AudioConst } from '../../../const/AudioConst';
import PopupBase from '../../../ui/PopupBase';
import EffectGfxNode from '../../../effect/EffectGfxNode';
import { Lang } from '../../../lang/Lang';
import PopupHomelandUpSubCell from './PopupHomelandUpSubCell';
import PopupHomelandUpMainCell from './PopupHomelandUpMainCell';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class PopupHomelandUpResult extends PopupBase {
    public static path = 'homeland/PopupHomelandUpResult';
    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: CommonPowerPrompt,
        visible: true
    })
    _fileNodePower: CommonPowerPrompt = null;

    @property({
        type: CommonContinueNode,
        visible: true
    })
    _nodeContinue: CommonContinueNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _openNewTree: cc.Node = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    popupHomelandUpMainCell: cc.Prefab = null;

    _oldPower: any;

    ctor(power) {
        this._oldPower = power;
        this.setClickOtherClose(true);
    }
    onLoad() {
        this._initEffect();
        this._createPlayEffect();
        G_AudioManager.playSoundWithId(AudioConst.SOUND_OFFICIAL_LEVELUP);
    }
    onExit() {
    }
    onClose() {
    }
    onClickTouch() {
        if (this._nodeContinue.node.active == true) {
            this.close();
        }
    }
    _playTotalPowerSummary() {
        var totalPower = G_UserData.getBase().getPower();
        this._fileNodePower.node.active = (true);
        var diffPower = totalPower - this._oldPower;
        this._fileNodePower.updateUI(totalPower, diffPower);
        this._fileNodePower.playEffect(false);
    }
    isAnimEnd() {
        return this._nodeContinue.node.active;
    }
    _initEffect() {
        this._nodeContinue.node.active = (false);
        this._fileNodePower.node.active = (false);
    }
    _createPlayEffect() {
        var currLevel = G_UserData.getHomeland().getMainTreeLevel();
        var currData = G_UserData.getHomeland().getMainTreeCfg(currLevel - 1);
        var nextData = G_UserData.getHomeland().getMainTreeCfg(currLevel);
        let effectFunction = function (effect) {
            // if (effect == 'effect_shenshu_jiantou') {
            //     var subEffect = new EffectGfxNode('effect_shenshu_jiantou');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_bg5') {
            //     var subEffect = new EffectGfxNode('effect_bg5');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_txt_bg') {
            //     var subEffect = new EffectGfxNode('effect_txt_bg');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_jinsheng_dazi') {
            //     var subEffect = new EffectGfxNode('effect_jinsheng_dazi');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_hejilibao_xiaodi') {
            //     var subEffect = new EffectGfxNode('effect_hejilibao_xiaodi');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_win_2') {
            //     var subEffect = new EffectGfxNode('effect_win_2');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_bg4') {
            //     var subEffect = new EffectGfxNode('effect_bg4');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_bg3') {
            //     var subEffect = new EffectGfxNode('effect_bg3');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_bg2') {
            //     var subEffect = new EffectGfxNode('effect_bg2');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_bg1') {
            //     var subEffect = new EffectGfxNode('effect_bg1');
            //     subEffect.play();
            //     return subEffect;
            // }
            if (effect == 'touxian_1') {
                var currLevel = G_UserData.getHomeland().getMainTreeLevel();
                var currData = G_UserData.getHomeland().getMainTreeCfg(currLevel - 1);
                var nextData = G_UserData.getHomeland().getMainTreeCfg(currLevel);
                var retNode = cc.instantiate(this.popupHomelandUpMainCell).getComponent(PopupHomelandUpMainCell);
                retNode.onLoad();
               // retNode.PanelCommon.y = (4);
                retNode.updateBreakUI(currData);
               // retNode.Image_bk.node.y = (200);
                var treeTitle = retNode.Node_treeTitle;
               // treeTitle.y = (227);
                return retNode.node;
            }
            if (effect == 'touxian_2') {
                var currLevel = G_UserData.getHomeland().getMainTreeLevel();
                var currData = G_UserData.getHomeland().getMainTreeCfg(currLevel - 1);
                var nextData = G_UserData.getHomeland().getMainTreeCfg(currLevel);
                var retNode = cc.instantiate(this.popupHomelandUpMainCell).getComponent(PopupHomelandUpMainCell);
                retNode.onLoad();
             //   retNode.PanelCommon.y = (4);
                retNode.updateNextBreakUI(currData, nextData);
              //  retNode.Image_bk.node.y = (200);
                var treeTitle = retNode.Node_treeTitle;
               // treeTitle.y = (227);
                return retNode.node;
            }
            return new cc.Node();
        }.bind(this);
        let eventFunction = function (event) {
            if (event == 'finish') {
                this._playTotalPowerSummary();
                this._nodeContinue.node.active = (true);
                if (currData.up_text && currData.up_text != '') {
                    this._openNewTree.removeAllChildren();
                    var params1 = {
                        name: 'label1',
                        text: Lang.get('homeland_open_new_level'),
                        fontSize: 22,
                        color: Colors.DARK_BG_THREE
                    };
                    var params2 = {
                        name: 'label2',
                        text: currData.up_text,
                        fontSize: 22,
                        color: Colors.DARK_BG_GREEN
                    };
                    var widget = UIHelper.createTwoLabel(params1, params2);
                    widget.setPosition(-widget.width/2, -widget.height/2);
                    this._openNewTree.addChild(widget);
                }
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_shenshu_jinsheng', effectFunction, eventFunction, false);
        // effect.setPosition(cc.v2(0, 0));
        // return effect;
    }

}