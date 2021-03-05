import ListViewCellBase from "../ListViewCellBase";

const { ccclass, property } = cc._decorator;

enum ListViewDirection{
    vertical = 1,
    horizontal = 2,
}

@ccclass
export default class CommonCustomListViewNoScroll extends cc.Component {

    @property(cc.Node)
    content:cc.Node = null;

    @property()
    vertical:boolean = true;

    @property()
    horizontal:boolean = true;

    private _curItemPos:number = 0;

    private _innerWidth:number = 0;
    private _innerheight:number = 0;

    private _updateItemCallback:any;
    private _scrollEvent:any;
    private _customCallback:any;

    private _template:cc.Prefab;
    private _templateWidth:number;
    private _templateHeight:number;
    private _spawnCount:number;

    private _items:ListViewCellBase[] = [];
    private _bufferZone:number = 0;
    private _spacing:number = 0;
    private _totalCount:number = 0;

    _listViewHeight:number = 0;
    _listViewWidth:number = 0;
    _reuseItemOffset:number = 0;
    _totalRange:number = 0;
    _lastContentPos:number = 0;
    _touchEnabled:boolean = true;

    _direction:number = 0;

    //#region 重写cc.ScrollView的方法
    // _hasNestedViewGroup(event, captureListeners) {
    //     if (event.eventPhase !== cc.Event.CAPTURING_PHASE) return;
    //     //不阻止out上onTouch事件执行。
    //     return false;
    // }
    
    onInit(){
        
    }

