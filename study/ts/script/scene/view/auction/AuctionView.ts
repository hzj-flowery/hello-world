const { ccclass, property } = cc._decorator;

import { AuctionConst } from '../../../const/AuctionConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { Colors, G_Prompt, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData, G_ConfigLoader } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevelPaimaiHightlight from '../../../ui/component/CommonButtonLevelPaimaiHightlight';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import CommonHelp from '../../../ui/component/CommonHelp';
import CommonListView from '../../../ui/component/CommonListView';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import CommonTabGroupTree from '../../../ui/component/CommonTabGroupTree';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import PopupAlert from '../../../ui/PopupAlert';
import { handler } from '../../../utils/handler';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import { AuctionHelper } from './AuctionHelper';
import PopupAuctionLog from './PopupAuctionLog';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { ConfigNameConst } from '../../../const/ConfigNameConst';








@ccclass
export default class AuctionView extends ViewBase {
    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelBk: cc.Node = null;
    @property({
        type: CommonFullScreen,
        visible: true
    })
    _commonFullScreen: CommonFullScreen = null;
    @property({
        type: CommonTabGroupTree,
        visible: true
    })
    _nodeTabRoot: CommonTabGroupTree = null;
    @property({
        type: CommonListView,
        visible: true
    })
    _listView: CommonListView = null;
    @property({
        type: CommonButtonLevelPaimaiHightlight,
        visible: true
    })
    _commonBtnAuction: CommonButtonLevelPaimaiHightlight = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInfo: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAuctionShare: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeResRoot: cc.Node = null;
    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _commonRes1: CommonResourceInfo = null;
    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _commonRes2: CommonResourceInfo = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textAuctionNoShare: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textAuctionYubiDes: cc.Label = null;
    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _imageNone: CommonEmptyListNode = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textNone: cc.Label = null;
    @property({
        type: CommonHelp,
        visible: true
    })
    _commonHelpBig: CommonHelp = null;
    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;
    @property(cc.Prefab)
    auctionItemCell: cc.Prefab = null;

    _dataList: any;
    _popupAuctionLogSignal: any;
    _popupAuctionLog: any;
    _tabIndex: any;
    _selectTabIndex: number;
    _signalGetAuctionInfo: any;
    _signalAuctionItem: any;
    _signalAuctionLog: any;
    _signalAuctionUpdateItem: any;
    _schedulerFunc: any;

