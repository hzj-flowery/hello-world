const { ccclass, property } = cc._decorator;

import CommonRankIcon from '../../../ui/component/CommonRankIcon'
import { Lang } from '../../../lang/Lang';
import { Colors, G_UserData } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { handler } from '../../../utils/handler';

@ccclass
export default class PopupTowerRankNode extends cc.Component {

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
        type: cc.Sprite,
        visible: true
    })
    _imageBGLight: cc.Sprite = null;

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
    _textRound: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textStar: cc.Label = null;

    private _rankData;

    public onLoad() {
        this._panelBase.on(cc.Node.EventType.TOUCH_END, handler(this, this._onPanelClick));
    }

    public updateUI(rankData) {
        this._rankData = rankData;
        var rank = this._rankData.getRank();
        var officerLevel = this._rankData.getOfficer_level();
        this._setNodeBG(rank);
        this._textRank.string = (this._rankData.getRank());
        this._textStar.string = (this._rankData.getStar());
        this._textName.string = (this._rankData.getName());
        var layer = this._rankData.getLayer();
        this._textRound.string = (Lang.get('challenge_tower_rank_layer_count', { count: layer }));
        var commonColor = Colors.getRankColor(rank);
        this._textRank.node.color = (commonColor);
        this._textStar.node.color = (commonColor);
        this._textRound.node.color = (commonColor);
        this._textName.node.color = (Colors.getOfficialColor(officerLevel));
        UIHelper.updateTextOfficialOutline(this._textName.node, officerLevel);
    }

    _setNodeBG(rank) {
        if (rank < 4) {
            var pic = Path.getComplexRankUI('img_com_ranking0' + rank);
            UIHelper.loadTexture(this._imageBG, pic);
            this._textRank.node.active = (false);
            var icon = Path.getRankIcon(rank);
            this._rank.setRank(rank);
            this._rank.node.active = (true);
            this._imageBGLight.node.active = (true);
        } else {
            this._textRank.node.active = (true);
            this._rank.node.active = (false);
            this._imageBGLight.node.active = (false);
        }
        if (rank >= 4 && rank % 2 == 1) {
            var pic = Path.getComplexRankUI('img_com_ranking04');
            UIHelper.loadTexture(this._imageBG, pic);
        } else if (rank >= 4 && rank % 2 == 0) {
            var pic = Path.getComplexRankUI('img_com_ranking05');
            UIHelper.loadTexture(this._imageBG, pic);
        }
    }
    _onPanelClick(sender) {
        var userId = this._rankData.getUser_id();
        if (userId != G_UserData.getBase().getId()) {
            G_UserData.getBase().c2sGetUserBaseInfo(userId);
        }
    }
}