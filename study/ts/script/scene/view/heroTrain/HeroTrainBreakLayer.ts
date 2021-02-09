import AttributeConst from "../../../const/AttributeConst";
import { AudioConst } from "../../../const/AudioConst";
import { SignalConst } from "../../../const/SignalConst";
import { HeroUnitData } from "../../../data/HeroUnitData";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_AudioManager, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonAttrDiff from "../../../ui/component/CommonAttrDiff";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonCostNode from "../../../ui/component/CommonCostNode";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import CommonHeroName from "../../../ui/component/CommonHeroName";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import CommonUI from "../../../ui/component/CommonUI";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { handler } from "../../../utils/handler";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import { MilitaryMasterPlanHelper } from "../militaryMasterPlan/MilitaryMasterPlanHelper";
import { MilitaryMasterPlanView } from "../militaryMasterPlan/MilitaryMasterPlanView";
import PopupBreakResult from "./PopupBreakResult";



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
export default class HeroTrainBreakLayer extends ViewBase{


    @property({
        type: cc.PageView,
        visible: true
    })
    _pageView: cc.PageView= null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonBreak: CommonButtonLevel0Highlight= null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _fileNodeDetailTitle: CommonDetailTitleWithBg= null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _fileNodeCostTitle: CommonDetailTitleWithBg= null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeShow: cc.Node= null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeNameOld: CommonHeroName= null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeNameNew: CommonHeroName= null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeHeroName2: CommonHeroName= null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBreakArrow: cc.Sprite= null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTalentBg: cc.Sprite= null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _iconArrow: cc.Sprite= null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageStage1: cc.Sprite= null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageStage2: cc.Sprite= null;


    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTalentDesPos: cc.Node= null;

    
    @property({
        type: cc.Label,
        visible: true
    })
    _textTalentName: cc.Label= null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOldLevel: cc.Label= null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNewLevel: cc.Label= null;

    @property({
        type: CommonAttrDiff,
        visible: true
    })
    _fileNodeAttr1: CommonAttrDiff= null;

    @property({
        type: CommonAttrDiff,
        visible: true
    })
    _fileNodeAttr2: CommonAttrDiff= null;

    @property({
        type: CommonAttrDiff,
        visible: true
    })
    _fileNodeAttr3: CommonAttrDiff= null;

    @property({
        type: CommonAttrDiff,
        visible: true
    })
    _fileNodeAttr4: CommonAttrDiff= null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelCost: cc.Node= null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeNeedLevelPos: cc.Node= null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _nodeResource: CommonResourceInfo= null;

    private _pageItems:Array<any> = [];//下标从0走
    private _parentView:any;
    private _signalHeroRankUp:any;
    private _isReachLimit:boolean;
    private _conditionLevel:boolean;
    private _fileNodeHeroOld:CommonHeroAvatar;
    private _fileNodeHeroNew:CommonHeroAvatar;

    private _materialIcons:Array<any>;
    private _materialInfo:Array<any>;
    private _resourceInfo:Array<any>;
    private _heroUnitData:HeroUnitData;
    private _heroId:number;
    private _rankLevel:number;
    private _costCardNum:number;
    private _pageViewSize:cc.Size;

