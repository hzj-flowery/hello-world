import ListViewCellBase from "../../../ui/ListViewCellBase";
import { Path } from "../../../utils/Path";
import { GuildCrossWarConst } from "../../../const/GuildCrossWarConst";
import UIHelper from "../../../utils/UIHelper";
import { GuildCrossWarHelper } from "./GuildCrossWarHelper";
import { TextHelper } from "../../../utils/TextHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildCrossWarGuildRankCell extends ListViewCellBase {

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
        type: cc.Sprite,
        visible: true
    })
    _imageRank: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHurt: cc.Label = null;

    onCreate() {
        var size = this._resource.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    _updateBack(index) {
        index = index % 2 + 1;
        UIHelper.loadTexture(this._imageBack, Path.getGuildWar(GuildCrossWarConst.GUILD_LADDER_CELL_BG[index]));
    }
    _updateRank(index) {
        if (index == null || index <= 0) {
            return;
        }
        this._textRank.node.active = (index > 3);
        if (index <= 3) {
            UIHelper.loadTexture(this._imageRank, Path.getArenaUI(GuildCrossWarConst.GUILD_LADDER_RANKNUM[index]));
        } else {
            this._textRank.string =(parseInt(index) + "");
            UIHelper.loadTexture(this._imageRank, Path.getArenaUI(GuildCrossWarConst.GUILD_LADDER_RANKNUM[4]));
        }
    }
    _updateGuildName(index, name) {
        if (index == null || index <= 0) {
            return;
        }
        this._textGuildName.string = (name);
        this._textGuildName.node.color = (GuildCrossWarHelper.getGuildNameColor(index));
    }
    _updateHurt(hurt) {
        var powerStr = TextHelper.getAmountText(hurt);
        this._textHurt.string = (powerStr);
    }
    updateUI(data) {
        this._updateBack(data.index);
        this._updateRank(data.index);
        this._updateGuildName(data.index, data.guild_name);
        this._updateHurt(data.score);
    }

}