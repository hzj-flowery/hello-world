const { ccclass, property } = cc._decorator;

import { Colors } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonRankIcon from '../../../ui/component/CommonRankIcon'
import CommonUI from '../../../ui/component/CommonUI';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class RedPacketRainRankCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBG: cc.Sprite = null;

    @property({
        type: CommonRankIcon,
        visible: true
    })
    _rank: CommonRankIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textSmallCount: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBigCount: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMoney: cc.Label = null;
    _size: cc.Size;

    onCreate() {
        this._size = this._panelBase.getContentSize();
        this.node.setContentSize(this._size);
        this._rank.node.active = (false);
    }
    updateData(data, rank, hideBg) {
        this._imageBG.node.active = (!hideBg);
        if (rank == 0) {
            this._textRank.node.active = (true);
            this._rank.node.active = (false);
            this._textRank.string = (Lang.get('common_text_no_rank'));
        } else if (rank >= 1 && rank <= 3) {
            var pic = Path.getComplexRankUI('img_com_ranking0' + rank);
            this._imageBG.node.addComponent(CommonUI).loadTexture(pic);
            var icon = Path.getRankIcon(rank);
            this._rank.setRank(rank);
            this._rank.node.active = (true);
            this._textRank.node.active = (false);
        } else {
            this._textRank.node.active = (true);
            this._rank.node.active = (false);
            this._textRank.string = (rank);
            var bgResName = rank % 2 == 1 && 'img_com_board_list01b' || 'img_com_board_list01a';
            this._imageBG.node.addComponent(CommonUI).loadTexture(Path.getCommonRankUI(bgResName));
            this._imageBG.node.setContentSize(this._size);
        }
        this._textName.string = (data.getName());
        this._textSmallCount.string = (data.getSmall_red_packet());
        this._textBigCount.string = (data.getBig_red_packet());
        this._textMoney.string = (data.getMoney());
        var officerLevel = data.getOffice_level();
        this._textName.node.color = (Colors.getOfficialColor(officerLevel));
        UIHelper.updateTextOfficialOutline(this._textName.node, officerLevel);
    }
}