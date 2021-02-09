const { ccclass, property } = cc._decorator;

import CommonNormalSmallPop from '../../../ui/component/CommonNormalSmallPop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { G_SignalManager, G_UserData, G_Prompt, G_ConfigLoader, G_ServerTime, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import { GuildConst } from '../../../const/GuildConst';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { ChatConst } from '../../../const/ChatConst';
import { FriendConst } from '../../../const/FriendConst';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Path } from '../../../utils/Path';
import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1';
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';
import UIHelper from '../../../utils/UIHelper';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import PopupAlert from '../../../ui/PopupAlert';
import PopupGuildAppoint from './PopupGuildAppoint';
import { ChatPlayerData } from '../../../data/ChatPlayerData';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';

@ccclass
export default class PopupGuildMemberInfo extends PopupBase {

    @property({
        type: CommonNormalSmallPop,
        visible: true
    })
    _panelBg: CommonNormalSmallPop = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _commonBtn1: CommonButtonLevel1Normal = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _commonBtn2: CommonButtonLevel1Normal = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _commonBtn3: CommonButtonLevel1Normal = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _commonBtn4: CommonButtonLevel1Normal = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _commonBtn5: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _button1: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _button2: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _button3: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon: CommonHeroIcon = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon1: CommonHeroIcon = null;
    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon2: CommonHeroIcon = null;
    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon3: CommonHeroIcon = null;
    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon4: CommonHeroIcon = null;
    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon5: CommonHeroIcon = null;
    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon6: CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDuties: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPower: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textContribution: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOnline: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOfficial: cc.Sprite = null;

    _data: any;

    public static readonly HERO_NUM = 6;
    _signalLeaveSuccess;
    _signalKickSuccess;
    _signalImpeachSuccess;
    _signalGuildUserPositionChange;
    _signalPromoteSuccess;
    _signalAddFriend;
    _signalDelFriend;


