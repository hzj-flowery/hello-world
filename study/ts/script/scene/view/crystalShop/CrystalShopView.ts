const {ccclass, property} = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_Prompt, G_SceneManager, G_SignalManager, G_UserData, G_ConfigManager } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import CommonTabGroupVertical from '../../../ui/component/CommonTabGroupVertical';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { table } from '../../../utils/table';
import ViewBase from '../../ViewBase';
import CrystalShopChargeClient from './CrystalShopChargeClient';
import CrystalShopFixClient from './CrystalShopFixClient';
import { ShopConst } from '../../../const/ShopConst';




@ccclass
export default class CrystalShopView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

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
        type: cc.Node,
        visible: true
    })
    _clientParent: cc.Node = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property(cc.Prefab)
    CrystalShopFixClient:cc.Prefab = null;

    @property(cc.Prefab)
    CrystalShopChargeClient:cc.Prefab = null;


    _curSelectTabIndex: number = 0;
    _firstEnterTabIndex: number = 1;
    _signalCrystalShopItems: any;
    _signalCrystalShopAwards: any;
    _signalRedPointUpdate: any;
    _signalRefreshCrystalShop: any;
    _signalCrystalShopBuy: any;
    _tabNames: any[];
    _createClientHandlers: any[];
    _clients: cc.Component[];
    _requestsHandlers: any[];

    protected preloadResList = [
        // { path: Path.getPrefab("ChapterCity", "chapter"), type: cc.Prefab },
        // { path: Path.getPrefab("ChapterMapCell", "chapter"), type: cc.Prefab },
        // { path:Path.getChapterBG(1), type: cc.SpriteFrame },
        // { path:Path.getChapterBG(2), type: cc.SpriteFrame },
        // { path:Path.getChapterBG(3), type: cc.SpriteFrame },
        { path:"icon/resource/20", type: cc.SpriteFrame },
    ];


    ctor(tabIndex) {
        this._curSelectTabIndex = 0;
        this._firstEnterTabIndex = tabIndex || 1;
    }
    onEnter() {
        this._signalCrystalShopItems = G_SignalManager.add(SignalConst.EVENT_GET_SHOP_CRYSTAL_SUCCESS, handler(this, this._onEventShopUpdate));
        this._signalCrystalShopAwards = G_SignalManager.add(SignalConst.EVENT_GET_SHOP_CRYSTAL_AWARD_SUCCESS, handler(this, this._onEventGetReward));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalRefreshCrystalShop = G_SignalManager.add(SignalConst.EVENT_REFRESH_CRYSTAL_SHOP_SUCCESS, handler(this, this._onEventShopUpdate));
        this._signalCrystalShopBuy = G_SignalManager.add(SignalConst.EVENT_SHOP_CRYSTAL_BUY_SUCCESS, handler(this, this._onEventGetReward));
        this._refreshClient();
        this._refreshRedPoint();
    }
    onExit() {
        this._signalCrystalShopItems.remove();
        this._signalCrystalShopItems = null;
        this._signalCrystalShopAwards.remove();
        this._signalCrystalShopAwards = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalRefreshCrystalShop.remove();
        this._signalRefreshCrystalShop = null;
        this._signalCrystalShopBuy.remove();
        this._signalCrystalShopBuy = null;
    }
    onCreate() {
        var params = G_SceneManager.getViewArgs('crystalShop');
        if(params && params.length > 0){
            this.ctor(params[0]);
        }
        this.setSceneSize();
        G_ConfigManager.checkCanRecharge() && this._topbarBase.setImageTitle('txt_sys_com_shangdian');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_CRYSTAL_SHOP);
        var cryShopList = UserDataHelper.getShopTab(ShopConst.CRYSTAL_SHOP_ENTRANCE);
        this._tabNames = [];
        this._createClientHandlers = [];
        this._clients = [];
        this._requestsHandlers = [];
        var cnt = 2;
        //暂时屏蔽充值
        if (!G_ConfigManager.checkCanRecharge()){
            cnt = 1;
        }
        for (var i = 1; i<=cnt; i++) {
            table.insert(this._tabNames, Lang.get('lang_crystal_shop_tab_charge' + i));
            table.insert(this._createClientHandlers, handler(this, this._createChargeClient));
            table.insert(this._requestsHandlers, handler(this, this._requestChargeData));
        }
        table.insert(this._tabNames, Lang.get('lang_crystal_shop_tab_charge3'));
        table.insert(this._requestsHandlers, handler(this, this._requestShopData));
        table.insert(this._createClientHandlers, handler(this, this._createFixShopClient));
        var param = {
            callback: handler(this, this._onTabSelect),
            textList: this._tabNames
        };
        this._nodeTabRoot.recreateTabs(param);
        var tab = this._firstEnterTabIndex-1;
        if (this._firstEnterTabIndex == 3 && cnt == 1) {
            tab = this._firstEnterTabIndex-2;
        }
        this._nodeTabRoot.setTabIndex(tab);
        this._refreshRedPoint();
        this._fileNodeBg.setTitle(G_ConfigManager.checkCanRecharge() ? Lang.get('lang_crystal_shop_title') : '水晶兑换');
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_CRYSTAL_SHOP);
    }
    _requestShopData() {
        G_UserData.getCrystalShop().requestShopData();
    }
    _requestChargeData() {
        this._onEventShopUpdate();
    }
    _getClientByIndex(index):cc.Component {
        var client = this._clients[index-1];
        if (!client) {
            client = this._createClientHandlers[index-1](index);
            this._clientParent.addChild(client.node);
            this._clients[index-1] = client;
        }
        return client;
    }
    _onTabSelect(index, sender) {
        if (this._curSelectTabIndex == index+1) {
            return;
        }
        var oldIndex = this._curSelectTabIndex;
        if (oldIndex > 0) {
            var oldClient = this._getClientByIndex(oldIndex);
            oldClient.node.active = (false);
        }
        this._curSelectTabIndex = index+1;
        var newClient = this._getClientByIndex(this._curSelectTabIndex);
        newClient.node.active = (true);
        if ((newClient as any).setPlayEnterEffectTag) {
            (newClient as any).setPlayEnterEffectTag(true);
        }
        this._requestsHandlers[index]();
    }
    _createFixShopClient(index) {
        var client = cc.instantiate(this.CrystalShopFixClient).getComponent(CrystalShopFixClient);
        return client;
    }
    _createChargeClient(index) {
        var client = cc.instantiate(this.CrystalShopChargeClient).getComponent(CrystalShopChargeClient);
        client.ctor(index);
        return client;
    }
    _onEventShopUpdate() {
        this._refreshClient();
    }
    _refreshClient() {
        var client = this._getClientByIndex(this._curSelectTabIndex);
        (client as any).refreshClient();
    }
    _onEventRedPointUpdate() {
        this._refreshRedPoint();
    }
    _refreshRedPoint() {
        this._nodeTabRoot.setRedPointByTabIndex(1, G_UserData.getCrystalShop().hasRedPoint(1));
        this._nodeTabRoot.setRedPointByTabIndex(2, G_UserData.getCrystalShop().hasRedPoint(2));
    }
    _onEventGetReward(event, awards) {
        if (awards) {
            G_Prompt.showAwards(awards);
        }
        this._refreshClient();
    }

}
