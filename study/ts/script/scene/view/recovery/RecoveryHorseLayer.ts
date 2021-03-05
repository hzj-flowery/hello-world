const {ccclass, property} = cc._decorator;

import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import RecoveryLayerBase from './RecoveryLayerBase';
import { RecoveryConst } from '../../../const/RecoveryConst';
import { Lang } from '../../../lang/Lang';
import { PopupCheckHorseHelper } from './PopupCheckHorseHelper';

@ccclass
export default class RecoveryHorseLayer extends RecoveryLayerBase {

    private _signalHorseRecovery;

    onCreate() {
        this._setIsNotShowLightEffect(true);
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_11, "PopupCheckHorse",
            PopupCheckHorseHelper.FROM_TYPE1, Lang.get('recovery_tip_11')
        );
        super.onCreate();
    }

    public onEnter() {
        this._signalHorseRecovery = G_SignalManager.add(SignalConst.EVENT_HORSE_RECYCLE_SUCCESS, handler(this, this._recoverySuccess));
        super.onEnter();
    }

    public onExit() {
        this._signalHorseRecovery.remove();
        this._signalHorseRecovery = null;
        super.onExit();
    }

    public onButtonAutoAddClicked() {
        var list = G_UserData.getHorse().getRecoveryAutoList();
        super._autoAddClicked(list, Lang.get('recovery_auto_add_no_horse'));
    }

    public onButtonRecoveryClicked() {
        this._showRecoveryRebornPreview(Lang.get('recovery_no_horse_tip'))
    }

    protected _updateView() {
        for (let i = 0; i < this._recoveryRebornNodes.length; i++) {
            var data = this._getDataWithIndex(i);
            if (data) {
                this._recoveryRebornNodes[i].updateInfo(data.getBase_id(),data.getStar());
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
        G_UserData.getHorse().c2sWarHorseReclaim(recoveryId);
        this._setBtnEnable(false);
    }
}