    public static waitEnterMsg(callBack) {
        function onMsgCallBack() {
            callBack();
            // this._needRequest = false;
        }
        G_UserData.getAuction().c2sGetAllAuctionInfo();
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_GET_ALL_AUCTION_INFO, onMsgCallBack);
    }
    ctor(tabIndex?) {
        this._dataList = null;
        this._popupAuctionLogSignal = null;
        this._popupAuctionLog = null;
        this._tabIndex = AuctionConst.AC_TYPE_WORLD;
        this._selectTabIndex = 0;
        this._commonBtnAuction.addClickEventListenerEx(handler(this, this._onBtnAuctionLog));
    }
    onCreate() {
        this.ctor();
        this.setSceneSize();
        this._commonFullScreen.setTitle(Lang.get('auction_view_title1'));
        this._commonHelpBig.updateUI(FunctionConst.FUNC_AUCTION);
        var scrollViewParam = {
            template: this.auctionItemCell,
            updateFunc: handler(this, this._onItemUpdate),
            selectFunc: handler(this, this._onItemSelected),
            touchFunc: handler(this, this._onItemTouch)
        };
        this._listView.initWithParam(scrollViewParam);

        this._updateTabList();
        this._nodeTabRoot.setTabIndex(this._tabIndex - 1);
        this._nodeTabRoot.openTreeTab(this._tabIndex - 1);
        var [tabType] = this.getTabType(this._tabIndex);
        this._commonBtnAuction.setString(Lang.get('auction_log_title' + tabType));
        this._imageNone.node.active = (true);
    }

    start() {
        this._topbarBase.setImageTitle('txt_sys_com_paimai');
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_JADE2)[0];
        var topbarConst = isOpen && TopBarStyleConst.STYLE_COMMON2 || TopBarStyleConst.STYLE_COMMON;
        this._topbarBase.updateUI(topbarConst);
    }
    _updateTabList() {
        var [textList, groupData] = AuctionHelper.getAuctionTextListEx();
        var param = {
            callback: handler(this, this._onTabSelect),
            textList: textList,
            groupData: groupData
        };
        function getAuctionStartIndex(groupData) {
            for (var i in groupData) {
                var mainData = groupData[i];
                for (var j in mainData.subList) {
                    var subData = mainData.subList[j];
                    if (subData.type == AuctionConst.AC_TYPE_GUILD) {
                        if (subData.tabIndex > 0) {
                            return subData.tabIndex;
                        }
                    }
                }
                if (mainData.type == AuctionConst.AC_TYPE_ARENA || mainData.type == AuctionConst.AC_TYPE_TRADE || mainData.type == AuctionConst.AC_TYPE_GM || mainData.type == AuctionConst.AC_TYPE_PERSONAL_ARENA || mainData.type == AuctionConst.AC_TYPE_GUILDCROSS_WAR) {
                    return mainData.tabIndex;
                }
            }
            return AuctionConst.AC_TYPE_WORLD;
        }
        this._tabIndex = getAuctionStartIndex(groupData);
        this._nodeTabRoot.recreateTabs(param);
    }
    _checkInTheGuild(index) {
        function onOkClick() {
            G_SceneManager.showDialog('app.scene.view.guild.PopupGuildListView');
        }
        var [tabType] = this.getTabType(index);
        if (tabType == AuctionConst.AC_TYPE_GUILD) {
            var isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild == false) {
                UIPopupHelper.popupCommonView(PopupAlert, function (popup: PopupAlert) {
                    popup.init('', Lang.get('auction_no_guild_notice'), onOkClick)
                    popup.setOKBtn(Lang.get('auction_no_guild_btn'));
                    popup.openWithAction();
                });
                return false;
            }
        }
        return true;
    }
    _onTabSelect(index, sender, groupData) {
        index++;
        var [tabType] = this.getTabType(index);
        if (this._checkInTheGuild(index) == false) {
            return false;
        }
        if (this._selectTabIndex == index) {
            return true;
        }
        this._selectTabIndex = index;
        if (groupData.isMain == true) {
            G_UserData.getAuction().c2sGetAuctionInfo(tabType);
            this._commonBtnAuction.setString(Lang.get('auction_log_title' + tabType));
        } else {
            this._updateListView(index);
            this._commonBtnAuction.setString(Lang.get('auction_log_title' + tabType));
        }
        return true;
    }
    onEnter() {
        this._signalGetAuctionInfo = G_SignalManager.add(SignalConst.EVENT_GET_AUCTION_INFO, handler(this, this._onEventAuctionInfo));
        this._signalAuctionItem = G_SignalManager.add(SignalConst.EVENT_AUCTION_ITEM, handler(this, this._onEventAuctionItem));
        this._signalAuctionLog = G_SignalManager.add(SignalConst.EVENT_AUCTION_LOG, handler(this, this._onEventAuctionLog));
        this._signalAuctionUpdateItem = G_SignalManager.add(SignalConst.EVENT_AUCTION_UPDATE_ITEM, handler(this, this._onEventAuctionUpdateItem));
        this._registerScheduler();
    }
    onExit() {
        this._deleteScheduler();
        this._signalGetAuctionInfo.remove();
        this._signalGetAuctionInfo = null;
        this._signalAuctionItem.remove();
        this._signalAuctionItem = null;
        this._signalAuctionLog.remove();
        this._signalAuctionLog = null;
        this._signalAuctionUpdateItem.remove();
        this._signalAuctionUpdateItem = null;
        if (this._popupAuctionLogSignal) {
            this._popupAuctionLogSignal.remove();
            this._popupAuctionLogSignal = null;
        }
    }
    _onRequestTick() {
    }
    _onBtnAuctionLog() {
        var [tabType] = this.getTabType(this._selectTabIndex);
        G_UserData.getAuction().c2sGetAuctionLog(tabType);
    }
    _updateListView(tabIndex) {
        tabIndex = tabIndex || 1;
        this._nodeInfo.active = (false);
        var [tabType, configId, rootId] = this.getTabType(tabIndex);
        var [dataList] = AuctionHelper.getConfigIdByIndex(rootId, configId);
        this._commonFullScreen.setTitle(Lang.get('auction_view_title' + tabType));
        if (dataList) {
            this._dataList = dataList;
            //   this._listView.updateListView(tabIndex, this._dataList.length);
            if (dataList.length == 0) {
                this._imageNone.node.active = (true);
            } else {
                this._imageNone.node.active = (false);
            }
            this._listView.setData(this._dataList.length, tabIndex);

        }
        this.procGuildAuctionShare();
    }

    porcYubiShareDes(tabType, canYubi) {
        var rank = G_ConfigLoader.getConfig(ConfigNameConst.PVPPRO_PARAMETER).get(49).content;
        if (tabType == AuctionConst.AC_TYPE_PERSONAL_ARENA) {
            this._nodeResRoot.y = (0);
            if (canYubi) {
                this._textAuctionYubiDes.string = (Lang.get('auction_have_yubi_des', { rank: rank }));
            } else {
                this._textAuctionYubiDes.string = (Lang.get('auction_have_no_yubi_des', { rank: rank }));
            }
        } else {
            this._nodeResRoot.y = (-17);
            this._textAuctionYubiDes.string = ('');
        }
    }

    procGuildAuctionShare() {
        if (AuctionConst.AC_BOUNS_TYPE_LIST[tabType]) {
            var [tabType, configId, rootCfgId] = this.getTabType(this._selectTabIndex);
            var haveBonus = false;
            var haveYubi = false;
            var canYubi = false;
            var bonus = G_UserData.getAuction().getBonus(rootCfgId);
            var yubiBonus = G_UserData.getAuction().getYubiBonus(rootCfgId);
            if (rootCfgId && rootCfgId > 0) {
                haveBonus = G_UserData.getAuction().isAuctionCanBonus(rootCfgId);
                canYubi = G_UserData.getAuction().isAuctionCanYubi(rootCfgId);
            }
            haveYubi = canYubi && yubiBonus > 0;
            var haveShare = haveBonus || haveYubi;
            this._nodeInfo.active = (true);
            if (haveBonus && haveYubi) {
                this._commonRes1.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, bonus);
                this._commonRes2.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2, yubiBonus);
                this._commonRes2.node.active = (true);
            } else if (haveYubi) {
                this._commonRes1.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2, yubiBonus);
                this._commonRes2.node.active = (false);
            } else {
                this._commonRes1.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, bonus);
                this._commonRes2.node.active = (false);
            }
            this.porcYubiShareDes(tabType, canYubi);
            this._nodeAuctionShare.active = (haveShare);
            this._textAuctionNoShare.node.active = (!haveShare);
            this._textAuctionNoShare.string = (Lang.get('auction_no_share'));
            this._textAuctionNoShare.node.color = (Colors.TITLE_ONE);
        }
    }

    _onItemUpdate(item, index, type) {
        var data = this._dataList[index];
        item.updateItem(index, data, type);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, parmas) {
        var data = parmas[0];
        var buttonType = parmas[1];
        var itemId = data.getId();
        var buyerId = data.getNow_buyer();
        var itemAward = data.getItem();
        var addPrice = data.getAdd_price();
        var nowPrice = data.getNow_price();
        var initPrice = data.getInit_price();
        var totalPrice = data.getFinal_price();
        var startTime = data.getStart_time();
        var moneyType = data.getMoney_type();
        var timeLeft = G_ServerTime.getLeftSeconds(startTime);
        if (timeLeft > 0) {
            G_Prompt.showTip(Lang.get('auction_time_no_reach'));
            return;
        }
        if (nowPrice == 0) {
            addPrice = initPrice;
        }
        function converTotalPrice(totalPrice) {
            var retValue = totalPrice;
            if (buyerId == G_UserData.getBase().getId()) {
                retValue = retValue - nowPrice;
            }
            return retValue;
        }
        let onOkCallBack = function (addPrice, dlgType) {
            var retValue, dlgFunc;
            if (moneyType == 1) {
                [retValue, dlgFunc] = UserCheck.enoughJade2(addPrice);
            } else {
                [retValue, dlgFunc] = UserCheck.enoughCash(addPrice);
            }
            if (retValue == false) {
                (dlgFunc as Function)();
                return;
            }
            var [tabType, configId, rootCfgId] = this.getTabType(this._selectTabIndex);
            G_UserData.getAuction().c2sAuction(tabType, itemId, rootCfgId, buttonType);
        }.bind(this);
        if (buttonType == AuctionConst.BUTTON_TYPE_BUY) {
            this._showBuyDlg3(itemAward, data, converTotalPrice(totalPrice), onOkCallBack, totalPrice);
        } else if (buttonType == AuctionConst.BUTTON_TYPE_ADD) {
            if (buyerId && buyerId == G_UserData.getBase().getId()) {
                if (nowPrice + addPrice >= totalPrice) {
                    this._showAddPriceDlg5(itemAward, data, totalPrice, onOkCallBack, converTotalPrice(totalPrice));
                } else {
                    this._showAddPriceDlg2(itemAward, data, addPrice, onOkCallBack);
                }
            } else {
                if (nowPrice + addPrice >= totalPrice) {
                    this._showBuyDlg3(itemAward, data, converTotalPrice(totalPrice), onOkCallBack);
                } else {
                    this._showAuctionDlg1(itemAward, data, nowPrice + addPrice, onOkCallBack);
                }
            }
        }
    }
    _showAuctionDlg1(itemAward, data, addPrice, onOkCallBack) {
        var itemParams = TypeConvertHelper.convert(itemAward.type, itemAward.value, itemAward.size);
        if (itemParams == null) {
            return;
        }
        var moneyInfo = AuctionHelper.getMoneyInfoByData(data);
        var richList = [];
        var richText1 = Lang.get('auction_add_price1', {
            resIcon: Path.getResourceMiniIcon(DataConst.RES_DIAMOND),
            resNum: addPrice,
            resName: moneyInfo.name
        });
        var numText = 'x' + itemParams.size;
        if (itemParams.size == 1) {
            numText = ' ';
        }
        var itemOutlineColor = null;
        var itemOutlineSize = 0;
        if (itemParams.cfg.color == 7) {
            itemOutlineColor = Colors.colorToNumber(itemParams.icon_color_outline);
            itemOutlineSize = 2;
        }
        var richText2 = Lang.get('auciton_buy_item', {
            itemName: itemParams.name,
            itemColor: Colors.colorToNumber(itemParams.icon_color),
            outColor: itemOutlineColor,
            itemNum: numText,
            outSize: itemOutlineSize
        });
        richList.push(richText1);
        richList.push(richText2);
        function onCallBackFunc() {
            onOkCallBack(addPrice, 1);
        }
        UIPopupHelper.popupCommonView(PopupAlert, function (popup: PopupAlert) {
            popup.init(Lang.get('common_title_notice'), '', onCallBackFunc);
            popup.addRichTextList(richList);
            popup.openWithAction();
        });
    }
    _showAddPriceDlg2(itemAward, data, addPrice, onOkCallBack) {
        var itemParams = TypeConvertHelper.convert(itemAward.type, itemAward.value, itemAward.size);
        if (itemParams == null) {
            return;
        }
        var moneyInfo = AuctionHelper.getMoneyInfoByData(data);
        var richList = [];
        var richText1 = Lang.get('auction_add_price2', {
            resIcon: Path.getResourceMiniIcon(1),
            resNum: addPrice,
            resName: moneyInfo.name
        });
        var numText = 'x' + itemParams.size;
        if (itemParams.size == 1) {
            numText = '';
        }
        var itemOutlineColor = null;
        var itemOutlineSize = 0;
        if (itemParams.cfg.color == 7) {
            itemOutlineColor = Colors.colorToNumber(itemParams.icon_color_outline);
            itemOutlineSize = 2;
        }
        var richText2 = Lang.get('auciton_buy_item', {
            itemName: itemParams.name,
            itemColor: Colors.colorToNumber(itemParams.icon_color),
            outColor: itemOutlineColor,
            itemNum: numText,
            outSize: itemOutlineSize
        });
        richList.push(Lang.get('auction_add_price_top2'));
        richList.push(richText1);
        richList.push(richText2);
        function onCallBackFunc() {
            onOkCallBack(addPrice, 2);
        }
        UIPopupHelper.popupCommonView(PopupAlert, function (popup: PopupAlert) {
            popup.init(Lang.get('common_title_notice'), '', onCallBackFunc);
            popup.addRichTextList(richList);
            popup.openWithAction();
        });
    }
    _showAddPriceDlg5(itemAward,data, totalPrice, onOkCallBack, addPrice) {
        var itemParams = TypeConvertHelper.convert(itemAward.type, itemAward.value, itemAward.size);
        if (itemParams == null) {
            return;
        }
        var moneyInfo = AuctionHelper.getMoneyInfoByData(data);
        var richList = [];
        var richText1 = Lang.get('auction_add_price5', {
            resIcon: Path.getResourceMiniIcon(1),
            resNum: totalPrice,
            resName: moneyInfo.name
        });
        var numText = 'x' + itemParams.size;
        if (itemParams.size == 1) {
            numText = '';
        }
        var itemOutlineColor = null;
        var itemOutlineSize = 0;
        if (itemParams.cfg.color == 7) {
            itemOutlineColor = Colors.colorToNumber(itemParams.icon_color_outline);
            itemOutlineSize = 2;
        }
        var richText2 = Lang.get('auciton_buy_item', {
            itemName: itemParams.name,
            itemColor: Colors.colorToNumber(itemParams.icon_color),
            outColor: itemOutlineColor,
            itemNum: numText,
            outSize: itemOutlineSize
        });
        richList.push(richText1);
        richList.push(richText2);
        function onCallBackFunc() {
            onOkCallBack(addPrice, 2);
        }
        UIPopupHelper.popupCommonView(PopupAlert, function (popup: PopupAlert) {
            popup.init(Lang.get('common_title_notice'), '', onCallBackFunc);
            popup.addRichTextList(richList);
            popup.openWithAction();
        });
    }
    _showBuyDlg3(itemAward,data, addPrice, onOkCallBack, totalPrice?) {
        var itemParams = TypeConvertHelper.convert(itemAward.type, itemAward.value, itemAward.size);
        if (itemParams == null) {
            return;
        }
        var moneyInfo = AuctionHelper.getMoneyInfoByData(data);
        var richText1 = {};
        if (totalPrice && totalPrice > addPrice) {
            richText1 = Lang.get('auction_add_price4', {
                resIcon: Path.getResourceMiniIcon(1),
                resNum: addPrice,
                resName: moneyInfo.name
            });
        } else {
            richText1 = Lang.get('auction_add_price3', {
                resIcon: Path.getResourceMiniIcon(1),
                resNum: addPrice,
                resName: moneyInfo.name
            });
        }
        var richList = [];
        var numText = 'x' + itemParams.size;
        if (itemParams.size == 1) {
            numText = '';
        }
        var itemOutlineColor = null;
        var itemOutlineSize = 0;
        if (itemParams.cfg.color == 7) {
            itemOutlineColor = Colors.colorToNumber(itemParams.icon_color_outline);
            itemOutlineSize = 2;
        }
        var richText2 = Lang.get('auciton_buy_item', {
            itemName: itemParams.name,
            itemColor: Colors.colorToNumber(itemParams.icon_color),
            outColor: itemOutlineColor,
            itemNum: numText,
            outSize: itemOutlineSize
        });
        richList.push(richText1);
        richList.push(richText2);
        function onCallBackFunc() {
            onOkCallBack(addPrice, 3);
        }
        UIPopupHelper.popupCommonView(PopupAlert, function (popup: PopupAlert) {
            popup.init(Lang.get('common_title_notice'), '', onCallBackFunc);
            popup.addRichTextList(richList);
            popup.openWithAction();
        });
    }
    _onEventAuctionInfo(id, message) {
        this._updateListView(this._selectTabIndex);
    }
    _onEventAuctionItem(id, message) {
        if (message == null) {
            return;
        }
        this._updateListView(this._selectTabIndex);
        if (message.auction_type == AuctionConst.AC_TYPE_GUILD) {
            G_Prompt.showTip(Lang.get('auction_add_price_ok'));
        } else if (message.auction_type == AuctionConst.AC_TYPE_WORLD) {
            G_Prompt.showTip(Lang.get('auction_once_buy_ok'));
        } else if (message.auction_type == AuctionConst.AC_TYPE_ARENA) {
            G_Prompt.showTip(Lang.get('auction_once_buy_ok'));
        } else if (message.auction_type == AuctionConst.AC_TYPE_TRADE) {
            G_Prompt.showTip(Lang.get('auction_once_buy_ok'));
        } else if (message.auction_type == AuctionConst.AC_TYPE_PERSONAL_ARENA) {
            G_Prompt.showTip(Lang.get('auction_once_buy_ok'));
        } else if (message.auction_type == AuctionConst.AC_TYPE_GUILDCROSS_WAR) {
            G_Prompt.showTip(Lang.get('auction_once_buy_ok'));
        }
    }
    _onEventAuctionUpdateItem(id, message) {
        if (message == null) {
            return;
        }
        this._updateListView(this._selectTabIndex);
    }
    _onEventAuctionLog(id, message) {
        if (message == null) {
            return;
        }
        if (this._popupAuctionLog) {
            return;
        }
        var [tabType] = this.getTabType(this._selectTabIndex);

        var logList = message['logs'] || {};
        var showList = [];
        for (var i in logList) {
            var log = logList[i];
            if (log.main_type == tabType) {
                showList.push(log);
            }
        }
        showList.sort(function (log1, log2) {
            return log2.deal_time - log1.deal_time;
        });

        PopupAuctionLog.getIns(PopupAuctionLog, (popupDlg: PopupAuctionLog) => {
            popupDlg.ctor(Lang.get('auction_log_title' + tabType))
            popupDlg.updateUI(showList);
            popupDlg.openWithAction();

            this._popupAuctionLog = popupDlg;
            this._popupAuctionLogSignal = this._popupAuctionLog.signal.add(handler(this, this._onPopupAuctionLogClose));
        })

    }
    getTabType(tabIndex) {
        var groupData = this._nodeTabRoot.getGroupDataByIndex(tabIndex - 1);
        return [
            groupData.type,
            groupData.cfgId,
            groupData.rootCfgId
        ];
    }
    _onPopupAuctionLogClose(event) {
        if (event == 'close') {
            this._popupAuctionLog = null;
            this._popupAuctionLogSignal.remove();
            this._popupAuctionLogSignal = null;
        }
    }
    _registerScheduler() {
        this._deleteScheduler();
        this._schedulerFunc = function () {
            var tabIndex = this._selectTabIndex || 1;
            var [auctionType, cfgId, rootId] = this.getTabType(tabIndex);
            var [dataList] = AuctionHelper.getConfigIdByIndex(rootId, cfgId);
            if (this._dataList && dataList) {
                if (this._dataList.length != dataList.length) {
                    this._updateListView(this._selectTabIndex);
                }
            }
        }.bind(this);
        this.schedule(this._schedulerFunc, 1);
    }
    _deleteScheduler() {
        if (this._schedulerFunc) {
            this.unschedule(this._schedulerFunc);
            this._schedulerFunc = null;
        }
    }
}