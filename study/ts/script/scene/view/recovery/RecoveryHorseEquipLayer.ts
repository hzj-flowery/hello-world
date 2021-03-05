const {ccclass, property} = cc._decorator;

import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import RecoveryLayerBase from './RecoveryLayerBase';
import { RecoveryConst } from '../../../const/RecoveryConst';
import { Lang } from '../../../lang/Lang';
import { PopupCheckHorseEquipHelper } from './PopupCheckHorseEquipHelper';

@ccclass
export default class RecoveryHorseEquipLayer extends RecoveryLayerBase {

    private _signalHorseEquipRecovery;

    onCreate() {
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_14, "PopupCheckHorseEquip",
            PopupCheckHorseEquipHelper.FROM_TYPE1, Lang.get('recovery_tip_14')
        );
        super.onCreate();
    }

    public onEnter() {
        this._signalHorseEquipRecovery = G_SignalManager.add(SignalConst.EVENT_HORSE_EQUIP_RECOVERY_SUCCESS, handler(this, this._recoverySuccess));
        super.onEnter();
    }

    public onExit() {
        this._signalHorseEquipRecovery.remove();
        this._signalHorseEquipRecovery = null;
        super.onExit();
    }

    public onButtonAutoAddClicked() {
        var list = G_UserData.getHorseEquipment().getAllRecoveryHorseEquipments(true);
        super._autoAddClicked(list, Lang.get('recovery_auto_add_no_horse_equip'));
    }

    public onButtonRecoveryClicked() {
        this._showRecoveryRebornPreview(Lang.get('recovery_no_horse_equip_tip'))
    }

    protected _updateView() {
        for (let i = 0; i < this._recoveryRebornNodes.length; i++) {
            var data = this._getDataWithIndex(i);
            if (data) {
                this._recoveryRebornNodes[i].updateInfo(data.getBase_id());
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
        G_UserData.getHorseEquipment().c2sWarHorseEquipmentRecovery(recoveryId);
        this._setBtnEnable(false);
    }
}