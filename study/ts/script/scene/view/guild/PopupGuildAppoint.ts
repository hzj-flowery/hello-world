const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonNormalMiniPop from '../../../ui/component/CommonNormalMiniPop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { G_SignalManager, G_UserData, G_Prompt, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { GuildConst } from '../../../const/GuildConst';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';

@ccclass
export default class PopupGuildAppoint extends PopupBase {

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _panelBg: CommonNormalMiniPop = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDes: cc.Label = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _button1: CommonButtonLevel1Normal = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _button2: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _button3: CommonButtonLevel1Highlight = null;
    _uid: any;
    _position: any;
    _signalTransferLeaderSuccess: any;
    _signalGuildPromoteSuccess: any;

    initData(uid, position) {
        this._uid = uid;
        this._position = position;
    }
    onCreate() {
        this._panelBg.setTitle(Lang.get('guild_title_appoint'));
        this._panelBg.addCloseEventListener(handler(this, this._onClickClose));
        this._textDes.string = (Lang.get('guild_appoint_desc'));
    }
    onEnter() {
        this._signalTransferLeaderSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_TRANSFER_LEADER_SUCCESS, handler(this, this._onEventGuildTransferLeaderSuccess));
        this._signalGuildPromoteSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_PROMOTE_SUCCESS, handler(this, this._onEventGuildPromoteSuccess));
        this._updateButtonState();
    }
    onExit() {
        this._signalTransferLeaderSuccess.remove();
        this._signalTransferLeaderSuccess = null;
        this._signalGuildPromoteSuccess.remove();
        this._signalGuildPromoteSuccess = null;
    }
    _updateButtonState() {
        var btnCount = 0;
        if (this._position == GuildConst.GUILD_POSITION_2) {
            this._button1.setString(Lang.get('guild_btn_transfer_leader'));
            this._button1.addClickEventListenerEx(handler(this, this.onTransferLeader));
            this._button2.setString(Lang.get('guild_btn_recall'));
            this._button2.addClickEventListenerEx(handler(this, this.onRecall));
            btnCount = 2;
        } else if (this._position == GuildConst.GUILD_POSITION_3) {
            this._button1.setString(Lang.get('guild_btn_transfer_leader'));
            this._button1.addClickEventListenerEx(handler(this, this.onTransferLeader));
            this._button2.setString(Lang.get('guild_btn_appoint_mate'));
            this._button2.addClickEventListenerEx(handler(this, this.onAppointMate));
            this._button3.setString(Lang.get('guild_btn_recall'));
            this._button3.addClickEventListenerEx(handler(this, this.onRecall));
            btnCount = 3;
        } else if (this._position == GuildConst.GUILD_POSITION_4) {
            this._button1.setString(Lang.get('guild_btn_transfer_leader'));
            this._button1.addClickEventListenerEx(handler(this, this.onTransferLeader));
            this._button2.setString(Lang.get('guild_btn_appoint_mate'));
            this._button2.addClickEventListenerEx(handler(this, this.onAppointMate));
            this._button3.setString(Lang.get('guild_btn_appoint_elder'));
            this._button3.addClickEventListenerEx(handler(this, this.onAppointElder));
            btnCount = 3;
        } else {
            // logError(string.format('Guild\'s position is Wrong = %d', this._position));
        }
        if (btnCount == 2) {
            this._button1.setVisible(true);
            this._button2.setVisible(true);
            this._button3.setVisible(false);
            this._button1.node.x = (-95);
            this._button2.node.x = (95);
        } else if (btnCount == 3) {
            this._button1.setVisible(true);
            this._button2.setVisible(true);
            this._button3.setVisible(true);
            this._button1.node.x = (-156);
            this._button2.node.x = (0);
            this._button3.node.x = (156);
        }
    }
    _onClickClose() {
        this.close();
    }
    onTransferLeader() {
        var content = Lang.get('guild_appoint_confirm_leader_des');
        var title = Lang.get('guild_appoint_confirm_title');
        var callbackOK = function () {
            G_UserData.getGuild().c2sGuildTransfer(this._uid);
        }.bind(this);
        G_SceneManager.openPopup('prefab/common/PopupSystemAlert', (popup: PopupSystemAlert) => {
            popup.setup(title, content, callbackOK);
            popup.setCheckBoxVisible(false);
            popup.openWithAction();
        })
    }
    onAppointMate() {
        var content = Lang.get('guild_appoint_confirm_mate_des');
        var title = Lang.get('guild_appoint_confirm_title');
        var callbackOK = function () {
            var count = G_UserData.getGuild().getMateCount();
            if (count >= UserDataHelper.getParameter(ParameterIDConst.GUILD_DEPUTY_NUM_ID)) {
                G_Prompt.showTip(Lang.get('guild_tip_mate_max'));
                return;
            }
            G_UserData.getGuild().c2sGuildPromote(this._uid, GuildConst.GUILD_POSITION_2);
        }.bind(this);
        G_SceneManager.openPopup('prefab/common/PopupSystemAlert', (popup: PopupSystemAlert) => {
            popup.setup(title, content, callbackOK);
            popup.setCheckBoxVisible(false);
            popup.openWithAction();
        })
    }
    onAppointElder() {
        var content = Lang.get('guild_appoint_confirm_elder_des');
        var title = Lang.get('guild_appoint_confirm_title');
        var callbackOK = function () {
            var count = G_UserData.getGuild().getElderCount();
            if (count >= UserDataHelper.getParameter(ParameterIDConst.GUILD_ELDER_NUM_ID)) {
                G_Prompt.showTip(Lang.get('guild_tip_elder_max'));
                return;
            }
            G_UserData.getGuild().c2sGuildPromote(this._uid, GuildConst.GUILD_POSITION_3);
        }.bind(this);
        G_SceneManager.openPopup('prefab/common/PopupSystemAlert', (popup: PopupSystemAlert) => {
            popup.setup(title, content, callbackOK);
            popup.setCheckBoxVisible(false);
            popup.openWithAction();
        })
    }
    onRecall() {
        var content = Lang.get('guild_appoint_confirm_recall_des');
        var title = Lang.get('guild_appoint_confirm_title');
        var callbackOK = function () {
            G_UserData.getGuild().c2sGuildPromote(this._uid, GuildConst.GUILD_POSITION_4);
        }.bind(this);
        G_SceneManager.openPopup('prefab/common/PopupSystemAlert', (popup: PopupSystemAlert) => {
            popup.setup(title, content, callbackOK);
            popup.setCheckBoxVisible(false);
            popup.openWithAction();
        })
    }
    _onEventGuildTransferLeaderSuccess(eventName, uid) {
        G_Prompt.showTip(Lang.get('guild_tip_transfer_leader_success'));
        this.close();
    }
    _onEventGuildPromoteSuccess(eventName, uid, op) {
        if (op == GuildConst.GUILD_POSITION_4) {
            G_Prompt.showTip(Lang.get('guild_tip_recall_success'));
        } else {
            var positionName = GuildDataHelper.getGuildDutiesName(op);
            G_Prompt.showTip(Lang.get('guild_tip_promote_success', { position: positionName }));
        }
        this.close();
    }

}