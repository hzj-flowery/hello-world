import CommonRollNumber from "./CommonRollNumber";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { TextHelper } from "../../utils/TextHelper";
import { G_ConfigLoader, G_RecoverMgr, G_Prompt, G_SceneManager, G_ConfigManager } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import ParameterIDConst from "../../const/ParameterIDConst";
import { DataConst } from "../../const/DataConst";
import { FunctionConst } from "../../const/FunctionConst";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import { WayFuncDataHelper } from "../../utils/data/WayFuncDataHelper";
import { LogicCheckHelper } from "../../utils/LogicCheckHelper";
import { Lang } from "../../lang/Lang";
import { UIPopupHelper } from "../../utils/UIPopupHelper";
import { UserCheck } from "../../utils/logic/UserCheck";
import CommonUI from "./CommonUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonTopBarItem extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _node_root: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_click: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_Blue: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _background: cc.Sprite = null;

    @property({
        type: CommonRollNumber,
        visible: true
    })
    _label_numer: CommonRollNumber = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_res_icon: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _button_add: cc.Button = null;


    _type;
    _value;

    onLoad() {
        // this._button_add.addClickEventListenerEx(handler(this, this._onAddClick), true, null, 0);
        // this._panel_click.addClickEventListenerEx(handler(this, this._onAddClick), true, null, 0);
        this._button_add.transition = cc.Button.Transition.SCALE;
        this._registerRoll(this);
    }
    _registerRoll(listener) {
        this._label_numer.setRollListener(listener);
    }
    showPanelBlue(s) {
        this._panel_Blue.active = (s);
    }
    updateUI(type, value) {
        this._type = type;
        this._value = value;
        var size = UserDataHelper.getNumByTypeAndValue(type, value);
        var typeRes = TypeConvertHelper.convert(type, value, size);
        if (typeRes.res_mini) {
            this._image_res_icon.node.addComponent(CommonUI).loadTexture(typeRes.res_mini);
        }
        if (type == TypeConvertHelper.TYPE_POWER) {
            this._label_numer.updateTxtValue(typeRes.size, null, 5);
        } else {
            this.setNumberValue(typeRes.size, type);
        }
        if (type == TypeConvertHelper.TYPE_MINE_POWER) {
            this._button_add.node.active = (false);
            this._panel_click.getComponent(cc.Button).enabled = (false);
        }
    }
    setNumberValue(value, type) {
        // var maxValue = 0; 
        var maxValue = G_RecoverMgr.getRecoverLimitByResId(this._value);
        var sizeText = TextHelper.getAmountText(value);
        if (type == TypeConvertHelper.TYPE_MINE_POWER) {
            maxValue = parseFloat(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.TROOP_MAX).content);
        }
        if (maxValue > 0) {
            this._label_numer.setString(sizeText + ('/' + maxValue));
        } else {
            this._label_numer.setString(sizeText);
        }
    }
    getNumberValue() {
        var size = UserDataHelper.getNumByTypeAndValue(this._type, this._value);
        return size;
    }
    _procRes(itemType, itemValue) {
        var getResFunc = function (itemValue) {
            var resName = DataConst.getResName(itemValue);
            var funcName = '_proc_' + resName;
            if (this[funcName] && typeof (this[funcName]) == 'function') {
                return this[funcName];
            }
        }.bind(this)
        var resFunc = null;
        if (itemType == TypeConvertHelper.TYPE_POWER || itemType == TypeConvertHelper.TYPE_RESOURCE) {
            resFunc = getResFunc(itemValue);
        }
        if (resFunc) {
            resFunc(this);
            return;
        }
        if (itemType == TypeConvertHelper.TYPE_RESOURCE) {
            if (itemValue == DataConst.RES_VIT || itemValue == DataConst.RES_SPIRIT || itemValue == DataConst.RES_TOKEN || itemValue == DataConst.RES_ARMY_FOOD || itemValue == DataConst.RES_MINE_TOKEN) {
                var [success,popDialog] = UserCheck.resCheck(itemValue, -1, true);
                if (!popDialog) {
                    G_Prompt.showTip(Lang.get('common_not_develop'));
                }
                return;
            }
        }
        UIPopupHelper.popupItemGuiderByType(itemType, itemValue,Lang.get('way_type_get'))
    }
    onAddClick(sender) {
        this._procRes(this._type, this._value);
    }
    _proc_diamond() {
        G_SceneManager.showDialog("prefab/vip/PopupCurrencyExchangeView");
    }
    _proc_power() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_NEW_STAGE);
    }
    _proc_gold() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_MONEY_TREE);
    }
    _proc_jade2() {
        G_ConfigManager.checkCanRecharge() && WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_JADE2);
    }

}