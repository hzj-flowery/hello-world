const { ccclass, property } = cc._decorator;

import CommonHeroStar from '../../../ui/component/CommonHeroStar'

import CommonAttrDiff from '../../../ui/component/CommonAttrDiff'

import CommonContinueNode from '../../../ui/component/CommonContinueNode'
import PopupBase from '../../../ui/PopupBase';
import { Colors, G_SignalManager, G_UserData, G_EffectGfxMgr } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Lang } from '../../../lang/Lang';
import AttributeConst from '../../../const/AttributeConst';
import EffectGfxNode from '../../../effect/EffectGfxNode';
import { Path } from '../../../utils/Path';
import { stringUtil } from '../../../utils/StringUtil';
import PetBreakResultTalentDesNode from './PetBreakResultTalentDesNode';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';

@ccclass
export default class PopupPetBreakResult extends PopupBase {
    public static path = 'pet/PopupPetBreakResult';
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: CommonContinueNode,
        visible: true
    })
    _nodeContinue: CommonContinueNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTxt1: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNewLevel: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOldLevel: cc.Label = null;

    @property({
        type: CommonAttrDiff,
        visible: true
    })
    _fileNodeAttr1: CommonAttrDiff = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTxt3: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDiffValue1: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _commonStar: CommonHeroStar = null;
    @property(cc.Prefab)
    petBreakResultTalentDesNode: cc.Prefab = null;
    @property(cc.Prefab)
    commonHeroAvatar: cc.Prefab = null;

    _parentView: any;
    _petId: any;
    _canContinue: boolean;
    _petUnitData: import("f:/mingjiangzhuan/main/assets/script/data/PetUnitData").PetUnitData;
    _talentName: any;
    _talentDes: any;

    ctor(parentView, petId) {
        this._parentView = parentView;
        this._petId = petId;
    }
    onCreate() {
        for (var i = 1; i <= 1; i++) {
            this['_fileNodeAttr' + i].setNameColor(Colors.LIST_TEXT);
            this['_fileNodeAttr' + i].setCurValueColor(Colors.DARK_BG_ONE);
            this['_fileNodeAttr' + i].setNextValueColor(Colors.DARK_BG_ONE);
            this['_fileNodeAttr' + i].showDiffValue(false);
        }
    }
    onEnter() {
        this._canContinue = false;
        this._updateInfo();
        this._initEffect();
        this._playEffect();
    }
    onShowFinish() {
    }
    onExit() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END);
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'PopupPetBreakResult:_createRoleEffect');
    }
    onClickTouch() {
        if (this._canContinue) {
            if (this._parentView && this._parentView.showPetAvatar) {
                this._parentView.showPetAvatar();
            }
            this.close();
        }
    }
    _updateInfo() {
        this._petUnitData = G_UserData.getPet().getUnitDataWithId(this._petId);
        var petBaseId = this._petUnitData.getBase_id();
        var starLevel = this._petUnitData.getStar();
        var petStarConfig = UserDataHelper.getPetStarConfig(petBaseId, starLevel);
        this._talentName = petStarConfig.talent_name;
        this._talentDes = petStarConfig.talent_description;
        this._textOldLevel.string = (Lang.get('pet_break_result_level', { level: starLevel - 1 }));
        var strStarLevel = Lang.get('pet_break_result_level', { level: starLevel });
        this._textNewLevel.string = (strStarLevel);
        var curBreakAttr = UserDataHelper.getPetBreakShowAttr(this._petUnitData, -1);
        var nextBreakAttr = UserDataHelper.getPetBreakShowAttr(this._petUnitData);
        this._fileNodeAttr1.updateValue(AttributeConst.PET_ALL_ATTR, curBreakAttr[AttributeConst.PET_ALL_ATTR], nextBreakAttr[AttributeConst.PET_ALL_ATTR], 3);
        var add = nextBreakAttr[AttributeConst.PET_ALL_ATTR] - curBreakAttr[AttributeConst.PET_ALL_ATTR];
        add = add / 10;
        this._textDiffValue1.string = ('+' + (add + '%'));
        this._commonStar.setCount(starLevel, this._petUnitData.getStarMax());
        this._commonStar.playStar(this._petUnitData.getStar(), 1);
    }
    _initEffect() {
        this._nodeContinue.node.active = (false);
        this._nodeTxt1.active = (false);
        this._nodeTxt3.active = (false);
        for (var i = 1; i <= 1; i++) {
            this['_fileNodeAttr' + i].node.active = (false);
        }
    }
    _playEffect() {
        let effectFunction = function (effect) {
            // if (effect == 'effect_shenshoubreak_jiesuotianfu') {
            //     var subEffect = new EffectGfxNode('effect_shenshoubreak_jiesuotianfu');
            //     subEffect.play();
            //     return subEffect;
            // }
            if (effect == 'moving_wujiangbreak_jiesuo') {
                // var desNode = CSHelper.loadResourceNode(Path.getCSB('BreakResultTalentDesNode', 'hero'));
                // var textTalentName = ccui.Helper.seekNodeByName(desNode, 'TextTalentName');
                // var textTalentDes = ccui.Helper.seekNodeByName(desNode, 'TextTalentDes');
                // var imageButtomLine = ccui.Helper.seekNodeByName(desNode, 'ImageButtomLine');
                // textTalentName.string = (this._talentName + ':');
                // var nameSize = textTalentName.getContentSize();
                // var namePosX = textTalentName.getPositionX();
                // var render = textTalentDes.getVirtualRenderer();
                // render.setMaxLineWidth(290 - nameSize.width);
                // textTalentDes.string = (this._talentDes);
                // textTalentDes.setPositionX(namePosX + nameSize.width + 5);
                // var desSize = textTalentDes.getContentSize();
                // var posLineY = textTalentDes.getPositionY() - desSize.height - 5;
                // posLineY = math.min(posLineY, 0);
                // imageButtomLine.setPositionY(posLineY);
                // return desNode;

                var desNode = cc.instantiate(this.petBreakResultTalentDesNode).getComponent(PetBreakResultTalentDesNode) as PetBreakResultTalentDesNode;
                var textTalentName = desNode.TextTalentName;
                var textTalentDes: cc.Label = desNode.TextTalentDes;
                var imageButtomLine = desNode.ImageButtomLine;
                textTalentName.string = (this._talentName + ":");
                textTalentName["_updateRenderData"](true)
                var nameSize = textTalentName.node.getContentSize();
                var namePosX = textTalentName.node.x;
                textTalentDes.node.width = 290 - nameSize.width;
                textTalentDes.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
                textTalentDes.string = (this._talentDes);
                textTalentDes.node.x = (namePosX + nameSize.width + 5);
                textTalentDes["_updateRenderData"](true)
                var desSize = textTalentDes.node.getContentSize();
                var posLineY = textTalentDes.node.y - desSize.height - 5;
                posLineY = Math.min(posLineY, 0);
                imageButtomLine.node.y = (posLineY);
                return desNode.node;
            }
            if (effect == 'smoving_wujiangbreak_txt_1') {
               
            }
            // if (effect == 'effect_shenshoubreak_jiantou') {
            //     var subEffect = new EffectGfxNode('effect_shenshoubreak_jiantou');
            //     subEffect.play();
            //     return subEffect;
            // }
            if (effect == 'moving_shenshoubreak_role') {
                var node = this._createRoleEffect();
                return node;
            }
            // if (effect == 'effect_wujiangbreak_heidi') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_heidi');
            //     subEffect.play();
            //     return subEffect;
            // }
            return new cc.Node();
        }.bind(this);
        let eventFunction = function (event) {
            var stc = stringUtil.find(event, 'play_txt2_');
            if (stc != -1) {
                var index = 1;    // string.sub(event, edc + 1, -1);   这里根据配置看了是 play_txt2_1， 就写死了
                if (this['_fileNodeAttr' + index] == null) {
                    return;
                }
                this['_fileNodeAttr' + index].node.active = (true);
                this['_fileNodeAttr' + index].showArrow(false);
                G_EffectGfxMgr.applySingleGfx(this['_fileNodeAttr' + index].node, 'smoving_wujiangbreak_txt_2', null, null, null);
            } else if (event == 'play_txt1') {
                this._nodeTxt1.active = (true);
                G_EffectGfxMgr.applySingleGfx(this._nodeTxt1, 'smoving_wujiangbreak_txt_1', null, null, null);
            } else if (event == 'play_jiantou') {
            } else if (event == 'play_txt3') {
                this._nodeTxt3.active = (true);
                G_EffectGfxMgr.applySingleGfx(this._nodeTxt3, 'smoving_wujiangbreak_txt_3', null, null, null);
            } else if (event == 'finish') {
                this._canContinue = true;
                this._nodeContinue.node.active = (true);
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN, 'PopupPetBreakResult');
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_shenshoubreak', effectFunction, eventFunction, false);
        effect.node.setPosition(cc.v2(0, 0));
    }
    _createRoleEffect() {
        let effectFunction = function (effect) {
            // if (effect == 'effect_wujiangbreak_xingxing') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_xingxing');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_wujiangbreak_guangxiao') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_guangxiao');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_shenshoubreak_tupochenggong') {
            //     var subEffect = new EffectGfxNode('effect_shenshoubreak_tupochenggong');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_wujiangbreak_luoxia') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_luoxia');
            //     subEffect.play();
            //     return subEffect;
            // }
            if (effect == 'levelup_role') {
                // var petSpine = CSHelper.loadResourceNode(Path.getCSB('CommonHeroAvatar', 'common'));
                // var petBaseId = this._petUnitData.getBase_id();
                // petSpine.setConvertType(TypeConvertHelper.TYPE_PET);
                // petSpine.updateUI(petBaseId);
                // petSpine.setScale(0.8);
                // petSpine.showShadow(false);
                //    return petSpine;

                var petSpine = (cc.instantiate(this.commonHeroAvatar) as cc.Node).getComponent(CommonHeroAvatar) as CommonHeroAvatar;
                var petBaseId = this._petUnitData.getBase_id();
                petSpine.init();
                petSpine.setConvertType(TypeConvertHelper.TYPE_PET);
                petSpine.updateUI(petBaseId);
                petSpine.setScale(0.8);
                petSpine.showShadow(false);
                petSpine.scheduleOnce(function () {
                    petSpine._playAnim("idle", true);
                }, 2)
                return petSpine.node;
            }
            // if (effect == 'effect_wujiangbreak_fazhen') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_fazhen');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_wujiangbreak_txt_di') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_txt_di');
            //     subEffect.play();
            //     return subEffect;
            // }
             return new cc.Node();
        }.bind(this);
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        var node = new cc.Node();
        var effect = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_shenshoubreak_role', effectFunction, eventFunction, false);
        return node;
    }

}