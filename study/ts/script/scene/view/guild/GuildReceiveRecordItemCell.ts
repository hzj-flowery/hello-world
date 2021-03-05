const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { DataConst } from '../../../const/DataConst';
import { Colors } from '../../../init';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';

@ccclass
export default class GuildReceiveRecordItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBest: cc.Sprite = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resInfo: CommonResourceInfo = null;
    _data: any;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateData(data) {
        this._data = data;
        var money = data.getGet_money();
        var userName = data.getUser_name();
        var showBestImg = data.isIs_best();
        this._textName.string = (userName);
        this._imageBest.node.active = (showBestImg);
        this._resInfo.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, money);
        this._resInfo.setTextColor(Colors.BRIGHT_BG_ONE);
        this._resInfo.setTextCountSize(24);
        this._resInfo.showResName(false, null);
    }

}