import TeamHorseEquipIcon from "../team/TeamHorseEquipIcon";
import { G_UserData } from "../../../init";

const { ccclass, property } = cc._decorator;
@ccclass
export default class HorseDetailEquipNode extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: TeamHorseEquipIcon,
        visible: true
    })
    _fileNodeEquip1: TeamHorseEquipIcon = null;

    @property({
        type: TeamHorseEquipIcon,
        visible: true
    })
    _fileNodeEquip2: TeamHorseEquipIcon = null;

    @property({
        type: TeamHorseEquipIcon,
        visible: true
    })
    _fileNodeEquip3: TeamHorseEquipIcon = null;

    private _horseId;
    private _horseEquipNum;
    private _horseEquipments: TeamHorseEquipIcon[];
    onLoad() {
        this._initData();
        this._initView();
    }

    _initData() {
        this._horseId = G_UserData.getHorse().getCurHorseId();
        this._horseEquipNum = 3;
    }

    _initView() {
        this._horseEquipments = [];
        for (var i = 1; i <= this._horseEquipNum; i++) {
            var horseEquip: TeamHorseEquipIcon = this['_fileNodeEquip' + i];
            horseEquip.init(this._horseId, i);
            this._horseEquipments.push(horseEquip);
        }
    }

    onEnable() {
        this.updateInfo();
    }

    onExit() {
    }

    updateInfo() {
        this._updateData();
        this._updateView();
    }

    _updateData() {
    }

    _updateView() {
        for (let i in this._horseEquipments) {
            var horseEquip = this._horseEquipments[i];
            horseEquip.updateIcon();
        }
    }

    updateHorseEquip(horseEquipPos) {
        var horseEquip = this._horseEquipments[horseEquipPos - 1];
        horseEquip.updateIcon();
    }
}