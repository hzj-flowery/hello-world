import { G_UserData, G_SignalManager, G_ResolutionManager, G_AudioManager, G_ServerTime, Colors, G_Prompt, G_SceneManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { Path } from "../../../utils/Path";
import { AudioConst } from "../../../const/AudioConst";
import { handler } from "../../../utils/handler";
import { TenJadeAuctionConfigHelper } from "./TenJadeAuctionConfigHelper";
import { TenJadeAuctionConst } from "../../../const/TenJadeAuctionConst";
import { Lang } from "../../../lang/Lang";
import TenJadeAuctionCell from "./TenJadeAuctionCell";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { table } from "../../../utils/table";
import CommonTabGroup from "../../../ui/component/CommonTabGroup";
import CommonListView from "../../../ui/component/CommonListView";
import ViewBase from "../../ViewBase";
import UIHelper from "../../../utils/UIHelper";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import UIActionHelper from "../../../utils/UIActionHelper";
import CommonMainMenu from "../../../ui/component/CommonMainMenu";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import { RedPointHelper } from "../../../data/RedPointHelper";
import PopupAlert from "../../../ui/PopupAlert";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { TenJadeAuctionDataHelper } from "./TenJadeAuctionDataHelper";
import ListView from "../recovery/ListView";

const { ccclass, property } = cc._decorator;
var ITEM_WIDTH = 200;
var TAB_ITEM_WIDTH = 178;
@ccclass
export default class TenJadeAuctionView extends ViewBase {
    @property({ type: CommonTabGroup, visible: true })
    _nodeTabRoot: CommonTabGroup = null;
    @property({ type: ListView, visible: true })
    _listView: ListView = null;
    @property({ type: cc.Node, visible: true })
    _btnBid: cc.Node = null;
    @property({ type: cc.Label, visible: true })
    _labelTimeTitle: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _labelFocusTip: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _labelEndTip: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _labelTime: cc.Label = null;
    @property({ type: CommonMainMenu, visible: true })
    _btnMail: CommonMainMenu = null;
    @property({ type: CommonTopbarBase, visible: true })
    _topbarBase: CommonTopbarBase = null;
    @property({ type: cc.Prefab, visible: true })
    _cellTemplate:  cc.Prefab = null;

    _curIndex: any;
    _lastItem: any;
    _selectTabIndex: number;
    _tagItemList: any[];
    _tagNameList: any[];
    _curAuctionInfo: any;
    _listViewList: {};
    _bResizeArray: boolean[];
    _bDefaultListViewFirstShow: boolean;
    _signalAuctionUpdateItem: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _signalAuctionAddFocus: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _signalRedPointUpdate: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _signalAuctionGetInfo: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _signalAuctionAddPrice: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _dataList: any[];
    _widthMax: any;
    _scheduleTimeHandler: any;

    static waitEnterMsg(callBack) {
        function onMsgCallBack() {
            callBack();
        }
        var auctionInfo = G_UserData.getTenJadeAuction().getCurAuctionInfo();
        if (auctionInfo) {
            G_UserData.getTenJadeAuction().requestCurAuctionItem();
        } else {
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TEN_JADE_AUCTION);
        }
        var signal = G_SignalManager.add(SignalConst.EVENT_CROSS_AUCTION_GET_INFO, onMsgCallBack);
        return signal;
    }
    ctor(tabIndex?) {
        this._curIndex = null;
        this._lastItem = null;
        this._selectTabIndex = 0;
        this._tagItemList = [];
        this._tagNameList = [];
        this._curAuctionInfo = null;
        this._listViewList = {};
        this._bResizeArray = [
            true,
            true,
            true,
            true
        ];
        this._bDefaultListViewFirstShow = true;

        this.node.name = ('TenJadeAuctionView');
    }
    onCreate() {
        var param = G_SceneManager.getViewArgs('tenJadeAuction');
        this.ctor();
        this.setSceneSize();
        this._initUI();
        this._initListView();
    }
    onEnter() {
        var curAuctionInfo = G_UserData.getTenJadeAuction().getCurAuctionInfo();
        if (curAuctionInfo) {
            G_UserData.getTenJadeAuction().c2sGetCrossAuctionInfo(curAuctionInfo.getAuction_id());
        } else {
            this._showAuctionEndView();
            return;
        }
        this._updateData();
       // this._updateView();
        this._updateTabList();
        this._startTimer();
        G_AudioManager.playMusicWithId(AudioConst.SOUND_TEN_JADE_AUCTION_BGM);
        this._signalAuctionUpdateItem = G_SignalManager.add(SignalConst.EVENT_CROSS_AUCTION_UPDATE_ITEM, handler(this, this._onEventAuctionUpdateItem));
        this._signalAuctionAddFocus = G_SignalManager.add(SignalConst.EVENT_CROSS_AUCTION_ADD_FOCUS, handler(this, this._onEventAuctionAddFocus));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalAuctionGetInfo = G_SignalManager.add(SignalConst.EVENT_CROSS_AUCTION_GET_INFO, handler(this, this._onEventAuctionGetInfo));
        this._signalAuctionAddPrice = G_SignalManager.add(SignalConst.EVENT_CROSS_AUCTION_ADD_PRICE, handler(this, this._onEventAuctionAddPrice));
    }
    onExit() {
        if (this._signalAuctionUpdateItem) {
            this._signalAuctionUpdateItem.remove();
            this._signalAuctionUpdateItem = null;
        }
        if (this._signalAuctionAddFocus) {
            this._signalAuctionAddFocus.remove();
            this._signalAuctionAddFocus = null;
        }
        if (this._signalRedPointUpdate) {
            this._signalRedPointUpdate.remove();
            this._signalRedPointUpdate = null;
        }
        if (this._signalAuctionGetInfo) {
            this._signalAuctionGetInfo.remove();
            this._signalAuctionGetInfo = null;
        }
        if (this._signalAuctionAddPrice) {
            this._signalAuctionAddPrice.remove();
            this._signalAuctionAddPrice = null;
        }
        this._stopTimer();
        if (this._curAuctionInfo) {
            G_UserData.getTenJadeAuction().c2sCrossAuctionLeave(this._curAuctionInfo.getAuction_id());
        }
    }
    _updateData() {
        this._tagItemList = TenJadeAuctionDataHelper.getItemList();
        this._tagNameList = G_UserData.getTenJadeAuction().getTagNameList();
        this._curAuctionInfo = G_UserData.getTenJadeAuction().getCurAuctionInfo();
        var focusList = this._tagItemList[this._tagItemList.length - 1].list;
        var phase = TenJadeAuctionConfigHelper.getAuctionPhase();
        if (focusList.length > 0 && this._bDefaultListViewFirstShow && (phase == TenJadeAuctionConst.PHASE_ITEM_SHOW || phase == TenJadeAuctionConst.PHASE_START)) {
            this._selectTabIndex = this._tagItemList.length -1;
        }
        var dataList = this._tagItemList[this._selectTabIndex].list;
        this._dataList = TenJadeAuctionDataHelper.sort(dataList);
    }
    _initUI() {
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_TEN_JADE_AUCTION);
        this._topbarBase.setImageTitle('txt_sys_yiwanqipai');
        this._labelTimeTitle.string = (Lang.get('ten_jade_auction_time_title'));
        this._widthMax = this._listView.node.getContentSize().width;
        this._labelFocusTip.string = (Lang.get('ten_jade_auction_no_focus_tip'));
        this._labelEndTip.string = (Lang.get('ten_jade_auction_is_over'));
        this._btnMail.updateUI(FunctionConst.FUNC_MAIL_RED);
        this._btnMail.node.active = (false);
        this._btnMail.node.zIndex = (10);
        this._btnMail.addClickEventListenerEx(handler(this, this._onBtnMail));
        this._updateMailShow();
        UIActionHelper.playBlinkEffect(this._btnBid, false)
    }
    _updateView() {
        this._updateCurList();
          this._updateItems(true);
        this._putListViewMiddle();
        this._updateFocusTips();
    }
    _updateTabList() {
        this._nodeTabRoot.setCustomColor([
            [cc.color(244, 177, 128)],
            [cc.color(134, 68, 35)]
        ]);
        var param = {
            callback: handler(this, this._onTabSelect),
            textList: this._tagNameList,
            isVertical: 2,
            offset: 0
        };
        var offset = 0.5 * TAB_ITEM_WIDTH * (this._tagNameList.length - 2);
        this._nodeTabRoot.node.x = (- offset);
        this._nodeTabRoot.recreateTabs(param);
        this._nodeTabRoot.setTabIndex(this._selectTabIndex);
    }
    _updateWihtPhase(phase) {
        if (phase == TenJadeAuctionConst.PHASE_SHOW) {
            var startTime = G_UserData.getTenJadeAuction().getCurAuctionStartTime();
            this._labelTime.string = (G_ServerTime.getLeftSecondsString(startTime));
            this._labelTimeTitle.node.active = (true);
            this._labelTime.node.active = (true);
            this._btnBid.active = (false);
            this._labelEndTip.node.active = (false);
        } else if (phase == TenJadeAuctionConst.PHASE_ITEM_SHOW) {
            this._labelTimeTitle.node.active = (false);
            this._labelTime.node.active = (false);
            this._btnBid.active = (false);
            this._labelEndTip.node.active = (false);
        } else if (phase == TenJadeAuctionConst.PHASE_START) {
            this._labelTimeTitle.node.active = (false);
            this._labelTime.node.active = (false);
            this._btnBid.active = (true);
            this._labelEndTip.node.active = (false);
        } else if (phase == TenJadeAuctionConst.PHASE_END || phase == TenJadeAuctionConst.PHASE_DEFAULT) {
            this._stopTimer();
            this._labelEndTip.node.active = (true);
            this._labelFocusTip.node.active = (false);
        }
    }
    _putListViewMiddle() {
        var curListView =this._listView.node; 
        var itemCount = this._dataList.length;
        if (itemCount <= 5) {
           // curListView.setBounceEnabled(false);
            var x = ( ITEM_WIDTH * (itemCount -1)) / 2;
            curListView.x = (x);
        } else {
            //curListView.setBounceEnabled(true);
            curListView.x = (0);
        }
    }
    _updateFocusTips() {
        if (this._selectTabIndex == this._tagNameList.length) {
            var phase = TenJadeAuctionConfigHelper.getAuctionPhase();
            if (phase == TenJadeAuctionConst.PHASE_END || phase == TenJadeAuctionConst.PHASE_DEFAULT) {
                this._labelFocusTip.node.active = (false);
            } else {
                this._labelFocusTip.node.active = (this._dataList.length == 0);
            }
        } else {
            this._labelFocusTip.node.active = (false);
        }
    }
    _updateMailShow() {
        var visible = RedPointHelper.isModuleReach(FunctionConst.FUNC_MAIL);
        this._btnMail.node.active = (visible);
        if (visible && visible == true) {
            this._btnMail.showRedPoint(true);
            this._btnMail.playFuncGfx();
        }
    }
    _showAuctionEndView() {
        // for (var i in this._listViewList) {
        //     var view = this._listViewList[i];
        //     view.node.active = (false);
        //     view.stopAutoScroll();
        // }
        this._listView.node.active = false;
        this._labelEndTip.node.active = (true);
        this._labelFocusTip.node.active = (false);
    }
    _initListView() {
        // var scrollParam = {
        //     template: TenJadeAuctionCell,
        //     updateFunc: handler(this, this._onItemUpdate),
        //     selectFunc: handler(this, this._onItemSelected),
        //     touchFunc: handler(this, this._onItemTouch),
        // };
        this._listView.setCallback(handler(this, this._onCellUpdate));
        //this._listView.initWithParam(scrollParam);
    }
    // _getListView(index, scrollParam) {
    //     for (var i in this._listViewList) {
    //         var view = this._listViewList[i];
    //         view.node.active = (false);
    //         view.stopAutoScroll();
    //     }
    //     var bNewList = false;
    //     var listView = this._listViewList[index];
    //     if (listView == null) {
    //         listView = this._createListView(scrollParam);
    //         this._listViewList[index] = listView;
    //         bNewList = true;
    //     }
    //     bNewList = this._bResizeArray[index];
    //     this._bResizeArray[index] = false;
    //     return [
    //         listView,
    //         bNewList
    //     ];
    // }
    // _createListView(scrollParam) {
    //     var root = this._listView.getParent();
    //     if (root == null) {
    //         return;
    //     }
    //     var listView = this._listView.clone();
    //     cc.bind(listView, scrollParam.bind);
    //     listView.removeAllItems();
    //     listView.setTemplate(scrollParam.template);
    //     listView.setCallback(scrollParam.updateFunc, scrollParam.selectFunc, scrollParam.scrollFunc);
    //     listView.setCustomCallback(scrollParam.touchFunc);
    //     root.addChild(listView);
    //     return listView;
    // }
    _updateCurList() {
        // var scrollViewParam = {
        //     template: TenJadeAuctionCell,
        //     updateFunc: handler(this, this._onItemUpdate),
        //     selectFunc: handler(this, this._onItemSelected),
        //     touchFunc: handler(this, this._onItemTouch),
        //     bind: 'ListView'
        // };
        // var listView = this._getListView(this._selectTabIndex, scrollViewParam), bNewList;
        // listView.node.active = (true);
        // if (bNewList) {
        //     listView.resize(this._dataList.length);
        //     this._curIndex = null;
        //     this._lastItem = null;
        // }
        // if (this._bDefaultListViewFirstShow) {
        //     this._bDefaultListViewFirstShow = false;
        //     listView.resize(this._dataList.length);
        // }

       // this._listView.setData(this._dataList.length);
    }
    _updateItems(bForceResize?) {
        // var curList = this._getListWithTagIndex(this._selectTabIndex);
        // var listView = this._getCurListView();
        // var items = listView.getItems();
        // if (bForceResize) {
        //     this._curIndex = null;
        //     this._lastItem = null;
        //     listView.stopAutoScroll();
        //     listView.clearAll();
        //     listView.resize(curList.length);
        // }
        var phase = TenJadeAuctionConfigHelper.getAuctionPhase();
        if (phase == TenJadeAuctionConst.PHASE_END) {
            this._listView.node.active = (false);
            return;
        }

        this._listView.setData(this._dataList);
    }
    // _updateItemWithItemId(itemId) {
    //     function getItemIndex(itemId) {
    //         var curList = this._getListWithTagIndex(this._selectTabIndex);
    //         for (var idx in curList) {
    //             var data = curList[idx];
    //             var unitData = data.unitData;
    //             if (unitData.getId() == itemId) {
    //                 return [
    //                     idx,
    //                     data
    //                 ];
    //             }
    //         }
    //     }
    //     var [index, itemData] = getItemIndex(itemId);
    //     var listView = this._getCurListView();
    //     if (!index) {
    //         return;
    //     }
    //     var items = listView.getItems();
    //     for (var _ in items) {
    //         var item = items[_];
    //         if (item.getTag() == index - 1) {
    //             item.updateUI(item.getTag(), itemData);
    //             break;
    //         }
    //     }
    // }
    _startTimer() {
        this.schedule(this._updateTimer, 1);
        this._updateTimer();
    }
    _stopTimer() {
        this.unschedule(this._updateTimer);
    }
    _getListWithTagIndex(index) {
        return this._tagItemList[index].list;
    }
    // _getCurListView() {
    //     return this._listViewList[this._selectTabIndex];
    // }
    _showAuctionDlg(itemAward, addPrice, onOkCallBack) {
        var itemParams = TypeConvertHelper.convert(itemAward.type, itemAward.value, itemAward.size);
        if (itemParams == null) {
            return;
        }
        var richList = [];
        var richText1 = Lang.get('ten_jade_auction_add_price', { resNum: addPrice });
        var numText = 'x' + itemParams.size;
        if (itemParams.size == 1) {
            numText = '';
        }
        var itemOutlineColor = '';
        var itemOutlineSize = 0;
        if (itemParams.cfg.color == 7) {
            itemOutlineColor = Colors.colorToHexStr(itemParams.icon_color_outline);
            itemOutlineSize = 2;
        }
        var richText2 = Lang.get('auciton_buy_item', {
            itemName: itemParams.name,
            itemColor: Colors.colorToHexStr(itemParams.icon_color),
            outColor: itemOutlineColor,
            itemNum: numText,
            outSize: itemOutlineSize
        });
        table.insert(richList, richText1);
        table.insert(richList, richText2);
        function onCallBackFunc() {
            onOkCallBack(addPrice);
        }
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupAlert"), (popup: PopupAlert) => {
            popup.init(Lang.get('common_title_notice'), '', onCallBackFunc);
            popup.addRichTextList(richList);
            popup.openWithAction();
        });
    }
    _onTabSelect(index, sender, groupData) {
        if (this._curIndex !=null) {
            this._dataList[this._curIndex].viewData.selected = 0;
            this._curIndex = null;
        }
        if (this._lastItem) {
            this._lastItem.setSelected(false);
            this._lastItem = null;
        }
        this._selectTabIndex = index;
        this._dataList = this._getListWithTagIndex(index);
        this._updateView();
        return true;
    }
    _onCellUpdate(node: cc.Node, index) {
        var cell = node.getComponent(TenJadeAuctionCell);
        cell.setCustomCallback(handler(this, this._onItemTouch));
        cell.updateUI(index, this._dataList[index]);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, item, data, buttonType) {
        if (buttonType == 1) {
            if (this._lastItem) {
                this._lastItem.setSelected(false);
                this._dataList[this._curIndex].viewData.selected = 0;
            }
            item.setSelected(true);
            this._lastItem = item;
            this._curIndex = index;
            this._dataList[this._curIndex].viewData.selected = 1;
        }
    }
    _updateTimer() {
        var phase = TenJadeAuctionConfigHelper.getAuctionPhase();
        this._updateWihtPhase(phase);
    }
    onBtnBidClicked() {
        if (this._curIndex == null) {
            G_Prompt.showTip(Lang.get('ten_jade_auction_no_item'));
            return;
        }
        var data = this._dataList[this._curIndex].unitData;
        var itemId = data.getId();
        var buyerId = data.getNow_buyer();
        var itemAward = data.getItem();
        var addPrice = data.getAdd_price();
        var nowPrice = data.getNow_price();
        var initPrice = data.getInit_price();
        var totalPrice = data.getFinal_price();
        var startTime = data.getStart_time();
        var timeLeft = G_ServerTime.getLeftSeconds(startTime);
        if (timeLeft > 0) {
            G_Prompt.showTip(Lang.get('auction_time_no_reach'));
            return;
        }
        if (nowPrice == 0) {
            addPrice = initPrice;
        }
        var needPrice = nowPrice + addPrice;
        var onOkCallBack = function (price) {
            var retValue, dlgFunc;
            if (buyerId == G_UserData.getBase().getId()) {
                [retValue, dlgFunc] = UserCheck.enoughJade2(addPrice);
                if (retValue == false) {
                    dlgFunc();
                    return;
                }
            } else {
                [retValue, dlgFunc] = UserCheck.enoughJade2(price);
                if (retValue == false) {
                    dlgFunc();
                    return;
                }
            }
            if (this._curAuctionInfo) {
                G_UserData.getTenJadeAuction().c2sCrossAuction(this._curAuctionInfo.getAuction_id(), data.getConfig_id(), price, data.getId());
            }
        }.bind(this);
        this._showAuctionDlg(itemAward, needPrice, onOkCallBack);
    }
    _onBtnMail() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_MAIL_RED);
    }
    _onEventAuctionUpdateItem(event, itemIds, bForceResize) {
        if (bForceResize) {
            this._bResizeArray = [
                true,
                true,
                true,
                true
            ];
        }
        if (bForceResize || itemIds.length > 1) {
            this._updateData();
            this._updateItems(true);
            this._putListViewMiddle();
        } else {
            this._updateItems();
        }
    }
    _onEventAuctionAddFocus(event, itemId, state) {
        G_Prompt.showTip(state == 1 && Lang.get('ten_jade_auction_tag_name_add_focus_success') || Lang.get('ten_jade_auction_tag_name_del_focus_success'));
        if (this._selectTabIndex == this._tagNameList.length) {
            this._updateData();
            this._updateItems(true);
            this._putListViewMiddle();
        } else {
            this._updateItems();
        }
    }
    _onEventAuctionGetInfo() {
        this._updateData();
        this._updateView();
    }
    _onEventRedPointUpdate(id, funcId, param) {
        this._updateMailShow();
    }
    _onEventAuctionAddPrice(id) {
        G_Prompt.showTip(Lang.get('ten_jade_auction_add_price_success'));
    }
    _onEventLoginSuccess(id) {
        var curAuctionInfo = G_UserData.getTenJadeAuction().getCurAuctionInfo();
        if (curAuctionInfo) {
            G_UserData.getTenJadeAuction().c2sGetCrossAuctionInfo(curAuctionInfo.getAuction_id());
        } else {
            this._showAuctionEndView();
            return;
        }
    }
}