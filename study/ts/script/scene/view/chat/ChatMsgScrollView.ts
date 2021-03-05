const { ccclass, property } = cc._decorator;

import { ChatConst } from '../../../const/ChatConst';
import { G_UserData } from '../../../init';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { handler } from '../../../utils/handler';
import { table } from '../../../utils/table';
import ViewBase from '../../ViewBase';
import ChatSystemMsgItemCell from './ChatSystemMsgItemCell';
import { KvPairs } from '../../../data/KvPairs';


class ItemData {
    constructor(cp:cc.Component,msg:string,time:number) {
        this.cp = cp;
        this.msg = msg;
        this.time = time;
    }
    cp: cc.Component;
    msg:string;
    time:number;
    used: boolean = false;
    isEqual(msg:string,time:number):boolean{
        if(msg==this.msg&&time==this.time)
        {
            return true;
        }
        return false;
    }
}

export  class ChatItemPool {
    constructor() {
        this.clear();
    }
    private static _instance: ChatItemPool;
    public static get Instance(): ChatItemPool {
        if (!this._instance)
            this._instance = new ChatItemPool();
        return this._instance;
    }
    private ChatSystemMsgItemCell: cc.Prefab;
    private ChatMsgRightItemCell: cc.Prefab;
    private ChatMsgItemCell: cc.Prefab;
    private _isRegister: boolean = false;
    public register(cell1, cell2, cell3): void {
        if (this._isRegister) return;
        this.ChatSystemMsgItemCell = cell1;
        this.ChatMsgRightItemCell = cell2;
        this.ChatMsgItemCell = cell3;
        this._isRegister = true;
    }

    private _cellType1: Array<ItemData>=[];
    private _cellType2: Array<ItemData>=[];
    private _cellType3: Array<ItemData>=[];

    borrowItem(type:number,msg:string,time:number,ctorData:any): cc.Component {
        var cellA: Array<ItemData> = this["_cellType" + type];
        if (!cellA) {
            console.log("未找到相关的item--", type);
            return;
        }
        var result = null;;
        for (var j = 0; j < cellA.length; j++) {
            var data = cellA[j];
            if (data.isEqual(msg,time)&&data.used == false&&!data.cp.node.parent) {
                data.used = true;
                result = data.cp;
                break;
            }
        }
        if (!result) {
            result = this.produceItem(type);
            (result as any).ctor(ctorData);
            cellA.push(new ItemData(result,msg,time));
        }
        return result;
    }

    isSaveItem(type:number,msg:string,time:number,ctorData:any):boolean{
        var cellA: Array<ItemData> = this["_cellType" + type];
        if (!cellA) {
            console.log("未找到相关的item--", type);
            return false;
        }
        var result = false;;
        for (var j = 0; j < cellA.length; j++) {
            var data = cellA[j];
            if (data.isEqual(msg,time)&&data.used == false&&!data.cp.node.parent) {
                result = true;
                break;
            }
        }
        return result;
    }
    returnItem(node:cc.Node):void{
        for (var type = 1; type <= 3; type++) {
            var cellA: Array<ItemData> = this["_cellType" + type];
            for (var j = 0; j < cellA.length; j++) {
                var data = cellA[j];
                if(data.cp.node==node)
                {
                    data.cp.node.removeFromParent(true);
                    data.cp.node.destroy();
                    data.used = false;
                    cellA.splice(j,1);
                    break;
                }
            }
        }
    }
    reset(): void {
        for (var type = 1; type <= 3; type++) {
            var cellA: Array<ItemData> = this["_cellType" + type];
            for (var j = 0; j < cellA.length; j++) {
                var data = cellA[j];
                if(data.cp.node)
                {
                    data.cp.node.removeFromParent(false);
                    data.used = false;
                }
                else
                {
                    console.log("重置节点失败 自动清理掉所有缓存-----");
                    this.clear();
                    break;
                }
            }
        }
    }
    clear():void{
        for (var type = 1; type <= 3; type++) {
            var cellA: Array<ItemData> = this["_cellType" + type];
            for (var j = 0; j < cellA.length; j++) {
                var data = cellA[j];
                if(data.cp.node)
                {
                    data.cp.node.removeFromParent(true);
                    data.cp.node.destroy();
                    data.used = false;
                }
            }
        }
        this._cellType1 = [];
        this._cellType2 = [];
        this._cellType3 = [];
    }
    private produceItem(type): cc.Component {
        if (type == 1) {
            return (cc.instantiate(this.ChatSystemMsgItemCell) as cc.Node).getComponent(ChatSystemMsgItemCell);
        }
        else if (type == 2) {
            return (cc.instantiate(this.ChatMsgRightItemCell) as cc.Node).getComponent(ListViewCellBase)
        }
        else if (type == 3) {
            return (cc.instantiate(this.ChatMsgItemCell) as cc.Node).getComponent(ListViewCellBase);
        }
    }
}

