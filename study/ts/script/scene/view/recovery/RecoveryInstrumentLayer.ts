const { ccclass, property } = cc._decorator;

import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import RecoveryLayerBase from './RecoveryLayerBase';
import { RecoveryConst } from '../../../const/RecoveryConst';
import { Lang } from '../../../lang/Lang';
import { PopupCheckInstrumentHelper } from './PopupCheckInstrumentHelper';

@ccclass
export default class RecoveryInstrumentLayer extends RecoveryLayerBase {

    private _signalInstrumentRecovery;

    onCreate() {
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_7, "PopupCheckInstrument",
            PopupCheckInstrumentHelper.FROM_TYPE1, Lang.get('recovery_tip_7')
        );
        super.onCreate();
    }

    public onEnter() {
        this._signalInstrumentRecovery = G_SignalManager.add(SignalConst.EVENT_INSTRUMENT_RECYCLE_SUCCESS, handler(this, this._recoverySuccess));
        super.onEnter();
    }

    public onExit() {
        this._signalInstrumentRecovery.remove();
        this._signalInstrumentRecovery = null;
        super.onExit();
    }

    public onButtonAutoAddClicked() {
        var list = G_UserData.getInstrument().getRecoveryAutoList();
        super._autoAddClicked(list, Lang.get('recovery_auto_add_no_instrument'));
    }

    public onButtonRecoveryClicked() {
        this._showRecoveryRebornPreview(Lang.get('recovery_no_instrument_tip'))
    }

    protected _updateView() {
        for (let i = 0; i < this._recoveryRebornNodes.length; i++) {
            var data = this._getDataWithIndex(i);
            if (data) {
                this._recoveryRebornNodes[i].updateInfo(data.getBase_id(), data.getLimit_level());
            } else {
                this._recoveryRebornNodes[i].updateInfo(null);
            }
        }
    }

    protected _doRecoveryReborn() {
        var recoveryId = [];
        for (const k in this._recoveryRebornList) {
            var data = this._recoveryRebornList[k];
            data && recoveryId.push(data.getId());
        }
        G_UserData.getInstrument().c2sInstrumentRecycle(recoveryId);
        this._setBtnEnable(false);
    }
}