    onLoad(){
        this.updateDirection();
        this._listViewHeight = this.node.height;
        this._listViewWidth = this.node.width;

        // this.scrollEvents = [];
        // var clickEventHandler = new cc.Component.EventHandler();
        // clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        // clickEventHandler.component = 'CommonCustomListViewEx';// 这个是代码文件名
        // clickEventHandler.handler = 'onPageViewEvent';
        // this.scrollEvents.push(clickEventHandler);
    }
    setDirection(type){
        this._direction = type;
    }
    updateDirection(){
        if(this._direction > 0){
            return;
        }
        if (this.vertical){
            this._lastContentPos = this.content.y;
            this._direction = ListViewDirection.vertical;
        }else{
            this._direction = ListViewDirection.horizontal;
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
        this.updateDirection();
        // if(this._direction == ListViewDirection.vertical){
        //     this.scrollToTop();
        // }else{
        //     this.scrollToLeft();
        // }
        
    }
    clearAll(){
        this.removeAllChildren();
        this.updateDirection();
    }
    pushBackCustomItem(item:cc.Node){
        this.updateDirection();
        var comp = item.getComponent(ListViewCellBase);
        comp.onInit();
        this.content.addChild(item);
        //item.setAnchorPoint(0,0);
        if (this._direction == ListViewDirection.vertical) {
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
        if (this._direction == ListViewDirection.vertical){
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
    setCallback(update, selected?, scrollEvent?) {
        this._updateItemCallback = update;
        this._scrollEvent = scrollEvent;
    }
    setCustomCallback(callback) {
        this._customCallback = callback;
    }
    doLayout(){
        var contentSize = this.getInnerContainerSize();
        this.node.setContentSize(contentSize);
        if (this.vertical) {
            this.content.y = contentSize.height;
            this.scrollToTop();
        }else{
            this.content.x = -contentSize.width/2;
        }
    }
    scrollToTop(){

    }
    resize(size, exCount?) {
        this._listViewHeight = this.node.height;
        this._listViewWidth = this.node.width;
        this._totalCount = size;
        var exCount = exCount || 2;
        if (this._direction == ListViewDirection.vertical) {
            this._spawnCount = Math.ceil(this._listViewHeight / this._templateHeight) + exCount;
        } else{
            this._spawnCount = Math.ceil(this._listViewWidth / this._templateWidth) + exCount;
        }
        if (this._spawnCount > this._totalCount) {
            this._spawnCount = this._totalCount;
        }
        var innerContainerSize = this.getInnerContainerSize();
        if (this._direction == ListViewDirection.vertical) {
            this._reuseItemOffset = (this._templateHeight + this._spacing) * this._spawnCount;
            this._totalRange = this._templateHeight * this._totalCount + (this._totalCount - 1) * this._spacing;
            innerContainerSize.height = this._totalRange;
        } else{
            this._reuseItemOffset = (this._templateWidth + this._spacing) * this._spawnCount;
            this._totalRange = this._templateWidth * this._totalCount + (this._totalCount - 1) * this._spacing;
            innerContainerSize.width = this._totalRange;
        }
        this._respawn();
        this.forceDoLayout();
        this.setInnerContainerSize(innerContainerSize);
    }
    onPageViewEvent(sender, eventType){
        if (eventType == cc.ScrollView.EventType.SCROLLING) {
            this._onUpdate();
        }
        if (this._scrollEvent) {
            this._scrollEvent(sender, eventType);
        }
    }
    setTouchEnabled(enable:boolean){
        this._touchEnabled = enable;
        this.updateDirection();
        if(this._direction == ListViewDirection.vertical){
            this.vertical = enable;
        }else{
            this.horizontal = enable;
        }
    }
    setSwallowTouches(enable:boolean){
        this.setTouchEnabled(enable);
    }
    // adaptWithContainerSize(){
    //     // var width = 0;
    //     // var height = 0;
    //     // for(var i=0;i<this.node.childrenCount;i++){
    //     //     var item = this.node.children[i];
    //     //     if(width < item.width){
    //     //         width = item.width;
    //     //     }
    //     // }
    // }

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
                var widget = cc.instantiate(this._template);
                var comp = widget.getComponent(ListViewCellBase);
                comp.onInit();
                comp.setIdx(index);
                this.pushBackCustomItem(widget);
                comp.setCustomCallback(this._customCallback);
                this._updateItem(comp, index);
                this._items.push(comp);;
                index = index + 1;
            }
        }
    }
    setTemplate(template, itemWidth?, itemHeight?) {
        this._template = template;
        this.removeAllChildren();
        var widget = cc.instantiate(template);
        var comp:ListViewCellBase = widget.getComponent(ListViewCellBase);
        comp.onInit();
        var size = widget.getContentSize();
        this._templateWidth = itemWidth || size.width;
        this._templateHeight = itemHeight || size.height;
        if (this._direction == ListViewDirection.vertical) {
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
    checkNeedUpdate(){
        //var offset = this.getScrollOffset();
    }
    getScrollOffset(){
        return cc.v2(0,0);
    }
    getContentPosition(){
        return this.content.position;
    }
    _onUpdate() {
        if(this._items.length <= 0){
            return;
        }
        var scrollOffset = this.getScrollOffset();
        if (this._direction == ListViewDirection.vertical) {
            var isDown = this.getContentPosition().y < this._lastContentPos;
            this._lastContentPos = this.getContentPosition().y;
            if(isDown){
                if(scrollOffset.y < this._bufferZone){
                    return;
                }
                var lastItem = this._items[0];
                if(lastItem.node.y > -scrollOffset.y){
                    return;
                }
                var itemID = lastItem.getIdx();
                if(itemID <= 0){
                    return;
                }
                for(var i=1; i<this._items.length; i++){
                    var curItem = this._items[i];
                    this._items[i] = lastItem;
                    lastItem = curItem;
                }
                this._items[0] = lastItem;
                lastItem.node.y = -itemID * this._bufferZone;
                this._updateItem(lastItem, itemID-1);
            }else{
                if(scrollOffset.y > this._bufferZone * this._totalCount - this._listViewHeight){
                    return;
                }
                var nextItem = this._items[this._items.length-1];
                if(nextItem.node.y+scrollOffset.y < -this._listViewHeight){
                    return;
                }
                var itemID = nextItem.getIdx();
                if(itemID >= this._totalCount-1){
                    return;
                }
                nextItem = this._items[0];
                for(var i=this._items.length-1; i>=0; i--){
                    var curItem = this._items[i];
                    this._items[i] = nextItem;
                    nextItem = curItem;
                }
                nextItem.node.y = -(itemID+2) * this._bufferZone;
                this._updateItem(nextItem, itemID+1);
            }
            
        } else {
            var isRight = this.getContentPosition().x > this._lastContentPos;
            this._lastContentPos = this.getContentPosition().x;
            if(isRight){
                if(scrollOffset.x >= 0){
                    return;
                }
                var lastItem = this._items[0];
                if(lastItem.node.x < -scrollOffset.x){
                    return;
                }
                var itemID = lastItem.getIdx();
                if(itemID <= 0){
                    return;
                }
                for(var i=1; i<this._items.length; i++){
                    var curItem = this._items[i];
                    this._items[i] = lastItem;
                    lastItem = curItem;
                }
                this._items[0] = lastItem;
                lastItem.node.x = (itemID-1) * this._bufferZone;
                this._updateItem(lastItem, itemID-1);
            }else{
                if(-scrollOffset.x > this._bufferZone * this._totalCount - this._listViewWidth){
                    return;
                }
                var nextItem = this._items[this._items.length-1];
                if(nextItem.node.x+scrollOffset.x > this._listViewWidth){
                    return;
                }
                var itemID = nextItem.getIdx();
                if(itemID >= this._totalCount-1){
                    return;
                }
                nextItem = this._items[0];
                for(var i=this._items.length-1; i>=0; i--){
                    var curItem = this._items[i];
                    this._items[i] = nextItem;
                    nextItem = curItem;
                }
                nextItem.node.x = (itemID+1) * this._bufferZone;
                nextItem.setIdx(itemID+1);
                this._updateItem(nextItem, itemID+1);
            }
        }
    }
    _updateItem(item, itemID) {
        item.setIdx(itemID);
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

            if (this._direction == ListViewDirection.vertical) {
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
}