@ccclass
export default class ChatMsgScrollView extends ViewBase {

    @property(cc.Prefab)
    ChatMsgItemCell: cc.Prefab = null;

    @property(cc.Prefab)
    ChatSystemMsgItemCell: cc.Prefab = null;

    @property(CommonCustomListViewEx)
    scrollView: CommonCustomListViewEx = null;

    @property(cc.Prefab)
    ChatMsgRightItemCell: cc.Prefab = null;

    _mainView: any;
    _listSize: any;
    _channelId: any;
    _maxShowCount: any;
    _dataList: any[];
    //这个数组记录了加入到content上节点的次序
    //索引越小越先被加入
    _showItems: cc.Component[];
    _template: any;
    _itemGap: any;
    _lastScrollX: any;
    _isUserCanSee: boolean;

    waitItems: any[] = [];
    preWaitItems: any[] = [];
    ctor(mainView, listSize, channelId, maxShowCount, dataList, template, itemGap?) {

        ChatItemPool.Instance.register(this.ChatSystemMsgItemCell, this.ChatMsgRightItemCell, this.ChatMsgItemCell);
        this._mainView = mainView;
        this._listSize = listSize;
        this._channelId = channelId;
        this._maxShowCount = maxShowCount;
        this._dataList = this.clone(dataList);
        this._showItems = [];
        this._template = template;
        this._itemGap = itemGap || 14;
        this._lastScrollX = null;
        this._isUserCanSee = false;
        this._initUI();
    }
    onCreate() {

    }
    onEnter() {

    }

    update() {

    }

    onDisable() {
        if (this._handlerNormal)
            this.unschedule(this._handlerNormal);
        if (this._preLoadCallFunc)
            this.unschedule(this._preLoadCallFunc);
        if (this.refreDataHandle)
            this.unschedule(this.refreDataHandle);
        this.waitItems = [];
        this.preWaitItems = [];
        ChatItemPool.Instance.reset();
    }

