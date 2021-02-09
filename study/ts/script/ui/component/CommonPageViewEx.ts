import UIHelper from "../../utils/UIHelper";
import ListViewCellBase from "../ListViewCellBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonPageViewEx extends cc.PageView {

   private _curItemPos:number = 0;

   private _innerWidth:number = 0;
   private _innerheight:number = 0;

   private _updateItemCallback:any;
   private _customCallback:any;
   private _pageViewCallback:any;

   private _template:cc.Prefab;
   private _templateWidth:number;
   private _templateHeight:number;
   private _spawnCount:number;

    private _items:ListViewCellBase[] = [];
    private _nodeList:any = {}; 
    private _bufferZone:number = 0;
    private _spacing:number = 0;
    private _totalCount:number = 0;

    _listViewHeight:number = 0;
    _listViewWidth:number = 0;
    _reuseItemOffset:number = 0;
    _totalRange:number = 0;
    _lastContentPos:number = 0;
    _touchEnabled:boolean = true;

    _enableTimer:boolean = false;
    _curIndex:number = 0;

    _anchorInfo:cc.Vec2 = cc.v2(0,0);

    //#region 重写cc.ScrollView的方法
    // _hasNestedViewGroup(event, captureListeners) {
    //     if (event.eventPhase !== cc.Event.CAPTURING_PHASE) return;
    //     //不阻止out上onTouch事件执行。
    //     return false;
    // }
    
    onLoad(){
        super.onLoad();
        this.updateDirection();
        this._listViewHeight = this.node.height;
        this._listViewWidth = this.node.width;
        this.content.on('position-changed', this._onUpdate, this, true);
        UIHelper.addPageEvent(this.node, this, 'CommonPageViewEx', 'onPageViewEvent');
    }
    updateDirection(){
        if (this.direction == cc.PageView.Direction.Vertical){
            this._lastContentPos = this.content.y;
        }else{
            this._lastContentPos = this.content.x;
        }
    }

    removeAllChildren()
    {
        this.content.removeAllChildren();
        if(this._listViewHeight > 0 && this._listViewWidth > 0){
            this.content.setContentSize(this._listViewWidth, this._listViewHeight);
        }
        
        this._curItemPos = 0;
        this._innerWidth = this._innerheight = 0;
        this._spawnCount = 0;
        this._items = [];
        this._nodeList = {};
    }
    clearAll(){
        this.removeAllChildren();
    }
    pushBackCustomItem(item:cc.Node){
        var comp = item.getComponent(ListViewCellBase);
        if(!comp){
            comp = item.addComponent(ListViewCellBase);
        }
        comp.onInit();
        this.addPage(item);
        if (this.direction == cc.PageView.Direction.Vertical) {
            this._curItemPos -= item.height;
            item.y = this._curItemPos;
            item.active = true;
            this._innerheight += item.height;
            this._innerWidth = this.content.width;
        }else {
            item.active = true;
            item.x = this._curItemPos;
            this._curItemPos += item.width;
            this._innerWidth += item.width;
            this._innerheight = this.content.height;
        }
    
        this.setInnerContainerSize(cc.size(this._innerWidth, this._innerheight));
    }
    getInnerContainerSize():cc.Size{
        return this.content.getContentSize();
    }
    getInnerContainer():cc.Vec2{
        return this.content.getPosition();
    }
    setInnerContainerSize(contentSize){
        if (this.direction == cc.PageView.Direction.Vertical){
            if(contentSize.height < this.node.height){
                contentSize.height = this.node.height;
            }
        }else{
            if(contentSize.width < this.node.width){
                contentSize.width = this.node.width;
            }
        }
        
        this.content.setContentSize(contentSize);
    }
    setVisible(visible){
        this.node.active = visible;
    }
    setCallback(updateCallBack, pageViewCallBack?) {
        this._updateItemCallback = updateCallBack;
        this._pageViewCallback = pageViewCallBack;
    }
    setCustomCallback(callback) {
        this._customCallback = callback;
    }
    resize(size, force = true) {
        this._listViewHeight = this.node.height;
        this._listViewWidth = this.node.width;
        this._totalCount = size;;
        this._spawnCount = Math.min(3, this._totalCount);
        var innerContainerSize = this.getInnerContainerSize();
        if (this.direction == cc.PageView.Direction.Vertical) {
            this._reuseItemOffset = (this._templateHeight + this._spacing) * this._spawnCount;
            this._totalRange = this._templateHeight * this._totalCount + (this._totalCount - 1) * this._spacing;
            innerContainerSize.height = this._totalRange;
        } else{
            this._reuseItemOffset = (this._templateWidth + this._spacing) * this._spawnCount;
            this._totalRange = this._templateWidth * this._totalCount + (this._totalCount - 1) * this._spacing;
            innerContainerSize.width = this._totalRange;
        }
        this._respawn();
        if(force){
            this.forceDoLayout();
        }
        this.setInnerContainerSize(innerContainerSize);
        if(this.getCurrentPageIndex() != 0){
            super.scrollToPage(0,0);
        }
    }
    onPageViewEvent(sender, eventType){
        if(this._pageViewCallback){
            this._pageViewCallback(sender, eventType);
        }
    }
    _respawn() {
        var count = this._items.length;
        if (count > this._spawnCount) {
            while (this._items.length > this._spawnCount) {
                var item = this._items.pop();
                item.node.destroy();
            }
        } else if (count < this._spawnCount) {
            var index = this._items.length;
            while (index < this._spawnCount) {
                var root = new cc.Node();
                var widget = cc.instantiate(this._template);
                var comp = widget.getComponent(ListViewCellBase);
                if(!comp){
                    comp = widget.addComponent(ListViewCellBase);
                }
                comp.onInit();
                comp.setIdx(index);
                root.setAnchorPoint(widget.getAnchorPoint());
                root.setContentSize(widget.getContentSize());
                root.name = index.toString();
                this.pushBackCustomItem(root);
                this.content.addChild(widget);
                widget.setPosition(root.getPosition());
                comp.setCustomCallback(this._customCallback);
                this._nodeList[index] = root;
                this._updateItem(comp, index);
                this._items.push(comp);
                index = index + 1;
            }
        }
        while(index < this._totalCount){
            var widget = new cc.Node();
            widget.setContentSize(this._listViewWidth, this._listViewHeight);
            widget.addComponent(ListViewCellBase);
            widget.setAnchorPoint(this._anchorInfo);
            widget.addComponent(cc.Sprite);
            widget.name = index.toString();
            this.pushBackCustomItem(widget);
            this._nodeList[index] = widget;
            index = index + 1;
        }
    }
    setTemplate(template, itemWidth?, itemHeight?) {
        this._template = template;
        this.removeAllChildren();
        var widget = cc.instantiate(template) as cc.Node;
        var comp:ListViewCellBase = widget.getComponent(ListViewCellBase);
        if(!comp){
            comp = widget.addComponent(ListViewCellBase);
        }
        comp.onInit();
        this._anchorInfo = cc.v2(widget.anchorX, widget.anchorY)
        var size = widget.getContentSize();
        this._templateWidth = itemWidth || size.width;
        this._templateHeight = itemHeight || size.height;
        if (this.direction == cc.PageView.Direction.Vertical) {
            this._bufferZone = this._templateHeight + this._spacing;
        } else {
            this._bufferZone = this._templateWidth + this._spacing;
        }
        this._lastContentPos = 0;
    }
    _getItemPositionYInView(item:cc.Node){
        var worldPos = item.getParent().convertToWorldSpaceAR(cc.v2(item.getPosition()));
        var viewPos = this.content.convertToNodeSpaceAR(cc.v2(worldPos));
        return viewPos.y;
    }
    _getItemPositionXInView(item){
        var worldPos = item.getParent().convertToWorldSpaceAR(cc.v2(item.getPosition()));
        var viewPos = this.node.convertToNodeSpaceAR(cc.v2(worldPos));
        return viewPos.x;
    }
    _onUpdate() {
        if(this._items.length <= 0){
            return;
        }
        var scrollOffset = this.getScrollOffset();
        if (this.direction == cc.PageView.Direction.Vertical) {
            var isDown = this.content.y < this._lastContentPos;
            this._lastContentPos = this.content.y;
            if(isDown){
                if(scrollOffset.y < this._bufferZone){
                    return;
                }
                var lastItem = this._items[0];
                if(lastItem.node.y > -scrollOffset.y){
                    return;
                }
                var itemID = this._curIndex;//lastItem.getIdx();
                if(itemID <= 0){
                    return;
                }
                for(var i=1; i<this._items.length; i++){
                    var curItem = this._items[i];
                    this._items[i] = lastItem;
                    lastItem = curItem;
                }
                this._items[0] = lastItem;
                this._curIndex = itemID-1;
                //lastItem.node.removeFromParent(false);
                //lastItem.node.y = -itemID * this._bufferZone;
                //this._updateItem(lastItem, itemID-1);
                this.updateAllItem(itemID-1);
            }else{
                if(scrollOffset.y > this._bufferZone * this._totalCount - this._listViewHeight){
                    return;
                }
                var nextItem = this._items[this._items.length-1];
                if(nextItem.node.y+scrollOffset.y < -this._listViewHeight){
                    return;
                }
                var itemID = this._curIndex;//nextItem.getIdx();
                if(itemID >= this._totalCount-1){
                    return;
                }
                nextItem = this._items[0];
                for(var i=this._items.length-1; i>=0; i--){
                    var curItem = this._items[i];
                    this._items[i] = nextItem;
                    nextItem = curItem;
                }
                this._curIndex = itemID+1;
                //nextItem.node.y = -(itemID+2) * this._bufferZone;
                //nextItem.node.removeFromParent(false);
                //this._updateItem(nextItem, itemID+1);
                this.updateAllItem(itemID+1);
            }
            
        } else {
            var isRight = this.content.x > this._lastContentPos;
            this._lastContentPos = this.content.x;
            if(isRight){
                if(scrollOffset.x >= 0){
                    return;
                }
                var lastItem = this._items[0];
                //var offsetX = lastItem.node.width * lastItem.node.anchorX;
                if(lastItem.node.x < -scrollOffset.x){
                    return;
                }
                var itemID = this._curIndex;//lastItem.getIdx();
                if(itemID <= 0){
                    return;
                }
                for(var i=1; i<this._items.length; i++){
                    var curItem = this._items[i];
                    this._items[i] = lastItem;
                    lastItem = curItem;
                }
                this._items[0] = lastItem;
                //lastItem.node.x = (itemID-1) * this._bufferZone;
                this._curIndex = itemID-1;
                //this._updateItem(lastItem, itemID-1);
                this.updateAllItem(itemID-1);
            }else{
                // if(-scrollOffset.x > this._bufferZone * this._totalCount - this._listViewWidth){
                //     return;
                // }
                var nextItem = this._items[this._items.length-1];
                if(-scrollOffset.x < nextItem.node.x){
                    return;
                }
                var itemID = this._curIndex;//nextItem.getIdx();
                if(itemID >= this._totalCount-1){
                    return;
                }
                nextItem = this._items[0];
                for(var i=this._items.length-1; i>=0; i--){
                    var curItem = this._items[i];
                    this._items[i] = nextItem;
                    nextItem = curItem;
                }
                //nextItem.node.x = (itemID+1) * this._bufferZone;
                this._curIndex = itemID+1;
                //nextItem.setIdx(itemID+1);
                //this._updateItem(nextItem, itemID+1);
                this.updateAllItem(itemID+1);
            }
        }
    }
    _updateItem(item, itemID) {
        item.setIdx(itemID);
        var root = this._nodeList[itemID];
        item.node.setPosition((root as cc.Node).getPosition());
        item.node.name = 'item'+itemID;
        if (this._updateItemCallback) {
            this._updateItemCallback(item, itemID);
        }
    }
    forceDoLayout(){
        this._curItemPos = 0;
        this._innerheight = 0;
        this._innerWidth = 0;
        for(var i=0;i<this._items.length;i++){
            var item = this._items[i];
            item.setIdx(i);

            if (this.direction == cc.PageView.Direction.Vertical) {
                this._curItemPos -= item.node.height;
                item.node.y = this._curItemPos;
                this._innerheight += item.node.height;
                this._innerWidth = this.content.width;
            }else {
                item.node.x = this._curItemPos;
                this._curItemPos += item.node.width;
                this._innerWidth += item.node.width;
                this._innerheight = this.content.height;
            }

            this._updateItem(item, item.getIdx());
        }
    }
    getItems():any[]{
        return this._items;
    }
    getCurentItem(){
        var selectedPos = this.getCurrentPageIndex();
        for(var i=0; i<this._items.length; i++){
            var item = this._items[i];
            if(item.getIdx() == selectedPos){
                return item;
            }
        }
        return null;
    }
    scrollToPage(idx:number, timeInSceond:number){
        if(idx < 0 || idx >= this._totalCount){
            return;
        }
        // if(this._curIndex == idx){
        //     //super.scrollToPage(idx, timeInSceond);
        //     super.scrollToPage(idx, timeInSceond);
        //     return;
        // }
        this._curIndex = idx;
        this.updateAllItem(idx);

        super.scrollToPage(this._curIndex, timeInSceond);
    }
    updateAllItem(idx){
        if(idx <= 0){
            idx = 0;
            for(var i=0; i < this._items.length; i++){
                let lastItem = this._items[i];
                let index = idx + i;
                this._updateItem(lastItem, index);
            }
        }else if(idx >= this._totalCount-1){
            for(var i=0; i<this._items.length; i++){
                let lastItem = this._items[this._items.length-1-i];
                let index = idx-i;
                this._updateItem(lastItem, index);
            }
        }else{
            idx--;
            for(var i=0; i < this._items.length; i++){
                let lastItem = this._items[i];
                let index = idx + i;
                this._updateItem(lastItem, index);
            }
        }
    }
    updateItemByID(itemID){
        for(var i=0;i<this._items.length;i++){
            var item = this._items[i];
            if(item.getIdx() == itemID){
                console.log("updateItemByID itemID:"+itemID);
                this._updateItem(item, item.getIdx());
                return;
            }
        }
    }
}
