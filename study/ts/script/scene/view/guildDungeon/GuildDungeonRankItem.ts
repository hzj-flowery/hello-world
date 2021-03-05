import CommonListView from "../../../ui/component/CommonListView";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { Colors } from "../../../init";
import CommonListItem from "../../../ui/component/CommonListItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildDungeonRankItem extends ListViewCellBase {

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
        type: cc.Sprite,
        visible: true
    })
    _imageRank: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNum: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPoint: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;
    _data: any;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(data, index) {
        this._data = data;
        var rank = data.getRank();
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
            this._textRank.string = ((rank.toString()));
            UIHelper.loadTexture(this._imageRank, Path.getArenaUI('img_qizhi04'));
        }
        function getRankColor(rank) {
            if (rank <= 3 && rank > 0) {
                return Colors['GUILD_DUNGEON_RANK_COLOR' + rank];
            }
            return Colors['DARK_BG_ONE'];
        }
        this._imageBg.node.active = (index % 2 == 0);
        this._textGuildName.string = (data.getName());
        this._textNum.string = (data.getNum());
        this._textPoint.string = (data.getPoint());
        this._textGuildName.node.color = (getRankColor(rank));
        this._textNum.node.color = (getRankColor(rank));
        this._textPoint.node.color = (getRankColor(rank));
    }
}