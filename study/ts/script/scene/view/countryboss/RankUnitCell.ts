import CommonListItem from "../../../ui/component/CommonListItem";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import { Colors } from "../../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RankUnitCell extends CommonListItem {
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
    _textHurt: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;


    updateUI(index, data) {
        if (!data) {
            return;
        }
        if (index !=undefined && (index + 1) % 2 == 0) {
            UIHelper.loadTexture(this._imageBg, Path.getUICommon('img_com_board_list01b'));
            this._imageBg.node.setContentSize(cc.size(248, 44));
        }
        var hurtRate = data.getHurt_rate();
        if (index == undefined && hurtRate == 0) {
            this._textHurt.string = (Lang.get('country_boss_my_rank_empty'));
        } else {
            this._textHurt.string = ('%s%').format(hurtRate / 10);
        }
        var rank = data.getRank();
        if (rank >= 1 && rank <= 3) {
            UIHelper.loadTexture(this._imageRank, Path.getArenaUI('img_qizhi0' + rank));
            this._imageRank.node.setContentSize(cc.size(30, 40));
            this._textRank.node.active = (false);
            this._imageRank.node.active = (true);
            this._textGuildName.node.color = (Colors['COUNTRY_BOSS_RANK_COLOR' + rank]);
            this._textHurt.node.color = (Colors['COUNTRY_BOSS_RANK_COLOR' + rank]);
        } else if (rank == 0) {
            this._imageRank.node.active = (false);
            this._textRank.node.active = (false);
            this._textGuildName.node.color = (Colors.BRIGHT_BG_ONE);
            this._textHurt.node.color = (Colors.BRIGHT_BG_ONE);
        } else {
            this._textRank.node.active = (true);
            this._textRank.string = (rank);
            this._imageRank.node.active = (true);
            UIHelper.loadTexture(this._imageRank, Path.getArenaUI('img_qizhi04'));
            this._imageRank.node.setContentSize(cc.size(30, 40));
            this._textGuildName.node.color = (Colors.BRIGHT_BG_ONE);
            this._textHurt.node.color = (Colors.BRIGHT_BG_ONE);
        }
        this._textGuildName.string = (data.getGuild_name());
    }
}