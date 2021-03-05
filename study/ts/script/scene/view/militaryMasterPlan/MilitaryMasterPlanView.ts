
import { DataConst } from "../../../const/DataConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_Prompt, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonListItem from "../../../ui/component/CommonListItem";
import CommonListView from "../../../ui/component/CommonListView";
import CommonNormalLargePop from "../../../ui/component/CommonNormalLargePop";
import CommonTabGroupScrollVertical from "../../../ui/component/CommonTabGroupScrollVertical";
import PopupBase from "../../../ui/PopupBase";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { handler } from "../../../utils/handler";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { MilitaryMasterPlanHelper } from "./MilitaryMasterPlanHelper";


const { ccclass, property } = cc._decorator;
@ccclass
export class MilitaryMasterPlanView extends PopupBase {
    @property({
        type: CommonTabGroupScrollVertical,
        visible: true
    })
    _tabGroup: CommonTabGroupScrollVertical = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _tabListView: CommonListView = null;
    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonPop: CommonNormalLargePop = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _cellPrefab: cc.Prefab = null;



    //当前显示的table数据
    private _mainTabGroupData: Array<any>;
    //第一次选中的索引
    private _tabIndex: number = 0;
    private _enterIndex: number = -1;
    private _cellTime: number = 0;
    private _updateTimeHandle: Function;
    private _sysHandleGetInfor: any;
    private _sysHandleBuyInforLany: any;
    onCreate() {
        this._sysHandleGetInfor = G_SignalManager.add(SignalConst.EVENT_GetSuperLevelGiftInfo, handler(this, this._s2cSuperLevelGift));
        this._sysHandleBuyInforLany = G_SignalManager.add(SignalConst.EVENT_BuySuperLevelGift, handler(this, this._s2cEventPurchass));
    }
    onEnter() {

        this._commonPop.addCloseEventListener(handler(this, this.onClickClose));
        G_UserData.getMilitaryMasterPlan().c2sSuperLevelGiftInfor();
    }
    public setInitData(selectIndex: number): void {
        this._enterIndex = selectIndex;
    }

