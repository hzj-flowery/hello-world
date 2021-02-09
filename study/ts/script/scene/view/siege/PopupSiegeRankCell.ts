const { ccclass, property } = cc._decorator;

import CommonRankIcon from '../../../ui/component/CommonRankIcon'
import { TextHelper } from '../../../utils/TextHelper';
import { Colors, G_UserData } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { handler } from '../../../utils/handler';

@ccclass
export default class PopupSiegeRankCell extends cc.Component {

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
    _rankIcon: CommonRankIcon = null;

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
    _textHurt: cc.Label = null;

    public static RANK_BG_DARK = 4
    public static TYPE_PERSON = 1	//个人
    public static TYPE_GUILD = 2	//工会

    private _rankData;
    private _type;

    onLoad() {
        var size = this._panelBase.getContentSize();
        this.node.setContentSize(size);
        this._panelBase.on(cc.Node.EventType.TOUCH_START, handler(this, this._onPanelClick));
    }

    private _createPersonNode() {
        this._textRank.string = (this._rankData.getRank());
        var hurt = this._rankData.getHurt();
        var strHurt = TextHelper.getAmountText2(hurt);
        this._textHurt.string = (strHurt);
        this._textName.string = (this._rankData.getName());
        var officerLevel = this._rankData.getOfficer_level();
        this._textName.node.color = (Colors.getOfficialColor(officerLevel));
        UIHelper.updateTextOfficialOutline(this._textName.node, officerLevel);
    }

    private _createGuildNode() {
        this._textRank.string = (this._rankData.getRank());
        var hurt = this._rankData.getHurt();
        var strHurt = TextHelper.getAmountText2(hurt);
        this._textHurt.string = (strHurt);
        this._textName.string = (this._rankData.getName());
    }

    private _setNodeBG(rank) {
        if (rank < 4) {
            var pic = Path.getComplexRankUI('img_com_ranking0' + rank);
            UIHelper.loadTexture(this._imageBG, pic);
            this._textRank.node.active = (false);
            this._rankIcon.setRank(rank);
            this._rankIcon.node.active = (true);
            this._imageBGLight.node.active = (true);
        } else if (rank % 2 == 1) {
            var pic = Path.getCommonRankUI('img_com_board_list01a');
            UIHelper.loadTexture(this._imageBG, pic);
            this._rankIcon.node.active = (false);
            this._textRank.node.active = (true);
            this._imageBGLight.node.active = (false);
        } else {
            var pic = Path.getCommonRankUI('img_com_board_list01b');
            UIHelper.loadTexture(this._imageBG, pic);
            this._rankIcon.node.active = (false);
            this._textRank.node.active = (true);
            this._imageBGLight.node.active = (false);
        }
    }

    private _onPanelClick(sender) {
        if (this._type == PopupSiegeRankCell.TYPE_PERSON) {
            var userId = this._rankData.getUser_id();
            if (userId != G_UserData.getBase().getId()) {
                G_UserData.getBase().c2sGetUserBaseInfo(userId);
            }
        }
    }

    public refreshInfo(rankData, type) {
        this._type = type;
        this._rankData = rankData;
        if (type == PopupSiegeRankCell.TYPE_PERSON) {
            this._createPersonNode();
        } else if (type == PopupSiegeRankCell.TYPE_GUILD) {
            this._createGuildNode();
        }
        var rank = this._rankData.getRank();
        this._setNodeBG(rank);
    }
}