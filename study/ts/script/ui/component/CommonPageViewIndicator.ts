
const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonPageViewIndicator extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _checkBox: cc.Node = null;
   
   private _indicatorViews:Array<cc.Node> = [];
   private _currPageIndex:number = 0;
   private _itemSize:any;
   private _eventListen:any;
   private _pageView:cc.PageView;
   public static  DEFAULT_GAP = 10;

   onLoad() {
    this._currPageIndex = 0;
    this._indicatorViews = [];
    this._init();
}
private _init() {
    this._indicatorViews.push(this._checkBox);
    this._itemSize = this._checkBox.getContentSize();
}
refreshPageData(pageView:cc.PageView, count, currPageIndex, itemGap, eventListen?) {
    if (this._pageView != pageView) {
        this._pageView = pageView;
        this._eventListen = eventListen;
        if (this._pageView) {
            this._pageView.node.on(cc.Node.EventType.TOUCH_END,this.onPageEvent,this);
        }
    }
    count = count || 0;
    currPageIndex = currPageIndex || 0;
    itemGap = itemGap || CommonPageViewIndicator.DEFAULT_GAP;
    for (var k = 0;k<this._indicatorViews.length;k++) {
        var v = this._indicatorViews[k];
        if (k != 0) {
            v.destroy();
        }
    }
    this._indicatorViews = [];
    this._indicatorViews.push(this._checkBox);
    for (var k = 2; k <= count; k += 1) {
        var checkBox = this._createCloneNode(k, this._checkBox);
        checkBox.active = (false);
        this.node.addChild(checkBox);
        this._indicatorViews.push(checkBox);
    }
    for (var k = 0;k<this._indicatorViews.length;k++) {
        var v = this._indicatorViews[k];
        v.name = (k).toString();
         v.on(cc.Node.EventType.TOUCH_END,this._onClickCheckBox,this);
    }
    var totalW = (count - 1) * itemGap + count * this._itemSize.width;
    var startX = -totalW * 0.5 + this._itemSize.width * 0.5;
    for (var k = 1; k <= count; k += 1) {
        var v = this._indicatorViews[k-1];
        v.x = (startX);
        v.active = (true);
        this._brightItem(v, false);
        startX = startX + this._itemSize.width + itemGap;
    }
    this.setCurrentPageIndex(currPageIndex);
}
setCurrentPageIndex(currPageIndex) {
    var oldPageIndex = this._currPageIndex;
    this._currPageIndex = currPageIndex || 0;
    this._brightItem(this._indicatorViews[oldPageIndex], false);
    this._brightItem(this._indicatorViews[this._currPageIndex], true);
}
_brightItem(item:cc.Node, bright) {
    if (!item) {
        return;
    }
    item.getComponent(cc.Toggle).isChecked = (bright);
}
_onClickCheckBox(event) {
    // if (event == 1) {
    //     this._brightItem(checkBox, true);
    // } else {
        if (this._pageView) {
            var idx = parseInt(event.target.name) || 0;
            if (idx != this._currPageIndex) {
                this._pageView.setCurrentPageIndex(idx);
                if (this._eventListen) {
                    this._eventListen(this._pageView, cc.PageView.EventType.PAGE_TURNING);
                }
                this.setCurrentPageIndex( idx);
            }else{
                event.target.getComponent(cc.Toggle).isChecked = false;
            }
        }
    // }
}
onPageEvent(sender, eventType) {
    if (this._eventListen) {
        this._eventListen(sender, eventType);
    }
    if (eventType == cc.PageView.EventType.PAGE_TURNING && this._pageView == sender) {
        var pageIndex = sender.getCurrentPageIndex();
        this.setCurrentPageIndex(pageIndex);
    }
}
_createCloneNode(index, cloneNode:cc.Node) {
    var instNode = cc.instantiate(cloneNode);
    instNode.name = (index).toString();
    return instNode;
}
setPageViewIndex(index) {
    if (index!=null && index < this._indicatorViews.length) {
        if (this._pageView) {
            this._pageView.scrollToPage(index,0);
            if (this._eventListen) {
                this._eventListen(this._pageView,cc.PageView.EventType.PAGE_TURNING);
            }
        }
        this.setCurrentPageIndex(index);
    }
}


}