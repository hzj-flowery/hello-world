import ListViewCellBase from "../ListViewCellBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonCustomListView extends cc.ScrollView {

   private _curItemPos:number = 0;

   private _innerWidth:number = 0;
   private _innerheight:number = 0;

   private _updateItemCallback:any;
   private _selectedCallback:any;
   private _scrollEvent:any;
   private _customCallback:any;

   private _template:cc.Prefab;
   private _templateWidth:number;
   private _templateHeight:number;
   private _direction:number;
   private _spawnCount:number = 0;

   @property()
   stopVertical:boolean = false;

   @property()
   space:number = 0;

    private _items:cc.Node[] = [];
    _enableTimer:boolean = false;

    //#region 重写cc.ScrollView的方法
    // _hasNestedViewGroup(event, captureListeners) {
    //     if (event.eventPhase !== cc.Event.CAPTURING_PHASE) return;
    //     //不阻止out上onTouch事件执行。
    //     return false;
    // }

    removeAllChildren()
    {
        this.content.removeAllChildren();
        this._curItemPos = 0;
        this._innerWidth = this._innerheight = 0;
        this._spawnCount = 0;
        this._items = [];
    }
    pushBackCustomItem(item:cc.Node){
        item.parent = this.content;
        item.setAnchorPoint(0,0);
        var space = this._spawnCount > 0 ? this.space : 0;
        if (this.vertical || this.stopVertical) {
            this._curItemPos -= (item.height + space);
            item.y = this._curItemPos;
            item.active = true;
            this._innerheight += item.height +space;
            this._innerWidth = this.content.width;
        }else {
            item.active = true;
            item.x = this._innerWidth + space;
            this._innerWidth += item.width + space;
            this._innerheight = this.content.height;
        }
    
        var contentSize = this.getInnerContainerSize();
        this.setContentSize(contentSize);
        this._spawnCount++;
        if(this.stopVertical && !this._enableTimer){
            this._enableTimer = true;
            this.scheduleOnce(function () {
                this.enabled = false;
            }.bind(this),0.5);
        }
    }
    getInnerContainerSize():any{
        return cc.size(this._innerWidth,this._innerheight);
    }
    setInnerContainerSize(contentSize){
        this.setContentSize(contentSize);
    }
    setContentSize(contentSize){
        //this.node.setContentSize(contentSize);
        this.content.setContentSize(contentSize);
        if (this.vertical) {
            //this.content.y = contentSize.height;
            //this.scrollToTop();
        }
    }
    setVisible(visible){
        this.node.active = visible;
    }
    setCallback(update, selected, scrollEvent) {
        this._updateItemCallback = update;
        this._selectedCallback = selected;
        this._scrollEvent = scrollEvent;
    }
    setCustomCallback(callback) {
        this._customCallback = callback;
    }
    setTemplate(template, itemWidth?, itemHeight?) {
        this._template = template;
        var widget = cc.instantiate(this._template);
        if(itemWidth && itemHeight){
            widget.setContentSize(itemWidth,itemHeight);
        }
        this.pushBackCustomItem(widget);
    }
    doLayout(){
        var contentSize = this.getInnerContainerSize();
        this.node.setContentSize(contentSize);
        if (this.vertical || this.stopVertical) {
            this.content.y = contentSize.height;
            this.scrollToTop();
        }
    }
    resize(size, exCount) {
        // this._totalCount = size;
        // var exCount = exCount || 2;
        // if (this._direction == ccui.ListViewDirection.vertical) {
        //     this._spawnCount = math.ceil(this._listViewHeight / this._templateHeight) + exCount;
        // } else if (this._direction == ccui.ListViewDirection.horizontal) {
        //     this._spawnCount = math.ceil(this._listViewWidth / this._templateWidth) + exCount;
        // }
        // if (this._spawnCount > this._totalCount) {
        //     this._spawnCount = this._totalCount;
        // }
        // var innerContainerSize = this.getInnerContainerSize();
        // if (this.vertical) {
        //     this._reuseItemOffset = (this._templateHeight + this._spacing) * this._spawnCount;
        //     this._totalRange = this._templateHeight * this._totalCount + (this._totalCount - 1) * this._spacing;
        //     innerContainerSize.height = this._totalRange;
        // } else if (this.horizontal) {
        //     this._reuseItemOffset = (this._templateWidth + this._spacing) * this._spawnCount;
        //     this._totalRange = this._templateWidth * this._totalCount + (this._totalCount - 1) * this._spacing;
        //     innerContainerSize.width = this._totalRange;
        // }
        // this._respawn();
        // this._target.forceDoLayout();
        //this.setInnerContainerSize(innerContainerSize);
        // this._target.addScrollViewEventListener(function (sender, eventType) {
        //     if (eventType == 9) {
        //         this._onUpdate(0);
        //     }
        //     if (this._scrollEvent) {
        //         this._scrollEvent(sender, eventType);
        //     }
        // });
        // this._target.addEventListener(function (sender, eventType) {
        //     if (eventType == 0) {
        //     } else {
        //         var item = this._items[sender.getCurSelectedIndex() + 1];
        //         if (this._selectedCallback) {
        //             this._selectedCallback(item, item.getTag());
        //         }
        //     }
        // });
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
                item.destroy();
            }
        } else if (count < this._spawnCount) {
            var index = this._items.length;
            while (index < this._spawnCount) {
                var widget = cc.instantiate(this._template);
                this.pushBackCustomItem(widget);
                widget.getComponent(ListViewCellBase).setCustomCallback(this._customCallback);
               // this._updateItem(widget, index, index);
                this._items.push(widget);;
                index = index + 1;
            }
        }
    }
    
}