    onExit(){

    }
    private startPre(): void {
        //拿到已知数据的高度，计算总的数据高度
        this.preWaitItems = []
        for (var j = 0; j < this.waitItems.length; j++) {
            this.preWaitItems[j] = this.waitItems[j];
        }
        if (this._dataList.length < 8 && this._dataList.length >= 0) {
            //走正常的加载路线
            this.startNormal();
        }
        else if (this._dataList.length >= 8) {
            this.teshuHandle(1500);
        }
    }
    private teshuHandle(totalH: number): void {
        this.scrollView.content.height = totalH;
        this.scrollView["_innerheight"] = totalH;
        //运行到此特殊处理结束
        //异步创建 
        var step = this.preWaitItems.length - 1;
        this._preLoadCallFunc = handler(this, function () {
            if (step < 0) {
                this.preWaitItems.splice(0, this.preWaitItems.length);
                this.preWaitItems = [];

                //特殊处理结束
                this.unschedule(this._preLoadCallFunc);
                //走正常的加载路线
                this.startNormal();
                return;
            }
            this.addTeShuMsg(this.preWaitItems[step]);
            step--;
        })
        this.schedule(this._preLoadCallFunc);
    }
    private _preLoadCallFunc: any;
    //重新设置一下所有的消息位置和content大小
    private resetContentAndMsgPos() {
        //所有item总的高度
        var totalH = 0;
        for (var j = 0; j < this._showItems.length; j++) {
            totalH = totalH + this._showItems[j].node.height;
        }
        this.scrollView.content.height = totalH;
        this.scrollView["_innerheight"] = totalH;
        this.scrollView.content.y = totalH;
        this.scrollView["_lastContentPos"] = this.scrollView.content.y;

        this._showItems.sort(function(a:cc.Component,b:cc.Component):number{
            return a.node.y - b.node.y;
        });

        for (var j = 0; j < this._showItems.length; j++) {
            if (j == 0) {
                this._showItems[j].node.y = 0 - totalH;
            }
            else {
                this._showItems[j].node.y = this._showItems[j - 1].node.y + this._showItems[j - 1].node.height
            }
        }
        this.scrollView["_curItemPos"] = -totalH;
    }
    private addTeShuMsg(data: any): void {
        let nowDate = new Date();
        let nowTime = nowDate.getTime();
        var chaDif = data.time - nowTime
        if (chaDif <= 0) {
            let item = data.item;
            if (this._showItems.length >= this._maxShowCount) {
                //移除最老的数据
                this.removeShowItem();
                return;
            }
            var comp = item.getComponent(ListViewCellBase);
            if (!comp) {
                comp = item.addComponent(ListViewCellBase);
            }
            comp.onInit();
            if (item.node.getParent() == null)
                this.scrollView.content.addChild(item.node);
            if (this._showItems.length == 0) {
                item.node.y = 0 - this.scrollView.content.height;
            }
            else {
                var lastNode = this._showItems[this._showItems.length - 1];
                lastNode["updateItemSize"]();
                item.node.y = lastNode.node.y + lastNode.node.height;
            }
            this._showItems.push(item);
            if (data.isChannelVisible || data.isSelf) {
                this._setVisibleMsgReaded();
            } else if (data.isChannelVisible) {
                this.readMsgsInScreen();
            }
            this.deletePreWaitItems(data);
        }
        this.resetContentAndMsgPos();
    }

    private _handlerNormal: any;
    private startNormal(): void {
        if (this._handlerNormal)
            this.unschedule(this._handlerNormal);
        this._handlerNormal = handler(this, this.addNewMsgDelay);
        this.schedule(this._handlerNormal, 0.1);
    }
    //删除预先处理的item
    private deletePreWaitItems(dataNew: any): void {
        for (var j = 0; j < this.waitItems.length; j++) {
            var data = this.waitItems[j];
            if (dataNew.item.node == data.item.node) {
                this.waitItems.splice(j, 1);
                break;
            }
        }
    }

