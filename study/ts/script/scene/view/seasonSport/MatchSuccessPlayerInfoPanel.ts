const { ccclass, property } = cc._decorator;

import CommonHeadFrame from '../../../ui/component/CommonHeadFrame'

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import { G_UserData, Colors } from '../../../init';
import { SeasonSportHelper } from './SeasonSportHelper';
import { Path } from '../../../utils/Path';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import UIHelper from '../../../utils/UIHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';

@ccclass
export default class MatchSuccessPlayerInfoPanel extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _ownPanel: cc.Node = null;

    @property({ type: CommonHeroIcon, visible: true })
    _fileNodeIconOwn: CommonHeroIcon = null;

    @property({ type: CommonHeadFrame, visible: true })
    _commonFrameOwn: CommonHeadFrame = null;

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

    @property({ type: cc.Node, visible: true })
    _otherPanel: cc.Node = null;

    @property({ type: CommonHeroIcon, visible: true })
    _fileNodeIconOther: CommonHeroIcon = null;

    @property({ type: CommonHeadFrame, visible: true })
    _commonFrameOther: CommonHeadFrame = null;

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

    public setName(type, nameStr) {
        if (type == 1) {
            this._ownPanel.name = (nameStr);
        } else {
            this._otherPanel.name = (nameStr);
        }
    }

    private _init() {
        this._fileNodeIconOwn.onLoad();
        this._fileNodeIconOther.onLoad();
        this._commonFrameOwn.onLoad();
        this._commonFrameOther.onLoad();
    }

    public updateUI(state) {
        this._init();
        var data: any = {};
        if (state == 1) {
            data = G_UserData.getSeasonSport().getOwn_DanInfo();
        } else if (state == 2) {
            data = G_UserData.getSeasonSport().getOther_DanInfo();
        }
        this._ownPanel.active = (data.isOwn);
        this._otherPanel.active = (!data.isOwn);
        if (!data || data.star == null) {
            return;
        }
        if (data.officialLevel == null || data.star == 0) {
            return;
        }
        if (data.isOwn) {
            let avatarData = {
                baseId: G_UserData.getHero().getRoleBaseId(),
                avatarBaseId: G_UserData.getBase().getAvatar_base_id(),
                covertId: data.baseId,
                isHasAvatar: G_UserData.getBase().getAvatar_base_id() && G_UserData.getBase().getAvatar_base_id() > 0
            };
            if (avatarData.covertId != null && avatarData.covertId != 0) {
                this._fileNodeIconOwn.updateIcon(avatarData);
                this._fileNodeIconOwn.setIconMask(false);
            }
            this._commonFrameOwn.updateUI(G_UserData.getBase().getHead_frame_id(), this._fileNodeIconOwn.node.scale);
            let ownColor = Colors.getOfficialColor(data.officialLevel);
            let ownStarInfo = SeasonSportHelper.getDanInfoByStar(data.star);
            let ownDan = parseInt(SeasonSportHelper.getDanInfoByStar(data.star).rank_1);
            UIHelper.loadTexture(this._imageOwnSword, Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[ownDan - 1]));
            UIHelper.loadTexture(this._imageOwnTitle, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[ownDan - 1]));
            UIHelper.loadTexture(this._imageOwnStar, Path.getSeasonStar(ownStarInfo.name_pic));
            if ((data.sid as string).match(/^\D+\d+/) != null) {
                let nameStr = (data.sid as string).match(/^\D+\d+/) + '.';
                this._serverOwnName.string = nameStr;
            } else {
                this._serverOwnName.string = data.sid;
            }
            UIHelper.updateLabelSize(this._serverOwnName);
            let targetPosX = this._serverOwnName.node.x + this._serverOwnName.node.getContentSize().width + SeasonSportConst.POSITION_PLAYERNAME_OFFSETX / 2;
            this._playerOwnName.node.x = (targetPosX);
            this._playerOwnName.string = data.name;
            this._playerOwnName.node.color = ownColor;
        } else {
            let avatarData = {
                baseId: data.baseId,
                avatarBaseId: data.avatarId,
                covertId: UserDataHelper.convertToBaseIdByAvatarBaseId(data.avatarId, data.baseId)[0],
                isHasAvatar: data.avatarId && data.avatarId > 0
            };
            if (avatarData.covertId != null && avatarData.covertId != 0) {
                this._fileNodeIconOther.updateIcon(avatarData);
                this._fileNodeIconOther.setIconMask(false);
            }
            this._commonFrameOther.updateUI(data.head_frame_id, this._fileNodeIconOther.node.scale);
            let otherColor = Colors.getOfficialColor(data.officialLevel);
            let otherDan = parseInt(SeasonSportHelper.getDanInfoByStar(data.star).rank_1);
            let otherStarInfo = SeasonSportHelper.getDanInfoByStar(data.star);
            UIHelper.loadTexture(this._imageOtherSword, Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[otherDan - 1]));
            UIHelper.loadTexture(this._imageOtherTitle, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[otherDan - 1]));
            UIHelper.loadTexture(this._imageOtherStar, Path.getSeasonStar(otherStarInfo.name_pic));
            this._playerOtherName.string = data.name;
            this._playerOtherName.node.color = otherColor;
            if ((data.sid as string).match(/^\D+\d+/) != null) {
                let nameStr = (data.sid as string).match(/^\D+\d+/) + '.';
                this._serverOtherName.string = nameStr;
            } else {
                this._serverOtherName.string = data.sid;
            }
            UIHelper.updateLabelSize(this._playerOtherName);
            let targetPosX = this._playerOtherName.node.x - this._playerOtherName.node.getContentSize().width - SeasonSportConst.POSITION_PLAYERNAME_OFFSETX / 2;
            this._serverOtherName.node.x = targetPosX;
        }
    }
}