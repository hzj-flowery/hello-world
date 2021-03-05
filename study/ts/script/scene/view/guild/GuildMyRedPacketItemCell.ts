const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { DataConst } from '../../../const/DataConst';
import { Colors } from '../../../init';
import { GuildConst } from '../../../const/GuildConst';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';

@ccclass
export default class GuildMyRedPacketItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRedPacketName: cc.Label = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resInfo: CommonResourceInfo = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRedPacket: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textStageName: cc.Label = null;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        // this._imageRedPacket.setSwallowTouches(false);
    }
    updateData(data) {
        var config = data.getConfig();
        var money = data.getTotal_money() * data.getMultiple();
        var state = data.getRed_bag_state();
        this._textRedPacketName.string = (config.name);
        this._resInfo.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, money);
        this._resInfo.setTextColor(Colors.BRIGHT_BG_TWO);
        this._resInfo.showResName(false, null);
        if (state == GuildConst.GUILD_RED_PACKET_NO_SEND) {
            UIHelper.loadTexture(this._imageBg, Path.getCommonImage('img_com_board04b'));
            this._textStageName.string = (Lang.get('guild_red_packet_btn_send'));
            UIHelper.loadTexture(this._imageRedPacket, Path.getGuildRes('img_lit_hongbao_03'));
        } else if (state == GuildConst.GUILD_RED_PACKET_NO_RECEIVE) {
            UIHelper.loadTexture(this._imageBg, Path.getCommonImage('img_com_board04'));
            this._textStageName.string = (Lang.get('guild_red_packet_btn_open'));
            var bgRes = config.show == 1 && 'img_lit_hongbao_03' || 'img_lit_hongbao_03_2';
            UIHelper.loadTexture(this._imageRedPacket, Path.getGuildRes(bgRes));
        } else {
            UIHelper.loadTexture(this._imageBg, Path.getCommonImage('img_com_board04'));
            this._textStageName.string = (Lang.get('guild_red_packet_btn_see'));
            var bgRes = config.show == 1 && 'img_lit_hongbao_03' || 'img_lit_hongbao_04_2';
            UIHelper.loadTexture(this._imageRedPacket, Path.getGuildRes(bgRes));
        }
        var color = config.show == 1 && Colors.OBVIOUS_YELLOW || Colors.CLASS_WHITE;
        this._textStageName.node.color = (color);
    }
    onButton(sender) {
        this.dispatchCustomCallback(null);
    }

}