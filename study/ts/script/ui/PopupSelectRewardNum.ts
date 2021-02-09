import PopupSelectReward from "./PopupSelectReward";

import CommonSelectNumNode from "./component/CommonSelectNumNode";
import { handler } from "../utils/handler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupSelectRewardNum extends PopupSelectReward {
    public static path = 'common/PopupSelectRewardNum';
    @property({
        type: CommonSelectNumNode,
        visible: true
    })
    _commonNumSelect: CommonSelectNumNode = null;
    _totalNum: number;

    ctor(title, callback) {
        super.ctor(title, callback);
        this._totalNum = 1;
    }
    start() {
        this._commonNumSelect.setCallBack(handler(this, this._onNumSelect));
        this._commonNumSelect.showButtonMax(false);
    }
    setMaxLimit(max) {
        this._commonNumSelect.setMaxLimit(max);
    }
    _onNumSelect(totalNum) {
        this._totalNum = totalNum;
    }
    hideNumSelect() {
        this._commonNumSelect.node.active = false;
    }
    onEnter() {
    }
    onExit() {
    }
    onBtnOk() {
        var isBreak;
        if (this._callback) {
            var awardItem = this._itemList[this._boxIndex];
            isBreak = this._callback(awardItem, this._boxIndex, this._totalNum);
        }
        if (!isBreak) {
            this.close();
        }
    }
}