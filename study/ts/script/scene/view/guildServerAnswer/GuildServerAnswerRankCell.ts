import ListViewCellBase from "../../../ui/ListViewCellBase";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildServerAnswerRankCell extends ListViewCellBase {

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
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textScore: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    public static readonly SELF_COLOR = new cc.Color(102, 229, 0);
    public static readonly DETAULT_COLOR = new cc.Color(255, 255, 255);
    public static readonly RANK_COLOR = {
        [1]: new cc.Color(255, 25, 25),
        [2]: new cc.Color(255, 198, 25),
        [3]: new cc.Color(255, 0, 255)
    };
    _data: any;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateRankUI(isSelf) {
        var rank = this._data.getRank();
        if (rank <= 3 && rank > 0) {
            UIHelper.loadTexture(this._imageRank, Path.getArenaUI('img_qizhi0' + rank));
            this._textRank.node.active = (false);
        } else {
            UIHelper.loadTexture(this._imageRank, Path.getArenaUI('img_qizhi04' + rank));
            this._textRank.string = (rank);
            this._textRank.node.active = (true);
        }
        if (isSelf) {
            this._textName.node.color = (GuildServerAnswerRankCell.SELF_COLOR);
            this._textScore.node.color = (GuildServerAnswerRankCell.SELF_COLOR);
        } else {
            this._textName.node.color = (GuildServerAnswerRankCell.RANK_COLOR[rank] || GuildServerAnswerRankCell.DETAULT_COLOR);
            this._textScore.node.color = (GuildServerAnswerRankCell.DETAULT_COLOR);
        }
        this._textName.string = (this._data.getName());
        this._textScore.string = (this._data.getPoint());
    }
    updateUI(data, isSelf) {
        if (!data) {
            return;
        }
        this._data = data;
        this.updateRankUI(isSelf);
    }
    setImageBg(res) {
        UIHelper.loadTexture(this._imageBg, res);
    }
    setImageVisible(visible) {
        this._imageBg.node.active = (visible);
    }
}