    initData(data) {
        this._data = data;

    }
    onCreate() {
        this._panelBg.setTitle(Lang.get('guild_title_member_info'));
        this._panelBg.addCloseEventListener(handler(this, this._onClickClose));
        this._commonBtn1.setString(Lang.get('common_btn_look_team'));
        this._commonBtn2.setString(Lang.get('common_btn_private_chat'));
        this._commonBtn3.setString(Lang.get('common_btn_go_black_list'));
        this._commonBtn4.setString(Lang.get('common_btn_pk_target'));
        this._commonBtn5.setString(Lang.get('common_btn_add_friend'));
    }
    onEnter() {
        this._signalLeaveSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_LEAVE_SUCCESS, handler(this, this._onEventGuildLeaveSuccess));
        this._signalKickSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_KICK_NOTICE, handler(this, this._onEventGuildKickNotice));
        this._signalImpeachSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_IMPEACHMENT_LEADER_SUCCESS, handler(this, this._onEventGuildImpeachSuccess));
        this._signalGuildUserPositionChange = G_SignalManager.add(SignalConst.EVENT_GUILD_USER_POSITION_CHANGE, handler(this, this._onEventGuildUserPositionChange));
        this._signalPromoteSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_PROMOTE_SUCCESS, handler(this, this._onEventGuildPromoteSuccess));
        this._signalAddFriend = G_SignalManager.add(SignalConst.EVENT_ADD_FRIEND_SUCCESS, handler(this, this._onAddFriendSuccess));
        this._signalDelFriend = G_SignalManager.add(SignalConst.EVENT_DEL_FRIEND_SUCCESS, handler(this, this._onDelFriendSuccess));
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.addGetUserBaseInfoEvent();
        this._updateInfo();
        this._updateButtonState();
        this._updateMiddleBtns(this._data.getUid());
    }
    onExit() {
        this._signalLeaveSuccess.remove();
        this._signalLeaveSuccess = null;
        this._signalKickSuccess.remove();
        this._signalKickSuccess = null;
        this._signalImpeachSuccess.remove();
        this._signalImpeachSuccess = null;
        this._signalGuildUserPositionChange.remove();
        this._signalGuildUserPositionChange = null;
        this._signalPromoteSuccess.remove();
        this._signalPromoteSuccess = null;
        this._signalAddFriend.remove();
        this._signalAddFriend = null;
        this._signalDelFriend.remove();
        this._signalDelFriend = null;
    }
    _updateInfo() {
        var heroBaseId = this._data.getPlayer_info().covertId;
        // assert(heroBaseId != 0, string.format('Could not find the base_id for member data: %s %d %d', this._data.getName(), this._data.getBase_id(), this._data.getAvatar()));
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
        var heroName = this._data.getName();
        var level = this._data.getLevel();
        var position = this._data.getPosition();
        var duties = GuildDataHelper.getGuildDutiesName(position);
        var power = TextHelper.getAmountText1(this._data.getPower());
        var contribution = TextHelper.getAmountText1(this._data.getWeek_contribution());
        var [onlineText, color] = UserDataHelper.getOnlineText(this._data.getOffline());
        var [officialName, officialColor, officialInfo] = GuildDataHelper.getOfficialInfo(this._data.getOfficer_level());
        this._fileNodeIcon.updateIcon(this._data.getPlayer_info(), null, this._data.getHead_frame_id());
        this._textName.string = (heroName);
        this._textName.node.color = (officialColor);
        this._textLevel.string = (level);
        this._textDuties.string = (duties);
        this._textPower.string = (power);
        this._textContribution.string = ((contribution).toString());
        this._textOnline.string = (onlineText);
        this._textOnline.node.color = (color);
        // this._imageOfficial.loadTexture(Path.getTextHero(officialInfo.picture));
        UIHelper.loadTexture(this._imageOfficial, Path.getTextHero(officialInfo.picture));
        this._imageOfficial.sizeMode = cc.Sprite.SizeMode.RAW;
        // this._imageOfficial.ignoreContentAdaptWithSize(true);
        var heroList = this._data.getHeros();
        for (var i = 1; i <= PopupGuildMemberInfo.HERO_NUM; i += 1) {
            var fileNodeIcon = this['_fileNodeIcon' + i];
            var formationHeroBaseId = (i == 1) ? heroBaseId : heroList[i - 1];
            /* if (fileNodeIcon && formationHeroBaseId && formationHeroBaseId != 0) {
                fileNodeIcon.node.active = (true);
                fileNodeIcon.updateUI(formationHeroBaseId);
            } else  */if (fileNodeIcon) {
                fileNodeIcon.node.active = (false);
            }
        }
    }
    _updateButtonState() {
        var btnData = [];
        var isSelf = this._data.isSelf();
        if (isSelf) {
            // logError('should not run here!');
        } else {
            var userInfo = G_UserData.getGuild().getMyMemberData();
            // assert(userInfo, 'PopupGuildMemberInfo _updateButtonState not find userInfo ');
            var userPosition = userInfo.getPosition();
            var position = this._data.getPosition();
            var canImpeach = GuildDataHelper.isHaveJurisdiction(userPosition, GuildConst.GUILD_JURISDICTION_9);
            var canAppoint = GuildDataHelper.isHaveJurisdiction(userPosition, GuildConst.GUILD_JURISDICTION_3);
            var canExpel = GuildDataHelper.isHaveJurisdiction(userPosition, GuildConst.GUILD_JURISDICTION_5);
            if (userPosition == GuildConst.GUILD_POSITION_1) {
                if (canAppoint) {
                    btnData.push({
                        name: Lang.get('guild_btn_appoint'),
                        event: handler(this, this._onAppoint),
                        highlight: false
                    });
                }
                if (canExpel) {
                    btnData.push({
                        name: Lang.get('guild_btn_expel'),
                        event: handler(this, this._onExpel),
                        highlight: false
                    });
                }
            } else if (userPosition == GuildConst.GUILD_POSITION_2) {
                if (position == GuildConst.GUILD_POSITION_1) {
                    if (canImpeach) {
                        btnData.push({
                            name: Lang.get('guild_btn_impeach'),
                            event: handler(this, this._onImpeach),
                            highlight: false
                        });
                    }
                } else if (position == GuildConst.GUILD_POSITION_2) {
                    // logError('should not run here!');
                } else {
                    if (canExpel) {
                        btnData.push({
                            name: Lang.get('guild_btn_expel'),
                            event: handler(this, this._onExpel),
                            highlight: false
                        });
                    }
                }
            } else if (userPosition == GuildConst.GUILD_POSITION_3) {
                if (position == GuildConst.GUILD_POSITION_1) {
                    if (canImpeach) {
                        btnData.push({
                            name: Lang.get('guild_btn_impeach'),
                            event: handler(this, this._onImpeach),
                            highlight: false
                        });
                    }
                } else if (position == GuildConst.GUILD_POSITION_2 || position == GuildConst.GUILD_POSITION_3) {
                } else {
                    if (canExpel) {
                        btnData.push({
                            name: Lang.get('guild_btn_expel'),
                            event: handler(this, this._onExpel),
                            highlight: false
                        });
                    }
                }
            } else {
                if (position == GuildConst.GUILD_POSITION_1) {
                    if (canImpeach) {
                        btnData.push({
                            name: Lang.get('guild_btn_impeach'),
                            event: handler(this, this._onImpeach),
                            highlight: false
                        });
                    }
                }
            }
        }
        var btnCount = btnData.length;
        if (btnCount == 0) {
            this._button1.setVisible(false);
            this._button2.setVisible(false);
            this._button3.setVisible(false);
        } else if (btnCount == 1) {
            this._button1.setVisible(true);
            this._button2.setVisible(false);
            this._button3.setVisible(false);
        } else if (btnCount == 2) {
            this._button1.setVisible(true);
            this._button2.setVisible(true);
            this._button3.setVisible(false);
        } else if (btnCount == 3) {
            this._button1.setVisible(true);
            this._button2.setVisible(true);
            this._button3.setVisible(true);
        }
        for (var k = 1; k <= btnData.length; k++) {
            var v = btnData[k - 1];
            var button = this['_button' + k];
            button.setString(v.name);
            button.addClickEventListenerEx(v.event);
            button.enableHighLightStyle(v.highlight);
        }
    }
    _updateMiddleBtns(uid) {
        if (G_UserData.getFriend().isUserIdInFriendList(uid)) {
            this._commonBtn5.setString(Lang.get('common_btn_delete_friend'));
        } else {
            this._commonBtn5.setString(Lang.get('common_btn_add_friend'));
        }
        if (G_UserData.getFriend().isUserIdInBlackList(uid)) {
            this._commonBtn3.setString(Lang.get('common_btn_leave_black_list'));
        } else {
            this._commonBtn3.setString(Lang.get('common_btn_go_black_list'));
        }
    }
    _onClickClose() {
        this.close();
    }
    _onButtonSeek() {
        G_UserData.getBase().c2sGetUserBaseInfo(this._data.getUid());
    }
    _onQuit() {
        var position = this._data.getPosition();
        if (position == GuildConst.GUILD_POSITION_1) {
            G_Prompt.showTip(Lang.get('guild_tip_leader_can_not_quit'));
            return;
        }
        var time = this._data.getTime();
        if (!GuildDataHelper.checkCanQuitGuild(time)) {
            return;
        }
        var timeLimit = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.GUILD_QUIT_CD_ID).content);
        var timeStr = G_ServerTime.getDayOrHourOrMinFormat(timeLimit);
        var content = Lang.get('guild_appoint_confirm_leave_des', { time: timeStr });
        var title = Lang.get('guild_appoint_confirm_title');
        var callbackOK = function () {
            G_UserData.getGuild().c2sGuildLeave();
        }.bind(this);
        G_SceneManager.openPopup('prefab/common/PopupSystemAlert', (popup: PopupSystemAlert) => {
            popup.setup(title, content, callbackOK);
            popup.setCheckBoxVisible(false);
            popup.openWithAction();
        })

    }
    _onDissolve() {
        var count = G_UserData.getGuild().getGuildMemberCount();
        if (count > 1) {
            G_Prompt.showTip(Lang.get('guild_tip_can_not_dissolve'));
            return;
        }
        var callbackOK = function () {
            G_UserData.getGuild().c2sGuildDismiss();
        }.bind(this);
        var content = Lang.get('guild_dissolve_hint');
        var title = Lang.get('guild_appoint_confirm_title');

        G_SceneManager.openPopup('prefab/common/PopupAlert', (popup: PopupAlert) => {
            popup.init(title, content, callbackOK);
            popup.openWithAction();
        })
    }
    _onAppoint() {
        G_SceneManager.openPopup('prefab/guild/PopupGuildAppoint', (popup: PopupGuildAppoint) => {
            popup.initData(this._data.getUid(), this._data.getPosition());
            popup.openWithAction();
        })
    }
    _onExpel() {
        var time = this._data.getTime();
        if (!GuildDataHelper.checkCanExpelGuild(time)) {
            return;
        }
        var myGuild = G_UserData.getGuild().getMyGuild();
        if (!myGuild) {
            return;
        }
        var remainCount = UserDataHelper.getParameter(ParameterIDConst.GUILD_MAXKICK_TIMES) - myGuild.getKick_member_cnt();

        G_SceneManager.openPopup('prefab/common/PopupAlert', (popup: PopupAlert) => {
            popup.init(null, Lang.get('guild_kick_dialog_txt', { value: remainCount }), function () {
                G_UserData.getGuild().c2sGuildKick(this._data.getUid());
            }.bind(this));
            popup.openWithAction();
        })
    }
    _onImpeach() {
        var offline = this._data.getOffline();
        if (!GuildDataHelper.checkCanImpeach(offline)) {
            return;
        }
        G_UserData.getGuild().c2sLeaderImpeachment();
    }
    onButtonSeeUserDetail(sender) {
        var uid = this._data.getUid();
        G_UserData.getBase().c2sGetUserDetailInfo(uid);
    }
    onButtonPrivateChat(sender) {
        var chatPlayerData = new ChatPlayerData();
        chatPlayerData.setDataByGuildMemberData(this._data);
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT, [
            ChatConst.CHANNEL_PRIVATE,
            chatPlayerData
        ]);
        this.close();
    }
    onButtonBattle(sender) {
        var uid = this._data.getUid();
        var sceneName = G_SceneManager.getRunningScene().getName();
        if (sceneName == 'fight') {
            G_Prompt.showTip(Lang.get('chat_pk_hint_when_infight'));
        } else {
            G_UserData.getBase().c2sPractice(uid);
        }
    }
    onButtonAddFriend(sender) {
        var uid = this._data.getUid();
        var name = this._data.getName();
        if (G_UserData.getFriend().isUserIdInFriendList(uid)) {
            G_SceneManager.openPopup('prefab/common/PopupAlert', (popup: PopupAlert) => {
                popup.init(Lang.get('common_btn_delete_friend'), Lang.get('lang_friend_delete_tips', { name: name }), function () {
                    G_UserData.getFriend().c2sDelFriend(uid, FriendConst.FRIEND_DEL_FRIEND_TYPE);
                }.bind(this));
                popup.openWithAction();
            })
        } else {
            if (G_UserData.getFriend().isUserIdInBlackList(uid)) {
                G_Prompt.showTip(Lang.get('lang_friend_add_friend_leave_black_tip'));
                return;
            }
            G_UserData.getFriend().c2sAddFriend(name, FriendConst.FRIEND_ADD_FRIEND_TYPE);
        }
    }
    onButtonAddBlackList(sender) {
        var uid = this._data.getUid();
        var name = this._data.getName();
        if (G_UserData.getFriend().isUserIdInBlackList(uid)) {
            G_UserData.getFriend().c2sDelFriend(uid, FriendConst.FRIEND_DEL_BLACK_TYPE);
        } else {
            if (G_UserData.getFriend().isUserIdInFriendList(uid)) {
                G_SceneManager.openPopup('prefab/common/PopupAlert', (popup: PopupAlert) => {
                    popup.init(Lang.get('common_btn_go_black_list'), Lang.get('lang_friend_black_tips2', { name: name }), function () {
                        G_UserData.getFriend().c2sAddFriend(name, FriendConst.FRIEND_ADD_BLACK_TYPE);
                    }.bind(this));
                    popup.openWithAction();
                })
            } else {
                G_SceneManager.openPopup('prefab/common/PopupAlert', (popup: PopupAlert) => {
                    popup.init(Lang.get('common_btn_go_black_list'), Lang.get('lang_friend_black_tips1', { name: name }), function () {
                        G_UserData.getFriend().c2sAddFriend(name, FriendConst.FRIEND_ADD_BLACK_TYPE);
                    }.bind(this));
                    popup.openWithAction();
                })
            }
        }
    }
    refreshData() {
        var uid = this._data.getUid();
        var data = G_UserData.getGuild().getGuildMemberDataWithId(uid);
        if (data) {
            this._data = data;
        }
        this._updateInfo();
        this._updateButtonState();
        this._updateMiddleBtns(this._data.getUid());
    }
    _onEventGuildLeaveSuccess() {
        G_SceneManager.popScene();
        var showTips = function () {
            var timeLimit = UserDataHelper.getParameter(ParameterIDConst.GUILD_QUIT_CD_ID);
            var timeStr = G_ServerTime.getDayOrHourOrMinFormat(timeLimit);
            G_Prompt.showTip(Lang.get('guild_quit_hint', { time: timeStr }));
        }.bind(this);
        this.schedule(function () {
            showTips();
        }, 0.3);
    }
    _onEventGuildKickNotice(eventName, uid) {
        if (uid != G_UserData.getBase().getId()) {
            G_Prompt.showTip(Lang.get('guild_tip_expel_success'));
            this.close();
        }
    }
    _onEventGuildImpeachSuccess() {
        G_Prompt.showTip(Lang.get('guild_tip_impeach_success'));
    }
    _onEventGuildUserPositionChange(eventName, uid) {
        this.refreshData();
    }
    _onEventGuildPromoteSuccess(eventName, uid, op) {
        this.refreshData();
    }
    _onEventGuildDismissSuccess() {
        G_Prompt.showTip(Lang.get('guild_tip_dismiss_success'));
        G_SceneManager.popScene();
    }
    _onAddFriendSuccess(event, message) {
        var friend_type = message.friend_type;
        if (friend_type) {
            if (friend_type == FriendConst.FRIEND_ADD_FRIEND_TYPE) {
                G_Prompt.showTip(Lang.get('lang_friend_apply_success_tip'));
            } else {
                G_Prompt.showTip(Lang.get('lang_friend_black_success_tip'));
            }
            this.refreshData();
        }
    }
    _onDelFriendSuccess(event, message) {
        var friend_type = message.friend_type;
        if (friend_type) {
            if (friend_type == FriendConst.FRIEND_DEL_FRIEND_TYPE) {
                G_Prompt.showTip(Lang.get('lang_friend_delete_success_tip'));
            } else {
                G_Prompt.showTip(Lang.get('lang_friend_del_black_success_tip'));
            }
            this.refreshData();
        }
    }

}