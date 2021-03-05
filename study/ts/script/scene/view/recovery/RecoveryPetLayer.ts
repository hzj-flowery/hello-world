const { ccclass, property } = cc._decorator;

import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import RecoveryLayerBase from './RecoveryLayerBase';
import { RecoveryConst } from '../../../const/RecoveryConst';
import { Lang } from '../../../lang/Lang';
import { PopupCheckPetHelper } from './PopupCheckPetHelper';

@ccclass
export default class RecoveryPetLayer extends RecoveryLayerBase {

    private _signalPetRecovery;

    onCreate() {
        this._setIsNotShowLightEffect(true);
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_9, "PopupCheckPet",
            PopupCheckPetHelper.FROM_TYPE2, Lang.get('recovery_tip_9')
        );
        super.onCreate();
    }

    public onEnter() {
        this._signalPetRecovery = G_SignalManager.add(SignalConst.EVENT_PET_RECOVERY_SUCCESS, handler(this, this._recoverySuccess));
        super.onEnter();
    }

    public onExit() {
        this._signalPetRecovery.remove();
        this._signalPetRecovery = null;
        super.onExit();
    }

    public onButtonAutoAddClicked() {
        var list = G_UserData.getPet().getRecoveryAutoList();
        super._autoAddClicked(list, Lang.get('recovery_auto_add_no_pet'));
    }

    public onButtonRecoveryClicked() {
        this._showRecoveryRebornPreview(Lang.get('recovery_no_pet_tip'))
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
        G_UserData.getPet().c2sPetRecycle(recoveryId);
        this._setBtnEnable(false);
    }
}