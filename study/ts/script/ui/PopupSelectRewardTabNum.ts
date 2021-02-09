const { ccclass, property } = cc._decorator;

import CommonSelectNumNode from './component/CommonSelectNumNode';
import PopupSelectRewardTab from './PopupSelectRewardTab';
import { handler } from '../utils/handler';

@ccclass
export default class PopupSelectRewardTabNum extends PopupSelectRewardTab {
    public static path = 'common/PopupSelectRewardTabNum';
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
    onBtnOk() {
        var isBreak;
        if (this._callback) {
            var awards = this._itemList['key' + this._selectTabIndex];
            var awardItem = awards[this._boxIndex];
            isBreak = this._callback(awardItem, this._boxIndex, this._totalNum);
        }
        if (!isBreak) {
            this.close();
        }
    }
}