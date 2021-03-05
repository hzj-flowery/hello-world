import ListViewCellBase from "../../../ui/ListViewCellBase";
import { Lang } from "../../../lang/Lang";
import { Colors } from "../../../init";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarHurtRankNode extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRankBg1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRankBg2: cc.Sprite = null;

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
    _textPoint: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    _data: any;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(data, index, totalHp, isTaskNode) {
        this._data = data;
        this._imageRankBg1.node.active = (false);
        this._imageRankBg2.node.active = (false);
        var rank = index+1;
        if (rank <= 3 && rank > 0) {
            this._imageRank.node.active = (true);
            UIHelper.loadTexture(this._imageRank, Path.getArenaUI('img_qizhi0' + rank));
            this._textRank.node.active = (false);
        } else if (rank == 0) {
            this._imageRank.node.active = (false);
            this._textRank.node.active = (false);
        } else {
            this._imageRank.node.active = (true);
            this._textRank.node.active = (true);
            this._textRank.string = ((rank) + "");
            UIHelper.loadTexture(this._imageRank, Path.getArenaUI('img_qizhi04'));
        }
        function getRankColor(rank) {
            if (rank <= 3 && rank > 0) {
                return Colors['GUILD_DUNGEON_RANK_COLOR' + rank];
            }
            return Colors['DARK_BG_ONE'];
        }
        if (isTaskNode) {
            if (index % 2 == 0) {
                this._imageRankBg1.node.active = (true);
            } else {
                this._imageRankBg2.node.active = (true);
            }
        }
        this._imageBg.node.active = (false);
        this._textGuildName.string = (data.unit.getGuild_name());
        this._textPoint.string = (Lang.get('guildwar_rank_list_hurt_percent', { value: Math.floor(data.hurt * 100 / totalHp) }));
        this._textGuildName.node.color = (getRankColor(rank));
        this._textPoint.node.color = (getRankColor(rank));
    }

}