    clone(src) {
        var list = [];
        for (let k in src) {
            var v = src[k];
            table.insert(list, v);
        }
        return list;
    }
    _createTemplate(...param): cc.Component {
        if (param[0].getSysMsg() != null) {
            var view1 = this.getItemCell(1,param[0].getSysMsg(),param[0].getTime(),param);
            return view1;
        }
        var chatMsgData = param[0];
        var listWidth = param[1];
        var isLeft = !chatMsgData.getSender().isSelf();
        var isVoice = chatMsgData.isVoice();
        var template = this.ChatMsgItemCell;
        if (isVoice || isLeft) {
            var view3 = this.getItemCell(3,param[0].getContent(),param[0].getTime(),param);
            return view3;
        } else {
            var view2 = this.getItemCell(2,param[0].getContent(),param[0].getTime(),param);
            return view2;
        }
    }
    _analysisTemplate(...param): boolean {
        if (param[0].getSysMsg() != null) {
            return ChatItemPool.Instance.isSaveItem(1,param[0].getSysMsg(),param[0].getTime(),param);
        }
        var chatMsgData = param[0];
        var listWidth = param[1];
        var isLeft = !chatMsgData.getSender().isSelf();
        var isVoice = chatMsgData.isVoice();
        var template = this.ChatMsgItemCell;
        if (isVoice || isLeft) {
            return ChatItemPool.Instance.isSaveItem(3,param[0].getContent(),param[0].getTime(),param);
        } else {
            return ChatItemPool.Instance.isSaveItem(2,param[0].getContent(),param[0].getTime(),param);
        }
    }
    //获取消息单次累加的值
    getMsgItemAddCount(sourceList):number{
        var ret = 10;
        var length = sourceList.length;
        var existCount:number = 0;
        for(var j = 0;j<length;j++)
        {
             if(this._analysisTemplate(sourceList[j],this._listSize.width))
             existCount++;
        }

        var needNewCount = length - existCount;
         
        if(needNewCount<5)
        {
            console.log("当前需要创建的对象小于5--",needNewCount);
            return 10;
        }
        else if(needNewCount>5&&needNewCount<10)
        {
            console.log("当前需要创建的对象大于5小于10--",needNewCount);
            return 8;
        }
        else if(needNewCount>10&&needNewCount<20)
        {
            console.log("当前需要创建的对象大于10小于20--",needNewCount);
            return 5;
        }
        else
        {
            console.log("当前需要创建的对象太多了啊--",needNewCount);
            return 1;
        }


    }

    //获取itemCell
    private getItemCell(type: number,msg:string,time:number,ctorData:any): cc.Component {
        return ChatItemPool.Instance.borrowItem(type,msg,time,ctorData);
    }
    addNewMsg(chatMsgUnit, isChannelVisible) {
        table.insert(this._dataList, chatMsgUnit);
        var item = this._createTemplate(chatMsgUnit, this._listSize.width);
        let isSelf = chatMsgUnit.getSender().isSelf();
        var nowDate = new Date();
        var nowTime = nowDate.getTime() + 200;
        this.waitItems.push({ time: chatMsgUnit.getTime(), item: item, isChannelVisible: isChannelVisible, isSelf: isSelf });
    }
    private removeShowItem():void{
        var deleteNumber = 0;
        var minNumber = 0;
        for(var j =1;j<this._showItems.length;j++)
        {
            if(this._showItems[deleteNumber].node.y<this._showItems[j].node.y)
            {
                deleteNumber = j;
            }
            if(this._showItems[minNumber].node.y>this._showItems[j].node.y)
            {
                minNumber = j;
            }
        }
        var [lastItem] = this._showItems.splice(deleteNumber, 1);
        ChatItemPool.Instance.returnItem(lastItem.node);
        this._dataList.splice(0, 1);
        this.resetContentAndMsgPos();
    }
    /**
     * scrollView
     * anchor(0,1)
     * 添加一个item,放在这个位置（已经添加的items的高度之和，取负值，这个是自上而下的高度增长，y值最大为0，之后y坐标依次是，n*height）
     * 简单的说，这个content的坐标是不会发生变化的，变化的是他的尺寸，尺寸一直往上增加，这个滑动列表始终显示最底
     */
    addNewMsgDelay() {
        var count = 0;
        for (var i = 0; i < this.waitItems.length; i++) {
            var data = this.waitItems[i];
            let nowDate = new Date();
            let nowTime = nowDate.getTime();
            if (data.time <= nowTime) {
                if (this._showItems.length == this._maxShowCount) {
                    this.removeShowItem();
                }
                count++;
                let item = data.item;
                if (item.updateItemSize) {
                    item.updateItemSize();
                }
                if (item.node.getParent() == null) {
                    this.scrollView.pushBackCustomItem(item.node);
                }
                
                this._showItems.push(item);
                
                var isBottom = -item.node.y >= this._listSize.height;
                if (data.isChannelVisible && isBottom || data.isSelf) {
                    this.scrollView.scrollToBottom();
                    this._setVisibleMsgReaded();
                } else if (data.isChannelVisible) {
                    this.readMsgsInScreen();
                }
            } else {
                break;
            }
            break;
        }
        this.waitItems.splice(0, count);
    }
    _initUI() {
        this.scrollView.setDirection(1);
        if(this._dataList.length>0)
        this.refreshData(this._dataList);
    }
    private refreDataHandle: any;
    refreshData(newNsgList, scrollToBottom?) {
        this.scrollView.removeAllChildren(false);
        ChatItemPool.Instance.reset();
        this._dataList = this.clone(newNsgList);
        this._showItems = [];
        var nowDate = new Date();
        var nowTime = nowDate.getTime() + 200;
        if (this.refreDataHandle)
            this.unschedule(this.refreDataHandle);
        
        if(this._dataList.length>this._maxShowCount)
        {
            this._dataList.splice(0,this._dataList.length-this._maxShowCount);
        }
        var pos = 1;
        var step = this.getMsgItemAddCount(this._dataList);
        this.refreDataHandle = function () {
            for (var j = pos; j < pos + step; j++) {
                if (j > this._dataList.length) {
                    this.unschedule(this.refreDataHandle);
                    if (scrollToBottom) {
                        this.readAllMsg();
                    }
                    this.startPre();
                    return;
                }
                var data = this._dataList[j - 1];
                var item = this._createTemplate(data, this._listSize.width);
                if (item.node.getParent() == null) {
                    let isSelf = data.getSender().isSelf();
                    this.waitItems.push({ time: data.getTime(), item: item, isChannelVisible: true, isSelf: isSelf });
                }
            }
            pos = pos + step;
        }.bind(this)
        this.schedule(this.refreDataHandle);
    }

