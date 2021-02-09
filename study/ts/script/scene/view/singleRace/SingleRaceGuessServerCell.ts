const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import { handler } from '../../../utils/handler';
import CommonListItem from '../../../ui/component/CommonListItem';
import { TextHelper } from '../../../utils/TextHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Path } from '../../../utils/Path';
import { G_UserData } from '../../../init';
import { SingleRaceConst } from '../../../const/SingleRaceConst';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { UserDetailData } from '../../../data/UserDetailData';

@ccclass
export default class SingleRaceGuessServerCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textServer: cc.Label = null;

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
        type: cc.Node,
        visible: true
    })
    _node1: cc.Node = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _nodeIcon1: CommonHeroIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOfficial1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlayerPower1: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node2: cc.Node = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _nodeIcon2: CommonHeroIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOfficial2: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlayerPower2: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node3: cc.Node = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _nodeIcon3: CommonHeroIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOfficial3: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName3: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlayerPower3: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node4: cc.Node = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _nodeIcon4: CommonHeroIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOfficial4: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName4: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlayerPower4: cc.Label = null;

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

        this._data = null;
        for (var i = 1; i <= 4; i++) {
            this['_nodeIcon' + i].onLoad();
            this['_nodeIcon' + i].setTouchEnabled(true);
            this['_nodeIcon' + i].setCallBack(handler(this, this['_onClickIcon' + i]));
        }
    }
    updateUI(index, datas) {
        var data = datas[0];
        this._data = data;
        var mySupportId = datas[1];
        var supportNum = datas[2];
        var markRes = datas[3];
        var textButton = datas[4];
        this._textServer.string = (data.getServer_name());
        this._textPower.string = (TextHelper.getAmountText1(data.getPower()));
        this.updateCount(supportNum);
        this.updateVote(mySupportId);
        var users = data.getUserDatas();
        for (var i = 1; i <= 4; i++) {
            var user = users[i-1];
            if (user) {
                this['_node' + i].active = (true);
                var [coverId, , limitLevel, limitRedLevel] = user.getCovertIdAndLimitLevel();
                var [officialName, officialColor, officialInfo] = UserDataHelper.getOfficialInfo(user.getOfficer_level());
                this['_nodeIcon' + i].updateUI(coverId, null, limitLevel, limitRedLevel);
                UIHelper.loadTexture(this['_imageOfficial' + i], Path.getTextHero(officialInfo.picture));
                this['_textName' + i].string = (user.getUser_name());
                this['_textName' + i].node.color = (officialColor);
                UIHelper.updateTextOfficialOutline(this['_textName' + i].node, user.getOfficer_level());
                this['_textPlayerPower' + i].string = (TextHelper.getAmountText1(user.getPower()));
            } else {
                this['_node' + i].active = (false);
            }
        }
        UIHelper.loadTexture(this._imageMark, markRes);
        this._buttonVote.setString(textButton);
    }
    updateVote(mySupportId) {
        var status = G_UserData.getSingleRace().getStatus();
        var isInStatus = status == SingleRaceConst.RACE_STATE_PRE;
        var isVoted = mySupportId > 0;
        var thisVoted = this._data.getServer_id() == mySupportId;
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
        return this._data.getServer_id();
    }
    _onClickIcon1() {
        if (this._data) {
            var users = this._data.getUserDatas();
            var user = users[0];
            if (user) {
                this._popupDetailInfo(user);
            }
        }
    }
    _onClickIcon2() {
        if (this._data) {
            var users = this._data.getUserDatas();
            var user = users[1];
            if (user) {
                this._popupDetailInfo(user);
            }
        }
    }
    _onClickIcon3() {
        if (this._data) {
            var users = this._data.getUserDatas();
            var user = users[2];
            if (user) {
                this._popupDetailInfo(user);
            }
        }
    }
    _onClickIcon4() {
        if (this._data) {
            var users = this._data.getUserDatas();
            var user = users[3];
            if (user) {
                this._popupDetailInfo(user);
            }
        }
    }
    _popupDetailInfo(user) {
        var userId = user.getUser_id();
        var userDetailData = G_UserData.getSingleRace().getUserDetailInfoWithId(userId);
        var power = user.getPower();
        if (userDetailData) {
            UIPopupHelper.popupUserDetailInfor(userDetailData, power);
        } else {
            var pos = G_UserData.getSingleRace().getPosWithUserIdForGuess(userId);
            G_UserData.getSingleRace().c2sGetSingleRacePositionInfo(pos);
        }
    }

}