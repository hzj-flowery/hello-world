const { ccclass, property } = cc._decorator;

import { HeroConst } from '../../../const/HeroConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_HeroVoiceManager, G_SignalManager, G_UserData } from '../../../init';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonHeroStar from '../../../ui/component/CommonHeroStar';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { Path } from '../../../utils/Path';
import ViewBase from '../../ViewBase';
import HeroDetailBaseView from './HeroDetailBaseView';


@ccclass
export default class HeroDetailView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHeroDetailView: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.PageView,
        visible: true
    })
    _pageView: cc.PageView = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _fileNodeStar: CommonHeroStar = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonLeft: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonRight: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonVoice: cc.Button = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    protected preloadResList = [
        {path:Path.getPrefab("HeroDetailBaseView","heroDetail"),type:cc.Prefab},
        {path:Path.getPrefab("HeroDetailSkillCell","heroDetail"),type:cc.Prefab},
        {path:Path.getPrefab("HeroDetailAttrModule","heroDetail"),type:cc.Prefab},
        {path:Path.getPrefab("HeroDetailJointModule","heroDetail"),type:cc.Prefab},
        {path:Path.getPrefab("HeroDetailSkillModule","heroDetail"),type:cc.Prefab},
        {path:Path.getPrefab("HeroDetailWeaponModule","heroDetail"),type:cc.Prefab},
        {path:Path.getPrefab("HeroDetailTalentModule","heroDetail"),type:cc.Prefab},
        {path:Path.getPrefab("HeroDetailKarmaModule","heroDetail"),type:cc.Prefab},
        {path:Path.getPrefab("HeroDetailYokeModule","heroDetail"),type:cc.Prefab},
        {path:Path.getPrefab("HeroDetailAwakeModule","heroDetail"),type:cc.Prefab},
        {path:Path.getPrefab("HeroDetailBriefModule","heroDetail"),type:cc.Prefab},
        {path:Path.getPrefab("HeroDetailDynamicModule","heroDetail"),type:cc.Prefab},
        {path:Path.getPrefab("TreasureTrainLimitBg","treasure"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonDetailTitleWithBg"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonHeroAvatar"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonStoryAvatar"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonButtonLevel2Highlight"),type:cc.Prefab},

    ];

    private _allHeroIds: Array<number>;
    private _rangeType: number;
    private _heroCount: number;
    private _selectedPos: number;
    private _pageViewSize: cc.Size;
    private _pageItems: Array<cc.Node>;

    private _commonHeroAvatar: CommonHeroAvatar;
    private _heroDetailBaseView: HeroDetailBaseView;

    private static _enterInitData: Array<any> = [];

    public static waitEnterMsg(callBack: any, params: Array<any>): void {
        HeroDetailView._enterInitData = params;
        callBack();
    }
    //此函数必须调用
    private enterToInitData(): void {
        var heroId = HeroDetailView._enterInitData[0];
        var rangeType = HeroDetailView._enterInitData[1];
        G_UserData.getHero().setCurHeroId(heroId);
        this._rangeType = rangeType;
        this._allHeroIds = [];
    }

    onCreate() {
        this.setSceneSize();
        // this._commonHeroAvatar = ;
        // this._heroDetailBaseView = ;
        //this._pageView.setScrollDuration(0.3);
        // this._pageView.node.on(cc.Node.EventType.TOUCH_START, handler(this, this.onPageTouchBegan));
        this._pageViewSize = this._pageView.node.getChildByName("view").getContentSize();

        //目前没有发现该节点的引用 先隐藏
        this._fileNodeStar.node.active = false;
    }

    onEnter() {
        this.enterToInitData();
        this._updateHeroIds();
        this._initPageView();
        this._updateArrowBtn(); 
        this._updateInfo();
        this._setCurPos();
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_wujiang');
        
        let inited = false;
        this._heroDetailBaseView.onDrawComplete = function() {
            if (!inited) {
                inited = true;
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "HeroDetailView");
            }
        }
        // this.scheduleOnce(() => {
        //     G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "HeroDetailView");
        // }, 0);
        // this.scheduleOnce(function(){
        //     this.onButtonRightClicked();
        // }.bind(this))
    }

    private updatePageViewItemActive():void{
        var children = this._pageView.getPages();
        var curIndex:number = this._pageView.getCurrentPageIndex();
        for(var j =0;j<children.length;j++)
        {
            if(curIndex!=j)
            children[j].active = false;
            else
            children[j].active = true;
        }
    }
    
    //更新英雄的id
    private _updateHeroIds() {
        if (this._rangeType == HeroConst.HERO_RANGE_TYPE_1) {
            this._allHeroIds = G_UserData.getHero().getRangeDataBySort();
        } else if (this._rangeType == HeroConst.HERO_RANGE_TYPE_2) {
            this._allHeroIds = G_UserData.getTeam().getHeroIdsInBattle();
        }
        this._selectedPos = 1;
        var heroId = G_UserData.getHero().getCurHeroId();
        for (var i = 0; i < this._allHeroIds.length; i++) {
            var id = this._allHeroIds[i];
            if (id == heroId) {
                this._selectedPos = i + 1;
            }
        }
        this._heroCount = this._allHeroIds.length;
    }
    onExit() {

    }
    private _setCurPos() {
        if (this._rangeType == HeroConst.HERO_RANGE_TYPE_2) {
            G_UserData.getTeam().setCurPos(this._selectedPos);
        }
    }
    private _createPageItem(): cc.Node {
        var node = new cc.Node();
        node.setAnchorPoint(0.5, 0.5)
        node.setContentSize(this._pageViewSize.width, this._pageViewSize.height);
        return node;
    }
    private _updatePageItem() {
        
        var index = this._selectedPos - 1;
        for (var i = index; i <= index + 1; i++) {
            if (i >= 0&&i<this._heroCount) {
                var widget = this._pageItems[i];
                if (widget) {
                    var count = widget.childrenCount;
                    if (count == 0) {
                        var heroId = this._allHeroIds[i];
                        var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                        var [heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData);
                        var limitLevel = avatarLimitLevel || unitData.getLimit_level();
                        var limitRedLevel = arLimitLevel || unitData.getLimit_rtg()
                        var avatarNode = cc.instantiate(cc.resources.get(Path.getCommonPrefab("CommonHeroAvatar"))) as cc.Node;
                        var avatar = this._commonHeroAvatar = avatarNode.getComponent(CommonHeroAvatar) as CommonHeroAvatar;
                        avatar.init();
                        avatar.updateUI(heroBaseId, null,null, limitLevel, null, null, limitRedLevel);
                        avatar.node.setScale(1.4);
                        avatar.node.setPosition(new cc.Vec2(0, -130));
                        widget.addChild(avatar.node);
                        // avatar._playAnim("idle", true);
                    }
                    else {
                        var avatar1 = widget.children[0].getComponent(CommonHeroAvatar) as CommonHeroAvatar;
                        // avatar1._playAnim("idle", true);
                    }
                }
            }
        }

        var pages = this._pageView.getPages();
        for(var j =0;j<pages.length;j++)
        {
            if(j==index)
            pages[j].opacity = 255;
            else
            pages[j].opacity = 0;
        }
    }
    private _initPageView() {
        this._pageItems = [];
        this._pageView.removeAllPages();
        for (var i = 1; i <= this._heroCount; i++) {
            var item = this._createPageItem();
            this._pageView.addPage(item);
            this._pageItems.push(item);
        }
        this.scheduleOnce(function () {
            this._updatePageItem();
            this._pageView.scrollToPage(this._selectedPos - 1,0);  
        }.bind(this));

    }
    update(){

    }
    private _updateInfo() {
        this._nodeHeroDetailView.removeAllChildren();
        var curHeroId = G_UserData.getHero().getCurHeroId();
        var node = cc.instantiate(cc.resources.get(Path.getPrefab("HeroDetailBaseView","heroDetail"))) as cc.Node;
        var heroDetail = this._heroDetailBaseView = node.getComponent(HeroDetailBaseView) as HeroDetailBaseView;
        heroDetail.setInitData(curHeroId, null, this._rangeType, this);
        this._nodeHeroDetailView.addChild(heroDetail.node);
        this._playCurHeroVoice();
    }
    private _playCurHeroVoice(must?) {
        var curHeroId = G_UserData.getHero().getCurHeroId();
        var curHeroData = G_UserData.getHero().getUnitDataWithId(curHeroId);
        var baseId = curHeroData.getBase_id();
        G_HeroVoiceManager.playVoiceWithHeroId(baseId, must);
    }
    private _updateArrowBtn() {
        this._buttonLeft.node.active = (this._selectedPos > 1);
        this._buttonRight.node.active = (this._selectedPos < this._heroCount);
    }

    onReadyGo(): void {
        this._setCurPos();
        var curHeroId = this._allHeroIds[this._selectedPos - 1];
        G_UserData.getHero().setCurHeroId(curHeroId);
        this._updateArrowBtn();
        this._pageView.scrollToPage(this._selectedPos - 1,0);
        this._updateInfo();
        this._updatePageItem();
    }

    onButtonLeftClicked() {
        if (this._selectedPos <= 1) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        this._setCurPos();
        var curHeroId = this._allHeroIds[this._selectedPos - 1];
        G_UserData.getHero().setCurHeroId(curHeroId);
        this._updateArrowBtn();
        this._pageView.scrollToPage(this._selectedPos - 1,0);
        this._updateInfo();
        this._updatePageItem();
    }
    onButtonRightClicked() {
        if (this._selectedPos >= this._heroCount) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        this._setCurPos();
        var curHeroId = this._allHeroIds[this._selectedPos - 1];
        G_UserData.getHero().setCurHeroId(curHeroId);
        this._updateArrowBtn();
        this._pageView.scrollToPage(this._selectedPos - 1,0);
        this._updateInfo();
        this._updatePageItem();
    }
    onPageTouchBegan(touch: cc.Touch): boolean {
        return true;
    }
    onPageViewEvent(event) {
        var targetPos = this._pageView.getCurrentPageIndex() + 1;
        if (targetPos != this._selectedPos) {
            this._selectedPos = targetPos;
            this._setCurPos();
            var curHeroId = this._allHeroIds[this._selectedPos - 1];
            G_UserData.getHero().setCurHeroId(curHeroId);
            this._updateArrowBtn();
            this._updateInfo();
            this._updatePageItem();
        }
    }
    onButtonVoiceClicked() {
        this._playCurHeroVoice(true);
    }

}