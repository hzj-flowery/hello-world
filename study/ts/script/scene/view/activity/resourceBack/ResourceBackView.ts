const {ccclass, property} = cc._decorator;

import CommonEmptyListNode from '../../../../ui/component/CommonEmptyListNode'

import CommonFullScreenActivityTitle from '../../../../ui/component/CommonFullScreenActivityTitle'

import CommonTabGroupHorizon from '../../../../ui/component/CommonTabGroupHorizon'
import ActivitySubView from '../ActivitySubView';
import { G_SignalManager, G_Prompt, G_UserData } from '../../../../init';
import { SignalConst } from '../../../../const/SignalConst';
import { handler } from '../../../../utils/handler';
import { Lang } from '../../../../lang/Lang';
import { LogicCheckHelper } from '../../../../utils/LogicCheckHelper';
import { TypeConvertHelper } from '../../../../utils/TypeConvertHelper';
import { DataConst } from '../../../../const/DataConst';
import CommonCustomListViewEx from '../../../../ui/component/CommonCustomListViewEx';

@ccclass
export default class ResourceBackView extends ActivitySubView {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonTabGroupHorizon,
        visible: true
    })
    _tabGroup2: CommonTabGroupHorizon = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listViewTab: CommonCustomListViewEx = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _imageNoTimes: CommonEmptyListNode = null;

    @property(cc.Prefab)
    ResourceBackCell:cc.Prefab = null;

    
    _curSelectTabIndex: number;
    _isPerfect: boolean;
    _datas: any[];
    _signalGetReward: any;

    ctor() {
        this._curSelectTabIndex = 0;
        this._datas = [];
        this._isPerfect = false;
    }
    onCreate() {
        this._updateData();
        this._initListViewTab();
        this._initTab();
    }
    onEnter() {
        this._signalGetReward = G_SignalManager.add(SignalConst.EVENT_ACT_RESOURCE_BACK_AWARD_SUCCESS, handler(this, this._onEventGetAwards));
    }
    onExit() {
        this._signalGetReward.remove();
        this._signalGetReward = null;
    }
    exitModule(){
        //this._listViewTab.clearAll();
    }
    _onEventGetAwards(event, awards) {
        if (awards) {
            G_Prompt.showAwards(awards);
        }
        this._updateData();
        this._refreshView();
    }
    _initTab() {
        var param2 = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            offset: -2,
            textList: [
                Lang.get('lang_activity_resource_back_tab_perfect'),
                Lang.get('lang_activity_resource_back_tab_normal')
            ]
        };
        this._tabGroup2.recreateTabs(param2);
        this._tabGroup2.setTabIndex(0);
    }
    _onTabSelect(index, sender) {
        if (this._curSelectTabIndex == index+1) {
            return;
        }
        this._curSelectTabIndex = index+1;
        this._isPerfect = this._curSelectTabIndex == 1;
        this._refreshView();
    }
    _initListViewTab() {
        this._listViewTab.setTemplate(this.ResourceBackCell);
        this._listViewTab.setCallback(handler(this, this._onListViewTabItemUpdate), handler(this, this._onListViewTabItemSelected));
        this._listViewTab.setCustomCallback(handler(this, this._onListViewTabItemTouch));
    }
    _updateData() {
        this._datas = G_UserData.getActivityResourceBack().getNotBuyItems();
    }
    _refreshView() {
        this._listViewTab.clearAll();
        this._listViewTab.resize(Math.ceil(this._datas.length / 2));
        if (this._datas.length == 0) {
            this._imageNoTimes.node.active = (true);
        } else {
            this._imageNoTimes.node.active = (false);
        }
    }
    _onListViewTabItemUpdate(item, index) {
        var data1 = this._datas[index * 2];
        var data2 = this._datas[index * 2 + 1];
        item.updateUI(data1, data2, this._isPerfect);
    }
    _onListViewTabItemSelected(item, index) {
    }
    _onListViewTabItemTouch(index, params) {
        // console.log("ResourceBackView index:"+index);
        var data = params;
        if (data) {
            var success;
            if (this._isPerfect) {
                success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, data.getGold(), true);
            } else {
                success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, data.getCoin(), true);
            }
            if (success) {
                G_UserData.getActivityResourceBack().c2sActResourceBackAward(data.getId(), this._isPerfect ? 0 : 1);
            }
        }
    }

}
