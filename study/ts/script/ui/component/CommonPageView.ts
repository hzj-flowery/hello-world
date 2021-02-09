import UIHelper from "../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonPageView extends cc.PageView{


    _data: any;
    _updateListener: any;
    _eventListener: any;
    _template: any;
    _items: any;
    _time: number;
    _isAutoUpdate: boolean;

    ctor() {
        this._data = null;
        this._updateListener = null;
        this._eventListener = null;
        this._template = null;
        this._items = {};
        this._time = 0;
        this._isAutoUpdate = false;
    }
    _init() {
        UIHelper.addPageEvent(this.node, this, 'CommonPageView', '_onPageViewEvent');
    }
    onLoad() {
        this._init();
    }
    initPageView(template, updateListener, eventListener, isAutoUpdate) {
        this._template = template;
        this._updateListener = updateListener;
        this._eventListener = eventListener;
        this._isAutoUpdate = isAutoUpdate;
    }
    _createPageItem() {
        var pageViewSize = this.node.getContentSize();
        var widget = new cc.Node();
        widget.setContentSize(pageViewSize.width, pageViewSize.height);
        return widget;
    }
    refreshPage(pageData) {
        this._data = pageData;
        this._items = {};
        this._time = 0;
        this.removeAllPages();
        var pageSize = this.getPageSize();
        var pageViewSize = this.node.getContentSize();
        this.content.setContentSize(pageSize * pageViewSize.width, pageViewSize.height);
        for (var i = 1; i<=pageSize; i++) {
            var item = this._createPageItem();
            this.addPage(item);
        }
    }
    scrollToPageEx(index) {
        if (!this._checkIndex(index)) {
            return;
        }
        var currPageIndex = this._getCurrentPageIndex();
        if (currPageIndex == index) {
            return;
        }
        this._updatePages(index);
        this.scrollToPage(index, 0);
    }
    setCurrentPageIndexEx(index) {
        if (!this._checkIndex(index)) {
            return;
        }
        var currPageIndex = this._getCurrentPageIndex();
        if (currPageIndex == index) {
            return;
        }
        this._updatePages(index);
        this.setCurrentPageIndex(index);
    }
    _updatePages(index?) {
        index = index || this.getCurrentPageIndex();
        for (var i = index - 1; i<=index + 1; i++) {
            if (this._checkIndex(i)) {
                this._updateItem(i);
            }
        }
    }
    _updateItem(i) {
        if (this._items[i]) {
            return;
        }
        var item = this.getPages()[i];
        var template:cc.Node = cc.instantiate(this._template);
        item.addChild(template);
        template.active = true;
        var size = item.getContentSize();
        template.setAnchorPoint(0.5,0.5);
        template.setPosition(0, 0);
        //template.setPosition(size.width * 0.5, size.height * 0.5);
        this._items[i] = template;
        //this._items.push(template);
        this._updateListener(template, i);
        return template;
    }
    _getCurrentPageIndex() {
        return this.getCurrentPageIndex();
    }
    getItemEx(index, forceUpdate = true ) {
        var item = this._items[index];
        if (!item && forceUpdate == true) {
            item = this._updateItem(index);
        }
        return item;
    }
    getItemsEx() {
        return this._items;
    }
    getPageSize() {
        return this._data && this._data.length || 0;
    }
    _checkIndex(index) {
        if (index < 0 || index >= this.getPageSize()) {
            return false;
        }
        return true;
    }
    _onPageViewEvent(sender, eventType) {
        this._updatePages();
        if (this._eventListener) {
            this._eventListener(sender, eventType);
        }
    }
    _onUpdate(dt) {
        if (!this._isAutoUpdate || !this._updateListener) {
            return;
        }
        this._time = this._time + dt;
        if (this._time < 0.1) {
            return;
        }
        this._time = 0;
        var currPageIndex = this._getCurrentPageIndex();
        this._updateItem(currPageIndex);
    }
}
