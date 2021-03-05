import { G_UserData } from "../../init";
import { Lang } from "../../lang/Lang";
import { handler } from "../../utils/handler";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import CommonCustomListViewEx from "../component/CommonCustomListViewEx";
import CommonEmptyTipNode from "../component/CommonEmptyTipNode";
import CommonNormalLargePop from "../component/CommonNormalLargePop";
import PopupBase from "../PopupBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseTactics extends PopupBase {
    @property({
        type: CommonNormalLargePop,
        visible: true
    }) _commonNodeBk: CommonNormalLargePop = null;
    private _callBack: any;
    private _tacticsIds: any[];
    private _pos: any;
    private _slot: any;
    private _count: number;
    @property({
        type: CommonCustomListViewEx,
        visible: true
    }) _listView: CommonCustomListViewEx = null;
    @property({
        type: CommonEmptyTipNode,
        visible: true
    }) _fileNodeEmpty: CommonEmptyTipNode = null;

    @property(cc.Prefab)
    popupChooseTacticsCell: cc.Prefab = null;
    ctor() {
        this._commonNodeBk = null;
    }
    onCreate() {
        this._commonNodeBk.addCloseEventListener(handler(this, this._onButtonClose));
    }
    onEnter() {
        if (this._callBack) {
            this.refresh();
        }
    }
    onExit() {
    }
    setTitle(title) {
        this._commonNodeBk.setTitle(title);
    }
    refresh() {
        this.updateUI(this._pos, this._slot, this._callBack);
    }
    updateUI(pos, slot, callBack) {
        this._pos = pos;
        this._slot = slot;
        this._callBack = callBack;
        this._tacticsIds = G_UserData.getTactics().getTacticsListByPos(pos, slot);
        this._count = Math.ceil(this._tacticsIds.length / 3);
        if (this._count == 0) {
            this._listView.setVisible(false);
            var emptyType = TypeConvertHelper.TYPE_TACTICS;
            this._fileNodeEmpty.updateView(emptyType);
            this._fileNodeEmpty.setButtonString(Lang.get('tactics_choose_empty_button'));
            this._fileNodeEmpty.node.active = (true);
        } else {
            this._listView.setVisible(true);
            this._listView.setTemplate(this.popupChooseTacticsCell);
            this._listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
            this._listView.setCustomCallback(handler(this, this._onItemTouch));
            this._listView.resize(this._count);
            this._fileNodeEmpty.node.active = (false);
        }
    }
    _onItemUpdate(item, index) {
        var index2 = index * 3;
        var dataList = {};
        for (var i = 1; i <= 3; i++) {
            var tacticsId = this._tacticsIds[index2 + i - 1];
            dataList[i] = tacticsId;
        }
        item.updateUI(this._pos, this._slot, dataList, true);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
        var tacticsId = this._tacticsIds[index * 3 + t - 1];
        if (this._callBack) {
            this._callBack(tacticsId);
        }
        this.close();
    }
    _onButtonClose() {
        this.close();
    }
}