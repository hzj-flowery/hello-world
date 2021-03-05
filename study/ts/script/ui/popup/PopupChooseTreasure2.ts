import PopupChooseBase from "./PopupChooseBase";
import { G_SignalManager, G_UserData } from "../../init";
import { SignalConst } from "../../const/SignalConst";
import { Lang } from "../../lang/Lang";
import { PopupChooseTreasureHelper } from "./PopupChooseTreasureHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseTreasure2 extends PopupChooseBase {
    public static path = 'common/PopupChooseTreasure2';

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox: cc.Toggle = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTip: cc.Label = null;

    private _hideWear;

    private _totalDatas: any[];
    private _noWearDatas: any[];
    private _showRP: any;
    private _curEquipUnitData: any;
    private _pos: any;

    public onShowFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupChooseTreasure2");
    }

    public updateUI(fromType, callBack, totalDatas, showRP, curEquipUnitData, noWearDatas, pos) {
        this._hideWear = G_UserData.getUserSetting().getHideWearEquip();
        this._checkBox.isChecked = this._hideWear;
        this._textTip.string = Lang.get('treasure_hide_tip');

        this._fromType = fromType;
        this._callBack = callBack;
        this._totalDatas = totalDatas;
        this._showRP = showRP;
        this._curEquipUnitData = curEquipUnitData;
        this._noWearDatas = noWearDatas;
        this._pos = pos;
        this._refreshList();
    }

    private _refreshList() {
        let data: any[] = null;
        let listData: any[] = null;
        var helpFunc = PopupChooseTreasureHelper['_FROM_TYPE' + this._fromType];
        if (helpFunc && typeof (helpFunc) == 'function') {
            if (this._hideWear) {
                data = helpFunc(this._noWearDatas);
            }
            else {
                data = helpFunc(this._totalDatas);
            }
        }
        if (data != null) {
            listData = [];
            for (let i = 0; i < data.length; i++) {
                listData.push(PopupChooseTreasureHelper.addTreasureDataDesc(data[i], this._fromType,
                    this._showRP, this._curEquipUnitData, this._pos));
            }
        }
        this._setData(data, listData, [this._totalDatas, this._showRP, this._curEquipUnitData, this._noWearDatas, this._pos]);
        super.updateUI(this._fromType, this._callBack);
    }

    public onCheckBoxClicked() {
        this._hideWear = this._checkBox.isChecked;
        G_UserData.getUserSetting().setHideWearEquip(this._hideWear);
        this._refreshList();
    }
}