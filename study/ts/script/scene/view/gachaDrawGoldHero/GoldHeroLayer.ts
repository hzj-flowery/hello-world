import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import { G_UserData } from "../../../init";
import { table } from "../../../utils/table";
import { handler } from "../../../utils/handler";
import CommonStoryAvatar2 from "../../../ui/component/CommonStoryAvatar2";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GoldHeroLayer extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resource: cc.Node = null;

    @property({
        type: cc.PageView,
        visible: true
    })
    _pageView: cc.PageView = null;

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

    @property(cc.Prefab)
    commonStoryAvatar2:cc.Prefab = null;
    
    _heroId: number;
    _isPageViewMoving: boolean;
    _callBack: any;
    _allHeroIds: any;
    _selectedPos: number;
    _heroCount: any;
    _pageViewSize: cc.Size;
    _pageItems: cc.Node[];


    ctor(heroId:number, callBack) {
        this._heroId = heroId;
        this._isPageViewMoving = false;
        this._callBack = callBack;
        UIHelper.addEventListener(this.node, this._buttonLeft, 'GoldHeroLayer', '_onButtonLeftClicked');
        UIHelper.addEventListener(this.node, this._buttonRight, 'GoldHeroLayer', '_onButtonRightClicked');
        this.setSceneSize();
    }
    onCreate() {
        //var size = this._resource.getContentSize();
        //this.node.setContentSize(size);
        this._initSelectedPos(this._heroId);
        this._initPageView();
        this._buttonLeft.node.active = (false);
        this._buttonRight.node.active = (false);
    }
    onEnter() {
        this._createPageView();
    }
    onExit() {
    }
    _initSelectedPos(id) {
        this._allHeroIds = G_UserData.getGachaGoldenHero().getGoldHeroGroupId() || [];
        for(var i=0;i<this._allHeroIds.length;i++){
            if(this._allHeroIds[i] == id){
                this._selectedPos = i+1;
            }
        }
        this._heroCount = this._allHeroIds.length;
    }
    _initPageView() {
        //this._pageView.setScrollDuration(0.3);
        UIHelper.addPageEvent(this.node, this._pageView, 'GoldHeroLayer', '_onPageViewEvent');
        UIHelper.addClickEventListenerEx(this._pageView.node, handler(this, this._onPageTouch));
        this._pageViewSize = this._pageView.node.getContentSize();
    }
    _onPageTouch(event:cc.Event.EventTouch, data) {
        if (event.type == cc.Node.EventType.TOUCH_START) {
            this._isPageViewMoving = true;
            this._updatePageItemVisible();
        } else if (cc.Node.EventType.TOUCH_END == event.type || event.type == cc.Node.EventType.TOUCH_CANCEL) {
            this._isPageViewMoving = false;
        }
    }
    _onPageViewEvent(sender, event) {
        if (event == cc.PageView.EventType.PAGE_TURNING && sender == this._pageView) {
            var targetPos = this._pageView.getCurrentPageIndex() + 1;
            if (targetPos != this._selectedPos) {
                this._selectedPos = targetPos;
                this._updatePageItem();
            }
        }
    }
    _updateArrowBtn() {
        this._buttonLeft.node.active = (this._selectedPos > 1);
        this._buttonRight.node.active = (this._selectedPos < this._heroCount);
    }
    _onButtonLeftClicked() {
        if (this._selectedPos <= 1) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        this._updatePageItem();
    }
    _onButtonRightClicked() {
        if (this._selectedPos >= this._heroCount) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        this._updatePageItem();
    }
    _createPageView(){
        let createPageItem = function ():cc.Node {
            var widget = new cc.Node();
            widget.setContentSize(this._pageViewSize.width, this._pageViewSize.height);
            return widget;
        }.bind(this);
        this._pageItems = [];
        this._pageView.removeAllPages();
        for (var i = 1; i<=this._heroCount; i++) {
            var item = createPageItem() as cc.Node;
            item.setAnchorPoint(cc.v2(0.5, 0.5));
            this._pageView.addPage(item);
            table.insert(this._pageItems, item);
        }
        this._updatePageItem();
        this._pageView.setCurrentPageIndex(this._selectedPos - 1);
    }
    _updatePageItem() {
        var index = this._selectedPos-1;
        for (var i = index - 1; i<=index + 1; i++) {
            var widget:cc.Node;
            if(i >= 0 && i < this._pageItems.length){
                widget = this._pageItems[i];
            }
            if (widget) {
                var count = widget.childrenCount;
                var heroId = this._allHeroIds[i];
                if (count == 0 && heroId > 0) {
                    var avatar = cc.instantiate(this.commonStoryAvatar2).getComponent(CommonStoryAvatar2);
                    avatar.updateUI(heroId);
                    avatar.setAvatarScale(1.0);
                    avatar.node.setPosition(cc.v2(0, -320));
                    widget.addChild(avatar.node);
                }
            }
        }
        this._updatePageItemVisible();
        if (this._callBack) {
            this._callBack(this._selectedPos);
        }
    }
    _updatePageItemVisible() {
        for (let i=0; i < this._pageItems.length;i++) {
            var item = this._pageItems[i];
            if (i == (this._selectedPos-1)) {
                item.active = (true);
            } else {
                item.active = (this._isPageViewMoving);
            }
        }
    }    

}
