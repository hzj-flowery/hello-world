const { ccclass, property } = cc._decorator;
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { Colors } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { GuildCrossWarConst } from "../../../const/GuildCrossWarConst";
import { Path } from "../../../utils/Path";
import TeamHistoryHeroIcon from "../team/TeamHistoryHeroIcon";

@ccclass
export default class GuildCrossWarAttackCell extends ListViewCellBase {
    _touchCallBack: any;

    @property({
        type: cc.Node,
        visible: true
    })
    _resource: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBack: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    _data: any;

    initData(touchCallBack) {
        this._touchCallBack = touchCallBack;
    }
    onCreate() {
        var size = this._resource.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._resource.active = (false);
    }
    updateNameColor(bSelected) {
        var fontColor = Colors.GUILDCROSSWAR_NOT_ATCCOLOR;
        var outsideColor = Colors.GUILDCROSSWAR_NOT_ATCCOLOR_OUT;
        if (bSelected) {
            fontColor = Colors.GUILDCROSSWAR_ATCCOLOR;
            outsideColor = Colors.GUILDCROSSWAR_ATCCOLOR_OUT;
        } else {
            fontColor = Colors.GUILDCROSSWAR_NOT_ATCCOLOR;
            outsideColor = Colors.GUILDCROSSWAR_NOT_ATCCOLOR_OUT;
        }
        this._textName.node.color = (fontColor);
        UIHelper.enableOutline(this._textName, outsideColor);
    }
    updateUI(data) {
        if (typeof (data) != 'object') {
            return;
        }
        this._data = data;
        this._resource.active = (true);
        UIHelper.loadTexture(this._imageBack, Path.getGuildCrossImage(GuildCrossWarConst.ATTACK_CELL_BG[data.backIndex]));
        this._textName.string = (data.point_name);
    }

    onClickPanel() {
        if (this._touchCallBack && this._data) {
            // dump(data.id);
            this._touchCallBack(this._data.id);
        }
    }
}