const { ccclass, property } = cc._decorator;

import CommonShopItemCell from '../../../ui/component/CommonShopItemCell'
import { handler } from '../../../utils/handler';

@ccclass
export default class SeasonShopCell extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;

    @property({ type: CommonShopItemCell, visible: true })
    _itemInfo: CommonShopItemCell = null;

    private _customCallback;
    private _index;
    public onLoad() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    public updateUI(cellIndex, cellData) {
        this._index = cellIndex;
        this._itemInfo.updateUI(cellData);
        this._itemInfo.node.active = true;
        this._itemInfo.setCallBack(handler(this, this._onBtnClick));
    }

    private _onBtnClick(iconNameNode) {
        if(this._customCallback != null)
        {
            this._customCallback(this._index);
        }
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}