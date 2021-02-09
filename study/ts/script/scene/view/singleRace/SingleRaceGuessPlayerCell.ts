const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import { handler } from '../../../utils/handler';
import CommonListItem from '../../../ui/component/CommonListItem';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import { G_UserData } from '../../../init';
import { SingleRaceConst } from '../../../const/SingleRaceConst';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';

@ccclass
export default class SingleRaceGuessPlayerCell extends CommonListItem {

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
        type: CommonHeroIcon,
        visible: true
    })
    _nodeIcon: CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textServer: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOfficial: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPower: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMark: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _buttonVote: CommonButtonLevel1Normal = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageVoted: cc.Sprite = null;
    _data: any;

    onCreate() {
        this._buttonVote.addClickEventListenerEx(handler(this, this._onButtonVoteClicked));

        this._data = 0;
        this._nodeIcon.onLoad();
        this._nodeIcon.setTouchEnabled(true);
        this._nodeIcon.setCallBack(handler(this, this._onClickIcon));
    }
    updateUI(index, datas) {
        var data = datas[0];
        var mySupportId = datas[1];
        var supportNum = datas[2];
        var markRes = datas[3];
        var textButton = datas[4];
        this._data = data;
        var [coverId, limitLevel, limitRedLevel] = data.getCovertIdAndLimitLevel();
        var [officialName, officialColor, officialInfo] = UserDataHelper.getOfficialInfo(data.getOfficer_level());
        this.updateCount(supportNum);
        this.updateVote(mySupportId);
        if (index % 2 == 1) {
            UIHelper.loadTexture(this._imageBg, Path.getIndividualCompetitiveImg('img_guessing_02'));
        } else {
            UIHelper.loadTexture(this._imageBg, Path.getIndividualCompetitiveImg('img_guessing_03'));
        }
        // this._imageBg.setScale9Enabled(true);
        // this._imageBg.setCapInsets(cc.rect(2, 2, 1, 3));
        this._nodeIcon.updateUI(coverId, null, limitLevel, limitRedLevel);
        this._textServer.string = (data.getServer_name());
        UIHelper.loadTexture(this._imageOfficial, Path.getTextHero(officialInfo.picture));
        this._textName.string = (data.getUser_name());
        this._textName.node.color = (officialColor);
        UIHelper.updateTextOfficialOutline(this._textName.node, data.getOfficer_level());
        this._textPower.string = (TextHelper.getAmountText1(data.getPower()));
        UIHelper.loadTexture(this._imageMark, markRes);
        this._buttonVote.setString (textButton);
    }
    updateVote(mySupportId) {
        var status = G_UserData.getSingleRace().getStatus();
        var isInStatus = status == SingleRaceConst.RACE_STATE_PRE;
        var isVoted = mySupportId > 0;
        var thisVoted = this._data.getUser_id() == mySupportId;
        this._buttonVote.node.active = (!isVoted && isInStatus);
        this._imageVoted.node.active = (thisVoted);
    }
    updateCount(supportNum) {
        this._textCount.string = (supportNum);
    }
    _onButtonVoteClicked() {
        this.dispatchCustomCallback(1);
    }
    getDataId() {
        return this._data.getUser_id();
    }
    _onClickIcon() {
        if (this._data) {
            var userId = this._data.getUser_id();
            var userDetailData = G_UserData.getSingleRace().getUserDetailInfoWithId(userId);
            var power = this._data.getPower();
            if (userDetailData) {
                UIPopupHelper.popupUserDetailInfor(userDetailData, power);
            } else {
                var pos = G_UserData.getSingleRace().getPosWithUserIdForGuess(userId);
                G_UserData.getSingleRace().c2sGetSingleRacePositionInfo(pos);
            }
        }
    }
}