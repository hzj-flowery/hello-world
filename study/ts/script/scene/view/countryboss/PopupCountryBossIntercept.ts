import { CountryBossConst } from "../../../const/CountryBossConst";
import { SignalConst } from "../../../const/SignalConst";
import { ReportParser } from "../../../fight/report/ReportParser";
import { G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonListView from "../../../ui/component/CommonListView";
import CommonNormalMidPop from "../../../ui/component/CommonNormalMidPop";
import PopupBase from "../../../ui/PopupBase";
import { BattleDataHelper } from "../../../utils/data/BattleDataHelper";
import { handler } from "../../../utils/handler";
import { CountryBossHelper } from "./CountryBossHelper";









const { ccclass, property } = cc._decorator;


@ccclass
export default class PopupCountryBossIntercept extends PopupBase {
    public static path = 'countryboss/PopupCountryBossIntercept';

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMidPop = null;
    @property({
        type: CommonListView,
        visible: true
    })
    _listViewItem: CommonListView = null;
    @property({ type: cc.Prefab, visible: true })
    countryBossInterceptCell: cc.Prefab = null;

    _bossId: any;
    _signalIntercept: any;
    _datas: any;

    ctor(bossId) {
        this._bossId = bossId;
    }
    onCreate() {
        this._commonNodeBk.setTitle(Lang.get('country_boss_intercept_pop_title'));
        this._commonNodeBk.addCloseEventListener(handler(this, this.close));
        this._initListViewItem();
    }
    onEnter() {
        this._signalIntercept = G_SignalManager.add(SignalConst.EVENT_INTERCEPT_COUNTRY_BOSS_USER_SUCCESS, handler(this, this._onEventIntecept));
        this.updateUI();
    }
    onExit() {
        this._signalIntercept.remove();
        this._signalIntercept = null;
    }
    onCleanup() {
        G_UserData.getCountryBoss().cleanInterceptList();
    }
    _onEventIntecept(event, message) {
        if (message == null) {
            return;
        }
        var reportId = message['report'];
        let enterFightView = function (message) {
            var cfg = CountryBossHelper.getBossConfigById(this._bossId);
            var battleReport = G_UserData.getFightReport().getReport();
            var reportData = ReportParser.parse(battleReport);
            var battleData = BattleDataHelper.parseCountryBossIntercept(message, cfg.battle_scene);
            this.close();
            G_SceneManager.showScene('fight', reportData, battleData);
        }.bind(this);
        G_SceneManager.registerGetReport(reportId, function () {
            enterFightView(message);
        }.bind(this));
    }
    _initListViewItem() {
        this._listViewItem.init(this.countryBossInterceptCell, handler(this, this._onListViewItemItemUpdate), handler(this, this._onListViewItemItemTouch));
    }
    updateUI() {
        this._datas = G_UserData.getCountryBoss().getInterceptList() || [];
        this._listViewItem.resize(this._datas.length);
    }
    _onListViewItemItemUpdate(item, index) {
        item.updateItem(index, this._datas[index]);
    }
    _onListViewItemItemSelected(item, index) {
    }
    _onListViewItemItemTouch(index, userId) {
        if (!userId) {
            return;
        }
        if (CountryBossHelper.getStage() != CountryBossConst.STAGE3) {
            G_Prompt.showTip(Lang.get('country_boss_fight_time_end'));
            return;
        }
        G_UserData.getCountryBoss().c2sInterceptCountryBossUser(userId, this._bossId);
    }
}