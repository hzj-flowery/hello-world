import RebornLayerBase from "./RebornLayerBase";
import { RecoveryConst } from "../../../const/RecoveryConst";
import { Lang } from "../../../lang/Lang";
import { G_SignalManager, G_Prompt, G_UserData } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { RecoveryDataHelper } from "../../../utils/data/RecoveryDataHelper";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import { PopupChooseHorseHelper } from "../../../ui/popup/PopupChooseHorseHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class RebornHorseLayer extends RebornLayerBase {

    private _signalHorseReborn;

    onCreate() {
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_12,
            "PopupChooseHorse",
            PopupChooseHorseHelper.FROM_TYPE3,
            Lang.get("recovery_tip_12"));
        super.onCreate();
    }

    public onEnter() {
        this._signalHorseReborn = G_SignalManager.add(SignalConst.EVENT_HORSE_REBORN_SUCCESS, handler(this, this._rebornSuccess));
        super.onEnter();
    }

    public onExit() {
        this._signalHorseReborn.remove();
        this._signalHorseReborn = null;
        super.onExit();
    }

    public _updateView() {
        var data = this._recoveryRebornList[0];
        if (data) {
            var baseId = data.getBase_id();
            this._recoveryRebornNodes[0].updateInfo(data.getBase_id(), data.getStar());
        } else {
            this._recoveryRebornNodes[0].updateInfo(null);
        }
    }

    public onButtonRebornClicked() {
        this._showRecoveryRebornPreview(Lang.get('reborn_no_horse_tip'))
    }

    protected _onClickAdd() {
        var isEmpty = PopupChooseHorseHelper.checkIsEmpty(PopupChooseHorseHelper.FROM_TYPE3);
        if (isEmpty) {
            G_Prompt.showTip(Lang.get('horse_popup_list_empty_tip' + PopupChooseHorseHelper.FROM_TYPE3));
        } else {
            this._showAddPopup(Lang.get('recovery_choose_horse_title'));
        }
    }

    protected _doRecoveryReborn() {
        var costCount = RecoveryDataHelper.getRebornCostCount();
        var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount);
        if (!success) {
            return;
        }
        var recoveryId = this._recoveryRebornList[0].getId();
        G_UserData.getHorse().c2sWarHorseReborn(recoveryId);
        this._buttonReborn.setEnabled(false);
    }

    protected _onChooseItem(id) {
        var data = G_UserData.getHorse().getUnitDataWithId(id);
        super._onChooseItem(data);
    }
}