const { ccclass, property } = cc._decorator;

import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import RecoveryLayerBase from './RecoveryLayerBase';
import { RecoveryConst } from '../../../const/RecoveryConst';
import { Lang } from '../../../lang/Lang';
import { PopupCheckEquipHelper } from './PopupCheckEquipHelper';

@ccclass
export default class RecoveryEquipLayer extends RecoveryLayerBase {

    private _signalEquipRecovery;

    onCreate() {
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_3, "PopupCheckEquip",
            PopupCheckEquipHelper.FROM_TYPE1, Lang.get('recovery_tip_3')
        );
        super.onCreate();
    }

    public onEnter() {
        this._signalEquipRecovery = G_SignalManager.add(SignalConst.EVENT_EQUIP_RECOVERY_SUCCESS, handler(this, this._recoverySuccess));
        super.onEnter();
    }

    public onExit() {
        this._signalEquipRecovery.remove();
        this._signalEquipRecovery = null;
        super.onExit();
    }

    public onButtonAutoAddClicked() {
        var list = G_UserData.getEquipment().getRecoveryAutoList();
        super._autoAddClicked(list, Lang.get('recovery_auto_add_no_equip'));
    }

    public onButtonRecoveryClicked() {
        this._showRecoveryRebornPreview(Lang.get('recovery_no_equip_tip'))
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
            if (data != null) {
                recoveryId.push(data.getId());
            }
        }
        G_UserData.getEquipment().c2sEquipmentRecycle(recoveryId);
        this._setBtnEnable(false);
    }
}