const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { FragmentData } from '../../../data/FragmentData';
import { G_Prompt, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData, G_WaitingMask } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import CommonEmptyTipNode from '../../../ui/component/CommonEmptyTipNode';
import CommonFullScreenListView from '../../../ui/component/CommonFullScreenListView';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { InstrumentDataHelper } from '../../../utils/data/InstrumentDataHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import PopupSellFragment from '../sell/PopupSellFragment';

 
enum InstrumentConst
{
    FLAG = 3,

    //神兵显示时获取范围的定义
    INSTRUMENT_RANGE_TYPE_1 = 1,//全范围
    INSTRUMENT_RANGE_TYPE_2 = 2,//阵位上的宝物

    //神兵培养方式的定义
    INSTRUMENT_TRAIN_ADVANCE = 1,//进阶
    INSTRUMENT_TRAIN_LIMIT = 2,// --界限

    //神兵列表显示类型
    INSTRUMENT_LIST_TYPE1 = 1,// --宝物
    INSTRUMENT_LIST_TYPE2 = 2,// --宝物碎片

    //神兵界限消耗物品的Key定义
    INSTRUMENT_LIMIT_COST_KEY_1 = 1,
    INSTRUMENT_LIMIT_COST_KEY_2 = 2,

    //神兵界限突破最大等级
    INSTRUMENT_LIMIT_MAX_LEVEL = 1,
}