    private _commonHeroAvatar:any;
    private _commonCostNode:any;
    _newNamePosX: any;
    public setInitData(pv:any):void{
        var size = G_ResolutionManager.getDesignSize()
        this._parentView = pv;
        this.node.setContentSize(size[0],size[1]);
        this._pageViewSize = this._pageView.node.getChildByName("view").getContentSize();
        this.node.name = "HeroTrainBreakLayer";
        this._commonHeroAvatar = cc.resources.get(Path.getCommonPrefab("CommonHeroAvatar")) as CommonHeroAvatar;
        this._commonCostNode = cc.resources.get(Path.getCommonPrefab("CommonCostNode")) as CommonCostNode;
    }
    onCreate() {
        this.setSceneSize();
        this._initData();
        this._initView();
    }
    onEnter() {
        this._signalHeroRankUp = G_SignalManager.add(SignalConst.EVENT_HERO_RANKUP, handler(this, this._heroRankUpSuccess));
        this._pageView.enabled = false;
    }
    onExit() {
        this._signalHeroRankUp.remove();
        this._signalHeroRankUp = null;
    }
    initInfo() {
        this._parentView.setArrowBtnVisible(true);
        this._updatePageItem();
        this._updateInfo();
        var selectedPos = this._parentView.getSelectedPos();
        this._pageView.scrollToPage(selectedPos - 1,0);
    }
    private _initData() {
        this._isReachLimit = false;
        this._conditionLevel = false;
    }
    private _initView() {
        this._materialIcons = [];
        this._buttonBreak.setString(Lang.get('hero_break_btn_break'));
        this._fileNodeDetailTitle.setFontSize(24);
        this._fileNodeCostTitle.setFontSize(24);
        this._fileNodeDetailTitle.setTitle(Lang.get('hero_break_detail_title'));
        this._fileNodeCostTitle.setTitle(Lang.get('hero_break_cost_title'));
        this._newNamePosX = this._fileNodeNameNew.node.x;
        this._initPageView();
    }
    _createPageItem() {
        var widget = (new cc.Node()).addComponent(cc.Widget) as cc.Widget;
        //widget.setSwallowTouches(false);
        widget.node.setContentSize(this._pageViewSize.width, this._pageViewSize.height);
        return widget;
    }
    _updatePageItem() {
        //下标从0走
        var allHeroIds = this._parentView.getAllHeroIds();
        //下标从1走
        var index = this._parentView.getSelectedPos()-1;
        for (var i = index - 1;i<=index + 1;i++) {
            if (i >= 0 && i < allHeroIds.length) {
                if (this._pageItems[i] == null) {
                    var widget = this._createPageItem();
                    this._pageView.addPage(widget.node);
                    this._pageItems[i] = { widget: widget.node };
                }
                if (this._pageItems[i].avatar1 == null && this._pageItems[i].avatar2 == null) {
                    var avatar1 = (cc.instantiate(this._commonHeroAvatar) as cc.Node).getComponent(CommonHeroAvatar) as CommonHeroAvatar;
                    var avatar2 = (cc.instantiate(this._commonHeroAvatar) as cc.Node).getComponent(CommonHeroAvatar) as CommonHeroAvatar;
                    avatar1.init();
                    avatar2.init();
                    avatar1.setScale(1);
                    avatar2.setScale(1.2);
                    avatar1.node.setPosition(this._getPositionWithIndex(1));
                    avatar2.node.setPosition(this._getPositionWithIndex(2));
                    this._pageItems[i].widget.addChild(avatar1.node);
                    this._pageItems[i].widget.addChild(avatar2.node);
                    this._pageItems[i].avatar1 = avatar1;
                    this._pageItems[i].avatar2 = avatar2;
                }
                var heroId = allHeroIds[i];
                var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                var [heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData);
                var limitLevel = avatarLimitLevel || unitData.getLimit_level();
                var limitRedLevel = arLimitLevel || unitData.getLimit_rtg();
                this._pageItems[i].avatar1.updateUI(heroBaseId, null, null, limitLevel, null, null, limitRedLevel);
                this._pageItems[i].avatar2.updateUI(heroBaseId, null, null, limitLevel, null, null, limitRedLevel);
            }
        }
        this._pageView.scrollToPage(index,0)
    }
    _getPositionWithIndex(index) {
        var imageStage = (this['_imageStage' + index] as cc.Sprite).node;
        var targetPosX = imageStage.x;
        var targetPosY = imageStage.y + imageStage.getContentSize().height / 4;
        var pos = UIHelper.convertSpaceFromNodeToNode(this._nodeShow, this._pageView.node, new cc.Vec2(targetPosX, targetPosY));
        pos.y = pos.y - this._pageView.node.height/2;
        return pos;
    }
    _initPageView() {
        this._pageItems = [];
        this._pageViewSize = this._pageView.node.getChildByName("view").getContentSize();
        this._pageView.removeAllPages();
        var heroCount = this._parentView.getHeroCount();
        for (var i = 0;i<heroCount;i++) {
            var widget = this._createPageItem();
            this._pageView.addPage(widget.node);
            this._pageItems[i] = { widget: widget.node };
        }
        var selectedPos = this._parentView.getSelectedPos();
        this._pageView.setCurrentPageIndex(selectedPos - 1);
    }
    private onPageViewEvent(sender, event) {
        // if (event == cc.PageView.EventType.PAGE_TURNING && sender == this._pageView) {
        //     var targetPos = this._pageView.getCurrentPageIndex() + 1;
        //     var selectedPos = this._parentView.getSelectedPos();
        //     if (targetPos != selectedPos) {
        //         this._parentView.setSelectedPos(targetPos);
        //         var allHeroIds = this._parentView.getAllHeroIds();
        //         var curHeroId = allHeroIds[targetPos-1];
        //         G_UserData.getHero().setCurHeroId(curHeroId);
        //         this._parentView.updateArrowBtn();
        //         this._updatePageItem();
        //         this._updateInfo();
        //         this._parentView.updateTabIcons();
        //     }
        // }
    }
    private _updateInfo() {
        this._heroId = G_UserData.getHero().getCurHeroId();
        this._heroUnitData = G_UserData.getHero().getUnitDataWithId(this._heroId);
        var rankMax = this._heroUnitData.getConfig().rank_max;
        this._rankLevel = this._heroUnitData.getRank_lv();
        this._isReachLimit = this._rankLevel >= rankMax;
        this.setButtonEnable(true);
        this._updateShow();
        this._updateAttr();
        this._updateCost();
    }

