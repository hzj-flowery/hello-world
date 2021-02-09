import ViewBase from "../../scene/ViewBase";
import { handler } from "../../utils/handler";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import CommonHeroAvatar from "./CommonHeroAvatar";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonPageItemHero extends ViewBase {

    @property({
        type: cc.PageView,
        visible: true
    })
    _page_View: cc.PageView = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _button_Left: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _button_Right: cc.Button = null;

    private _page_ViewSize: cc.Size;
    private _selectedPos: number;
    private _updateCallBack;
    private _dataList;
    private _dataCount;
    private _pageItems: Array<cc.Node>;
    private _commonHeroAvatar;
    
    onCreate():void{
        this._init();
        this._selectedPos = 1;
        this._updateCallBack = null;
        this._dataList = {};
        this._dataCount = 0;
        this._commonHeroAvatar = cc.resources.get(Path.getCommonPrefab("CommonHeroAvatar"));

        var handler1 = new cc.Component.EventHandler();
        handler1.component = "CommonPageItemHero";
        handler1.target = this.node;
        handler1.handler = "onButtonLeftClicked";
        var handler2 = new cc.Component.EventHandler();
        handler2.component = "CommonPageItemHero";
        handler2.target = this.node;
        handler2.handler = "onButtonRightClicked";
        this._button_Left.clickEvents = [];
        this._button_Left.clickEvents.push(handler1);
        this._button_Right.clickEvents = [];
        this._button_Right.clickEvents.push(handler2);
    }
    onEnter():void{

    }
    onExit():void{

    }
    _init() {
        //this._page_View.setScrollDuration(0.3);
        this._page_View.node.on(cc.Node.EventType.TOUCH_END, handler(this, this._onPageTouch));
        this._page_ViewSize = this._page_View.node.getContentSize();
    }
    updateSelectById(itemId) {
    }
    setUserData(userData, selectPos) {
        this._dataList = userData;
        this._dataCount = userData.length;
        if (this._dataCount > 0) {
            this._initPageView();
        }
        this._selectedPos = selectPos;
        this._updatePageItem();
        this._updateArrowBtn();
        this._page_View.scrollToPage(this._selectedPos - 1,0);
    }
    setCallBack(params) {
        if (typeof (params) == 'function') {
            this._updateCallBack = params;
        }
        if (typeof (params) == 'number') {
            if (params == TypeConvertHelper.TYPE_HERO) {
                this._updateCallBack = this._updateHeroAvatar;
            }
        }
    }
    _createPageItem():cc.Node {
        var node = new cc.Node();
        node.setAnchorPoint(0,0);
        node.setPosition(-this._page_ViewSize.width/2, -this._page_ViewSize.height/2);
        node.setContentSize(this._page_ViewSize.width, this._page_ViewSize.height);
        return node;
    }
    _updateHeroAvatar(widget, index) {
        if (index <= 0) {
            return;
        }
        var cfgData = this._dataList[index];
        if (cfgData == null) {
            return;
        }
        var heroBaseId = cfgData.id;
        var node = cc.instantiate(this._commonHeroAvatar) as cc.Node;
        var avatar = node.getComponent(CommonHeroAvatar);
        avatar.updateUI(heroBaseId);
        avatar.setScale(1.4);
        avatar.node.setPosition(new cc.Vec2(this._page_ViewSize.width / 2, 100));
        widget.addChild(avatar);
    }
    _updatePageItem() {
        var index = this._selectedPos-1;
        for (var i = index - 1;i<index + 1;i++) {
            if(i<0||i>=this._pageItems.length)
            {
                continue;
            }
            var widget = this._pageItems[i];
            if (widget) {
                if (this._updateCallBack && typeof (this._updateCallBack) == 'function') {
                    this._updateCallBack(this, widget, i, this._selectedPos);
                }
            }
        }
        for(let i = 0;i<this._pageItems.length;i++)
        {
            var widget = this._pageItems[i];
            if(i!=index&&widget.childrenCount>0)
            {
                widget.removeAllChildren();
            }
        }
        this._showNearItem(false);
    }
    _initPageView() {
        this._pageItems = [];
        this._page_View.removeAllPages();
        for (var i = 1;i<=this._dataCount;i++) {
            var item = this._createPageItem();
            this._page_View.addPage(item);
            this._pageItems.push(item);
        }
    }
    _updateArrowBtn() {
        this._button_Left.node.active = (this._selectedPos > 1);
        this._button_Right.node.active = (this._selectedPos < this._dataCount);
    }
    onButtonLeftClicked() {
        if (this._selectedPos <= 1) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        this._updateArrowBtn();
        this._page_View.scrollToPage(this._selectedPos - 1,0);
        this._updateInfo();
        this._updatePageItem();
    }
    onButtonRightClicked() {
        if (this._selectedPos >= this._dataCount) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        this._updateArrowBtn();
        this._page_View.scrollToPage(this._selectedPos - 1,0);
        this._updateInfo();
        this._updatePageItem();
    }
    _onPageTouch(touch: cc.Touch): boolean {
        this._showNearItem(true);
        return true;
    }
    onPageViewEvent(sender, event) {
        var targetPos = this._page_View.getCurrentPageIndex() + 1;
        if (targetPos != this._selectedPos) {
            this._selectedPos = targetPos;
            this._updateArrowBtn();
            this._updateInfo();
            this._updatePageItem();
        }
    }
    _showNearItem(show) {
        var index = this._selectedPos-1;
        var curItem = this._pageItems[index];
        var leftItem = this._pageItems[index - 1];
        var rightItem = this._pageItems[index + 1];
        if (curItem) {
            curItem.active = (true);
        }
        // if (leftItem) {
        //     leftItem.active = (show);
        // }
        // if (rightItem) {
        //     rightItem.active = (show);
        // }
    }
    _updateInfo() {
    }
    getPageSize():cc.Size {
        return this._page_ViewSize;
    }
    getPageItems():Array<cc.Node> {
        return this._pageItems;
    }
    getSelectedPos():number {
        return this._selectedPos;
    }
    setCurPage(selectedPos) {
        this._selectedPos = selectedPos;
        this._updateArrowBtn();
        this._page_View.scrollToPage(this._selectedPos - 1,0);
        this._updateInfo();
        this._updatePageItem();
    }
    setTouchEnabled(enabled) {
        //this._page_View.setTouchEnabled(enabled);
    }

}