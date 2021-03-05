const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground'
import CommonListView from '../../../ui/component/CommonListView';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import { G_SignalManager, G_UserData, G_SceneManager, G_Prompt, G_ResolutionManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { assert } from '../../../utils/GlobleFunc';
import { stringUtil } from '../../../utils/StringUtil';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import CommonEmptyTipNode from '../../../ui/component/CommonEmptyTipNode';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { FragmentData } from '../../../data/FragmentData';
import { EquipDataHelper } from '../../../utils/data/EquipDataHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import EquipConst from '../../../const/EquipConst';
import { EquipTrainHelper } from '../equipTrain/EquipTrainHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { Slot } from '../../../utils/event/Slot';
import PopupSellFragment from '../sell/PopupSellFragment';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import ViewBase from '../../ViewBase';


@ccclass
export default class EquipmentListView extends ViewBase {

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
        type: CommonTabGroup,
        visible: true
    })
    _nodeTabRoot: CommonTabGroup = null;

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
        type: CommonEmptyTipNode,
        visible: true
    })
    _fileNodeEmpty: CommonEmptyTipNode = null;


    @property({
        type: CommonListView,
        visible: true
    })
    _listView1: CommonListView = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listView2: CommonListView = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    EquipmentListCell: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    EquipFragListCell: cc.Prefab = null;


    _tabGroup2;

    _listView:CommonListView;
    _index = 0;
    _signalMerageItemMsg;
    _signalRedPointUpdate;
    _signalSellObjects;
    _selectTabIndex = 1;
    _datas;
    _count;
    _signalEquipClearSuccess: Slot;

    protected onCreate() {
        this.setSceneSize();
        this._topbarBase.setImageTitle('txt_sys_com_zhuangbei');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._initTabGroup();
    }

    protected onEnter() {
        this._signalMerageItemMsg = G_SignalManager.add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(this, this._onSyntheticFragments));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalSellObjects = G_SignalManager.add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(this, this._onSellFragmentsSuccess));
        this._signalEquipClearSuccess = G_SignalManager.add(SignalConst.EVENT_EQUIP_CLEAR_SUCCESS, handler(this, this._onSellFragmentsSuccess));
        var curTab = this._selectTabIndex;
        this._selectTabIndex = -1;
        this._nodeTabRoot.setTabIndex(curTab -1);
    }
    protected onExit() {
        this._signalMerageItemMsg.remove();
        this._signalMerageItemMsg = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        if (this._signalSellObjects) {
            this._signalSellObjects.remove();
            this._signalSellObjects = null;
        }
        this._signalEquipClearSuccess.remove();
        this._signalEquipClearSuccess = null;
    }
    _onEventRedPointUpdate(event, funcId, param) {
        if (funcId == FunctionConst.FUNC_EQUIP_LIST) {
            this._refreshRedPoint();
        }
    }
    _refreshRedPoint() {
        var redPointShow = G_UserData.getFragments().hasRedPoint({ fragType: 2 });
        if (this._nodeTabRoot) {
            this._nodeTabRoot.setRedPointByTabIndex(EquipConst.EQUIP_LIST_TYPE2, redPointShow);
        }
        if (this._tabGroup2) {
            this._tabGroup2.setRedPointByTabIndex(EquipConst.EQUIP_LIST_TYPE2, redPointShow);
        }
    }
    _initTabGroup() {
        if (this._nodeTabRoot) {
            this._initNodeTab();
        }
        if (this._tabGroup2) {
            this._initGroupTab();
        }
    }
    _initNodeTab() {
        var tabNameList = [];
        tabNameList.push(Lang.get('equipment_list_tab_1'));
        tabNameList.push(Lang.get('equipment_list_tab_2'));
        var param = {
            callback: handler(this, this._onTabSelect),
            textList: tabNameList
        };
        this._nodeTabRoot.recreateTabs(param);
    }
    _initGroupTab() {
        var tabNameList = [];
        tabNameList.push(Lang.get('equipment_list_tab_1'));
        tabNameList.push(Lang.get('equipment_list_tab_2'));
        var param2 = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            offset: -2,
            textList: tabNameList
        };
        this._tabGroup2.recreateTabs(param2);
        this._tabGroup2.setTabIndex(1);
    }
    _onTabSelect(index, sender) {
        index += 1;
        if (index == this._selectTabIndex) {
            return false;
        }
        this._selectTabIndex = index;
        this._updateListView();
       
        this._refreshRedPoint();
        return true;
    }

    _updateListView() {
        var scrollViewParam = {
            template: this.EquipmentListCell,
            // updateFunc: handler(this, this._onItemUpdate),
            // selectFunc: handler(this, this._onItemSelected),
            // touchFunc: handler(this, this._onItemTouch)
        };
        if (this._selectTabIndex == EquipConst.EQUIP_LIST_TYPE2) {
            scrollViewParam.template = this.EquipFragListCell;
            this._listView = this._listView2;
            this._listView1.scrollView.node.active = false;
        }else {
            this._listView = this._listView1;
            this._listView2.scrollView.node.active = false;
        }
        this._listView.scrollView.node.active = true;
        if (!this._listView.updateFunc) {
            this._listView.init(scrollViewParam.template, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
            this._updateView(true);
        }else {
            this._updateView();
        }
    }
    
    _updateView(resetList:boolean = false, delay:boolean = true) {
        this._fileNodeBg.setTitle(Lang.get('equipment_list_title_' + this._selectTabIndex));
        var count1 = G_UserData.getEquipment().getEquipTotalCount();
        var count2 = EquipDataHelper.getEquipListLimitCount();
        this._fileNodeBg.setCount(Lang.get('common_list_count', {
            count1: count1,
            count2: count2
        }));
        this._fileNodeBg.showCount(this._selectTabIndex == EquipConst.EQUIP_LIST_TYPE1);
        this._buttonSale.node.active = (this._selectTabIndex == EquipConst.EQUIP_LIST_TYPE2);
        this._initData();
        if (this._count == 0) {
            //    this._tabListView.hideAllView();
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
            //    this._tabListView.updateListView(this._selectTabIndex, this._count, scrollViewParam);
            this._fileNodeEmpty.node.active = (false);
        }
        this._listView.setData(this._count, this._selectTabIndex, resetList, resetList&&delay ? true : false);
    }
    _getEmptyType() {
        var emptyType = null;
        if (this._selectTabIndex == EquipConst.EQUIP_LIST_TYPE1) {
            emptyType = 3;
        } else if (this._selectTabIndex == EquipConst.EQUIP_LIST_TYPE2) {
            emptyType = 4;
        }
      console.assert(emptyType, 'EquipmentListView _selectTabIndex is wrong = %d');
        return emptyType;
    }
    _initData() {
        this._datas = [];
        if (this._selectTabIndex == EquipConst.EQUIP_LIST_TYPE1) {
            this._datas = G_UserData.getEquipment().getListDataBySort();
        } else if (this._selectTabIndex == EquipConst.EQUIP_LIST_TYPE2) {
            this._datas = G_UserData.getFragments().getFragListByType(2, FragmentData.SORT_FUNC_COMMON);
        }
        this._count = Math.ceil(this._datas.length / 2);
    }

    _onItemUpdate(item, index, type) {
        var startIndex = index * 2 + 0;
        var endIndex = startIndex + 1;
        var itemLine = [];
        if (this._datas.length > 0) {
            for (var i = startIndex; i <= endIndex && i < this._datas.length; i++) {
                var itemData = this._datas[i];
                itemLine.push(itemData);
            }
        }
        if (itemLine.length <= 0) {
            itemLine = null;
        }
        item.updateItem(index, itemLine, type);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
        var index = index * 2 + t;
        var data = this._datas[index];
        if (this._selectTabIndex == EquipConst.EQUIP_LIST_TYPE1) {
            if (EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1) == false) {
                return;
            }
            G_SceneManager.showScene('equipTrain', data, EquipConst.EQUIP_TRAIN_STRENGTHEN, EquipConst.EQUIP_RANGE_TYPE_1);
        } else if (this._selectTabIndex == EquipConst.EQUIP_LIST_TYPE2) {
            var itemId = data.getId();
            UIPopupHelper.popupFragmentDlg(itemId);
        }
    }
    _onSyntheticFragments(id, message) {
        if (!this.node.active) {    //!this.isVisible()
            return;
        }
        var fragId = message['id'];
        var itemSize = message['num'];
        if (fragId && fragId > 0) {
            var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragId);
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
    onButtonSaleClicked() {
        if (this._datas && this._datas.length == 0) {
            G_Prompt.showTip(Lang.get('lang_sellfragment_fragment_empty'));
            return;
        }
        UIPopupHelper.popupSellFragment(PopupSellFragment.EQUIPMENT_FRAGMENT_SELL);
    }
    _onSellFragmentsSuccess() {
        this._updateView();
        this._refreshRedPoint();
    }
}