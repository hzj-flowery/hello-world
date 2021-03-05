const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import TreasureConst from '../../../const/TreasureConst';
import { FragmentData } from '../../../data/FragmentData';
import { G_Prompt, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData, G_WaitingMask } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonEmptyTipNode from '../../../ui/component/CommonEmptyTipNode';
//import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import CommonTabGroupVertical from '../../../ui/component/CommonTabGroupVertical';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { TreasureDataHelper } from '../../../utils/data/TreasureDataHelper';
import { Slot } from '../../../utils/event/Slot';
import { handler } from '../../../utils/handler';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import PopupSellFragment from '../sell/PopupSellFragment';
import { TreasureTrainHelper } from '../treasureTrain/TreasureTrainHelper';

@ccclass
export default class TreasureListView extends ViewBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _fileNodeBg: CommonFullScreen = null;

    @property({
        type: CommonTabGroupVertical,
        visible: true
    })
    _nodeTabRoot: CommonTabGroupVertical = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonSale: cc.Button = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: CommonEmptyTipNode,
        visible: true
    })
    _fileNodeEmpty: CommonEmptyTipNode = null;


    TreasureListCell: cc.Prefab = null;

    TreasureFragListCell: cc.Prefab = null;

    _tabGroup2;

    _selectTabIndex: number = -1;

    _datas;
    _count;

    _signalMerageItemMsg: Slot;
    _signalRedPointUpdate: Slot;
    _signalSellObjects: Slot;

    loadIndex:number = 0;
    scheduleHandler:any;

    loadPreabIndex:number = 0;

    init() {
        this.node.setContentSize(G_ResolutionManager.getDesignCCSize());
        this.node.setPosition(-this.node.width / 2, -this.node.height / 2);
        this._topbarBase.setImageTitle('txt_sys_com_baowu');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this.loadPreabIndex = 0;
        this._initTabGroup();
        UIHelper.addEventListener(this.node, this._buttonSale, 'TreasureListView', '_onButtonSaleClicked');
    }

    onCreate(){
        this.init();
    }
    onEnter(){
        this._signalMerageItemMsg = G_SignalManager.add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(this, this._onSyntheticFragments));
	    this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalSellObjects = G_SignalManager.add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(this, this._onSellFragmentsSuccess));

        this._selectTabIndex = -1;
        this._nodeTabRoot.setTabIndex(0);
    }
    onExit(){
        this._signalMerageItemMsg.remove();
        this._signalMerageItemMsg = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        if (this._signalSellObjects) {
            this._signalSellObjects.remove();
            this._signalSellObjects = null;
        }
    }
    loadPreab(){
        this.loadPreabIndex++;
        let path = '';
        if(this.loadPreabIndex == 1){
            G_WaitingMask.showWaiting(true);
            path = 'TreasureListCell';
        }else if(this.loadPreabIndex == 2){
            path = 'TreasureFragListCell';
        }else{
            return;
        }

        var realPath: string = 'prefab/treasure/' + path;
        let preLoadRes:any[] = [];
        preLoadRes.push(realPath);
        let callback = handler(this, this.onLoadPreab);
        cc.resources.load(preLoadRes, (err, resource) => {
            var prefab = cc.resources.get(realPath);
            callback && callback(prefab);
        });
    }
    onLoadPreab(prefab){
        if(this.loadPreabIndex == 1){
            this.TreasureListCell = prefab;
            this.loadPreab();
        }else if(this.loadPreabIndex == 2){
            this.TreasureFragListCell = prefab;
            this.initListView();
            G_WaitingMask.showWaiting(false);
        }
    }
    _initTabGroup() {
        if (this._nodeTabRoot) {
            this._initNodeTab();
        }
        this._nodeTabRoot.setTabIndex(0);
        this.loadPreab();
    }
    initListView(){
        var template = this.TreasureListCell;
        if (this._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE2) {
            template = this.TreasureFragListCell;
        }
        this._listView.setTemplate(template);
        this._listView.setCallback(handler(this, this._onItemUpdate));
        this._listView.setCustomCallback(handler(this, this._onItemTouch));
        this._nodeTabRoot.setTabIndex(0);
    }

    _initNodeTab() {
        var tabNameList = [];
        tabNameList.push(Lang.get('treasure_list_tab_1'));
        tabNameList.push(Lang.get('treasure_list_tab_2'));
        var param = {
            callback: handler(this, this._onTabSelect),
            textList: tabNameList
        };
        this._nodeTabRoot.recreateTabs(param);
    }

    _onTabSelect(index, sender) {
        if(this.loadPreabIndex < 2){
            return true;
        }
        index += 1;
        if (index == this._selectTabIndex) {
            return false;
        }
        this._selectTabIndex = index;
        this._updateView();
        this._refreshRedPoint();
        return true;
    }

    _updateListView() {
        var template = this.TreasureListCell;
        if (this._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE2) {
            template = this.TreasureFragListCell;
        }
        this._listView.removeAllChildren();
        this._listView.setTemplate(template);
        //this._listView.resize(this._count);
        this.unInstallTimer();
        this.loadIndex = 0;
        this.scheduleHandler = handler(this, this.loadListView);
        this.schedule(this.scheduleHandler, 0.1);
        console.log("TreasureListView _updateListView");
    }
    loadListView(){
        this.loadIndex++;
        if(this.loadIndex >= this._count){
            this.loadIndex = this._count;
            this.unInstallTimer();
        }
        this._listView.resize(this.loadIndex, 2, false);
    }
    unInstallTimer(){
        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
    }
    _updateView() {
        this._fileNodeBg.setTitle(Lang.get('treasure_list_title_' + this._selectTabIndex));
        var count1 = G_UserData.getTreasure().getTreasureTotalCount();
        var count2 = TreasureDataHelper.getTreasureListLimitCount();
        this._fileNodeBg.setCount(Lang.get('common_list_count', {
            count1: count1,
            count2: count2
        }));
        this._fileNodeBg.showCount(this._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE1);
        this._buttonSale.node.active = (this._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE2);
        this._initData();

        if (this._count == 0) {
            //    this._tabListView.hideAllView();
            this._listView.node.active = false;
            var emptyType = this._getEmptyType();
            this._fileNodeEmpty.updateView(emptyType);
            this._fileNodeEmpty.node.active = (true);
        } else {
            // var scrollViewParam = {
            //     template: EquipmentListCell,
            //     updateFunc: handler(this, this._onItemUpdate),
            //     selectFunc: handler(this, this._onItemSelected),
            //     touchFunc: handler(this, this._onItemTouch)
            // };
            // if (this._selectTabIndex == EquipConst.EQUIP_LIST_TYPE2) {
            //     scrollViewParam.template = EquipFragListCell;
            // }
            this._listView.node.active = true;
            this._updateListView();
            //this._tabListView.updateListView(this._selectTabIndex, this._count, scrollViewParam);
            this._fileNodeEmpty.node.active = (false);            
        }
    }

    _getEmptyType() {
        var emptyType = null;
        if (this._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE1) {
            emptyType = 5;
        } else if (this._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE2) {
            emptyType = 6;
        }
      //assert((emptyType, 'EquipmentListView _selectTabIndex is wrong = %d'.format(this._selectTabIndex));
        return emptyType;
    }

    _initData() {
        this._datas = [];
        if (this._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE1) {
            this._datas = G_UserData.getTreasure().getListDataBySort();
        } else if (this._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE2) {
            this._datas = G_UserData.getFragments().getFragListByType(3, FragmentData.SORT_FUNC_COMMON);
        }
        this._count = Math.ceil(this._datas.length / 2);
    }

    _onItemUpdate(item, index, type) {
        index = index * 2;
        item.updateUI(this._datas[index], this._datas[index + 1]);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
        var index = index * 2 + t;
        var data = this._datas[index];
        if (this._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE1) {
            if (TreasureTrainHelper.isOpen(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1) == false) {
                return;
            }
            G_SceneManager.showScene('treasureTrain', data, TreasureConst.TREASURE_TRAIN_STRENGTHEN, TreasureConst.TREASURE_RANGE_TYPE_1);
        } else if (this._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE2) {
            var itemId = data.getId();
            UIPopupHelper.popupFragmentDlg(itemId);
        }
    }

    _onEventRedPointUpdate(event, funcId, param) {
        if (funcId == FunctionConst.FUNC_TREASURE_LIST) {
            this._refreshRedPoint()
        }
    }

    _refreshRedPoint() {
        var redPointShow = G_UserData.getFragments().hasRedPoint({fragType: 3})
        if (this._nodeTabRoot) {
            this._nodeTabRoot.setRedPointByTabIndex(TreasureConst.TREASURE_LIST_TYPE2, redPointShow)
        }
        if (this._tabGroup2) {
            this._tabGroup2.setRedPointByTabIndex(TreasureConst.TREASURE_LIST_TYPE2, redPointShow)
        }
    }

    _onSyntheticFragments(id, message) {
        if (!this.node.active) {
            return
        }
        var fragId = message["id"]
        var itemSize = message["num"]
        if (fragId && fragId > 0) {
            var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragId)
            var awards = [
                {
                    type: itemParam.cfg.comp_type,
                    value: itemParam.cfg.comp_value,
                    size: itemSize
                }
            ]
            PopupGetRewards.showRewards(awards)

            this._updateView()
        }
    }

    _onButtonSaleClicked() {
        if (this._datas && this._datas.length == 0) {
            G_Prompt.showTip(Lang.get('lang_sellfragment_fragment_empty'));
            return;
        }
        UIPopupHelper.popupSellFragment(PopupSellFragment.TREASURE_FRAGMENT_SELL);
    }

    _onSellFragmentsSuccess() {
        this._updateView()
        this._refreshRedPoint()
    }
}
