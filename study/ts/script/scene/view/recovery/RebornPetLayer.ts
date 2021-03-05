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
import PopupChoosePetHelper from "../../../ui/popup/PopupChoosePetHelper";

const {ccclass, property} = cc._decorator;
@ccclass
export default class RebornPetLayer extends RebornLayerBase {

    private _signalPetReborn;

    onCreate() {
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_10,
            "PopupChoosePet",
            PopupChoosePetHelper.FROM_TYPE4,
            Lang.get("recovery_tip_10"));
        super.onCreate();
    }

    public onEnter() {
        this._signalPetReborn = G_SignalManager.add(SignalConst.EVENT_PET_REBORN_SUCCESS, handler(this, this._rebornSuccess));
        super.onEnter();
    }

    public onExit() {
        this._signalPetReborn.remove();
        this._signalPetReborn = null;
        super.onExit();
    }

    public _updateView() {
        var heroData = this._recoveryRebornList[0];
        if (heroData) {
            var baseId = heroData.getBase_id();
            this._recoveryRebornNodes[0].updateInfo(baseId);
        } else {
            this._recoveryRebornNodes[0].updateInfo(null);
        }
    }

    public onButtonRebornClicked() {
        this._showRecoveryRebornPreview(Lang.get('reborn_no_pet_tip'))
    }

    protected _onClickAdd() {
        var isEmpty = PopupChoosePetHelper.checkIsEmpty(PopupChoosePetHelper.FROM_TYPE4);
        if (isEmpty) {
            G_Prompt.showTip(Lang.get('pet_popup_list_empty_tip' + PopupChoosePetHelper.FROM_TYPE4));
        } else {
            this._showAddPopup(Lang.get('recovery_choose_pet_title'));
        }
    }

    protected _doRecoveryReborn() {
        var costCount = RecoveryDataHelper.getRebornCostCount();
        var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount);
        if (!success) {
            return;
        }
        var recoveryId = this._recoveryRebornList[0].getId();
        G_UserData.getPet().c2sPetReborn(recoveryId);
        this._buttonReborn.setEnabled(false);
    }

    protected _onChooseItem(heroId) {
        var data = G_UserData.getPet().getUnitDataWithId(heroId);
        super._onChooseItem(data);
    }
}