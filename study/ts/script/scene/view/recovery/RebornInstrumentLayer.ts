import RebornLayerBase from "./RebornLayerBase";
import { RecoveryConst } from "../../../const/RecoveryConst";
import { Lang } from "../../../lang/Lang";
import { G_SignalManager, G_UserData } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { RecoveryDataHelper } from "../../../utils/data/RecoveryDataHelper";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import PopupChooseInstrumentHelper from "../../../ui/popup/PopupChooseInstrumentHelper";

const {ccclass, property} = cc._decorator;
@ccclass
export default class RebornInstrumentLayer extends RebornLayerBase {

    private _signalInstrumentReborn;

    onCreate() {
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_8,
            "PopupChooseInstrument",
            PopupChooseInstrumentHelper.FROM_TYPE3,
            Lang.get("recovery_tip_8"));
        super.onCreate();
    }

    public onEnter() {
        this._signalInstrumentReborn = G_SignalManager.add(SignalConst.EVENT_INSTRUMENT_REBORN_SUCCESS, handler(this, this._rebornSuccess));
        super.onEnter();
    }

    public onExit() {
        this._signalInstrumentReborn.remove();
        this._signalInstrumentReborn = null;
        super.onExit();
    }

    public _updateView() {
        var data = this._recoveryRebornList[0];
        if (data) {
            var baseId = data.getBase_id();
            var limitLevel = data.getLimit_level();
            this._recoveryRebornNodes[0].updateInfo(baseId, limitLevel);
        } else {
            this._recoveryRebornNodes[0].updateInfo(null);
        }
    }

    public onButtonRebornClicked() {
        this._showRecoveryRebornPreview(Lang.get('reborn_no_instrument_tip'))
    }

    protected _onClickAdd() {
        this._showAddPopup(Lang.get('recovery_choose_instrument_title'));
    }

    protected _doRecoveryReborn() {
        var costCount = RecoveryDataHelper.getRebornCostCount();
        var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount);
        if (!success) {
            return;
        }
        var recoveryId = this._recoveryRebornList[0].getId();
        G_UserData.getInstrument().c2sInstrumentReborn(recoveryId);
        this._buttonReborn.setEnabled(false);
    }

    protected _onChooseItem(id) {
        var data = G_UserData.getInstrument().getInstrumentDataWithId(id);
        super._onChooseItem(data);
    }
}