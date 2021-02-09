const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonPlayerName from '../../../ui/component/CommonPlayerName'

import CommonHeadFrame from '../../../ui/component/CommonHeadFrame'

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import { G_ConfigLoader } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { SeasonSportHelper } from './SeasonSportHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';

@ccclass
export default class SeasonRankCell extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resource: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBack: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBGLight: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSortBack: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSort: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textSort: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _serverNum: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageTitle: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textStarNum: cc.Label = null;

    @property({ type: CommonHeroIcon, visible: true })
    _fileNodeIcon: CommonHeroIcon = null;

    @property({ type: CommonHeadFrame, visible: true })
    _fileHeadFrame: CommonHeadFrame = null;

    @property({ type: CommonPlayerName, visible: true })
    _fileNodeName: CommonPlayerName = null;

    @property({ type: cc.Sprite, visible: true })
    _imageHonorTitle: cc.Sprite = null;

    @property({ type: CommonButtonLevel1Highlight, visible: true })
    _fileNodeLook: CommonButtonLevel1Highlight = null;

    private _customCallback;
    private _data;

    public onLoad() {
        var size = this._resource.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._initView();
        this._fileNodeLook.addClickEventListenerEx(handler(this, this._onBtnLook));
    }

    private _initView() {
        this._fileNodeLook.setString(Lang.get('season_rank_cell_btn_text'));
    }

    private _onBtnLook(sender) {
        if (this._customCallback) {
            this._customCallback(this._data);
        }
    }

    private _updateBack(index) {
        this._textSort.node.active = (index > 3 || false);
        this._imageSort.node.active = (index <= 3 || false);
        if (index <= 3) {
            UIHelper.loadTexture(this._imageBack, Path.getComplexRankUI(SeasonSportConst.SEASON_RANKCELL_BACK[index - 1]));
            // this._imageBack.setScale9Enabled(false);
            UIHelper.loadTexture(this._imageSortBack, Path.getComplexRankUI(SeasonSportConst.SEASON_RANK_BACK[index - 1]));
            UIHelper.loadTexture(this._imageSort, Path.getComplexRankUI(SeasonSportConst.SEASON_RANK_SORTIMG[index - 1]));
            this._imageBGLight.node.active = true;
        } else {
            var slot = index % 2 + 4;
            UIHelper.loadTexture(this._imageBack, Path.getCommonRankUI(SeasonSportConst.SEASON_RANKCELL_BACK[slot - 1]));
            // this._imageBack.setScale9Enabled(true);
            // this._imageBack.setCapInsets(cc.rect(1, 1, 1, 1));
            UIHelper.loadTexture(this._imageSortBack, Path.getComplexRankUI(SeasonSportConst.SEASON_RANK_BACK[4 - 1]));
            this._textSort.string = (index).toString();
            this._imageBGLight.node.active = false;
        }
    }

    private _updateHeroIcon(data) {
        this._fileNodeIcon.updateIcon(data);
    }

    private _updateNameAndOfficial(name, officialLv, gameTitle) {
        this._fileNodeName.updateUI(name, officialLv);
        this._fileNodeName.setFontSize(22);
        this._fileNodeName.updateNameGap();
        var titleInfo = G_ConfigLoader.getConfig(ConfigNameConst.TITLE);
        if (gameTitle >= 1 && gameTitle <= titleInfo.length()) {
            var titleData = titleInfo.get(gameTitle);
            var targetPosX = this._fileNodeName.node.x + this._fileNodeName.getWidth() + 5;
            this._imageHonorTitle.node.x = targetPosX;
            this._imageHonorTitle.sizeMode = cc.Sprite.SizeMode.RAW;
            UIHelper.loadTexture(this._imageHonorTitle, Path.getImgTitle(titleData.resource));
            this._imageHonorTitle.node.active = true;
        } else {
            this._imageHonorTitle.node.active = false;
        }
    }

    private _updateServerName(serverName) {
        this._serverNum.string = serverName;
    }

    private _updateDan(star) {
        var dan = SeasonSportHelper.getDanInfoByStar(star);
        var index = parseInt(dan.rank_1);
        this._textStarNum.string = (dan.star2);
        UIHelper.loadTexture(this._imageTitle, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[index - 1]));
        UIHelper.loadTexture(this._imageStar, Path.getSeasonStar(dan.name_pic));
    }

    public updateUI(data) {
        if (!data) {
            return;
        }
        this._data = data;
        this._updateDan(data.star);
        this._updateBack(data.index + 1);
        var avatarData = {
            baseId: data.base_id,
            avatarBaseId: data.avatar_base_id,
            covertId: UserDataHelper.convertToBaseIdByAvatarBaseId(data.avatar_base_id, data.base_id)[0],
            isHasAvatar: data.avatar_base_id && data.avatar_base_id > 0
        };
        this._updateHeroIcon(avatarData);
        if (data.head_icon_id) {
            this._fileHeadFrame.updateUI(data.head_icon_id, this._fileNodeIcon.node.scale);
        }
        this._updateNameAndOfficial(data.name, data.title, data.game_title);
        this._updateServerName(data.sname);
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}