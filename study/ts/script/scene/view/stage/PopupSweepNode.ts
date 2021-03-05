const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';
import { DropHelper } from '../../../utils/DropHelper';
import CommonIconTemplate from '../../../ui/component/CommonIconTemplate';
import { G_EffectGfxMgr, G_AudioManager } from '../../../init';
import { AudioConst } from '../../../const/AudioConst';

@ccclass
export default class PopupSweepNode extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _nodeBG: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textTitle: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeBG2: cc.Node = null;

    @property({ type: CommonResourceInfo, visible: true })
    _resExp: CommonResourceInfo = null;

    @property({ type: CommonResourceInfo, visible: true })
    _resMoney: CommonResourceInfo = null;

    @property({ type: cc.Prefab, visible: true })
    _commonIconTemplatePrefab: cc.Prefab = null;


    private static ITEM_POS_5 = [
        cc.v2(72, 56),
        cc.v2(177, 56),
        cc.v2(282, 56),
        cc.v2(387, 56),
        cc.v2(492, 56)
    ];
    private static ITEM_POS_4 = [
        cc.v2(125, 56),
        cc.v2(230, 56),
        cc.v2(335, 56),
        cc.v2(440, 56)
    ];
    private static ITEM_POS_3 = [
        cc.v2(175, 56),
        cc.v2(280, 56),
        cc.v2(385, 56)
    ];
    private static ITEM_POS_2 = [
        cc.v2(230, 56),
        cc.v2(335, 56)
    ];
    private static ITEM_POS_1 = [cc.v2(280, 56)];
    private static HEIGHT_FIX = 5;

    private _result;
    private _index;
    private _callback;
    private _itemIcons: cc.Node[];
    private _itemIdx;
    private _isCrit;

    public init(result, idx, callback) {
        this._result = result;
        this._index = idx;
        this._callback = callback;
        this._itemIcons = [];
        this._itemIdx = 0;
        this._isCrit = false;
    }

    public onLoad() {
        this.node.setContentSize(this._nodeBG.width, this._nodeBG.height + PopupSweepNode.HEIGHT_FIX);
        if (this._index == 0) {
            this._nodeBG.active = false;
        } else {
            this._nodeBG2.active = false;
            this._textTitle.string = (Lang.get('sweep_count', { count: this._index }));
        }
        this._resExp.onLoad();
        this._resMoney.onLoad();
        this._resExp.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_EXP, this._result.exp);
        this._resMoney.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, this._result.money);
        this._resExp.node.active = false;
        this._resMoney.node.active = false;
        this._itemIcons.push(this._resExp.node);
        this._itemIcons.push(this._resMoney.node);
        if (this._result.addRewards) {
            for (let i in this._result.addRewards) {
                var v = this._result.addRewards[i];
                this._resMoney.updateCrit(v.index, v.reward.size);
                // this._resMoney.setCritImageVisible(false);
                this._isCrit = true;
            }
        }
        var rewards = this._result.rewards;
        var rewardCount = rewards.length;
        rewards = DropHelper.sortDropList(rewards);
        for (let i in rewards) {
            var v = rewards[i];
            var uiNode = cc.instantiate(this._commonIconTemplatePrefab).getComponent(CommonIconTemplate);
            uiNode.initUI(v.type, v.value, v.size);
            uiNode.node.setScale(0.8);
            uiNode.setTouchEnabled(false);
            uiNode.showDoubleTips(this._result.isDouble);
            this.node.addChild(uiNode.node);
            uiNode.node.setPosition(PopupSweepNode['ITEM_POS_' + rewardCount][i]);
            this._itemIcons.push(uiNode.node);
            uiNode.node.active = false;
        }
        this.node.active = false;
    }

    public playEnterAction() {
        this.node.active = true;
        function eventFunc(event) {
            if (event == 'play') {
                G_EffectGfxMgr.applySingleGfx(this.node, 'smoving_saodang_di', null, null, null);
            } else if (event == 'exp') {
                this._startIconActions();
            } else if (event == 'baoji') {
                if (this._isCrit) {
                    this._resMoney.playCritAction('smoving_saodang_baoji');
                }
            } else if (event == 'finish') {
                if (this._callback) {
                    this._callback();
                }
            }
        }
        G_AudioManager.playSoundWithId(AudioConst.SOUND_SAODANG);
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_saodang', null, eventFunc.bind(this), false);
    }

    private _playIconAction(index) {
        var icon = this._itemIcons[index];
        icon.active = true;
        G_EffectGfxMgr.applySingleGfx(icon, 'smoving_saodang_exp', null, null, null);
    }

    private _startIconActions() {
        var delay = cc.delayTime(1 / 15);
        var callFunc: any[] = [];
        for (let i = 0; i < this._itemIcons.length; i++) {
            var func = cc.callFunc(function () {
                this._playIconAction(i);
            }.bind(this));
            callFunc.push(func);
        }
        let sequences:cc.ActionInterval[] = [];
        for (let i = 0; i < callFunc.length; i++) {
            let seq = cc.sequence(callFunc[i], delay);
            sequences.push(seq);
        }
        if (sequences.length > 0) {
            let seqSum = cc.sequence(sequences);
            this.node.runAction(seqSum);
        }
    }
}