@ccclass
export default class InstrumentListView extends ViewBase {

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: CommonFullScreenListView,
        visible: true
    })
    _fileNodeBg: CommonFullScreenListView = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonSale:cc.Button = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView:CommonCustomListViewEx = null;

    @property({
        type: CommonTabGroup,
        visible: true
    })
    _nodeTabRoot:CommonTabGroup = null;


    @property({
        type: CommonEmptyTipNode,
        visible: true
    })
    _fileNodeEmpty: CommonEmptyTipNode = null;


    _instrumentListCell: cc.Prefab = null;

    _instrumentFragListCell:cc.Prefab = null;
    
    private _selectTabIndex:number = 0;
    private _datas:any[] = [];
    private _count:number = 0;
    private _signalMerageItemMsg:any;
    private _signalRedPointUpdate:any;
    private _signalSellObjects:any;
    private _loadPreabIndex:number = 0;

    private loadIndex:number = 0;
    private scheduleHandler:any;

   // private _tabListView:TabScrollView;

    onCreate() {
        this.node.setContentSize(G_ResolutionManager.getDesignCCSize());
        this.node.setPosition(-this.node.width / 2, -this.node.height / 2);
        this._topbarBase.setImageTitle("txt_sys_com_shenbing");
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._initTabGroup();
        this._loadPreabIndex = 0;
        this.loadPreabView();
        UIHelper.addEventListener(this.node,this._buttonSale,'InstrumentListView','onButtonSaleClicked');
    }
    onEnter() {
        this._signalMerageItemMsg = G_SignalManager.add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(this, this._onSyntheticFragments));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalSellObjects = G_SignalManager.add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(this, this._onSellFragmentsSuccess));
        this._selectTabIndex = 0;
        this._nodeTabRoot.setTabIndex(0);
    }
    onExit() {
        this._signalMerageItemMsg.remove();
        this._signalMerageItemMsg = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        if (this._signalSellObjects) {
            this._signalSellObjects.remove();
            this._signalSellObjects = null;
        }
    }

    loadPreabView(){
        this._loadPreabIndex++;
        let path = '';
        if(this._loadPreabIndex == 1){
            G_WaitingMask.showWaiting(true);
            path = 'InstrumentListCell';
        }else if(this._loadPreabIndex == 2){
            path = 'InstrumentFragListCell';
        }else{
            return;
        }

        var realPath: string = 'prefab/instrument/' + path;
        let preLoadRes:any[] = [];
        preLoadRes.push(realPath);
        let callback = handler(this, this.onLoadPreabView);
        cc.resources.load(preLoadRes, (err, resource) => {
            var prefab = cc.resources.get(realPath);
            callback && callback(prefab);
        });
    }
    onLoadPreabView(preab){
        if(this._loadPreabIndex == 1){
            this._instrumentListCell = preab;
            this.loadPreabView();
        }else if(this._loadPreabIndex == 2){
            this._instrumentFragListCell = preab;
            this._nodeTabRoot.setTabIndex(0);
            G_WaitingMask.showWaiting(false);
        }
    }
    private _updateView() {
        console.log('InstrumentListView _updateView');
        this._fileNodeBg.setTitle(Lang.get('instrument_list_title_' + this._selectTabIndex));
        var count1 = G_UserData.getInstrument().getInstrumentTotalCount();
        var count2 = InstrumentDataHelper.getInstrumentListLimitCount();
        this._fileNodeBg.setCount(Lang.get('common_list_count', {
            count1: count1,
            count2: count2
        }));
        this._fileNodeBg.showCount(this._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE1);
        this._buttonSale.node.active = (this._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE2);
        this._initData();
        if (this._count == 0) {
            //this._listView.removeAllItem();
            var emptyType = this._getEmptyType();
            this._fileNodeEmpty.updateView(emptyType);
            this._fileNodeEmpty.node.active = true;
            this._listView.node.active = false;
        } else {
            var template;
            if (this._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE2) {
                template = this._instrumentFragListCell;
            }else{
                template = this._instrumentListCell;
            }

            this._listView.node.active = true;
            this._listView.setTemplate(template);
            this._listView.setCallback(handler(this, this._onItemUpdate));
            this._listView.setCustomCallback(handler(this, this._onItemTouch));
            this.loadIndex = 0;
            this.unInstallTimer();
            this.scheduleHandler = handler(this, this.loadListView);
            this.schedule(this.scheduleHandler, 0.1);
            //this._listView.resize(this._count);

            // this._listView.init(template, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
            // this._listView.setData(this._count, this._selectTabIndex);
            this._fileNodeEmpty.node.active = (false);
        }
    }
    loadListView(){
        this.loadIndex++;
        if(this.loadIndex >= this._count){
            this.unInstallTimer();
            this.loadIndex = this._count;
        }
        this._listView.resize(this.loadIndex, 2, false);
    }
    unInstallTimer(){
        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
    }
    private _initData() {
        this._datas = [];
        if (this._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE1) {
            this._datas = G_UserData.getInstrument().getListDataBySort();
        } else if (this._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE2) {
            this._datas = G_UserData.getFragments().getFragListByType(4, FragmentData.SORT_FUNC_COMMON);
        }
        this._count = Math.ceil(this._datas.length / 2);
    }
    private _onItemUpdate(item, index) {
        var startIndex = index * 2;
        var endIndex = startIndex + 1;
        var itemLine = [];
        if (this._datas.length > 0) {
            for (var i = startIndex; i <= endIndex && i < this._datas.length; i++) {
                var itemData = this._datas[i];
                itemLine.push(itemData);
            }
            if (itemLine.length <= 0) {
                itemLine = null;
            }
            item.updateUI(index, itemLine);
        }
    }
    private _onItemSelected(item, index) {
    }
    private _onItemTouch(index, t) {
        var index = index * 2 + t;
        var data = this._datas[index-1];
        if (this._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE1) {
            var result:any[] = LogicCheckHelper['funcIsOpened'](FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1);
            var isOpen = result[0];
            var des = result[1];
            if (!isOpen) {
                G_Prompt.showTip(des);
                return;
            }
            G_SceneManager.showScene('instrumentDetail', data, InstrumentConst.INSTRUMENT_RANGE_TYPE_1);
        } else if (this._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE2) {
            var itemId = data.getId();
            UIPopupHelper.popupFragmentDlg(itemId);
        }
    }
    private _initTabGroup() {
        // var scrollViewParam = {
        //     template: InstrumentListCell,
        //     updateFunc: handler(this, this._onItemUpdate),
        //     selectFunc: handler(this, this._onItemSelected),
        //     touchFunc: handler(this, this._onItemTouch)
        // };
        // if (this._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE2) {
        //     scrollViewParam.template = InstrumentFragListCell;
        // }
        //this._tabListView = new TabScrollView(this._listView, scrollViewParam);
        // this._listView.itemTemplate = null;
        if (this._nodeTabRoot) {
            this._initNodeTab();
        }
        // if (this._tabGroup2) {
        //     this._initGroupTab();
        // }
    }
    private _initGroupTab() {
        var tabNameList = [];
        tabNameList.push(Lang.get('instrument_list_tab_1'));
        tabNameList.push(Lang.get('instrument_list_tab_2'));

        var param2 = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            offset: -2,
            textList: tabNameList
        };
        // this._tabGroup2.recreateTabs(param2);
        // this._tabGroup2.setTabIndex(1);
    }
    private _initNodeTab() {
        var tabNameList = [];
        tabNameList.push(Lang.get('instrument_list_tab_1'));
        tabNameList.push(Lang.get('instrument_list_tab_2'));
        var param = {
            callback: handler(this, this._onTabSelect),
            //brightTabItemCallback: handler(this, this._onRightTabItemCallback),
            textList: tabNameList
        };
        this._nodeTabRoot.recreateTabs(param);
        //this._nodeTabRoot.setTabIndex(0);
    }
    private _onTabSelect(index, sender){
        index += 1;
        if(this._loadPreabIndex < 2){
            return;
        }
        if (index == this._selectTabIndex) {
            return false;
        }
        this._selectTabIndex = index;
        //this._updateListView();
        this._updateView();
        //this._refreshRedPoint();
        return true;
    }
    private _onRightTabItemCallback(tabItem,enable){
        var textWidget = tabItem.textWidget;
        if(enable){
            textWidget.color = new cc.Color(182,101,17,255);
        }else{
            textWidget.color = new cc.Color(184,201,238,255);
        }
    }
    private _getEmptyType() {
        var emptyType = null;
        if (this._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE1) {
            emptyType = 7;
        } else if (this._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE2) {
            emptyType = 8;
        }
      //assert((emptyType, 'InstrumentListView _selectTabIndex is wrong = %d'.format(this._selectTabIndex));
        return emptyType;
    }
    _onSyntheticFragments(id, message) {
        if (!this.node.active) {
            return;
        }

        var fragId = message['id'];
        var itemSize = message['num'];
        if (fragId && fragId > 0) {
            var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragId);
            //var PopupGetRewards = new (require('PopupGetRewards'))();
            var awards = [
                {
                    type: itemParam.cfg.comp_type,
                    value: itemParam.cfg.comp_value,
                    size: itemSize
                }
            ];
            PopupGetRewards.showRewards(awards);
            this._updateView();
        }
    }
    _onEventRedPointUpdate(event, funcId, param) {
        if (funcId == FunctionConst.FUNC_INSTRUMENT_LIST) {
            this._refreshRedPoint();
        }
    }
    _refreshRedPoint() {
        var redPointShow = G_UserData.getFragments().hasRedPoint({ fragType: 4 });
        if (this._nodeTabRoot) {
            this._nodeTabRoot.setRedPointByTabIndex(InstrumentConst.INSTRUMENT_LIST_TYPE2, redPointShow);
        }
        // if (this._tabGroup2) {
        //     this._tabGroup2.setRedPointByTabIndex(InstrumentConst.INSTRUMENT_LIST_TYPE2, redPointShow);
        // }
    }
    onButtonSaleClicked() {
        if (this._datas && this._datas.length == 0) {
            G_Prompt.showTip(Lang.get('lang_sellfragment_fragment_empty'));
            return;
        }
        UIPopupHelper.popupSellFragment(PopupSellFragment.INSTRUMENT_FRAGMENT_SELL);
    }
    _onSellFragmentsSuccess() {
        this._updateView();
        this._refreshRedPoint();
    }
}
