import PopupBase from "../PopupBase";
import CommonNormalLargePop from "../component/CommonNormalLargePop";
import CommonListView from "../component/CommonListView";
import { handler } from "../../utils/handler";
import { EquipJadeHelper } from "../../scene/view/equipmentJade/EquipJadeHelper";
import { EquipDataHelper } from "../../utils/data/EquipDataHelper";
import CommonListItem from "../component/CommonListItem";
import { FunctionConst } from "../../const/FunctionConst";
import { UserDataHelper } from "../../utils/data/UserDataHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseJadeStone extends PopupBase {
    public static path = 'common/PopupChooseJadeStone';
    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listView: CommonListView = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox: cc.Toggle = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    packageJadeCell: cc.Prefab = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTip: cc.Label = null;
    _isChange: any;
    _dataList: any[];
    _pos: number;
    _hideWear = true;
    _jadeUnitData: any;
    _equipUnitData: any;
    _callBack: any;
    _count: any;
    _type;

    ctor(isChange, type?) {
        this._isChange = isChange || false;
        this._dataList = [];
        this._pos = 1;
        this._type = type || FunctionConst.FUNC_EQUIP_TRAIN_TYPE3;
    }

    onEnable() {
        this._commonNodeBk.addCloseEventListener(handler(this, this._onButtonClose));
        // this._checkBox.addEventListener(handler(this, this._onCheckBoxClicked));
        // this._checkBox.setSelected(true);
        this._checkBox.checkMark.node.active = (this._hideWear);
        this._listView.init(this.packageJadeCell, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
    }
    setTitle(title) {
        this._commonNodeBk.setTitle(title);
    }
    updateUI(pos, jadeUnitData, equipUnitData, callBack) {
        this._pos = pos;
        this._jadeUnitData = jadeUnitData;
        this._equipUnitData = equipUnitData;
        this._callBack = callBack;
        this._updateListView();
    }
    _updateListView() {
        this._dataList = EquipJadeHelper.getEquipJadeListByWear(this._pos, this._jadeUnitData, this._equipUnitData, this._hideWear,this._type);

        var heroBaseId = 0;
        if (this._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) {
            heroBaseId = UserDataHelper.getHeroBaseIdWithEquipId(this._equipUnitData.getId())[0];
        } else if (this._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) {
            heroBaseId = UserDataHelper.getHeroBaseIdWithTreasureId(this._equipUnitData.getId())[0];
        }

        this._dataList.sort(function (data1, data2) {
            if (data1.isInEquipment() && !data2.isInEquipment()) {
                return 1;
            } else if (!data1.isInEquipment() && data2.isInEquipment()) {
                return -1;
            } else {
                if (data1.isSuitableHero(heroBaseId) && !data2.isSuitableHero(heroBaseId)) {
                    return -1;
                } else if (!data1.isSuitableHero(heroBaseId) && data2.isSuitableHero(heroBaseId)) {
                    return 1;
                } else {
                    if (data1.getConfig().color == data2.getConfig().color) {
                        if (data1.getConfig().property == data2.getConfig().property) {
                            return data1.getSys_id() - data2.getSys_id();
                        } else {
                            return data1.getConfig().property - data2.getConfig().property;
                        }
                    } else {
                        return data2.getConfig().color - data1.getConfig().color;
                    }
                }
            }
        });
        this._refreshList();
    }
    _refreshList() {
        this._count = Math.ceil(this._dataList.length / 2);
        this._listView.setData(this._count);
    }
    _onItemUpdate(item: CommonListItem, index, type) {
        var startIndex = index * 2;
        var data1 = null, data2 = null;
        var heroBaseId = EquipDataHelper.getHeroBaseIdWithEquipId(this._equipUnitData.getId())[0];
        var datas = [];
        if (this._dataList[startIndex + 0]) {
            var jadedata = this._dataList[startIndex + 0];
            data1 = jadedata
            data1.showRP = false;
            datas.push(data1);

            if (this._dataList[startIndex + 1]) {
                var jadedata = this._dataList[startIndex + 1];
                data2 = jadedata;
                data2.showRP = false;
                datas.push(data2);
            } else {
                datas.push(null);    //占位
            }
        }

        if (this._jadeUnitData) {
            var redPoint = false;
            if (!this._jadeUnitData.isSuitableHero(heroBaseId)) {
                redPoint = true;
            }
            if (data1 && !data1.isInEquipment() && !this._equipUnitData.isHaveTwoSameJade(data1.getId()) && data1.isSuitableHero(heroBaseId)) {
                data1.showRP = redPoint || data1.getConfig().color > this._jadeUnitData.getConfig().color;
            }
            if (data2 && !data2.isInEquipment() && !this._equipUnitData.isHaveTwoSameJade(data2.getId()) && data2.isSuitableHero(heroBaseId)) {
                data2.showRP = redPoint || data2.getConfig().color > this._jadeUnitData.getConfig().color;
            }
        }
        if (datas.length == 0) {
            datas = null;
        } else {
            datas.push(this._isChange);
        }
        item.updateItem(index, datas, type);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
        var unitData = this._dataList[index * 2 + t - 1];
        var jadeId = unitData.getId();
        if (this._callBack) {
            this._callBack(this._pos, jadeId);
        }
        this.close();
    }
    _onButtonClose() {
        this.close();
    }
    onCheckBoxClicked(sender) {
        this._hideWear = this._checkBox.isChecked;
        this._updateListView();
    }
}