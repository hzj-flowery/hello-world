import PopupBase from "../../../ui/PopupBase";
import { G_ResolutionManager, G_UserData } from "../../../init";
import ListView from "../recovery/ListView";
import { handler } from "../../../utils/handler";
import SeasonPetIcon from "./SeasonPetIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupPetView extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    @property({ type: ListView, visible: true })
    _scrollView: ListView = null;

    @property({ type: cc.Button, visible: true })
    _btnClose: cc.Button = null;
    @property({ type: cc.Prefab, visible: true })
    _seasonPetIconPrefab: cc.Prefab = null;

    private _petListData: any[];
    private _syncEquipedPet: any[];
    private _curPetSlot;
    private _pickCallback;
    private _closeCallback;

    public init(pickCallback, closeCallback) {
        this._petListData = null;
        this._syncEquipedPet = null;
        this._curPetSlot = 0;
        this._pickCallback = pickCallback;
        this._closeCallback = closeCallback;
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, handler(this, this.onCloseView));
    }

    public onCreate() {
        this._initListView();
        var size = G_ResolutionManager.getDesignCCSize();
        this._panelTouch.setContentSize(size);
    }

    public onEnter() {
        this._petListData = G_UserData.getSeasonSport().getPetListInfo();
        this._updateListView();
    }

    public onExit() {
    }

    public onCloseView() {
        if (this._closeCallback) {
            this._closeCallback();
        }
        this.close();
    }

    public setCurPetData(curPetSlot, data) {
        this._curPetSlot = curPetSlot;
        this._syncEquipedPet = data;
    }

    private _isExistPetInCur(petId) {
        for (let index = 0; index < this._syncEquipedPet.length; index++) {
            if (this._syncEquipedPet[index].petId == petId) {
                return true;
            }
        }
        return false;
    }

    private _initListView() {
        this._scrollView.setTemplate(this._seasonPetIconPrefab);
        this._scrollView.setCallback(handler(this, this._onCellUpdate));
    }

    private _updateListView() {
        if (!this._petListData || this._petListData.length <= 0) {
            return;
        }
        this._scrollView.resize(this._petListData.length);
    }

    private _isExistBanedPet(petId) {
        if (typeof (petId) != 'number') {
            return false;
        }
        var banedPets: any[] = G_UserData.getSeasonSport().getBanPets() || [];
        for (let key in banedPets) {
            var value = banedPets[key];
            if (value == petId) {
                return true;
            }
        }
        return false;
    }

    private _onCellUpdate(node: cc.Node, index) {
        if (!this._petListData || this._petListData.length <= 0) {
            return;
        }
        let cell: SeasonPetIcon = node.getComponent(SeasonPetIcon);

        var cellData: any = {};
        var data = this._petListData[index];
        if (data && data.cfg != null) {
            cellData = data.cfg;
            cellData.isExist = this._isExistPetInCur(cellData.id);
            cellData.isBaned = this._isExistBanedPet(cellData.id);
        }
        cell.setCustomCallback(handler(this, this._onItemTouch));
        cell.updateUI(cellData);
    }

    private _onCellSelected(cell, index) {
    }

    private _onItemTouch(itemPos) {
        let isExistAdded = function (baseId) {
            for (var index = 1; index <= this._syncEquipedPet.length; index++) {
                if (this._syncEquipedPet[index - 1].petId == baseId) {
                    if (this._curPetSlot != index) {
                        return true;
                    }
                }
            }
            return false;
        }.bind(this);
        if (isExistAdded(itemPos)) {
            return;
        }
        if (this._pickCallback) {
            this._pickCallback(itemPos);
        }
        this._updateListView();
        if (this._closeCallback) {
            this._closeCallback();
        }
        this.close();
    }
}