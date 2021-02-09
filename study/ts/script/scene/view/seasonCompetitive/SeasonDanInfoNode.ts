import { Colors } from "../../../init";
import { SeasonSportHelper } from "../seasonSport/SeasonSportHelper";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { SeasonSportConst } from "../../../const/SeasonSportConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SeasonDanInfoNode extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _ownPanel: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOwnSword: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOwnTitle: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOwnStar: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _serverOwnName: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _playerOwnName: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _precedenceOwn: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _otherPanel: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOtherSword: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOtherTitle: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOtherStar: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _serverOtherName: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _playerOtherName: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _precedenceOther: cc.Sprite = null;

    onLoad() {
        this._precedenceOwn.node.active = false;
        this._precedenceOther.node.active = false;
    }

    public updateOwnProir(bVisible) {
        console.log("updateOwnProir:",bVisible);
        this._precedenceOwn.node.active = bVisible;
        // this._precedenceOther.node.active = !bVisible;
    }

    public updateOtherProir(bVisible) {
        console.log("updateOtherProir:",bVisible);
        // this._precedenceOwn.node.active = !bVisible;
        this._precedenceOther.node.active = bVisible;
    }

    public updateUI(data) {
        this._ownPanel.active = (data.isOwn);
        this._otherPanel.active = (!data.isOwn);
        if (!data || data.star == null) {
            return;
        }
        if (data.officialLevel == null || data.star == 0) {
            return;
        }
        if (data.isOwn) {
            var ownColor = Colors.getOfficialColor(data.officialLevel);
            var ownStarInfo = SeasonSportHelper.getDanInfoByStar(data.star);
            var ownDan = parseInt(SeasonSportHelper.getDanInfoByStar(data.star).rank_1);
            UIHelper.loadTexture(this._imageOwnSword, Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[ownDan - 1]));
            UIHelper.loadTexture(this._imageOwnTitle, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[ownDan - 1]));
            UIHelper.loadTexture(this._imageOwnStar, Path.getSeasonStar(ownStarInfo.name_pic));
            if ((data.sid as string).match(/^\D+\d+/) != null) {
                var nameStr = (data.sid as string).match(/^\D+\d+/) + '.';
                this._serverOwnName.string = nameStr;
            } else {
                this._serverOwnName.string = data.sid;
            }
            UIHelper.updateLabelSize(this._serverOwnName);
            var targetPosX = this._serverOwnName.node.x + this._serverOwnName.node.getContentSize().width + SeasonSportConst.POSITION_PLAYERNAME_OFFSETX / 2;
            this._playerOwnName.node.x = targetPosX;
            this._playerOwnName.string = data.name;
            this._playerOwnName.node.color = ownColor;
        } else {
            var otherColor = Colors.getOfficialColor(data.officialLevel);
            var otherDan = parseInt(SeasonSportHelper.getDanInfoByStar(data.star).rank_1);
            var otherStarInfo = SeasonSportHelper.getDanInfoByStar(data.star);
            UIHelper.loadTexture(this._imageOtherSword, Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[otherDan - 1]));
            UIHelper.loadTexture(this._imageOtherTitle, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[otherDan - 1]));
            UIHelper.loadTexture(this._imageOtherStar, Path.getSeasonStar(otherStarInfo.name_pic));
            this._playerOtherName.string = data.name;
            this._playerOtherName.node.color = otherColor;
            if ((data.sid as string).match(/^\D+\d+/) != null) {
                var nameStr = (data.sid as string).match(/^\D+\d+/) + '.';
                this._serverOtherName.string = nameStr;
            } else {
                this._serverOtherName.string = data.sid;
            }
            UIHelper.updateLabelSize(this._playerOtherName);
            var targetPosX = this._playerOtherName.node.x - this._playerOtherName.node.getContentSize().width - SeasonSportConst.POSITION_PLAYERNAME_OFFSETX / 2;
            this._serverOtherName.node.x = targetPosX;
        }
    }
}