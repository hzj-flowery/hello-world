import ListViewCellBase from "../ListViewCellBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonListItem extends ListViewCellBase {
    itemID: number;
    type: number;

    public initItem(itemId: number, customCallback?) {
        this.itemID = itemId;
        this._customCallback = customCallback;
    }

    public updateItem(itemId: number, data, type?) {
        this.itemID = itemId;
        this.type = type;
        if (data != undefined) {
            this.node.active = true;
            this.updateUI(itemId, data);
        } else {
            this.node.active = false;
        }
    }

    protected updateUI(itemId, data) {

    }
    dispatchCustomCallback(...param) {
        if (this._customCallback) {
            this._customCallback(this.itemID, param.length <= 1 ? param[0] : param);
        }
    }
}