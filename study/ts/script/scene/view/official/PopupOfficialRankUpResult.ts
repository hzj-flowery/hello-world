const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { SignalConst } from '../../../const/SignalConst';
import { G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrDiff3 from '../../../ui/component/CommonAttrDiff3';
import CommonContinueNode from '../../../ui/component/CommonContinueNode';
import CommonPowerPrompt from '../../../ui/component/CommonPowerPrompt';
import PopupBase from '../../../ui/PopupBase';
import { Path } from '../../../utils/Path';
import ResourceLoader, { ResourceData } from '../../../utils/resource/ResourceLoader';
import { Util } from '../../../utils/Util';



@ccclass
export default class PopupOfficialRankUpResult extends PopupBase {

    static popupResult(currRank, oldPower) {
        var arr: ResourceData[] = [{path: 'prefab/official/PopupOfficialRankUpResult', type: cc.Prefab}];
        var curr: number = currRank - 1;
        var next: number = currRank;
        var info = G_UserData.getBase().getOfficialInfo(curr)[0];
        arr.push({path: Path.getTextHero(info.picture), type: cc.SpriteFrame});
        info = G_UserData.getBase().getOfficialInfo(next)[0];
        arr.push({path: Path.getTextHero(info.picture), type: cc.SpriteFrame});
        ResourceLoader.loadResArrayWithType(arr, (err, resource) => {
            // G_EffectGfxMgr.loadPlayMovingGfx('moving_jinsheng', () => {
            //     var result: PopupOfficialRankUpResult = Util.getNode('prefab/official/PopupOfficialRankUpResult', PopupOfficialRankUpResult);
            //     result.updateUI(currRank, oldPower);
            //     result.openWithAction();
            // });
            var result: PopupOfficialRankUpResult = Util.getNode('prefab/official/PopupOfficialRankUpResult', PopupOfficialRankUpResult);
            result.updateUI(currRank, oldPower);
            result.openWithAction();
        });

    }

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
        type: CommonAttrDiff3,
        visible: true
    })
    _fileNodeAttr1: CommonAttrDiff3 = null;

    @property({
        type: CommonAttrDiff3,
        visible: true
    })
    _fileNodeAttr2: CommonAttrDiff3 = null;

    @property({
        type: CommonAttrDiff3,
        visible: true
    })
    _fileNodeAttr3: CommonAttrDiff3 = null;

    @property({
        type: CommonAttrDiff3,
        visible: true
    })
    _fileNodeAttr4: CommonAttrDiff3 = null;

    @property({
        type: CommonAttrDiff3,
        visible: true
    })
    _fileNodeAttr5: CommonAttrDiff3 = null;

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
        type: cc.Label,
        visible: true
    })
    _textAddPlayerJoint: cc.Label = null;

    private _oldPower: number;
    private _currRank: number;
    private _nextRank: number;

    onEnter() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN);
        this._textAddPlayerJoint.node.active = false;
        this._initEffect();
        this._createPlayEffect();
        G_AudioManager.playSoundWithId(AudioConst.SOUND_OFFICIAL_LEVELUP, null);

        this._panelTouch.on(cc.Node.EventType.TOUCH_END, this._onClickTouch.bind(this));
    }

    onClose() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END);
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupOfficialRankUpResult");
    }

    _updateAttr(index, name, value, nextValue) {
        var nodeAttr: CommonAttrDiff3 = this['_fileNodeAttr' + index];
        nodeAttr.setLabelStr('TextName', name);
        nodeAttr.setLabelStr('TextName2', name);
        nodeAttr.setLabelStr('TextCurValue', '+' + value);
        nodeAttr.setLabelStr('TextAddValue', '+' + nextValue);
    }

    _onClickTouch() {
        if (this._nodeContinue.node.active) this.closeWithAction();
    }

    _playTotalPowerSummary() {
        var totalPower = G_UserData.getBase().getPower();
        this._fileNodePower.node.active = true;
        var diffPower = totalPower - this._oldPower;
        this._fileNodePower.updateUI(totalPower, diffPower);
        this._fileNodePower.playEffect(false);
    }

    updateUI(currRank, oldPower) {
        this._currRank = currRank - 1;
        this._nextRank = currRank;
        var currInfo = G_UserData.getBase().getOfficialInfo(currRank - 1)[0];
        var nextInfo = G_UserData.getBase().getOfficialInfo(currRank)[0];
        var diffCombat = nextInfo.all_combat - currInfo.all_combat;
        this._oldPower = oldPower;
        function getInfoList(confInfo) {
            var valueList = {};
            valueList[1] = {
                name: Lang.get('official_all_all_combat'),
                value: confInfo.all_combat || 0
            };
            for (var i = 1; i <= 4; i++) {
                var nameStr = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(confInfo['attribute_type' + i]).cn_name;
                nameStr = Lang.get('official_all') + nameStr;
                valueList[i + 1] = {
                    name: nameStr,
                    value: confInfo['attribute_value' + i] || 0
                };
            }
            return valueList;
        }
        var currList = getInfoList(currInfo);
        var nextList = getInfoList(nextInfo);
        for (var index in currList) {
            var value = currList[index];
            this._updateAttr(index, value.name, value.value, nextList[index].value);
        }
    }

    _initEffect() {
        this._nodeContinue.node.active = false;
        for (var i = 1; i <= 5; i++) {
            this['_fileNodeAttr' + i].node.active = false;
        }
        this._fileNodePower.node.active = false;
    }
    _createPlayEffect() {
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_jinsheng', this.effectFunction.bind(this), this.eventFunction.bind(this), false);
        // effect.node.setPosition(0, 0);
    }

    private static EffectNodeArr: string[] = [
        'effect_paiming_jiantou',
        'effect_bg5',
        'effect_txt_bg',
        'effect_jinsheng_dazi',
        'effect_hejilibao_xiaodi',
        'effect_win_2',
        'effect_bg4',
        'effect_bg3',
        'effect_bg2',
        'effect_bg1'
    ];

    private effectFunction(effect) {
        console.log('>>>>>> ', effect);
        var effectIndex: number = PopupOfficialRankUpResult.EffectNodeArr.indexOf(effect);
        // if(effectIndex >= 0){
        //     var subEffect = new EffectGfxNode();
        //     subEffect.setEffectName(effect);
        //     subEffect.play();
        //     return subEffect;
        // }
        if (effect == 'touxian_1') {
            var info = G_UserData.getBase().getOfficialInfo(this._currRank)[0];
            var image = Util.newSprite(Path.getTextHero(info.picture));
            return image.node;
        }
        if (effect == 'touxian_2') {
            var info = G_UserData.getBase().getOfficialInfo(this._nextRank)[0];
            var image = Util.newSprite(Path.getTextHero(info.picture));
            return image.node;
        }
        return new cc.Node();
    }

    private eventFunction(event) {
        if (event == 'finish') {
            this._playTotalPowerSummary();
            this._nodeContinue.node.active = true;
            this._textAddPlayerJoint.node.active = true;
            var info = G_UserData.getBase().getOfficialInfo(this._currRank)[0];
            this._textAddPlayerJoint.string = info.text_2 || '';
        }
        var eventStr: string = event;
        var etc: number = eventStr == null ? -1 : eventStr.indexOf('play_txt');
        if (etc != -1) {
            var index = parseInt(eventStr.substr(etc + 8));
            if (index && index > 0) {
                this['_fileNodeAttr' + index].node.active = true;
                // G_EffectGfxMgr.applySingleGfx(this['_fileNodeAttr' + index].node, 'smoving_jinsheng_txt', null, null, null);
            }
        }
    }

}