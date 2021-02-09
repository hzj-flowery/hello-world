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
import { PopupChooseTreasureHelper } from "../../../ui/popup/PopupChooseTreasureHelper";

const {ccclass, property} = cc._decorator;
@ccclass
export default class RebornTreasureLayer extends RebornLayerBase {

    private _signalTreasureReborn;

    onCreate() {
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_6,
            "PopupChooseTreasure",
            PopupChooseTreasureHelper.FROM_TYPE3,
            Lang.get("recovery_tip_6"));
        super.onCreate();
    }

    public onEnter() {
        this._signalTreasureReborn = G_SignalManager.add(SignalConst.EVENT_TREASURE_REBORN_SUCCESS, handler(this, this._rebornSuccess));
        super.onEnter();
    }

    public onExit() {
        this._signalTreasureReborn.remove();
        this._signalTreasureReborn = null;
        super.onExit();
    }

    public _updateView() {
        var data = this._recoveryRebornList[0];
        if (data) {
            var baseId = data.getBase_id();
            this._recoveryRebornNodes[0].updateInfo(baseId);
        } else {
            this._recoveryRebornNodes[0].updateInfo(null);
        }
    }

    public onButtonRebornClicked() {
        this._showRecoveryRebornPreview(Lang.get('reborn_no_treasure_tip'))
    }

    protected _onClickAdd() {
        this._showAddPopup(Lang.get('recovery_choose_treasure_title'));
    }

    protected _doRecoveryReborn() {
        var costCount = RecoveryDataHelper.getRebornCostCount();
        var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount);
        if (!success) {
            return;
        }
        var recoveryId = this._recoveryRebornList[0].getId();
        G_UserData.getTreasure().c2sRebornTreasure(recoveryId);
        this._buttonReborn.setEnabled(false);
    }

    protected _onChooseItem(id) {
        var data = G_UserData.getTreasure().getTreasureDataWithId(id);
        super._onChooseItem(data);
    }
}