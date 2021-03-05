const { ccclass, property } = cc._decorator;

import CommonRankIcon from '../../../ui/component/CommonRankIcon'
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { Color } from '../../../utils/Color';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { G_UserData } from '../../../init';

@ccclass
export default class PopupStarRankNode extends cc.Component {

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

    private _size;
    private _rankData;
    onLoad() {
        this._size = this._panelBase.getContentSize();
        this.node.setContentSize(this._size);
        this._panelBase.on(cc.Node.EventType.TOUCH_END, handler(this, this._onPanelClick));
        //this._rank.node.active = (false);
    }
    refreshInfo(rankData) {
        this._rankData = rankData;
        var rank = this._rankData.getRank();
        var officerLevel = this._rankData.getOfficer_level();
        this._setNodeBG(rank);
        this._textRank.string = (rank);
        this._textStar.string = (this._rankData.getStar());
        this._textName.string = (this._rankData.getName());
        var chapter = this._rankData.getChapter();
        this._textRound.string = (Lang.get('mission_star_chapter', { num: chapter }));
        this._textName.node.color = (Color.getOfficialColor(officerLevel));
        UIHelper.updateTextOfficialOutline(this._textName.node, officerLevel);
    }
    _setNodeBG(rank) {
        if (rank < 4) {
            var pic = Path.getComplexRankUI('img_com_ranking0' + rank);
            UIHelper.loadTexture(this._imageBG, pic);
            this._imageBGLight.node.active = (true);
            // this._imageBG.sizeMode = cc.Sprite.SizeMode.RAW;
            this._textRank.node.active = (false);
            var icon = Path.getRankIcon(rank);
            this._rank.setRank(rank);
            this._rank.node.active =(true);
        } else {
            this._textRank.node.active =(true);
            this._rank.node.active =(false);
            this._imageBGLight.node.active =(false);
        }
        if (rank >= 4 && rank % 2 == 1) {
            var pic = Path.getCommonRankUI('img_com_board_list01b');
            UIHelper.loadTexture(this._imageBG, pic);
            // this._imageBG.sizeMode = cc.Sprite.SizeMode.RAW;
        } else if (rank >= 4 && rank % 2 == 0) {
            var pic = Path.getCommonRankUI('img_com_board_list01a');
            UIHelper.loadTexture(this._imageBG, pic);
            // this._imageBG.sizeMode = cc.Sprite.SizeMode.RAW;
        }
    }
    _onPanelClick(sender:cc.Event.EventTouch) {
        var offsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var offsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (offsetX < 20 && offsetY < 20) {
            var userId = this._rankData.getUser_id();
            if (userId != G_UserData.getBase().getId()) {
                G_UserData.getBase().c2sGetUserBaseInfo(userId);
            }
        }
    }

}