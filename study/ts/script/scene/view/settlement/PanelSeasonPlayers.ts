import { Colors } from "../../../init";
import { SeasonSportHelper } from "../seasonSport/SeasonSportHelper";
import UIHelper from "../../../utils/UIHelper";
import { SeasonSportConst } from "../../../const/SeasonSportConst";
import { Path } from "../../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PanelSeasonPlayers extends cc.Component {
    @property({ type: cc.Sprite, visible: true })
    _imageOwnResult: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOwnSword: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOwnTitle: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOwnStar: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textOwnServerId: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textOwnPlayerName: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOtherResult: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOtherSword: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOtherTitle: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOtherStar: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textOtherServerId: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textOtherPlayerName: cc.Label = null;

    public updateUI(battleData) {
        var ownDanInfo = battleData.ownDanInfo;
        var otherDanInfo = battleData.otherDanInfo;
        var leftInfo: any = {};
        var rightInfo: any = {};
        if (ownDanInfo.isProir) {
            leftInfo = ownDanInfo;
            rightInfo = otherDanInfo;
        } else {
            leftInfo = otherDanInfo;
            rightInfo = ownDanInfo;
        }
        if (!leftInfo || leftInfo.star == null) {
            return;
        }
        if (!rightInfo || rightInfo.star == null) {
            return;
        }
        if (leftInfo.officialLevel == null || leftInfo.star == 0) {
            return;
        }
        if (rightInfo.officialLevel == null || rightInfo.star == 0) {
            return;
        }
        var ownColor = Colors.getOfficialColor(leftInfo.officialLevel);
        var otherColor = Colors.getOfficialColor(rightInfo.officialLevel);
        var ownStarInfo = SeasonSportHelper.getDanInfoByStar(leftInfo.star);
        var ownDan = parseInt(SeasonSportHelper.getDanInfoByStar(leftInfo.star).rank_1);
        var otherDan = parseInt(SeasonSportHelper.getDanInfoByStar(rightInfo.star).rank_1);
        var otherStarInfo = SeasonSportHelper.getDanInfoByStar(rightInfo.star);

        UIHelper.loadTexture(this._imageOwnSword, Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[ownDan - 1]));
        UIHelper.loadTexture(this._imageOwnTitle, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[ownDan - 1]));
        UIHelper.loadTexture(this._imageOwnStar, Path.getSeasonStar(ownStarInfo.name_pic));

        if ((leftInfo.sid as string).match(/^\D+\d+/) != null) {
            var nameStr = leftInfo.sid.match(/^\D+\d+/) + '.';
            this._textOwnServerId.string = (nameStr);
        } else {
            this._textOwnServerId.string = (leftInfo.sid);
        }
        (this._textOwnServerId as any)._updateRenderData(true);
        var targetPosX = this._textOwnServerId.node.x + this._textOwnServerId.node.getContentSize().width + SeasonSportConst.POSITION_PLAYERNAME_OFFSETX / 2;
        this._textOwnPlayerName.node.x = (targetPosX);
        this._textOwnPlayerName.string = (leftInfo.name);
        this._textOwnPlayerName.node.color = (ownColor);
        UIHelper.loadTexture(this._imageOtherSword, Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[otherDan - 1]));
        UIHelper.loadTexture(this._imageOtherTitle, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[otherDan - 1]));
        UIHelper.loadTexture(this._imageOtherStar, Path.getSeasonStar(otherStarInfo.name_pic));
        this._textOtherPlayerName.string = (rightInfo.name);
        (this._textOtherPlayerName as any)._updateRenderData(true);
        this._textOtherPlayerName.node.color = (otherColor);
        if (rightInfo.sid.match(/^\D+\d+/) != null) {
            var nameStr =rightInfo.sid.match(/^\D+\d+/) + '.';
            this._textOtherServerId.string = (nameStr);
        } else {
            this._textOtherServerId.string = (rightInfo.sid);
        }
        // (this._textOtherServerId as any)._updateRenderData(true);
        var targetPosX = this._textOtherPlayerName.node.x - this._textOtherPlayerName.node.getContentSize().width - SeasonSportConst.POSITION_PLAYERNAME_OFFSETX / 2;
        this._textOtherServerId.node.x = (targetPosX);
        if (ownDanInfo.isProir) {
            if (battleData.is_win) {
                UIHelper.loadTexture(this._imageOwnResult, Path.getTextSignet('txt_shengli01'));
                UIHelper.loadTexture(this._imageOtherResult, Path.getTextSignet('txt_lose01'));
            } else {
                UIHelper.loadTexture(this._imageOwnResult, Path.getTextSignet('txt_lose01'));
                UIHelper.loadTexture(this._imageOtherResult, Path.getTextSignet('txt_shengli01'));
            }
        } else {
            if (battleData.is_win) {
                UIHelper.loadTexture(this._imageOtherResult, Path.getTextSignet('txt_shengli01'));
                UIHelper.loadTexture(this._imageOwnResult, Path.getTextSignet('txt_lose01'));
            } else {
                UIHelper.loadTexture(this._imageOtherResult, Path.getTextSignet('txt_lose01'));
                UIHelper.loadTexture(this._imageOwnResult, Path.getTextSignet('txt_shengli01'));
            }
        }
    }
}