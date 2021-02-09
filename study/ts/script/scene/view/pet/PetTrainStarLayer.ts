const { ccclass, property } = cc._decorator;

import CommonHeroStar from '../../../ui/component/CommonHeroStar'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'

import CommonHeroName from '../../../ui/component/CommonHeroName'
import { handler } from '../../../utils/handler';
import { G_SignalManager, G_UserData, Colors, G_Prompt, G_AudioManager, G_EffectGfxMgr, G_ResolutionManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { Lang } from '../../../lang/Lang';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { PetTrainHelper } from '../petTrain/PetTrainHelper';
import AttributeConst from '../../../const/AttributeConst';
import { table } from '../../../utils/table';
import EffectGfxNode from '../../../effect/EffectGfxNode';
import { AudioConst } from '../../../const/AudioConst';
import UIHelper from '../../../utils/UIHelper';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonCostNode from '../../../ui/component/CommonCostNode';

import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import PopupPetBreakResult from './PopupPetBreakResult';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { PetUnitData } from '../../../data/PetUnitData';
import ViewBase from '../../ViewBase';
var MATERIAL_POS = {
    [1]: [[
        166,
        56
    ]],
    [2]: [
        [
            126,
            56
        ],
        [
            284,
            56
        ]
    ],
    [3]: [
        [
            93,
            56
        ],
        [
            207,
            56
        ],
        [
            316,
            56
        ]
    ]
};

@ccclass
export default class PetTrainStarLayer extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeHeroName2: CommonHeroName = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _fileNodeDetailTitle: CommonDetailTitleWithBg = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOldStar: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNewStar: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNewAdd: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOldAdd: cc.Label = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _fileNodeDetailTitle2: CommonDetailTitleWithBg = null;

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
    _buttonStar: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeNeedLevelPos: cc.Node = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeHeroName: CommonHeroName = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _fileNodeStar: CommonHeroStar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBreakDesc: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textIsBless: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBless: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _pageView: cc.Node = null;

    @property(cc.Prefab)
    commonCostNode: cc.Prefab = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _avatar: CommonHeroAvatar = null;

    _parentView: any;
    _signalPetStarUp: any;
    _isReachLimit: boolean;
    _conditionLevel: boolean;
    _isPageViewMoving: boolean;
    _materialIcons: any[];
    _petId: any;
    _petUnitData: PetUnitData;
    _starLevel: number;
    _costCardNum: number;
    _materialInfo: any[];
    _resourceInfo: any[];
    _fileNodePetNew: any;
    _pageViewSize: cc.Size;


    ctor(parentView) {
        this.node.name = "PetTrainStarLayer";
        this._parentView = parentView;
        this._buttonStar.addClickEventListenerEx(handler(this, this._onButtonBreakClicked));
    }
    onCreate() {
        this._initData();
        this._initView();
        this.setSceneSize(null, false);
    }
    onEnter() {
        this._signalPetStarUp = G_SignalManager.add(SignalConst.EVENT_PET_STAR_UP_SUCCESS, handler(this, this._petStarUpSuccess));
        // this._updatePageItem();
        // this._updateInfo();
    }
    onExit() {
        this._signalPetStarUp.remove();
        this._signalPetStarUp = null;
    }
    initInfo() {
        this._updateInfo();
        this._updatePageItem();
        this._updateInfo();
        var selectedPos = this._parentView.getSelectedPos();
        //  this._pageView.setCurrentPageIndex(selectedPos - 1);
    }
    _initData() {
        this._isReachLimit = false;
        this._conditionLevel = false;
        this._isPageViewMoving = false;
    }
    _initView() {
        this._materialIcons = [];
        this._buttonStar.setString(Lang.get('pet_break_btn_break'));
        this._fileNodeDetailTitle.setFontSize(24);
        this._fileNodeDetailTitle2.setFontSize(24);
        this._fileNodeDetailTitle.setTitle(Lang.get('pet_break_detail_title'));
        this._fileNodeDetailTitle2.setTitle(Lang.get('pet_break_cost_title'));
        this._initPageView();
    }
    _createPageItem() {
        // var widget = new ccui.Widget();
        // widget.setSwallowTouches(false);
        // widget.setContentSize(this._pageViewSize.width, this._pageViewSize.height);
        // return widget;
    }
    _updatePageItem() {
        // var allPetIds = this._parentView.getAllPetIds();
        // var index = this._parentView.getSelectedPos();
        // for (var i = index - 1; i <= index + 1; i++) {
        //     var item = this._pageItems[i];
        //     if (item && item.widget) {
        //         var widget = item.widget;
        //         var count = widget.getChildrenCount();
        //         if (count == 0) {
        //             var petId = allPetIds[i];
        //             var unitData = G_UserData.getPet().getUnitDataWithId(petId);
        //             var petBaseId = unitData.getBase_id();
        //             var avatar = CSHelper.loadResourceNode(Path.getCSB('CommonHeroAvatar', 'common'));
        //             avatar.setConvertType(TypeConvertHelper.TYPE_PET);
        //             avatar.updateUI(petBaseId);
        //             avatar.setScale(1);
        //             avatar.setShadowScale(2.7);
        //             avatar.setPosition(cc.v2(this._pageViewSize.width * 0.57, 190));
        //             avatar.playAnimationLoopIdle();
        //             widget.addChild(avatar);
        //             this._fileNodePetNew = avatar;
        //             this._pageItems[i].avatar = avatar;
        //         }
        //         if (this._pageItems[i].avatar) {
        //             var petId = allPetIds[i];
        //             var unitData = G_UserData.getPet().getUnitDataWithId(petId);
        //             var petBaseId = unitData.getBase_id();
        //             this._pageItems[i].avatar.updateUI(petBaseId);
        //         }
        //     }
        // }
        // this._updatePageItemVisible();
        var unitData = G_UserData.getPet().getUnitDataWithId(G_UserData.getPet().getCurPetId());
        this._avatar.updateUI(unitData.getBase_id());
        this._avatar.playAnimationLoopIdle();
    }
    _initPageView() {
        // this._pageItems = {};
        // this._pageView.setItemsMargin(60);
        // this._pageView.setSwallowTouches(false);
        // this._pageView.setScrollDuration(0.3);
        // this._pageView.addEventListener(handler(this, this._onPageViewEvent));
        // this._pageView.addTouchEventListener(handler(this, this._onPageTouch));
        this._pageViewSize = this._pageView.getContentSize();
        // this._pageView.removeAllPages();
        // var petCount = this._parentView.getPetCount();
        // for (var i = 1; i <= petCount; i++) {
        //     var widget = this._createPageItem();
        //     this._pageView.addPage(widget);
        //     this._pageItems[i] = { widget: widget };
        // }
        // var selectedPos = this._parentView.getSelectedPos();
        // this._pageView.setCurrentPageIndex(selectedPos - 1);
        this._avatar.init();
        this._avatar.setConvertType(TypeConvertHelper.TYPE_PET);
        this._avatar.setScale(1);
        this._avatar.setShadowScale(2.7);
        this._avatar.node.setPosition(cc.v2(this._pageViewSize.width * 0.07, 190 - this._pageViewSize.height * 0.5));
        this._fileNodePetNew = this._avatar.node;
    }
    _onPageViewEvent(sender, event) {
        // if (event == ccui.PageViewEventType.turning && sender == this._pageView) {
        //     var targetPos = this._pageView.getCurrentPageIndex() + 1;
        //     var selectedPos = this._parentView.getSelectedPos();
        //     if (targetPos != selectedPos) {
        //         this._parentView.setSelectedPos(targetPos);
        //         var allPetIds = this._parentView.getAllPetIds();
        //         var curPetId = allPetIds[targetPos];
        //         G_UserData.getPet().setCurPetId(curPetId);
        //         this._parentView.updateArrowBtn();
        //         this._updatePageItem();
        //         this._updateInfo();
        //         this._parentView.updateRedPoint();
        //         this._parentView.updateTabVisible();
        //     }
        // }
    }
    _onPageTouch(sender, state) {
        // if (state == ccui.TouchEventType.began) {
        //     this._isPageViewMoving = true;
        //     this._updatePageItemVisible();
        // } else if (state == ccui.TouchEventType.ended || state == ccui.TouchEventType.canceled) {
        //     this._isPageViewMoving = false;
        // }
    }
    _updatePageItemVisible() {
        // var curIndex = this._parentView.getSelectedPos();
        // for (i in this._pageItems) {
        //     var item = this._pageItems[i];
        //     if (i == curIndex) {
        //         item.widget.node.active = (true);
        //     } else {
        //         item.widget.node.active = (this._isPageViewMoving);
        //     }
        // }
    }
    _updateInfo() {
        this._petId = G_UserData.getPet().getCurPetId();
        this._petUnitData = G_UserData.getPet().getUnitDataWithId(this._petId);
        this._starLevel = this._petUnitData.getStar();
        this._isReachLimit = UserDataHelper.isReachStarLimit(this._petUnitData);
        this.setButtonEnable(true);
        this._updateShow();
        this._updateAttr();
        this._updateCost();
    }
    _updateShow() {
        var petBaseId = this._petUnitData.getBase_id();
        var starLevel = this._petUnitData.getStar();
        var strDes = '';
        this._fileNodeHeroName.setConvertType(TypeConvertHelper.TYPE_PET);
        this._fileNodeHeroName2.setConvertType(TypeConvertHelper.TYPE_PET);
        this._fileNodeHeroName.setName(petBaseId);
        this._fileNodeHeroName2.setName(petBaseId);
        this._fileNodeStar.setCount(starLevel);
        var strDesc = UserDataHelper.getPetStateStr(this._petUnitData);
        if (strDesc) {
            this._textIsBless.string = (strDesc);
            this._textIsBless.node.active = (true);
        } else {
            this._textIsBless.node.active = (false);
        }
        this._nodeBreakDesc.removeAllChildren();
        var widget = PetTrainHelper.createBreakDesc(this._petUnitData);
        this._nodeBreakDesc.addChild(widget.node);
    }
    _updateAttr() {
        this._textOldStar.string = (Lang.get('pet_break_txt_break_title', { level: this._starLevel }));
        if (this._isReachLimit == true) {
            var strStarLevel = Lang.get('pet_break_txt_reach_limit');
            this._textNewStar.string = (strStarLevel);
            this._textNewAdd.string = (strStarLevel);
            var curBreakAttr = UserDataHelper.getPetBreakShowAttr(this._petUnitData);
            var oldPercent = Lang.get('pet_break_txt_add', { percent: Math.floor(curBreakAttr[AttributeConst.PET_ALL_ATTR] / 10) });
            this._textOldAdd.string = (oldPercent);
            return;
        }
        var strRankLevel = Lang.get('pet_break_txt_break_title', { level: this._starLevel + 1 });
        this._textNewStar.string = (strRankLevel);
        var curBreakAttr = UserDataHelper.getPetBreakShowAttr(this._petUnitData);
        var nextBreakAttr = UserDataHelper.getPetBreakShowAttr(this._petUnitData, 1) || {};
        var oldPercent = Lang.get('pet_break_txt_add', { percent: Math.floor(curBreakAttr[AttributeConst.PET_ALL_ATTR] / 10) });
        var newPercent = Lang.get('pet_break_txt_add', { percent: Math.floor(nextBreakAttr[AttributeConst.PET_ALL_ATTR] / 10) });
        this._textOldAdd.string = (oldPercent);
        this._textNewAdd.string = (newPercent);
    }
    _updateCost() {
        this._costCardNum = 0;
        this._fileNodeDetailTitle2.node.active = (!this._isReachLimit);
        this._nodeResource.node.active = (!this._isReachLimit);
        this._panelCost.removeAllChildren();
        this._nodeNeedLevelPos.removeAllChildren();
        this._buttonStar.setEnabled(!this._isReachLimit);
        if (this._isReachLimit) {
            var sp = UIHelper.newSprite(Path.getTextTeam('img_beast_upstar'));
            var size = this._panelCost.getContentSize();
            sp.node.setPosition(cc.v2(size.width / 2, size.height / 2));
            this._panelCost.addChild(sp.node);
            return;
        }
        this._materialIcons = [];
        this._materialInfo = [];
        this._resourceInfo = [];
        var allMaterialInfo = UserDataHelper.getPetBreakMaterials(this._petUnitData);
        for (var i in allMaterialInfo) {
            var info = allMaterialInfo[i];
            if (info.type != TypeConvertHelper.TYPE_RESOURCE) {
                this._materialInfo.push(info);
            } else {
                this._resourceInfo.push(info);
            }
        }
        var _createMaterialIcon = function (info, id) {
            var node = cc.instantiate(this.commonCostNode).getComponent(CommonCostNode);
            node.setCloseMode();
            node.updateView(info, id);
            return node;
        }.bind(this);
        var len = this._materialInfo.length;
        for (i in this._materialInfo) {
            var info = this._materialInfo[i];
            var item = _createMaterialIcon(info, this._petUnitData.getId());
            var pos = cc.v2(MATERIAL_POS[len][i][0], MATERIAL_POS[len][i][1]);
            item.node.setPosition(pos);
            this._panelCost.addChild(item.node);
            this._materialIcons.push(item);
            if (info.type == TypeConvertHelper.TYPE_PET) {
                this._costCardNum = this._costCardNum + item.getNeedCount();
            }
        }
        var resource = this._resourceInfo[0];
        if (resource) {
            this._nodeResource.updateUI(resource.type, resource.value, resource.size);
            this._nodeResource.setTextColor(Colors.BRIGHT_BG_TWO);
            this._nodeResource.node.active = (true);
        } else {
            this._nodeResource.node.active = (false);
        }
        var myLevel = this._petUnitData.getLevel();
        var needLevel = UserDataHelper.getPetBreakLimitLevel(this._petUnitData);
        var colorNeed = myLevel < needLevel && Colors.colorToNumber(Colors.BRIGHT_BG_RED) || Colors.colorToNumber(Colors.BRIGHT_BG_GREEN);
        var needLevelInfo = Lang.get('pet_break_txt_need_level', {
            value1: myLevel,
            color: colorNeed,
            value2: needLevel
        });
        var richTextNeedLevel = RichTextExtend.createWithContent(needLevelInfo);
        richTextNeedLevel.node.setAnchorPoint(cc.v2(0, 0));
        this._nodeNeedLevelPos.addChild(richTextNeedLevel.node);
        this._conditionLevel = myLevel >= needLevel;
    }
    setButtonEnable(enable) {
        this._buttonStar.setEnabled(enable);
        //  this._pageView.setEnabled(enable);
        if (this._parentView && this._parentView.setArrowBtnEnable) {
            this._parentView.setArrowBtnEnable(enable);
        }
    }
    _onButtonBreakClicked() {
        if (this._isReachLimit) {
            G_Prompt.showTip(Lang.get('pet_break_reach_limit_tip'));
            return;
        }
        if (!this._conditionLevel) {
            G_Prompt.showTip(Lang.get('pet_break_condition_no_level'));
            return;
        }
        for (var i in this._materialIcons) {
            var icon = this._materialIcons[i];
            var isReachCondition = icon.isReachCondition();
            if (!isReachCondition) {
                var info = this._materialInfo[i];
                var param = TypeConvertHelper.convert(info.type, info.value);
                G_Prompt.showTip(Lang.get('pet_break_condition_no_cost', { name: param.name }));
                return;
            }
        }
        for (i in this._resourceInfo) {
            var info = this._resourceInfo[i];
            var enough = LogicCheckHelper.enoughValue(info.type, info.value, info.size);
            if (!enough) {
                return false;
            }
        }
        this._doPetBreak();
    }
    _doPetBreak() {
        var id = this._petUnitData.getId();
        var config = this._petUnitData.getConfig();
        var petBaseId = this._petUnitData.getBase_id();
        var initial_star = this._petUnitData.getInitial_star()
        if (config.color == 6 && initial_star == 0) {
            petBaseId = config.potential_before;
        }
        var petIds = [];
        var sameCards = G_UserData.getPet().getSameCardCountWithBaseId(petBaseId);
        var count = 0;
        for (var k in sameCards) {
            var card = sameCards[k];
            if (count >= this._costCardNum) {
                break;
            }
            petIds.push(card.getId());
            count = count + 1;
        }
        if (config.color == 6 && initial_star == 0) {
            G_UserData.getPet().c2sPetStarUp(id, null, petIds);
        } else {
            G_UserData.getPet().c2sPetStarUp(id, petIds, null);
        }
        this.setButtonEnable(false);
    }
    _petStarUpSuccess() {
        this._playEffect();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.updateTabVisible();
            this._parentView.checkRedPoint(2);
            this._parentView.checkRedPoint(3);
        }
    }
    showPetAvatar() {
        this._fileNodePetNew.opacity = 255;
    }
    _playEffect() {
        // function effectFunction(effect) {
        //     if (effect == 'effect_wujiangtupo_ningju') {
        //         var subEffect =   new EffectGfxNode('effect_wujiangtupo_ningju');
        //         subEffect.play();
        //         return subEffect;
        //     }
        //     if (effect == 'effect_wujiangtupo_feichu') {
        //         var subEffect = new EffectGfxNode('effect_wujiangtupo_feichu');
        //         subEffect.play();
        //         return subEffect;
        //     }
        //     if (effect == 'effect_wujiangtupo_xingxing') {
        //         var subEffect = new EffectGfxNode('effect_wujiangtupo_xingxing');
        //         subEffect.play();
        //         return subEffect;
        //     }
        //     if (effect == 'effect_wujiangtupo_daguang') {
        //         var subEffect = new EffectGfxNode('effect_wujiangtupo_daguang');
        //         subEffect.play();
        //         return subEffect;
        //     }
        //     if (effect == 'effect_wujiangtupo_xiaoxing') {
        //         var subEffect = new EffectGfxNode('effect_wujiangtupo_xiaoxing');
        //         subEffect.play();
        //         return subEffect;
        //     }
        //     if (effect == 'effect_wujiangtupo_guangqiu') {
        //         var subEffect = new EffectGfxNode('effect_wujiangtupo_guangqiu');
        //         subEffect.play();
        //         return subEffect;
        //     }
        //     if (effect == 'effect_wujiangtupo_shuxian') {
        //         var subEffect = new EffectGfxNode('effect_wujiangtupo_shuxian');
        //         subEffect.play();
        //         return subEffect;
        //     }
        //     if (effect == 'effect_wujiangtupo_xiaosan') {
        //         var subEffect = new EffectGfxNode('effect_wujiangtupo_xiaosan');
        //         subEffect.play();
        //         return subEffect;
        //     }
        //     return new cc.Node();
        // }
        let eventFunction = function (event) {
            if (event == '1p') {
                var action = cc.fadeOut(0.3);
                G_AudioManager.playSoundWithId(AudioConst.SOUND_HERO_BREAK);
            } else if (event == '2p') {
                var action = cc.fadeOut(0.3);
                this._fileNodePetNew.runAction(action);
            } else if (event == 'finish') {
                PopupPetBreakResult.getIns(PopupPetBreakResult, (p: PopupPetBreakResult) => {
                    p.ctor(this, this._petId);
                    p.open();
                    this.setButtonEnable(true);
                    this._updateInfo();
                })
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_shenshoushengxing1', null, eventFunction, false);
        effect.node.setPosition(G_ResolutionManager.getDesignCCPoint());
    }
    updatePageView() {
        this._initPageView();
        this._updatePageItem();
        this._updateShow();
    }
}