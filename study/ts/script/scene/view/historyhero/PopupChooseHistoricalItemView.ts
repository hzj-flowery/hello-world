import { HistoryHeroConst } from "../../../const/HistoryHeroConst";
import { G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import PopupChooseBase from "../../../ui/popup/PopupChooseBase";
import { ArraySort, handler } from "../../../utils/handler";
import { table } from "../../../utils/table";
import HistoricalItemCell from "./HistoricalItemCell";

const { ccclass, property } = cc._decorator;


@ccclass
export class PopupChooseHistoricalItemView extends PopupChooseBase {
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
    _chooseData;
    private _allList: import("f:/mingjiangzhuan/main/assets/resources/script/data/HistoryHeroUnit").HistoryHeroUnit[];
    private _noWearList: any[];
    private _curData: any;

    public updateUI(fromType, chooseData, callBack) {
        this._hideWear = G_UserData.getUserSetting().getHideWearHistoryHero();
        this._textTip.string = Lang.get('treasure_hide_tip');
        this._fromType = fromType;
        this._chooseData = chooseData;
        this._callBack = callBack;
        this._initTitle();
        this._initItemData();
        this._refreshList();
    }

    private _refreshList() {
        let data: any[] = this._hideWear ? this._noWearList : this._allList;
        ArraySort(data, handler(this, this.sortFunc));
        let listData: any[] = [];
        listData.length = data.length;
        this._setData(data, listData, []);
        super.updateUI(this._fromType, this._callBack, this._chooseData);
    }

    sortFunc(a, b) {
        this.check(a);
        this.check(b);
        if (a.weight != b.weight) {
            return a.weight > b.weight;
        } else if (a.onFormation != b.onFormation) {
            return a.onFormation == 0;
        } else if (a.isEquiped() != b.isEquiped()) {
            return a.isEquiped() == true;
        } else if (a.getConfig().color != b.getConfig().color) {
            return a.getConfig().color > b.getConfig().color;
        } else if (a.getBreak_through() != b.getBreak_through()) {
            return a.getBreak_through() > b.getBreak_through();
        } else {
            return a.getId() < b.getId();
        }
    }

    check(data) {
        var weight = 0;
        var onFormation = 0;
        if (this._chooseData) {
            if (this._chooseData.getId() == data.getId()) {
                weight = 100;
            }
            if (data.isOnFormation()) {
                onFormation = 1;
            }
        } else {
            if (data.isOnFormation()) {
                onFormation = 1;
            }
        }
        data.weight = weight;
        data.onFormation = onFormation;
    }

    _initTitle() {
        if (HistoryHeroConst.TAB_TYPE_HERO == this._fromType) {
            if (this._chooseData) {
                this._commonNodeBk.setTitle(Lang.get('historyhero_title_replace'));
            } else {
                this._commonNodeBk.setTitle(Lang.get('historyhero_equip'));
            }
        } else if (HistoryHeroConst.TAB_TYPE_REBORN == this._fromType) {
            this._commonNodeBk.setTitle(Lang.get('historyhero_reborn'));
        } else {
            this._commonNodeBk.setTitle(Lang.get('historyhero_awake_poptitle'));
        }
        this._commonNodeBk.addCloseEventListener(handler(this, this._onButtonClose));
    }

    addDataDesc(data, fromType, i) {
        data.isDown = this._chooseData && i == 0;
        data.btnType = this._chooseData ? HistoricalItemCell.BTN_TYPE_REPLACE_FORMATION : HistoricalItemCell.BTN_TYPE_ADD_FORMATION;
        return data;
    }

    _initItemData() {
        if (HistoryHeroConst.TAB_TYPE_AWAKE == this._fromType) {
            this._curData = G_UserData.getHistoryHero().getWeaponList();
        } else if (HistoryHeroConst.TAB_TYPE_REBORN == this._fromType) {
            this._curData = G_UserData.getHistoryHero().getCanRebornHisoricalHero();
        } else if (HistoryHeroConst.TAB_TYPE_BREAK == this._fromType || HistoryHeroConst.TAB_TYPE_HERO == this._fromType) {
            this._allList = G_UserData.getHistoryHero().getHeroList();
            this._noWearList = G_UserData.getHistoryHero().getNotInFormationList();
            if (this._chooseData) {
                table.insert(this._noWearList, this._chooseData);
            }
        }
    }

    public onCheckBoxClicked() {
        this._hideWear = this._checkBox.isChecked;
        G_UserData.getUserSetting().setHideWearHistoryHero(this._hideWear);
        this._refreshList();
    }
}