    //更新节点是否可见
    _updateItemVisible(): void {

    }
    _setVisibleMsgReaded() {
        var y = this.scrollView.getInnerContainer().y;
        var size = this.scrollView.getInnerContainer();
        var showHeight = size.y + y;
        var maxIndex = this._getMaxIndexInLengthRange(showHeight);
        if (maxIndex) {
            this._readMsgsBeforeIndex(maxIndex);
        }
    }
    _getMaxIndexInLengthRange(height) {
        var maxIndex = null;
        var placePosY = 0;
        for (var i = 1; i <= this._showItems.length; i++) {
            var item = this._showItems[i - 1];
            if (placePosY + 26 >= height) {
                maxIndex = i - 1;
                break;
            }
            placePosY = item.node.height + this._itemGap + placePosY;
        }
        if (!maxIndex) {
            maxIndex = this._showItems.length;
        }
        if (maxIndex <= 0) {
            return null;
        }
        return maxIndex;
    }
    _readMsgsBeforeIndex(maxIndex) {
        var chatMsgList = [];
        for (var k = 1; k <= this._dataList.length; k++) {
            var v = this._dataList[k - 1];
            if (k <= maxIndex && v.getStatus() == ChatConst.MSG_STATUS_UNREAD) {
                table.insert(chatMsgList, v);
            }
        }
        //logWarn(' -----------');
        G_UserData.getChat().readChatMsgDatas(chatMsgList);
        //logWarn(' -----------');
    }
    readMsgsInScreen() {
        var showHeight = this._listSize.height;
        var maxIndex = this._getMaxIndexInLengthRange(showHeight);
        if (maxIndex) {
            this._readMsgsBeforeIndex(maxIndex);
        }
    }
    readAllMsg() {
        this.scrollView.scrollToBottom();
        this._setVisibleMsgReaded();
    }
    setChannelVisible(visible) {
        this._isUserCanSee = visible;
    }
    getChatMsgList() {
        return this._dataList;
    }
}
