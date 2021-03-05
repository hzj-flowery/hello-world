import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { handler } from "../../../utils/handler";
import ViewBase from "../../ViewBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChatMiniMsgScrollView extends ViewBase {

    @property({
        type:CommonCustomListViewEx,
        visible: true
    })
    _scrollView:CommonCustomListViewEx = null;

    @property(cc.Prefab)
    ChatMsgItemCell:cc.Prefab = null;

    waitItems:any[] = [];


    _mainView: any;
    _dataList: any;
    _listSize: any;
    _channelId: any;
    _showItems: cc.Component[];
    _maxShowCount: any;
    _template: any;
    _itemGap: any;
    _enableScrollToLatestMsg: boolean;

    ctor(mainView, listSize, channelId, maxShowCount, dataList, template, itemGap) {
        this._mainView = mainView;
        this._dataList = dataList;
        this._listSize = listSize;
        this._channelId = channelId;
        this._showItems = [];
        this.waitItems = [];
        this._maxShowCount = maxShowCount;
        this._template = template;
        this._itemGap = itemGap || 6;
        this._enableScrollToLatestMsg = true;
        this._initUI();
    }
    onCreate(){
        let func = handler(this,this.addMsgDelay);
        this.unschedule(func);
        this.schedule(func, 0.1);
    }
    onEnter(){

    }
    onExit(){
        this.unschedule(this.scheduleCreateTemplate);
    }
    _createTemplate(...param):cc.Component {
        var view;
        if(this._template){
            view = cc.instantiate(this._template).getComponent(ListViewCellBase);
        }else{
            view = cc.instantiate(this.ChatMsgItemCell).getComponent(ListViewCellBase);
        }
        view.ctor(param);
        return view;
    }
    addNewMsg(chatMsgUnit) {
        var item = this._createTemplate(chatMsgUnit);
        var curDate = new Date();
        let curTime = curDate.getTime();
        this.waitItems.push({time:(curTime+200),item:item});
        //var lastY = this._scrollView.getInnerContainer().y;
        // if (!this._enableScrollToLatestMsg && lastY < 0) {
        //     var size = this._scrollView.content.getContentSize();
        //     var y = lastY - item.node.height - this._itemGap;
        //     y = Math.min(y, 0);
        //     y = Math.max(y, -(size.height - this._listSize.height));
        //     this._scrollView.content.y = (y);
        // } else {
        //     this._scrollView.scrollToBottom();
        // }
    }
    addMsgDelay(){
        if(this.waitItems.length <= 0){
            return;
        }

        var curDate = new Date();
        let curTime = curDate.getTime();
        var count = 0;
        for(var i=0;i<this.waitItems.length;i++){
            var data = this.waitItems[i];
            if(data.time <= curTime){
                count++;
                var item = data.item;
                item.updateItemSize();
                if (this._showItems.length == this._maxShowCount) {
                    var [lastItem] = this._showItems.splice(0,1);
                    lastItem.node.destroy()
                }
                if (item.node.getParent() == null) {
                    this._scrollView.pushBackCustomItem(item.node);
                    this._scrollView.scrollToBottom();
                }
                this._showItems.push(item);
                break;
            }else{
                break;
            }
        }
        if(count > 0){
            this.waitItems.splice(0,count);
        }
    }
    _initUI() {
        // var node = new cc.Node();
        // node.setAnchorPoint(0,0);
        // var content = new cc.Node();
        // node.addChild(content);
        // content.setAnchorPoint(0,1);
        // content.setPosition(0,this._listSize.height)
        // this._scrollView = node.addComponent(CommonCustomListViewEx);
        // this._scrollView.content = content;
        // //this._scrollView.setBounceEnabled(false);
        // this._scrollView.vertical = true;
        // this._scrollView.horizontal = false;
        // this._scrollView.setTouchEnabled(true);
        // //this._scrollView.setScrollBarEnabled(false);
        //this._scrollView.node.setPosition(cc.v2(-this._listSize.width/2, -this._listSize.height/2));
        //this._scrollView.setInnerContainerSize(cc.size(this._listSize.width, this._listSize.height));
        // this.node.addChild(this._scrollView.node);
        this._scrollView.setDirection(1);
        this.refreshData(this._dataList);
    }
    _refreshItemsPos() {
        var currentHeigth = 0;
        for (var i = this._showItems.length; i>=1; i--) {
            var item = this._showItems[i-1];
            item.node.setPosition(0, currentHeigth);
            currentHeigth = currentHeigth + item.node.height + (i == 1 && 0 || this._itemGap);
        }
        var finalHeight = currentHeigth > this._listSize.height && this._listSize.height || currentHeigth;
        //this._scrollView.setBounceEnabled(currentHeigth > this._listSize.height);
        this._scrollView.setInnerContainerSize(cc.size(this._listSize.width, currentHeigth));
        this._scrollView.node.setContentSize(cc.size(this._listSize.width, finalHeight));
        if (currentHeigth < this._listSize.height) {
            var placePosY = 0;
            for (var i = 1; i<=this._showItems.length; i++) {
                var item = this._showItems[i-1];
                item.node.setPosition(0, this._listSize.height - item.node.height + placePosY);
                placePosY = -item.node.height - this._itemGap + placePosY;
            }
            this._scrollView.node.setContentSize(cc.size(this._listSize.width, this._listSize.height));
        }
    }
    refreshData(newNsgList) {
        this._scrollView.removeAllChildren();
        this._dataList = newNsgList;
        this._showItems = [];
        // var curDate = new Date();
        // let curTime = curDate.getTime();
        this._curRunPos = 1;
        // for (var i = 1; i<=this._dataList.length; i++) {
        //     var data = this._dataList[i-1];
        //     var item = this._createTemplate(data, this._listSize.width);
        //     this.waitItems.push({time:(curTime+200),item:item});
        // };
        this.unschedule(this.scheduleCreateTemplate);
        this.schedule(this.scheduleCreateTemplate);
    }
    private _curRunPos:number = 0;
    private scheduleCreateTemplate():void{
        if(this._curRunPos>this._dataList.length)
        {
            this.unschedule(this.scheduleCreateTemplate);
            return;
        }
        var curDate = new Date();
        let curTime = curDate.getTime();
        var data = this._dataList[this._curRunPos-1];
        var item = this._createTemplate(data, this._listSize.width);
        this.waitItems.push({time:(curTime+200),item:item});
        this._curRunPos++;
    }
    enableScroll() {
        this._scrollView.setTouchEnabled(true);
        //this._scrollView.setScrollBarEnabled(true);
    }
    enableScrollToLatestMsg(enable) {
        this._enableScrollToLatestMsg = enable;
    }
    readAllMsg() {
        this._scrollView.scrollToBottom();
    }

}
