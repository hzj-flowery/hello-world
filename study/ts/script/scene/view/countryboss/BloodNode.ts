import { CountryBossHelper } from "./CountryBossHelper";
import { Colors, G_UserData } from "../../../init";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BloodNode extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _textBossName: cc.Label = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBarTime: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _progressLabel: cc.Label = null;
    _bossId: any;
    _cfg: any;

    ctor(bossId) {
        this._bossId = bossId;
        this.onCreate();
    }
    onCreate() {
        this._cfg = CountryBossHelper.getBossConfigById(this._bossId);
        this._textBossName.string = (this._cfg.name);
        if (this._cfg.type == 2) {
            this._textBossName.node.color = (Colors.COLOR_QUALITY[4]);
            UIHelper.enableOutline(this._textBossName, Colors.COLOR_QUALITY_OUTLINE[5], 2);
        } else {
            this._textBossName.node.color = (Colors.COLOR_QUALITY[4]);
            UIHelper.enableOutline(this._textBossName, Colors.COLOR_QUALITY_OUTLINE[4], 2);
        }
    }
    updateUI() {
        var bossData = G_UserData.getCountryBoss().getBossDataById(this._bossId);
        if (!bossData) {
            return;
        }
        var progress = bossData.getNow_hp() / bossData.getMax_hp();
        if (progress >= 1) {
            progress = 1;
        }
        this._loadingBarTime.progress = (progress);
        var str = ('%.2f% ( %s / %s )').format(progress * 100, bossData.getNow_hp(), bossData.getMax_hp());
        this._progressLabel.string = (str);
    }
}