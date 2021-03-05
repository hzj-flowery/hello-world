const { ccclass, property } = cc._decorator;

import CommonRankIcon from '../../../ui/component/CommonRankIcon'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { Lang } from '../../../lang/Lang';

@ccclass
export default class RankListViewCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBG: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBGLight: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: CommonRankIcon,
        visible: true
    })
    _rank: CommonRankIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textScore: cc.Label = null;
    _data: any;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateRankUI(noImageRank) {
        var rank = this._data.getRank();
        if (rank <= 3 && rank > 0) {
            UIHelper.loadTexture(this._imageBG, Path.getComplexRankUI('img_answer_ranking0' + rank));
            this._imageBGLight.node.active = (true);
        } else {
            if (rank >= 4 && rank % 2 == 1) {
                UIHelper.loadTexture(this._imageBG, Path.getCommonRankUI('img_com_board_list01a'));
                this._imageBG.node.active = (true);
            } else if (rank >= 4 && rank % 2 == 0) {
                UIHelper.loadTexture(this._imageBG, Path.getCommonRankUI('img_com_board_list01b'));
                this._imageBG.node.active = (true);
            }
            this._imageBGLight.node.active = (false);
        }
        this._rank.node.active = (true);
        if (noImageRank) {
            this._rank.setRankType3(rank);
            this._imageBG.node.active = (false);
        } else {
            this._rank.setRankType4(rank);
            this._imageBG.node.active = (true);
        }
        this._textName.string = (this._data.getName());
        this._textScore.string = (this._data.getPoint());
    }
    updateUI(data, noImageRank) {
        if (!data) {
            return;
        }
        this._data = data;
        this.updateRankUI(noImageRank);
    }
    setImageBgVisible(trueOrFalse) {
        this._imageBG.node.active = (trueOrFalse);
    }
    setScoreEmpty() {
        this._textScore.string = (Lang.get('lang_guild_answer_rank_empty_score'));
        this._rank.node.active = (false);
    }

}