    private _updateShow() {
        var index = this._parentView.getSelectedPos();
        this._fileNodeHeroOld = this._pageItems[index-1].avatar1;
        this._fileNodeHeroNew = this._pageItems[index-1].avatar2;
        var [heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(this._heroUnitData);
        var rankLevel = this._isReachLimit && this._rankLevel || this._rankLevel + 1;
        var limitLevel = avatarLimitLevel || this._heroUnitData.getLimit_level();
        var limitRedLevel = arLimitLevel || this._heroUnitData.getLimit_rtg();
        this._fileNodeNameOld.setName(this._heroUnitData.getBase_id(), this._rankLevel, this._heroUnitData.getLimit_level(), null, this._heroUnitData.getLimit_rtg());
        this._fileNodeNameNew.setName(this._heroUnitData.getBase_id(), rankLevel, this._heroUnitData.getLimit_level(), null, this._heroUnitData.getLimit_rtg());
        this._fileNodeHeroName2.setName(this._heroUnitData.getBase_id(), this._rankLevel, this._heroUnitData.getLimit_level(), null, this._heroUnitData.getLimit_rtg());
        this._fileNodeHeroNew.updateUI(heroBaseId, null, null, limitLevel, null, null, limitRedLevel);
        this._fileNodeNameOld.node.active = (!this._isReachLimit);
        this._fileNodeHeroOld.node.active = (!this._isReachLimit);
        this._imageBreakArrow.node.active = (!this._isReachLimit);
        this._imageTalentBg.node.active = (!this._isReachLimit);
        this._iconArrow.node.active = (!this._isReachLimit);
        this._nodeTalentDesPos.removeAllChildren();
        var label:any = null;
        if (this._isReachLimit) {
            label = UIHelper.createWithTTF(Lang.get('hero_break_txt_all_unlock'), Path.getCommonFont(), 20);
            label.node.width = (334);
            label.fontFamily = Path.getCommonFont();
            label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            label.node.setAnchorPoint(new cc.Vec2(0.5, 1));
            this._fileNodeNameNew.node.x = (this._iconArrow.node.x);
        } else {
            this._fileNodeNameNew.node.x = (this._newNamePosX);
            this._fileNodeHeroNew.node.setPosition(this._getPositionWithIndex(2));
            this._fileNodeHeroOld.updateUI(heroBaseId, null, null, limitLevel);
            limitLevel = this._heroUnitData.getLimit_level();
            var limitRedLevel = this._heroUnitData.getLimit_rtg();
            if (this._heroUnitData.isLeader()) {
                limitLevel = this._heroUnitData.getLeaderLimitLevel();
                limitRedLevel = this._heroUnitData.getLeaderLimitRedLevel();
            }
            var heroRankConfig = HeroDataHelper.getHeroRankConfig(heroBaseId, rankLevel, limitLevel, limitRedLevel);
            if (heroRankConfig) {
                var talentName = heroRankConfig.talent_name;
                var talentDes = heroRankConfig.talent_description;
                this._textTalentName.string = (talentName);
                var breakDes = Lang.get('hero_break_txt_break_des', { rank: rankLevel });
                var talentInfo = Lang.get('hero_break_txt_talent_des', {
                    name: talentName,
                    des: talentDes,
                    breakDes: breakDes
                });
                label = RichTextExtend.createWithContent(talentInfo);
                label.node.setAnchorPoint(new cc.Vec2(0.5, 1));
                label.maxWidth = 334;
                label.lineHeight = 22;
                //label.ignoreContentAdaptWithSize(false);
                // label.node.setContentSize(cc.size(334, 0));
                //label.formatText();
                this._imageTalentBg.node.active = (true);
            } else {
                this._imageTalentBg.node.active = (false);
            }
        }
        if (label) {
            this._nodeTalentDesPos.addChild(label.node);
        }
    }
    private _updateAttr() {
        this._textOldLevel.string = (Lang.get('hero_break_txt_break_title', { level: this._rankLevel }));
        var strRankLevel = this._isReachLimit == true && Lang.get('hero_break_txt_reach_limit') || Lang.get('hero_break_txt_break_title', { level: this._rankLevel + 1 });
        this._textNewLevel.string = (strRankLevel);
        var curBreakAttr = HeroDataHelper.getBreakAttr(this._heroUnitData);
        var nextBreakAttr = HeroDataHelper.getBreakAttr(this._heroUnitData, 1) || {};
        this._fileNodeAttr1.updateInfo(AttributeConst.ATK, curBreakAttr[AttributeConst.ATK], nextBreakAttr[AttributeConst.ATK], 4);
        this._fileNodeAttr2.updateInfo(AttributeConst.HP, curBreakAttr[AttributeConst.HP], nextBreakAttr[AttributeConst.HP], 4);
        this._fileNodeAttr3.updateInfo(AttributeConst.PD, curBreakAttr[AttributeConst.PD], nextBreakAttr[AttributeConst.PD], 4);
        this._fileNodeAttr4.updateInfo(AttributeConst.MD, curBreakAttr[AttributeConst.MD], nextBreakAttr[AttributeConst.MD], 4);
    }
    private _updateCost() {
        this._costCardNum = 0;
        this._fileNodeCostTitle.node.active = (!this._isReachLimit);
        this._panelCost.removeAllChildren();
        this._nodeNeedLevelPos.removeAllChildren();
        this._nodeResource.node.active = (false);
        this._buttonBreak.setEnabled(!this._isReachLimit);
        if (this._isReachLimit) {
            var node = new cc.Node();
            var sp = node.addComponent(cc.Sprite) as cc.Sprite;
            sp.node.addComponent(CommonUI).loadTexture(Path.getText('txt_train_breakthroughtop'));
            var size = this._panelCost.getContentSize();
            sp.node.setPosition(new cc.Vec2(size.width / 2, size.height / 2));
            this._panelCost.addChild(sp.node);
            return;
        }
        this._materialIcons = [];
        this._materialInfo = [];
        this._resourceInfo = [];
        var allMaterialInfo = HeroDataHelper.getHeroBreakMaterials(this._heroUnitData);
        for (var i in allMaterialInfo) {
            var info = allMaterialInfo[i];
            if (info.type != TypeConvertHelper.TYPE_RESOURCE) {
                this._materialInfo.push(info);
            } else {
                this._resourceInfo.push(info);
            }
        }
        var len = this._materialInfo.length;
        for (i in this._materialInfo) {
            var info = this._materialInfo[i];
            var costNode = (cc.instantiate(this._commonCostNode) as cc.Node).getComponent(CommonCostNode) as CommonCostNode;
            costNode.updateView(info);
            var pos = new cc.Vec2(MATERIAL_POS[len][i][0], MATERIAL_POS[len][i][1]);
            costNode.node.setPosition(pos);
            this._panelCost.addChild(costNode.node);
            this._materialIcons.push(costNode);
            if (info.type == TypeConvertHelper.TYPE_HERO) {
                this._costCardNum = this._costCardNum + costNode.getNeedCount();
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
        var myLevel = this._heroUnitData.getLevel();
        var needLevel = HeroDataHelper.getHeroBreakLimitLevel(this._heroUnitData);
        var colorNeed = myLevel < needLevel && Colors.colorToNumber(Colors.BRIGHT_BG_RED) || Colors.colorToNumber(Colors.BRIGHT_BG_GREEN);
        var needLevelInfo = Lang.get('hero_break_txt_need_level', {
            value1: myLevel,
            color: colorNeed,
            value2: needLevel
        });
        let richTextNeedLevel = RichTextExtend.createWithContent(needLevelInfo);
        richTextNeedLevel.node.setAnchorPoint(new cc.Vec2(0, 0));
        this._nodeNeedLevelPos.addChild(richTextNeedLevel.node);
        this._conditionLevel = myLevel >= needLevel;
    }
    setButtonEnable(enable) {
        this._buttonBreak.setEnabled(enable);
        //this._pageView.setEnabled(enable);
        if (this._parentView && this._parentView.setArrowBtnEnable) {
            this._parentView.setArrowBtnEnable(enable);
        }
    }
    public onButtonBreakClicked() {
        if (this._isReachLimit) {
            G_Prompt.showTip(Lang.get('hero_break_reach_limit_tip'));
            return;
        }
        if (!this._conditionLevel) {
            G_Prompt.showTip(Lang.get('hero_break_condition_no_level'));
            return;
        }
        for (var i in this._materialIcons) {
            var icon = this._materialIcons[i];
            var isReachCondition = icon.isReachCondition();
            if (!isReachCondition) {
                var info = this._materialInfo[i];
                var param = TypeConvertHelper.convert(info.type, info.value);
                G_Prompt.showTip(Lang.get('hero_break_condition_no_cost', { name: param.name }));
                return;
            }
        }
        for (i in this._resourceInfo) {
            var info = this._resourceInfo[i];
            var enough = UserCheck.enoughValue(info.type, info.value, info.size);
            if (!enough) {
                return false;
            }
        }
        this._doHeroBreak();
    }
    private _doHeroBreak() {
        var id = this._heroUnitData.getId();
        var heroIds = [];
        var sameCards = G_UserData.getHero().getSameCardCountWithBaseId(this._heroUnitData.getBase_id());
        var count = 0;
        for (var k in sameCards) {
            var card = sameCards[k];
            if (count >= this._costCardNum) {
                break;
            }
            heroIds.push(card.getId());
            count = count + 1;
        }
        G_UserData.getHero().c2sHeroRankUp(id, heroIds);
        this.setButtonEnable(false);
    }
    private _heroRankUpSuccess() {
        this._playEffect();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(2);
            this._parentView.checkRedPoint(4);
        }
    }
    private showHeroAvatar() {
        this._fileNodeHeroOld.node.opacity = (255);
        this._fileNodeHeroNew.node.opacity = (255);
    }
    private _playEffect() {
        var effectFunction = function (effect):cc.Node {
            return new cc.Node();
        }
        var eventFunction = function (event) {
            if (event == '1p') {
                var action = cc.fadeOut(0.3);
                this._fileNodeHeroOld.node.runAction(action);
                G_AudioManager.playSoundWithId(AudioConst.SOUND_HERO_BREAK);
            } else if (event == 'finish') {
                G_SceneManager.openPopup(Path.getPrefab("PopupBreakResult","heroTrain"),function(popup:PopupBreakResult){
                    popup.setInitData(this,this._heroId);
                    popup.open();
                    popup.setCloseCallBack(()=>{
                        console.log("关闭啦");
                        let heroUnitData = G_UserData.getHero().getUnitDataWithId(this._heroId);
                        var rankLevel = heroUnitData.getRank_lv();
                        if(MilitaryMasterPlanHelper.isOpen(MilitaryMasterPlanHelper.Type_HeroBreakResult,rankLevel))
                        {
                            G_SceneManager.showDialog("prefab/militaryMasterPlan/MilitaryMasterPlanView",function(pop:MilitaryMasterPlanView){
                                pop.setInitData(MilitaryMasterPlanHelper.Type_HeroBreakResult);
                                pop.openWithAction();
                            });
                        }

                       

                    })
                }.bind(this))
                this.setButtonEnable(true);
                this._updateInfo();
                this.showHeroAvatar();
            }
        }.bind(this);
        var effectNode = new cc.Node();
        this.node.addChild(effectNode);
        effectNode.setPosition(cc.v2(-10, -40));

        if (false) {  //CONFIG_LIMIT_BOOST
            this.setButtonEnable(true);
            this._updateInfo();
            this.showHeroAvatar();
        } else {
            var effect = G_EffectGfxMgr.createPlayMovingGfx(effectNode, 'moving_wujiangtupo', effectFunction, eventFunction, false);
            effect.node.setPosition(new cc.Vec2(0, 0));
        }
    }
    private updatePageView() {
        this._initPageView();
        this._updatePageItem();
        this._updateShow();
    }
}