import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { FunctionConst } from "../../../const/FunctionConst";
import GemstoneConst from "../../../const/GemstoneConst";
import { SignalConst } from "../../../const/SignalConst";
import UIConst from "../../../const/UIConst";
import { AttrRecordUnitData } from "../../../data/AttrRecordUnitData";
import { HeroUnitData } from "../../../data/HeroUnitData";
import LabelExtend from "../../../extends/LabelExtend";
import { Colors, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonAttrDiff from "../../../ui/component/CommonAttrDiff";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";
import CommonCostNode from "../../../ui/component/CommonCostNode";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import CommonHeroCountry from "../../../ui/component/CommonHeroCountry";
import CommonHeroName from "../../../ui/component/CommonHeroName";
import CommonHeroStar from "../../../ui/component/CommonHeroStar";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import CommonUI from "../../../ui/component/CommonUI";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { AttrDataHelper } from "../../../utils/data/AttrDataHelper";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { handler } from "../../../utils/handler";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";
import { TextHelper } from "../../../utils/TextHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import ViewBase from "../../ViewBase";
import TeamGemstoneIcon from "../team/TeamGemstoneIcon";
import HeroTrainHelper from "./HeroTrainHelper";
import PopupAwakePreview from "./PopupAwakePreview";
import PopupAwakeResult from "./PopupAwakeResult";

var MATERIAL_POS = {
    1: [[
        166,
        56
    ]],
    2: [
        [
            57,
            56
        ],
        [
            247,
            56
        ]
    ]
};

const { ccclass, property } = cc._decorator;
@ccclass
export default class HeroTrainAwakeLayer extends ViewBase {

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _fileNodeStar: CommonHeroStar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel: cc.Label = null;

    @property({
        type: TeamGemstoneIcon,
        visible: true
    })
    _fileNodeGemstone1: TeamGemstoneIcon = null;
    @property({
        type: TeamGemstoneIcon,
        visible: true
    })
    _fileNodeGemstone2: TeamGemstoneIcon = null;
    @property({
        type: TeamGemstoneIcon,
        visible: true
    })
    _fileNodeGemstone3: TeamGemstoneIcon = null;
    @property({
        type: TeamGemstoneIcon,
        visible: true
    })
    _fileNodeGemstone4: TeamGemstoneIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCost: cc.Label = null;

    @property({
        type: cc.PageView,
        visible: true
    })
    _pageView: cc.PageView = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _fileNodeCost: CommonResourceInfo = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _fileNodeDetailTitle: CommonDetailTitleWithBg = null;

    @property({
        type: CommonHeroCountry,
        visible: true
    })
    _fileNodeCountry: CommonHeroCountry = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeHeroName2: CommonHeroName = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOldLevel: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDesc: cc.Label = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _fileNodeDetailTitle2: CommonDetailTitleWithBg = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeHeroName: CommonHeroName = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNewLevel: cc.Label = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonAwake: CommonButtonLevel0Highlight = null;

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
        type: cc.Node,
        visible: true
    })
    _panelCost: cc.Node = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonOneKey: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonPreview: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;





    private _parentView;
    private _signalHeroAwake;
    private _signalHeroEquipAwake;
    private _signalMerageItemMsg;

    private _isLimit: boolean;
    private _curAttrInfo: any;
    private _heroUnitData: HeroUnitData;
    private _heroId: number;
    private _nextAttrInfo: any;
    private _sameCardNum: number;
    private _materialInfo: any;
    private _costInfo: any;
    private _gemstoneIcons: any;
    private _materialIcons: Array<any>;
    private _pageItems: any;
    private _isAllEquip: boolean;
    private _recordAttr: AttrRecordUnitData;
    private _lastAwakeLevel: number;
    // private _teamGemstoneIcon;
    private _commonHeroAvatar;
    private _commonCostNode;

    private _pageViewSize: cc.Size;
    _signalFastExecute: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;

    setInitData(parentView) {
        this._parentView = parentView;
        this._commonHeroAvatar = cc.resources.get(Path.getCommonPrefab("CommonHeroAvatar"));
        this._commonCostNode  = cc.resources.get(Path.getCommonPrefab("CommonCostNode"));
    }
    onCreate() {
        this.setSceneSize();
        this._pageItems = {};
        var size = G_ResolutionManager.getDesignSize();
        this._pageViewSize = this._pageView.node.getChildByName("view").getContentSize();
        this._initData();
        this._initView();
        this._buttonAwake.addTouchEventListenerEx(handler(this,this._onButtonAwake),false);
        this._buttonOneKey.addTouchEventListenerEx(handler(this,this._onButtonOneKey),false);
        this._buttonPreview.clickEvents = [];
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = "HeroTrainAwakeLayer";
        eventHandler.handler = "_onButtonPreview"
        this._buttonPreview.clickEvents.push(eventHandler)

    }
    onEnter() {
        this._signalHeroAwake = G_SignalManager.add(SignalConst.EVENT_HERO_AWAKE_SUCCESS, handler(this, this._heroAwakeSuccess));
        this._signalHeroEquipAwake = G_SignalManager.add(SignalConst.EVENT_HERO_EQUIP_AWAKE_SUCCESS, handler(this, this._heroEquipAwakeSuccess));
        this._signalMerageItemMsg = G_SignalManager.add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(this, this._onSyntheticFragments));
        this._signalFastExecute = G_SignalManager.add(SignalConst.EVENT_FAST_EXECUTE_STAGE, handler(this, this._onEventFastExecuteStage));
        this._pageView.enabled = false;
    }
    onExit() {
        this._signalHeroAwake.remove();
        this._signalHeroAwake = null;
        this._signalHeroEquipAwake.remove();
        this._signalHeroEquipAwake = null;
        this._signalMerageItemMsg.remove();
        this._signalMerageItemMsg = null;
        this._signalFastExecute.remove();
        this._signalFastExecute = null;
    }
    //初始化信息
    initInfo() {
        this._parentView.setArrowBtnVisible(true);
        this._updatePageItem();
        this._updateData();
        this._updateView();
        var selectedPos = this._parentView.getSelectedPos();
        this._pageView.scrollToPage(selectedPos - 1,0);
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_AWAKE_ONEKEY)[0];
        this._buttonOneKey.node.active = (isOpen);
        this.scheduleOnce(function(){
            this._pageView.scrollToPage(selectedPos - 1,0);
        }.bind(this),0.1)
    }
    _initData() {
        this._isLimit = false;
        this._curAttrInfo = {};
        this._nextAttrInfo = {};
        this._sameCardNum = 0;
        this._materialInfo = {};
        this._costInfo = {};
        this._isAllEquip = false;
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_HERO_TRAIN_TYPE3);
        this._lastAwakeLevel = 0;
    }
    //初始化UI
    _initView() {
        this._fileNodeDetailTitle.setFontSize(24);
        this._fileNodeDetailTitle2.setFontSize(24);
        this._fileNodeDetailTitle.setTitle(Lang.get('hero_awake_detail_title'));
        this._fileNodeDetailTitle2.setTitle(Lang.get('hero_awake_material_title'));
        this._buttonAwake.setString(Lang.get('hero_awake_btn'));
        this._buttonOneKey.setString(Lang.get('hero_awake_onekey_btn'));
        this._gemstoneIcons = {};
        for (var i = 1; i <= 4; i++) {
            (this['_fileNodeGemstone' + i] as TeamGemstoneIcon).setInitData(i, handler(this, this._onGemstoneCallback));
            this._gemstoneIcons[i] = (this['_fileNodeGemstone' + i] as TeamGemstoneIcon);
        }
        this._materialIcons = [];
        this._initPageView();
    }
    //初始化pageView
    _initPageView() {
        if (this._pageItems && table.nums(this._pageItems)== 0) {
            this._pageItems = {};
            this._pageView.removeAllPages();
            var heroCount = this._parentView.getHeroCount();
            for (var i = 0; i < heroCount; i++) {
                var widget = this._createPageItem();
                this._pageView.addPage(widget);
                this._pageItems[i] = { widget: widget };
            }
            var selectedPos = this._parentView.getSelectedPos();
            this._pageView.scrollToPage(selectedPos - 1,0);
        }
    }
    _createPageItem() {
        var node = new cc.Node();
        node.setContentSize(this._pageViewSize.width, this._pageViewSize.height);
        return node;
    }
    _updatePageItem() {
        var allHeroIds = this._parentView.getAllHeroIds();
        var index = this._parentView.getSelectedPos()-1;
        for (var i = index - 1; i <= index + 1; i++) {
            if (i >= 0 && i < allHeroIds.length) {
                if (this._pageItems[i] == null) {
                    var widget = this._createPageItem();
                    this._pageView.addPage(widget);
                    this._pageItems[i] = { widget: widget };
                }
                if (this._pageItems[i].avatar == null) {
                    var avatar = (cc.instantiate(this._commonHeroAvatar) as cc.Node).getComponent(CommonHeroAvatar) as CommonHeroAvatar;
                    avatar.init();
                    avatar.setScale(1.4);
                    avatar.node.setPosition(this._pageViewSize.width * 0.07,-192/1.5);
                    this._pageItems[i].widget.addChild(avatar.node);
                    this._pageItems[i].avatar = avatar;
                }
                var heroId = allHeroIds[i];
                var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                var [heroBaseId,, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData);
                var limitLevel = avatarLimitLevel || unitData.getLimit_level();
                var limitRedLevel = arLimitLevel || unitData.getLimit_rtg();
                this._pageItems[i].avatar.updateUI(heroBaseId, null, null, limitLevel, null, null, limitRedLevel);
            }
        }
    }
    onPageViewEvent(sender, event) {
        if (event == cc.PageView.EventType.PAGE_TURNING && sender == this._pageView) {
            var targetPos = this._pageView.getCurrentPageIndex()+1;//当前的位置
            var selectedPos = this._parentView.getSelectedPos();//选中的位置
            if (targetPos != selectedPos) {
                this._parentView.setSelectedPos(targetPos);
                var allHeroIds = this._parentView.getAllHeroIds();
                var curHeroId = allHeroIds[targetPos-1];
                G_UserData.getHero().setCurHeroId(curHeroId);
                this._parentView.updateArrowBtn();
                this._updatePageItem();
                this._updateData();
                this._updateView();
                this._parentView.updateTabIcons();
            }
        }
    }
    _updateData() {
        this._heroId = G_UserData.getHero().getCurHeroId();
        this._heroUnitData = G_UserData.getHero().getUnitDataWithId(this._heroId);
        var awakeLevel = this._heroUnitData.getAwaken_level();
        var nextAwakeLevel = awakeLevel + 1;
        var maxLevel = this._heroUnitData.getConfig().awaken_max;
        this._isLimit = nextAwakeLevel > maxLevel;
        this._curAttrInfo = HeroDataHelper.getAwakeAttr(this._heroUnitData);
        this._nextAttrInfo = {};
        if (this._isLimit == false) {
            this._nextAttrInfo = HeroDataHelper.getAwakeAttr(this._heroUnitData, 1);
        }
        this._recordAttr.updateData(this._curAttrInfo);
        G_UserData.getAttr().recordPower();
    }
    _recordAwakeLevel() {
        var awakeLevel = this._heroUnitData.getAwaken_level();
        this._lastAwakeLevel = awakeLevel;
    }

    _onEventFastExecuteStage() {
        this._updateGemstone();
    }

    _updateView() {
        this.setButtonEnable(true);
        this._updateShow();
        this._updateGemstone();
        this._updateLevel();
        this._updateAttr();
        this._updateMaterical();
    }
    _updateShow() {
        var heroBaseId = this._heroUnitData.getBase_id();
        var rankLevel = this._heroUnitData.getRank_lv();
        var awakeLevel = this._heroUnitData.getAwaken_level();
        var limitLevel = this._heroUnitData.getLimit_level();
        var limitRedLevel = this._heroUnitData.getLimit_rtg();
        var [star, level] = HeroDataHelper.convertAwakeLevel(awakeLevel);
        var awakenCost = this._heroUnitData.getConfig().awaken_cost;
        var maxLevel = this._heroUnitData.getConfig().awaken_max;
        var strLevel = '';
        var strDes = '';
        var [enoughLevel, nextNeedLevel] = HeroTrainHelper.checkAwakeIsEnoughLevel(this._heroUnitData);
        if (enoughLevel) {
            var [nextAwakeLevel, attrInfo, des] = HeroDataHelper.findNextAwakeLevel(awakeLevel, awakenCost, maxLevel);
            if (nextAwakeLevel) {
                var [nextStar, nextLevel] = HeroDataHelper.convertAwakeLevel(nextAwakeLevel);
                strLevel = Lang.get('hero_awake_star_level_des', {
                    star: nextStar,
                    level: nextLevel
                });
                strDes = des;
            } else {
                strLevel = Lang.get('hero_awake_star_level_max_des', {
                    star: star,
                    level: level
                });
                strDes = Lang.get('hero_awake_talent_max_des');
            }
        } else {
            strDes = Lang.get('hero_awake_next_need_level', { level: nextNeedLevel });
        }
        this._fileNodeCountry.updateUI(heroBaseId);
        this._fileNodeHeroName.setName(heroBaseId, rankLevel, limitLevel, null, limitRedLevel);
        this._fileNodeHeroName2.setName(heroBaseId, rankLevel, limitLevel, null, limitRedLevel);
        this._fileNodeStar.setStarOrMoon(star);
        //this._fileNodeStarCopy.setStarOrMoon(star);
        this._textLevel.string = (strLevel);
        this._textDesc.string = (strDes);
    }
    _updateGemstone() {
        var info = HeroDataHelper.getHeroAwakeEquipState(this._heroUnitData);
        this._isAllEquip = true;
        for (var i = 1; i <= 4; i++) {
            var baseId = info[i].needId;
            var state = info[i].state;
            var icon = this._gemstoneIcons[i] as  TeamGemstoneIcon;
            icon.updateIcon(state, baseId);
            this._isAllEquip = this._isAllEquip && state == GemstoneConst.EQUIP_STATE_2;
            if (state == GemstoneConst.EQUIP_STATE_1 || state == GemstoneConst.EQUIP_STATE_3) {
                icon.showRedPoint(true);
            } else {
                icon.showRedPoint(false);
            }
        }
        this._buttonAwake.setEnabled(this._isAllEquip && !this._isLimit);
        var show = HeroDataHelper.isCanHeroAwake(this._heroUnitData);
        this._buttonAwake.showRedPoint(show);
        this._buttonPreview.node.active = (!this._isLimit);
    }
    _updateLevel() {
        var awakeLevel = this._heroUnitData.getAwaken_level();
        var [star, level] = HeroDataHelper.convertAwakeLevel(awakeLevel);
        this._textOldLevel.string = (Lang.get('hero_awake_star_level', {
            star: star,
            level: level
        }));
        var nextAwakeLevel = awakeLevel + 1;
        if (this._isLimit) {
            this._textNewLevel.string = (Lang.get('hero_awake_star_level_max'));
        } else {
            var [nextStar, nextLevel] = HeroDataHelper.convertAwakeLevel(nextAwakeLevel);
            this._textNewLevel.string = (Lang.get('hero_awake_star_level', {
                star: nextStar,
                level: nextLevel
            }));
        }
    }
    _updateAttr() {
        var curDesInfo = TextHelper.getAttrInfoBySort(this._curAttrInfo);
        var nextDesInfo = TextHelper.getAttrInfoBySort(this._nextAttrInfo);
        for (var i = 1; i <= 4; i++) {
            var curInfo = curDesInfo[i-1];
            var nextInfo = nextDesInfo[i-1] || {};
            if (curInfo) {
                this['_fileNodeAttr' + i].updateInfo(curInfo.id, curInfo.value, nextInfo.value, 4);
                this['_fileNodeAttr' + i].node.active = (true);
            } else {
                this['_fileNodeAttr' + i].node.active = (false);
            }
        }
    }
    _updateMaterical() {
        this._sameCardNum = 0;
        this._fileNodeDetailTitle2.node.active = (!this._isLimit);
        this._fileNodeCost.node.active = (!this._isLimit);
        this._buttonAwake.setEnabled(this._isAllEquip && !this._isLimit);
        this._textCost.node.active = (this._isLimit);
        this._panelCost.removeAllChildren();
        if (this._isLimit) {
            var node1 = new cc.Node;
            var sp = node1.addComponent(cc.Sprite);
            sp.addComponent(CommonUI).loadTexture(Path.getText('txt_train_breakthroughtop'))
            var size = this._panelCost.getContentSize();
            sp.node.setPosition(new cc.Vec2(size.width / 2, size.height / 2));
            this._panelCost.addChild(sp.node);
            this._textCost.string = (Lang.get('hero_awake_cost_limit_des'));
            return;
        }
        this._materialIcons = [];
        this._materialInfo = HeroDataHelper.getHeroAwakeMaterials(this._heroUnitData);
        var len = this._materialInfo.length;
        for (var i in this._materialInfo) {
            var info = this._materialInfo[i];
            var node = (cc.instantiate(this._commonCostNode) as cc.Node).getComponent(CommonCostNode) as CommonCostNode;
            node.updateView(info);
            var pos = new cc.Vec2(MATERIAL_POS[len][i][0], MATERIAL_POS[len][i][1]);
            node.node.setPosition(pos);
            this._panelCost.addChild(node.node);
            this._materialIcons.push(node);
            if (info.type == TypeConvertHelper.TYPE_HERO) {
                this._sameCardNum = this._sameCardNum + node.getNeedCount();
            }
        }
        this._costInfo = HeroDataHelper.getHeroAwakeCost(this._heroUnitData);
        if (this._costInfo) {
            this._fileNodeCost.updateUI(this._costInfo.type, this._costInfo.value, this._costInfo.size);
            this._fileNodeCost.setTextColor(Colors.BRIGHT_BG_TWO);
        }
    }
    _onButtonAwake() {
        var [enoughLevel, limitLevel] = HeroTrainHelper.checkAwakeIsEnoughLevel(this._heroUnitData);
        if (!enoughLevel) {
            G_Prompt.showTip(Lang.get('hero_awake_level_not_enough'));
            return;
        }
        for (var i in this._materialIcons) {
            var icon = this._materialIcons[i];
            var isReachCondition = icon.isReachCondition();
            if (!isReachCondition) {
                var info = this._materialInfo[i];
                UIPopupHelper.popupItemGuider(function(popupItemGuider:PopupItemGuider){
                    popupItemGuider.updateUI(info.type, info.value);
                    popupItemGuider.setTitle(Lang.get('way_type_get'));
                }.bind(this))

                return;
            }
        }
        var isOk = UserCheck.enoughMoney(this._costInfo.size)[0];
        if (!isOk) {
            UIPopupHelper.popupItemGuider(function(popupItemGuider:PopupItemGuider){
                popupItemGuider.updateUI(this._costInfo.type, this._costInfo.value);
                popupItemGuider.setTitle(Lang.get('way_type_get'));
            }.bind(this))
            return;
        }
        var heroId = this._heroUnitData.getId();
        var costHeros = [];
        var sameCards = G_UserData.getHero().getSameCardCountWithBaseId(this._heroUnitData.getBase_id());
        var count = 0;
        for (var k in sameCards) {
            var card = sameCards[k];
            if (count >= this._sameCardNum) {
                break;
            }
            costHeros.push(card.getId());
            count = count + 1;
        }
        this._recordAwakeLevel();
        G_UserData.getHero().c2sHeroAwaken(heroId, costHeros);
        this.setButtonEnable(false);
    }
    _onGemstoneCallback(slot, isSynthetic) {
        var tempSlot = [slot];
        var [slot,composeInfo] = this._getSlotAndCompose();
        if (isSynthetic == true && composeInfo.length == 0) {
            return;
        }
        G_UserData.getHero().c2sHeroEquipAwaken(this._heroUnitData.getId(), tempSlot);
    }
    setButtonEnable(enable) {
        this._buttonAwake.setEnabled(enable && this._isAllEquip && !this._isLimit);
        //this._pageView.setEnabled(enable);
        if (this._parentView && this._parentView.setArrowBtnEnable) {
            this._parentView.setArrowBtnEnable(enable);
        }
    }
    _heroAwakeSuccess() {
        this._updateData();
        this._checkAndPlayEffect();
    }
    _heroEquipAwakeSuccess(eventName, slot) {
        this._updateData();
        this._updateGemstone();
        for (var i in slot) {
            var index = slot[i];
            var icon = this._gemstoneIcons[index] as TeamGemstoneIcon;
            if (icon) {
                icon.playEffect();
            }
        }
        this._playPromptEquipGemstone();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(3);
        }
    }
    _onSyntheticFragments() {
        this._updateData();
        this._updateGemstone();
        var [slot, composeInfo] = this._getSlotAndCompose();
        if (composeInfo.length == 0) {
            this._doOneKey(slot);
        }
    }
    _playPrompt() {
        var summary = [];
        var content1 = Lang.get('summary_hero_awake_success');
        var param1 = {
            content: content1,
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN }
        };
        summary.push(param1);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN);
    }
    _playPromptEquipGemstone() {
        var summary = [];
        var content1 = Lang.get('summary_hero_awake_equip_gemstone_success');
        var param1 = {
            content: content1,
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN }
        };
        summary.push(param1);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN);
    }
    _addBaseAttrPromptSummary(summary: Array<any>): Array<any> {
        let attr = this._recordAttr.getAttr();
        let desInfo = TextHelper.getAttrInfoBySort(attr);
        for (let i =1;i<=desInfo.length;i++) {
            let info = desInfo[i-1];
            let attrId = info.id;
            let diffValue = this._recordAttr.getDiffValue(attrId);
            if (diffValue != 0) {
                let curValue = TextHelper.getAttrBasicText(attrId, this._curAttrInfo[attrId])[1];
                let param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: new cc.Vec2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN + UIConst.SUMMARY_OFFSET_X_ATTR },
                    dstPosition: UIHelper.convertSpaceFromNodeToNode(this['_fileNodeAttr' + i].node, this.node),
                    finishCallback:function(curValue,_fileNodeAttr) {
                        (_fileNodeAttr._textCurValue.node.addComponent(LabelExtend) as LabelExtend).updateTxtValue(curValue);
                        _fileNodeAttr.updateInfo(attrId, this._curAttrInfo[attrId], this._nextAttrInfo[attrId], 4);
                    }.bind(this,curValue,this['_fileNodeAttr' + i])
                };
                summary.push(param);
            }
        }
        return summary;
    }
    _checkAndPlayEffect() {
        var lastLevel = this._lastAwakeLevel;
        var curLevel = this._heroUnitData.getAwaken_level();
        var lastStar = HeroDataHelper.convertAwakeLevel(lastLevel)[0];
        var curStar = HeroDataHelper.convertAwakeLevel(curLevel)[0];
        var isUpStar = curStar > lastStar;
        this._playEffect(isUpStar);
    }
    _onCommonFinishEffect() {
        this._updateShow();
        this._updateGemstone();
        this._updateLevel();
        this._updateMaterical();
        this._playPrompt();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(3);
        }
        this.setButtonEnable(true);
    }
    _clearTextSummary() {
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.clearTextSummary();
    }
    _onUpStarFinishEffect() {
        this._clearTextSummary();
        G_SceneManager.openPopup(Path.getPrefab("PopupAwakeResult","heroTrain"),function(popup:PopupAwakeResult) {
            popup.setInitData(this, this._heroId);
            popup.openWithAction();
        }.bind(this))
        this._updateShow();
        this._updateGemstone();
        this._updateLevel();
        this._updateMaterical();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(3);
        }
        this.setButtonEnable(true);
    }
    _playEffect(isUpStar) {
        var onFinishCallback = null;
        if (isUpStar) {
            onFinishCallback = handler(this, this._onUpStarFinishEffect);
        } else {
            onFinishCallback = handler(this, this._onCommonFinishEffect);
        }
        this._playCommonEffect(onFinishCallback);
    }
    _playCommonEffect(callback) {
        var effectFunction = function (effect) {
            return new cc.Node();
        }
        var eventFunction = function (event) {
            if (event == 'play') {
                for (var i = 1; i <= 4; i++) {
                    var icon = this._gemstoneIcons[i] as TeamGemstoneIcon;
                    var node = icon.getCommonIcon().node;
                    G_EffectGfxMgr.applySingleGfx(node, 'smoving_juexing_item_' + i, function (nodeP:cc.Node) {
                        nodeP.active = (false);
                    }.bind(this,node), null, null);
                }
            } else if (event == 'finish') {
                if (callback) {
                    callback();
                    for (var i = 1; i <= 4; i++) {
                        var icon = this._gemstoneIcons[i] as TeamGemstoneIcon;
                        var node = icon.getCommonIcon().node;
                        node.active = true;
                        node.setPosition(0, 0);
                    }
                }
            }
        }.bind(this)
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_juexing', effectFunction, eventFunction, false);
        effect.node.setPosition(new cc.Vec2(0 - 50, 0));
    }
    _onButtonPreview() {
        G_SceneManager.openPopup(Path.getPrefab("PopupAwakePreview","heroTrain"),function(pop:PopupAwakePreview){
            pop.setInitData(this._heroUnitData)
            pop.openWithAction();
        }.bind(this))
    }
    _getSlotAndCompose(): Array<any> {
        var slot = [];
        var composeInfo = [];
        var info = HeroDataHelper.getHeroAwakeEquipState(this._heroUnitData);
        for (var i = 1; i <= 4; i++) {
            var state = info[i].state;
            if (state == GemstoneConst.EQUIP_STATE_3) {
                composeInfo.push({
                    slot: i,
                    id: info[i].needId
                });
            } else if (state == GemstoneConst.EQUIP_STATE_1) {
                slot.push(i);
            }
        }
        return [
            slot,
            composeInfo
        ];
    }
    _onButtonOneKey() {
        var [slot, composeInfo] = this._getSlotAndCompose();
        if (composeInfo.length > 0) {
            for (var i in composeInfo) {
                var info = composeInfo[i];
                var baseId = info.id;

                var config = G_ConfigLoader.getConfig(ConfigNameConst.GEMSTONE).get(baseId);
              //assert((config, cc.js.formatStr('gemstone config can not find id = %d', baseId));
                var fragmentId = config.fragment_id;
                G_UserData.getFragments().c2sSyntheticFragments(fragmentId, 1);
            }
        } else {
            this._doOneKey(slot);
        }
    }
    _doOneKey(slot) {
        if (slot.length == 0) {
            G_Prompt.showTip(Lang.get('hero_awake_gemstone_empty'));
            return;
        }
        G_UserData.getHero().c2sHeroEquipAwaken(this._heroUnitData.getId(), slot);
    }
}