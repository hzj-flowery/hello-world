const { ccclass, property } = cc._decorator;
import RebornLayerBase from './RebornLayerBase';
import { RecoveryConst } from '../../../const/RecoveryConst';
import { Lang } from '../../../lang/Lang';
import { HistoryHeroConst } from '../../../const/HistoryHeroConst';
import { G_SignalManager, G_UserData, G_Prompt } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { RecoveryDataHelper } from '../../../utils/data/RecoveryDataHelper';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';

@ccclass
export default class RebornHistoryHeroLayer extends RebornLayerBase {

    private _signalHistoricalHeroReborn;

    onCreate() {
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_13,
            "PopupChooseHero",
            HistoryHeroConst.TAB_TYPE_REBORN,
            Lang.get("recovery_tip_13"));
        super.onCreate();
    }

    public onEnter() {
        this._signalHistoricalHeroReborn = G_SignalManager.add(SignalConst.EVENT_HISTORY_HERO_REBORN_SUCCESS, handler(this, this._rebornSuccess));
        super.onEnter();
    }

    public onExit() {
        this._signalHistoricalHeroReborn.remove();
        this._signalHistoricalHeroReborn = null;
        super.onExit();
    }

    public _updateView() {
        var data = this._recoveryRebornList[0];
        if (data) {
            var baseId = data.getSystem_id();
            this._recoveryRebornNodes[0].updateInfo(baseId);
        } else {
            this._recoveryRebornNodes[0].updateInfo(null);
        }
    }

    public onButtonRebornClicked() {
        this._showRecoveryRebornPreview(Lang.get('reborn_no_historicalhero_tip'))
    }

    protected _onClickAdd() {
        let bornHero = G_UserData.getHistoryHero().getCanRebornHisoricalHero();
        if (bornHero == null) {
            G_Prompt.showTip(Lang.get('historyhero_popup_empty'));
        }
        else {
            // TODO:
        }
    }

    protected _doRecoveryReborn() {
        var costCount = RecoveryDataHelper.getRebornCostCount();
        var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount);
        if (!success) {
            return;
        }
        var recoveryId = this._recoveryRebornList[0].getId();
        G_UserData.getHistoryHero().c2sStarReborn(recoveryId);
        this._buttonReborn.setEnabled(false);
    }

    protected _onChooseItem(id) {
        var data = G_UserData.getHistoryHero().getHisoricalHeroValueById(id);
        super._onChooseItem(data);
    }
}