    private _s2cSuperLevelGift(event, data): void {
        this._mainTabGroupData = data;
        if (this._updateTimeHandle)
            this.scheduleOnce(this._updateTimeHandle)
        this._updateTimeHandle = null;
        this._cellTime = 0;
        this._updateTimeHandle = this._onUpdateTime.bind(this);
        this.schedule(this._updateTimeHandle, 1);

        this._initTabGroup();
    }
    onClickClose(): void {
        this.close();
    }
    onExit() {
        if (this._updateTimeHandle)
            this.unschedule(this._updateTimeHandle)
        this._updateTimeHandle = null;
        if (this._sysHandleGetInfor)
            this._sysHandleGetInfor.remove();
        this._sysHandleGetInfor = null;
        if (this._sysHandleBuyInforLany)
            this._sysHandleBuyInforLany.remove();
        this._sysHandleBuyInforLany = null;
        G_SignalManager.dispatch(SignalConst.EVENT_JUN_SHI_MIAO_JI_EXIT, {});
    }
    private _onUpdateTime() {
        this._cellTime++;
    }
    /**
     * 刷新小红点
     */
    _refreshRedPoint() {
        // var actListData = this._getMainTabGroupData();
        // for (var k in actListData) {
        //     var v = actListData[k];
        //     var [_, newTagShow, redPointShow] = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ACTIVITY, 'subActivityRP', [
        //         v.type,
        //         v.id
        //     ]);
        //     this._tabGroup.setRedPointByTabIndex(parseInt(k) + 1, redPointShow, new cc.Vec2(0.9, 0.85));
        //     var tabItem = this._tabGroup.getTabItem(parseInt(k) + 1);
        //     if (tabItem) {
        //         tabItem.imageTag.node.active = (newTagShow);
        //     }
        // }
    }
    private _getMainTabGroupData() {
        return this._mainTabGroupData;
    }
    private _configTableName = {
        [MilitaryMasterPlanHelper.Type_HeroBreakResult]: "武将突破",
        [MilitaryMasterPlanHelper.Type_Instrument]: "神兵进阶",
        [MilitaryMasterPlanHelper.Type_HeroZhaoMu]: "武将招募",
        [MilitaryMasterPlanHelper.Type_HeroMerge]: "武将合成"
    }
    private _curType: Array<number> = [];
    private _initTabGroup() {
        var tabNameList = [];
        this._curType = []
        for (let i = 0; i < this._mainTabGroupData.length; i++) {
            let data = this._mainTabGroupData[i];
            if (data && data[0] && data[0]["type"]) {
                tabNameList.push(this._configTableName[data[0]["type"]]);
                this._curType.push(data[0]["type"]);
            }
        }

        if (this._enterIndex != -1) {
            let selectIndex = this._curType.indexOf(this._enterIndex);
            this._tabIndex = selectIndex >= 0 ? selectIndex : 0;
        }
        var param = {
            rootNode: this._tabGroup._scrollViewTab,
            callback: handler(this, this._onTabSelect),
            containerStyle: 2,
            tabIndex: this._tabIndex,
            textList: tabNameList
        };
        this._tabGroup.recreateTabs(param);
        this._refreshRedPoint();
        this._onTabSelect(this._tabIndex);

        this._enterIndex = -1;
    }
    /**
     * 切换table
     * @param tabIndex 
     */
    private _onTabSelect(tabIndex) {
        this._tabIndex = tabIndex;
        this._refreshModuleUI();
        return true;
    }
    /**
     * 获取当前页面的数据
     * @param tabIndex 
     */
    private _getTabDataByIndex(tabIndex?): any[] {
        var mainTabGroupData = this._getMainTabGroupData();
        if (!mainTabGroupData) {
            return null;
        }
        if (tabIndex == null) {
            tabIndex = this._tabIndex;
        }
        if (tabIndex < 0) {
            return null;
        }
        return mainTabGroupData[tabIndex];
    }

    //刷新UI
    private _refreshModuleUI() {
        this._updateListView(this._tabIndex);
    }
    _updateListView(index) {
        var actUnitdata = this._getTabDataByIndex();
        if (!actUnitdata && this._mainTabGroupData.length == 0) {
            //列表空了啊
            this._tabListView.scrollView.content.removeAllChildren();
            return;
        }
        this._tabListView.spawnCount = 5;
        this._tabListView.init(cc.instantiate(this._cellPrefab), handler(this, this._onItemUpdate),
            handler(this, this._onItemSelected), handler(this, this._onItemTouch))
        this._tabListView.setData(actUnitdata.length, 0, true, true);
    }

    //更新
    _onItemUpdate(item: CommonListItem, index) {
        var itemList = this._getTabDataByIndex();
        var data = itemList[index];
        item.updateItem(index, data ? [data, this._cellTime] : null);
    }
    refreshView() {
    }
    //选中
    _onItemSelected(item, index) {
        var itemList = this._getTabDataByIndex();
        //获取当前要购买的信息
        var itemData = itemList[index];
        var size = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
        if (size < itemData.cost) {
            //哦嚯，玉璧不足，购买失败
            G_Prompt.showTip(Lang.get("militaryMasterPlan_no_enough_money"));
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_JADE2);
        }
        else {
            //可以购买
            G_UserData.getMilitaryMasterPlan().c2sBuySuperLevelGift(itemData.id, itemData.award_id);
        }
    }
    private _s2cEventPurchass(event, awardList): void {
        //弹出恭喜获得界面
        PopupGetRewards.showRewards(awardList, () => {
            if (this._mainTabGroupData.length <= 0) {
                this.close();
                return;
            }
        });
    }
    _onItemTouch(index, touchTag) {

    }





}