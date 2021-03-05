import CommonMainMenu from "../../../ui/component/CommonMainMenu";
import { handler } from "../../../utils/handler";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import { RecoveryConst } from "../../../const/RecoveryConst";
import { DataConst } from "../../../const/DataConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { G_ConfigLoader, G_UserData, Colors } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecoveryShopButton extends cc.Component {

    @property({ type: CommonMainMenu, visible: true })
    _nodeShop: CommonMainMenu = null;

    @property({ type: cc.Label, visible: true })
    _textName: cc.Label = null;

    @property({ type: CommonResourceInfo, visible: true })
    _fileNodeResource: CommonResourceInfo = null;

    private _recoveryType;

    onLoad() {
        this._nodeShop.addClickEventListenerEx(handler(this, this._onButtonShopClicked));
    }


    updateView(recoveryType) {
        this._recoveryType = recoveryType;
        this._setVisible(true);
        var resType = 0;
        var functionId = null;
        if (recoveryType == RecoveryConst.RECOVERY_TYPE_1 || recoveryType == RecoveryConst.RECOVERY_TYPE_2) {
            resType = DataConst.RES_SOUL;
            functionId = FunctionConst.FUNC_HERO_SHOP;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_3 || recoveryType == RecoveryConst.RECOVERY_TYPE_4) {
            resType = DataConst.RES_JADE;
            functionId = FunctionConst.FUNC_EQUIP_SHOP;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_5 || recoveryType == RecoveryConst.RECOVERY_TYPE_6) {
            resType = DataConst.RES_BAOWUZHIHUN;
            functionId = FunctionConst.FUNC_INSTRUMENT_SHOP;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_7 || recoveryType == RecoveryConst.RECOVERY_TYPE_8) {
            resType = DataConst.RES_HONOR;
            functionId = FunctionConst.FUNC_SIEGE_SHOP;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_9 || recoveryType == RecoveryConst.RECOVERY_TYPE_10) {
            resType = DataConst.RES_PET;
            functionId = FunctionConst.FUNC_PET_SHOP;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_11 || recoveryType == RecoveryConst.RECOVERY_TYPE_12) {
            resType = DataConst.RES_HORSE_SOUL;
            functionId = FunctionConst.FUNC_HORSE_SHOP;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_14) {
            resType = DataConst.RES_HORSE_SOUL;
            functionId = FunctionConst.FUNC_HORSE_SHOP;
        }
        if (functionId) {
            this._nodeShop.updateUI(functionId);
        }
        var name = G_ConfigLoader.getConfig(ConfigNameConst.RESOURCE).get(resType).name;
        this._textName.string = (name);
        var value = G_UserData.getBase().getResValue(resType);
        this._fileNodeResource.updateUI(TypeConvertHelper.TYPE_RESOURCE, resType, value);
        this._fileNodeResource.setTextColor(Colors.DARK_BG_THREE);
        this.updateValue();
    }
    updateValue() {
        var recoveryType = this._recoveryType;
        if (recoveryType == RecoveryConst.RECOVERY_TYPE_1 || recoveryType == RecoveryConst.RECOVERY_TYPE_2) {
            this._fileNodeResource.setCount(G_UserData.getBase().getResValue(DataConst.RES_SOUL));
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_3 || recoveryType == RecoveryConst.RECOVERY_TYPE_4) {
            this._fileNodeResource.setCount(G_UserData.getBase().getResValue(DataConst.RES_JADE));
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_5 || recoveryType == RecoveryConst.RECOVERY_TYPE_6) {
            this._fileNodeResource.setCount(G_UserData.getBase().getResValue(DataConst.RES_BAOWUZHIHUN));
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_7 || recoveryType == RecoveryConst.RECOVERY_TYPE_8) {
            this._fileNodeResource.setCount(G_UserData.getBase().getResValue(DataConst.RES_HONOR));
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_9 || recoveryType == RecoveryConst.RECOVERY_TYPE_10) {
            this._fileNodeResource.setCount(G_UserData.getBase().getResValue(DataConst.RES_PET));
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_11 || recoveryType == RecoveryConst.RECOVERY_TYPE_12) {
            this._fileNodeResource.setCount(G_UserData.getBase().getResValue(DataConst.RES_HORSE_SOUL));
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_14) {
            this._fileNodeResource.setCount(G_UserData.getBase().getResValue(DataConst.RES_HORSE_SOUL));
        }
        this._fileNodeResource.setTextColor(Colors.DARK_BG_THREE);
    }
    _onButtonShopClicked() {
        var recoveryType = this._recoveryType;
        if (recoveryType == RecoveryConst.RECOVERY_TYPE_1 || recoveryType == RecoveryConst.RECOVERY_TYPE_2) {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HERO_SHOP);
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_3 || recoveryType == RecoveryConst.RECOVERY_TYPE_4) {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_EQUIP_SHOP);
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_5 || recoveryType == RecoveryConst.RECOVERY_TYPE_6) {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_INSTRUMENT_SHOP);
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_7 || recoveryType == RecoveryConst.RECOVERY_TYPE_8) {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_SIEGE_SHOP);
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_9 || recoveryType == RecoveryConst.RECOVERY_TYPE_10) {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_PET_SHOP);
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_11 || recoveryType == RecoveryConst.RECOVERY_TYPE_12) {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HORSE_SHOP);
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_14) {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HORSE_SHOP);
        }
    }

    _setVisible(visible) {
        if (visible == null) {
            visible = false;
        }
        this.node.active = (visible);
    }
}