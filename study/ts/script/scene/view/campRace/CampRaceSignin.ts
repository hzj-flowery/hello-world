const { ccclass, property } = cc._decorator;
import CommonHelpBig from '../../../ui/component/CommonHelpBig'
import CommonMainMenu from '../../../ui/component/CommonMainMenu'
import CommonHeroPower from '../../../ui/component/CommonHeroPower'
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import ViewBase from '../../ViewBase';
import { handler } from '../../../utils/handler';
import { FunctionConst } from '../../../const/FunctionConst';
import { Lang } from '../../../lang/Lang';
import { G_SignalManager, G_UserData, G_ServerTime, G_Prompt, G_SceneManager, Colors } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { CampRaceHelper } from './CampRaceHelper';
import { CampRaceConst } from '../../../const/CampRaceConst';
import { Path } from '../../../utils/Path';
import { stringUtil } from '../../../utils/StringUtil';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class CampRaceSignin extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBG: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDirTitle: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCampBig: cc.Sprite = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnSignIn: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSignin: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCampSmall: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDetail: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeWinner: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeWinner1: cc.Node = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _avatarWinner1: CommonHeroAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePower1: cc.Sprite = null;

    @property({
        type: CommonHeroPower,
        visible: true
    })
    _heroPower1: CommonHeroPower = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeWinner2: cc.Node = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _avatarWinner2: CommonHeroAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePower2: cc.Sprite = null;

    @property({
        type: CommonHeroPower,
        visible: true
    })
    _heroPower2: CommonHeroPower = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeWinner3: cc.Node = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _avatarWinner3: CommonHeroAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePower3: cc.Sprite = null;

    @property({
        type: CommonHeroPower,
        visible: true
    })
    _heroPower3: CommonHeroPower = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeWinner4: cc.Node = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _avatarWinner4: CommonHeroAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePower4: cc.Sprite = null;

    @property({
        type: CommonHeroPower,
        visible: true
    })
    _heroPower4: CommonHeroPower = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textWinCountDown: cc.Label = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnBest8: CommonMainMenu = null;

    @property({
        type: CommonHelpBig,
        visible: true
    })
    _btnRule: CommonHelpBig = null;
    _scheduleHandler: any;
    _openState: number;
    _countDownTime: number;
    _signalGetBaseInfo: import("f:/mingjiangzhuan/main/assets/script/utils/event/Slot").Slot;
    _signalSignUp: import("f:/mingjiangzhuan/main/assets/script/utils/event/Slot").Slot;
    _signalGetChampion: import("f:/mingjiangzhuan/main/assets/script/utils/event/Slot").Slot;

    ctor() {
        this._btnSignIn.addClickEventListenerEx(handler(this, this._onSigninClick));
        this._btnBest8.addClickEventListenerEx(handler(this, this._onBest8Click));
    }
    onCreate() {
        this.setSceneSize();
        this.ctor();
        this._initData();
        this._initView();
    }
    _initData() {
        this._scheduleHandler = null;
        this._openState = 0;
        this._countDownTime = 0;
    }
    _initView() {
        this._btnBest8.updateUI(FunctionConst.FUNC_CAMP_RACE_DATE);
        this._btnSignIn.setString(Lang.get('camp_race_signin'));
        this._btnRule.updateUI(FunctionConst.FUNC_CAMP_RACE);
    }
    onEnter() {
        this._signalGetBaseInfo = G_SignalManager.add(SignalConst.EVENT_GET_CAMP_BASE_INFO, handler(this, this._onEventBaseInfo));
        this._signalSignUp = G_SignalManager.add(SignalConst.EVENT_CAMP_SIGN_UP, handler(this, this._onEventCampSignUp));
        this._signalGetChampion = G_SignalManager.add(SignalConst.EVENT_CAMP_GET_CHAMPION, handler(this, this._onEventGetChampion));
    }
    onExit() {
        this._stopCountDown();
        this._signalGetBaseInfo.remove();
        this._signalGetBaseInfo = null;
        this._signalSignUp.remove();
        this._signalSignUp = null;
        this._signalGetChampion.remove();
        this._signalGetChampion = null;
    }
    onShow() {
        this._startCountDown();
    }
    onHide() {
        this._stopCountDown();
    }
    updateInfo() {
        this._updateData();
        this._checkShowWinnerView();
        this._updateBtnState();
        this._updateCamp();
    }
    _updateData() {
        [this._openState, this._countDownTime] = CampRaceHelper.getSigninState();
    }
    _checkShowWinnerView() {
        if (this._openState == CampRaceConst.SIGNIN_NOT_OPEN) {
            G_UserData.getCampRaceData().c2sGetCampRaceChampion();
        } else {
            this._nodeWinner.active = (false);
        }
    }
    _updateBtnState() {
        var isSignUp = G_UserData.getCampRaceData().isSignUp();
        this._btnSignIn.node.active = (!isSignUp);
        this._imageSignin.node.active = (isSignUp);
    }
    _startCountDown() {
        this._stopCountDown();
        this._scheduleHandler = handler(this, this._updateCountDown);
        this.schedule(this._scheduleHandler, 1);
        this._updateCountDown();
    }
    _stopCountDown() {
        if (this._scheduleHandler != null) {
            this.unschedule(this._scheduleHandler);
            this._scheduleHandler = null;
        }
    }
    _updateStateText() {
        var state = G_UserData.getCampRaceData().getStatus();
        if (state == CampRaceConst.STATE_PRE_MATCH) {
            this._textCountTitle.string = (Lang.get('camp_pre_matching'));
            this._textCount.node.active = (false);
        } else {
            if (this._openState == CampRaceConst.SIGNIN_NOT_OPEN) {
                this._textCountTitle.string = (Lang.get('camp_pre_signin_open'));
            } else if (this._openState == CampRaceConst.SIGNIN_OPEN) {
                if (G_UserData.getCampRaceData().isSignUp()) {
                    this._textCountTitle.string = (Lang.get('camp_pre_match_open'));
                } else {
                    this._textCountTitle.string = (Lang.get('camp_pre_signin'));
                }
                this._nodeWinner.active = (false);
            }
            this._textCount.node.active = (true);
        }
    }
    _updateCountDown() {
        let getLeftDHMSFormat = function () {

            var [day, hour, min, second] = G_ServerTime.convertSecondToDayHourMinSecond(this._countDownTime);
            if (day >= 1) {
                return (Lang.get('common_time_D')).format(day, hour);
            }
            var time = (Lang.get('common_time_DHM')).format(hour, min, second);
            return time;
        }.bind(this);
        if (this._countDownTime > 0) {
            this._textCount.node.active = (true);
            this._textCount.string = (getLeftDHMSFormat());
            this._textWinCountDown.string = (getLeftDHMSFormat());
            this._countDownTime = this._countDownTime - 1;
        } else {
            this._updateData();
        }
        this._updateStateText();
    }
    _updateCamp() {
        var showCamp = G_UserData.getCampRaceData().getMyCamp();
        var bg = Path.getCampJpg('img_camp_bg' + showCamp);
        UIHelper.loadTexture(this._imageBG, bg);
        var smallCamps = [
            8,
            5,
            7,
            6
        ];
        var campSmall = Path.getTextSignet('img_com_camp0' + smallCamps[showCamp - 1]);
        UIHelper.loadTexture(this._imageCampSmall, campSmall);
        this._textDetail.string = (Lang.get('camp_sign')[showCamp - 1]);
        var campImg = Path.getCampImg('img_camp_com' + showCamp);
        UIHelper.loadTexture(this._imageCampBig, campImg);
    }
    _onSigninClick() {
        if (G_UserData.getCampRaceData().getStatus() == CampRaceConst.STATE_PRE_MATCH) {
            G_Prompt.showTip(Lang.get('camp_already_open'));
            return;
        }
        if (this._openState != CampRaceConst.SIGNIN_OPEN) {
            G_Prompt.showTip(Lang.get('camp_not_signin_open'));
            return;
        }
        G_UserData.getCampRaceData().c2sCampRaceSignUp();
    }
    _onBest8Click() {
        var state = G_UserData.getCampRaceData().getStatus();
        if (state == CampRaceConst.STATE_PRE_MATCH) {
            G_Prompt.showTip(Lang.get('camp_map_notice'));
            return;
        }
        var showCamp = G_UserData.getCampRaceData().getMyCamp();
        G_SceneManager.showDialog('prefab/campRace/PopupCampMap', null, showCamp, true);
    }
    _onEventBaseInfo() {
        this._updateBtnState();
        this._updateCamp();
    }
    _onEventCampSignUp(eventName) {
        this._updateBtnState();
        this._updateData();
    }
    _onEventGetChampion() {
        var champions = G_UserData.getCampRaceData().getChampion();
        var count = 0;
        for (var camp in champions) {
            var user = champions[camp];
            count = count + 1;
        }
        if (count == 0) {
            this._nodeWinner.active = (false);
        } else {
            this._nodeWinner.active = (true);
            for (var i = 1; i <= 4; i++) {
                var data = champions[i];
                this._updateWinner(i, data);
            }
        }
    }
    _updateWinner(index, winnerData) {
        var node = this['_nodeWinner' + index];
        var imageBg2 = node.getChildByName('ImageBG2').getComponent(cc.Sprite);
        var imageCamp = node.getChildByName('ImageCamp').getComponent(cc.Sprite);
        var smallCamps = [
            8,
            5,
            7,
            6
        ];
        var campSmall = Path.getTextSignet('img_com_camp0' + smallCamps[index - 1]);
        var textName = node.getChildByName('TextName').getComponent(cc.Label);
        var avatar = this['_avatarWinner' + index];
        var heroPower = this['_heroPower' + index];
        var imgPower = this['_imagePower' + index];
        if (winnerData) {
            imageBg2.node.active = (true);
            imageCamp.node.active = (true);
            textName.node.active = (true);
            avatar.node.active = (true);
            heroPower.node.active = (true);
            UIHelper.loadTexture(imageCamp, campSmall);
            textName.string = (winnerData.getName());
            textName.node.color = (Colors.getOfficialColor(winnerData.getOfficer_level()));
            avatar.updateUI(winnerData.getCoverId(), null, null, winnerData.getLimitLevel(), null, null, winnerData.getLimitRedLevel());
            heroPower.updateUI(winnerData.getPower());
            imgPower.node.active = (true);
        } else {
            imageBg2.node.active = (false);
            imageCamp.node.active = (false);
            textName.node.active = (false);
            avatar.node.active = (false);
            heroPower.node.active = (false);
            imgPower.node.active = (false);
        }
    }
}