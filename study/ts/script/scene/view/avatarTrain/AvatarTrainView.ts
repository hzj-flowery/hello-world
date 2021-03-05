const {ccclass, property} = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { RecoveryConst } from '../../../const/RecoveryConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import EffectGfxNode from '../../../effect/EffectGfxNode';
import EffectHelper from '../../../effect/EffectHelper';
import { Colors, G_AudioManager, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrDiff from '../../../ui/component/CommonAttrDiff';
import CommonAvatarAvatar from '../../../ui/component/CommonAvatarAvatar';
import CommonAvatarName from '../../../ui/component/CommonAvatarName';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonCostNode from '../../../ui/component/CommonCostNode';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import CommonHeroName from '../../../ui/component/CommonHeroName';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { RecoveryDataHelper } from '../../../utils/data/RecoveryDataHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';








@ccclass
export default class AvatarTrainView extends ViewBase {

   @property({
       type: CommonHeroName,
       visible: true
   })
   _fileNodeHeroName: CommonHeroName = null;

   @property({
       type: CommonAvatarAvatar,
       visible: true
   })
   _fileNodeAvatar: CommonAvatarAvatar = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect: cc.Node = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonRecovery: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageWear: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeTalent: cc.Node = null;

   @property({
       type: CommonAvatarName,
       visible: true
   })
   _fileNodeAvatarName: CommonAvatarName = null;

   @property({
       type: CommonDetailTitleWithBg,
       visible: true
   })
   _fileNodeDetailTitle: CommonDetailTitleWithBg = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textOldLevel: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textNewLevel: cc.Label = null;

   @property({
       type: CommonAttrDiff,
       visible: true
   })
   _fileNodeAttr1: CommonAttrDiff = null;

   @property({
       type: CommonAttrDiff,
       visible: true
   })
   _fileNodeAttr2: CommonAttrDiff = null;

   @property({
       type: CommonAttrDiff,
       visible: true
   })
   _fileNodeAttr3: CommonAttrDiff = null;

   @property({
       type: CommonAttrDiff,
       visible: true
   })
   _fileNodeAttr4: CommonAttrDiff = null;

   @property({
       type: CommonDetailTitleWithBg,
       visible: true
   })
   _fileNodeCostTitle: CommonDetailTitleWithBg = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelCost: cc.Node = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _nodeResource: CommonResourceInfo = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _buttonStr: CommonButtonLevel0Highlight = null;

   @property({
       type: CommonTopbarBase,
       visible: true
   })
   _topbarBase: CommonTopbarBase = null;
   
   private _avatarId:number;
   private _isJumpWhenBack:boolean;
   private _signalAvatarEnhance:any;
   private _signalAvatarReborn:any;
   private _curData:any;
   private _curLevel:number;
   private _nextLevel:number;
   private _curAttr:any;
   private _nextAttr:any;
   private _costInfo:any;
   private _recordAttr:any;
   private _materialIcon:CommonCostNode;
   private _commonCostNode:any;

   setInitData(avatarId:number, isJumpWhenBack:boolean) {
    this._avatarId = avatarId;
    this._isJumpWhenBack = isJumpWhenBack;
    // var resource = {
    //     file: Path.getCSB('AvatarTrainView', 'avatar'),
    //     size: [
    //         1136,
    //         640
    //     ],
    //     binding: {
    //         _buttonRecovery: {
    //             events: [{
    //                     event: 'touch',
    //                     method: '_onButtonRecoveryClicked'
    //                 }]
    //         }
    //         _buttonStr: {
    //             events: [{
    //                     event: 'touch',
    //                     method: '_onButtonStrClicked'
    //                 }]
    //         }
    //     }
    // };
}
onCreate() {
    this._commonCostNode = cc.resources.get(Path.getCommonPrefab("CommonCostNode"))
    this._initData();
    this._initView();
}
onEnter() {
    this._signalAvatarEnhance = G_SignalManager.add(SignalConst.EVENT_AVATAR_ENHANCE_SUCCESS, handler(this, this._avatarEnhanceSuccess));
    this._signalAvatarReborn = G_SignalManager.add(SignalConst.EVENT_AVATAR_REBORN_SUCCESS, handler(this, this._avatarRebornSuccess));
    this._updateData();
    this._updateView();
}
onExit() {
    this._signalAvatarEnhance.remove();
    this._signalAvatarEnhance = null;
    this._signalAvatarReborn.remove();
    this._signalAvatarReborn = null;
}
_initData() {
    this._curData = null;
    this._curLevel = 0;
    this._nextLevel = 0;
    this._curAttr = {};
    this._nextAttr = {};
    this._costInfo = {};
    this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_AVATAR);
}
_initView() {
    this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
    this._topbarBase.setImageTitle('txt_sys_com_bianshenka');
    if (this._isJumpWhenBack) {
        this._topbarBase.setCallBackOnBack(handler(this, this._setCallback));
    }
    this._buttonStr.setString(Lang.get('avatar_detail_btn_str'));
    var roleBaseId = G_UserData.getHero().getRoleBaseId();
    this._fileNodeHeroName.setName(roleBaseId);
    this._fileNodeDetailTitle.setTitle(Lang.get('avatar_train_title_str'));
    this._fileNodeCostTitle.setTitle(Lang.get('avatar_train_title_cost'));
    this._fileNodeAvatar.setScale(1.4);
    this._materialIcon = null;
}
_updateData() {
    // this._curData = G_UserData.getAvatar().getUnitDataWithId(this._avatarId);
    // this._curLevel = this._curData.getLevel();
    // this._nextLevel = this._curLevel + 1;
    // var templet = this._curData.getConfig().levelup_cost;
    // var templet2MaxLevel = G_UserData.getAvatar().getTemplet2MaxLevel();
    // var maxLevel = templet2MaxLevel[templet];
    // if (this._nextLevel > maxLevel) {
    //     this._nextLevel = null;
    // }
    // this._curAttr = AvatarDataHelper.getAvatarLevelAttr(this._curLevel, templet);
    // this._nextAttr = {};
    // if (this._nextLevel) {
    //     this._nextAttr = AvatarDataHelper.getAvatarLevelAttr(this._nextLevel, templet);
    // }
    // this._costInfo = AvatarDataHelper.getAvatarSingleCost(this._curLevel, templet);
    // this._recordAttr.updateData(this._curAttr);
    // G_UserData.getAttr().recordPower();
}
_updateView() {
    this._updateShow();
    this._updateTalent();
    this._updateName();
    this._updateLevel();
    this._updateAttr();
    this._updateCost();
}
_updateShow() {
    this._fileNodeAvatar.updateUI(this._curData.getBase_id());
}
_updateTalent() {
    // this._nodeTalent.removeAllChildren();
    // var level = this._curData.getLevel();
    // var templet = this._curData.getConfig().levelup_cost;
    // var nextTalentInfo = AvatarDataHelper.getNextTalentDes(level, templet);
    // if (nextTalentInfo) {
    //     var talentInfo = Lang.get('avatar_train_talent_des', {
    //         name: nextTalentInfo.talent_name,
    //         des: nextTalentInfo.talent_description,
    //         unlock: nextTalentInfo.level
    //     });
    //     var node = new cc.Node();
    //     var label = node.addComponent(cc.RichText)
    //     label.string =UIHelper.getRichTextContent(talentInfo);
    //     label.node.setAnchorPoint(new cc.Vec2(0.5, 1));
    //     // label.ignoreContentAdaptWithSize(false);
    //     label.node.setContentSize(cc.size(340, 0));
    //     // label.formatText();
    //     this._nodeTalent.addChild(label.node);
    // }
}
_updateName() {
    var baseId = this._curData.getBase_id();
    this._fileNodeAvatarName.setName(baseId);
}
_updateLevel() {
    this._textOldLevel.string = (this._curLevel).toString();
    var nextLevel = this._nextLevel && this._nextLevel || Lang.get('hero_break_txt_reach_limit');
    this._textNewLevel.string = (nextLevel).toString();
}
_updateAttr() {
    var curDes = TextHelper.getAttrInfoBySort(this._curAttr);
    for (var i = 1; i <= 4; i++) {
        var curInfo = curDes[i-1];
        if (curInfo) {
            this['_fileNodeAttr' + i].setVisible(true);
            this['_fileNodeAttr' + i].updateInfo(curInfo.id, this._curAttr[curInfo.id], this._nextAttr[curInfo.id], 4);
        } else {
            this['_fileNodeAttr' + i].setVisible(false);
        }
    }
}
_updateCost() {
    var isReachMax = this._nextLevel == null;
    this._fileNodeCostTitle.node.active = (!isReachMax);
    this._panelCost.removeAllChildren();
    this._materialIcon = null;
    this._nodeResource.node.active = (false);
    this._buttonStr.setEnabled(!isReachMax);
    if (isReachMax) {
        var sp = UIHelper.newSprite(Path.getText('txt_train_breakthroughtop'));
        var size = this._panelCost.getContentSize();
        sp.node.setPosition(new cc.Vec2(size.width / 2, size.height / 2));
        this._panelCost.addChild(sp.node);
        return;
    }
    var itemInfo = {};
    for (var value in this._costInfo[TypeConvertHelper.TYPE_ITEM]) {
        size = this._costInfo[TypeConvertHelper.TYPE_ITEM][value];
        itemInfo = {
            type: TypeConvertHelper.TYPE_ITEM,
            value: value,
            size: size
        };
        break;
    }
    var node = (cc.instantiate(this._commonCostNode) as cc.Node).getComponent(CommonCostNode);
    node.updateView(itemInfo);
    node.node.setPosition(new cc.Vec2(159, 56));
    this._panelCost.addChild(node.node);
    this._materialIcon = node;
    var resInfo:any = {};
    for (value in this._costInfo[TypeConvertHelper.TYPE_RESOURCE]) {
        size = this._costInfo[TypeConvertHelper.TYPE_RESOURCE][value];
        resInfo = {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: value,
            size: size
        };
        break;
    }
    this._nodeResource.updateUI(resInfo.type, resInfo.value, resInfo.size);
    this._nodeResource.setTextColor(Colors.BRIGHT_BG_TWO);
    this._nodeResource.node.active = (true);
}
_onButtonRecoveryClicked() {
    if (this._curData.isEquiped()) {
        G_Prompt.showTip(Lang.get('avatar_recovery_condition_tip_1'));
        return;
    }
    if (!this._curData.isTrained()) {
        G_Prompt.showTip(Lang.get('avatar_recovery_condition_tip_2'));
        return;
    }
    UIPopupHelper.popupRecoveryPreview(this._curData, RecoveryConst.RECOVERY_TYPE_9, handler(this, this._doReborn));
}
_onButtonStrClicked() {
    var isReachCondition = this._materialIcon && this._materialIcon.isReachCondition() || false;
    if (!isReachCondition) {
        G_Prompt.showTip(Lang.get('avatar_train_condition_1'));
        return;
    }
    var resInfo:any = {};
    for (var value in this._costInfo[TypeConvertHelper.TYPE_RESOURCE]) {
        var size = this._costInfo[TypeConvertHelper.TYPE_RESOURCE][value];
        resInfo = {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: value,
            size: size
        };
        break;
    }
    var isOk = LogicCheckHelper.enoughMoney(resInfo.size);
    if (!isOk) {
        G_Prompt.showTip(Lang.get('avatar_train_condition_2'));
        return;
    }
    var avatarId = this._curData.getId();
    G_UserData.getAvatar().c2sEnhanceAvatar(avatarId);
    this._setButtonEnable(false);
}
_avatarEnhanceSuccess(eventName, avatarId) {
    this._updateData();
    this._updateTalent();
    this._playSingleBallEffect();
    this._updateCost();
}
_doReborn() {
    var avatarId = this._curData.getId();
    G_UserData.getAvatar().c2sRebornAvatar(avatarId);
}
_avatarRebornSuccess(eventName, awards) {
    this._updateData();
    this._updateView();
    RecoveryDataHelper.sortAward(awards);
    PopupGetRewards.showRewards(awards);
}
_playSingleBallEffect() {
    var sp = UIHelper.newSprite(Path.getBackgroundEffect('img_photosphere5'));
    var node = new cc.Node();
    var emitter = node.addComponent(cc.ParticleSystem);
    EffectHelper.loadEffectRes("particle/particle_touch.plist",cc.ParticleAsset,function(res:any){
        if (emitter&&sp) {
            emitter.file = res;
            emitter.node.setPosition(new cc.Vec2(sp.node.getContentSize().width / 2, sp.node.getContentSize().height / 2));
            sp.node.addChild(emitter.node);
            emitter.resetSystem();
        }
    })
    
    var startPos = UIHelper.convertSpaceFromNodeToNode(this._materialIcon.node, this.node);
    sp.node.setPosition(startPos);
    this.node.addChild(sp.node);
    var endPos = UIHelper.convertSpaceFromNodeToNode(this._fileNodeAvatar.node, this.node, new cc.Vec2(0, this._fileNodeAvatar.getHeight() / 2));
    var pointPos1 = new cc.Vec2(startPos.x, startPos.y + 200);
    var pointPos2 = new cc.Vec2((startPos.x + endPos.x) / 2, startPos.y + 100);
    var bezier = [
        pointPos1,
        pointPos2,
        endPos
    ];
    var action1 = cc.bezierTo(0.7, bezier);
    var action2 = cc.spawn(action1,cc.easeSineIn());
    sp.node.runAction(cc.sequence(action2,cc.callFunc(function () {
        this._playExplodeEffect();
        this._playPrompt();
        this._setButtonEnable(true);
    }.bind(this)),cc.destroySelf()));
    G_AudioManager.playSoundWithId(AudioConst.SOUND_HERO_LV);
}
_playExplodeEffect() {
    var effect1 = (new EffectGfxNode).setEffectName('effect_wujianglevelup_baozha');
    var effect2 = (new EffectGfxNode).setEffectName('effect_wujianglevelup_light');
    effect1.setAutoRelease(true);
    effect2.setAutoRelease(true);
    this._nodeEffect.addChild(effect1.node);
    this._nodeEffect.addChild(effect2.node);
    effect1.play();
    effect2.play();
}
_playPrompt() {
    var summary = [];
    var content1 = Lang.get('summary_avatar_str_success');
    var param1 = {
        content: content1,
        startPosition: { x: -170 },
        dstPosition: UIHelper.convertSpaceFromNodeToNode(this._textOldLevel.node, this.node),
        finishCallback:function() {
            if (this._textOldLevel) {
                this._textOldLevel.updateTxtValue(this._curLevel);
                this._updateLevel();
                this._onSummaryFinish();
            }
        }.bind(this)
    };
    summary.push(param1);
    this._addBaseAttrPromptSummary(summary);
    G_Prompt.showSummary(summary);
    G_Prompt.playTotalPowerSummary();
}
_addBaseAttrPromptSummary(summary) {
    var attr = this._recordAttr.getAttr();
    var desInfo = TextHelper.getAttrInfoBySort(attr);
    for (var i in desInfo) {
        var info = desInfo[i];
        var attrId = info.id;
        var diffValue = this._recordAttr.getDiffValue(attrId);
        if (diffValue != 0) {
            var param = {
                content: AttrDataHelper.getPromptContent(attrId, diffValue),
                anchorPoint: new cc.Vec2(0, 0.5),
                startPosition: { x: -230 },
                dstPosition: UIHelper.convertSpaceFromNodeToNode(this['_fileNodeAttr' + i].node, this.node),
                finishCallback() {
                    var [_, curValue] = TextHelper.getAttrBasicText(attrId, this._curAttr[attrId]);
                    this['_fileNodeAttr' + i].getSubNodeByName('TextCurValue').updateTxtValue(curValue);
                    this['_fileNodeAttr' + i].updateInfo(attrId, this._curAttr[attrId], this._nextAttr[attrId], 4);
                }
            };
            summary.push(param);
        }
    }
    return summary;
}
_setButtonEnable(enable) {
    var isReachMax = this._nextLevel == null;
    this._buttonRecovery.interactable = (enable);
    this._buttonStr.setEnabled(!isReachMax && enable);
}
_onSummaryFinish() {
}
_setCallback() {
    G_UserData.getTeamCache().setShowHeroTrainFlag(true);
    G_SceneManager.popSceneByTimes(2);
}

}