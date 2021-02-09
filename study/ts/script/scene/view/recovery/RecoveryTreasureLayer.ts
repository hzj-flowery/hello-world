import RecoveryLayerBase from "./RecoveryLayerBase";
import { RecoveryConst } from "../../../const/RecoveryConst";
import { PopupCheckTreasureHelper } from "./PopupCheckTreasureHelper";
import { Lang } from "../../../lang/Lang";
import { G_SignalManager, G_UserData } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";

const { ccclass, property } = cc._decorator;
@ccclass
export default class RecoveryTreasureLayer extends RecoveryLayerBase {

    private _signalTreasureRecovery;

    onCreate() {
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_5, "PopupCheckTreasure",
            PopupCheckTreasureHelper.FROM_TYPE1, Lang.get('recovery_tip_5')
        );
        super.onCreate();
    }

    public onEnter() {
        this._signalTreasureRecovery = G_SignalManager.add(SignalConst.EVENT_TREASURE_RECOVERY_SUCCESS,
            handler(this, this._recoverySuccess));
        super.onEnter();
    }

    public onExit() {
        this._signalTreasureRecovery.remove();
        this._signalTreasureRecovery = null;
        super.onExit();
    }

    public onButtonAutoAddClicked() {
        var list = G_UserData.getTreasure().getRecoveryAutoList();
        super._autoAddClicked(list, Lang.get('recovery_auto_add_no_treasure'));
    }

    public onButtonRecoveryClicked() {
        this._showRecoveryRebornPreview(Lang.get('recovery_no_treasure_tip'))
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
        G_UserData.getTreasure().c2sRecoveryTreasure(recoveryId);
        this._setBtnEnable(false);
    }
}