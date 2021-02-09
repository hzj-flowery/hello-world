const { ccclass, property } = cc._decorator;
import RebornLayerBase from './RebornLayerBase';
import { RecoveryConst } from '../../../const/RecoveryConst';
import { PopupChooseEquipHelper } from '../../../ui/popup/PopupChooseEquipHelper';
import { Lang } from '../../../lang/Lang';
import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { RecoveryDataHelper } from '../../../utils/data/RecoveryDataHelper';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';

@ccclass
export default class RebornEquipLayer extends RebornLayerBase {

    private _signalEquipReborn;

    onCreate() {
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_4,
            "PopupChooseEquip",
            PopupChooseEquipHelper.FROM_TYPE3,
            Lang.get("recovery_tip_4"));
        super.onCreate();
    }

    public onEnter() {
        this._signalEquipReborn = G_SignalManager.add(SignalConst.EVENT_EQUIP_REBORN_SUCCESS, handler(this, this._rebornSuccess));
        super.onEnter();
    }

    public onExit() {
        this._signalEquipReborn.remove();
        this._signalEquipReborn = null;
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
        this._showRecoveryRebornPreview(Lang.get('reborn_no_equip_tip'))
    }

    protected _onClickAdd() {
        this._showAddPopup(Lang.get('recovery_choose_equip_title'));
    }

    protected _doRecoveryReborn() {
        var costCount = RecoveryDataHelper.getRebornCostCount();
        var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount);
        if (!success) {
            return;
        }
        var recoveryId = this._recoveryRebornList[0].getId();
        G_UserData.getEquipment().c2sEquipmentReborn(recoveryId);
        this._buttonReborn.setEnabled(false);
    }

    protected _onChooseItem(id) {
        var data = G_UserData.getEquipment().getEquipmentDataWithId(id);
        super._onChooseItem(data);
    }
}