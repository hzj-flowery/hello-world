import CommonNormalMiniPop from "../component/CommonNormalMiniPop";
import CommonNormalMiniPop4 from "../component/CommonNormalMiniPop4";
import CommonHeroIcon from "../component/CommonHeroIcon";
import CommonPlayerName from "../component/CommonPlayerName";
import CommonButtonSwitchLevel1 from "../component/CommonButtonSwitchLevel1";
import { G_Prompt, G_UserData, G_SignalManager, G_SceneManager } from "../../init";
import { Lang } from "../../lang/Lang";
import { FriendConst } from "../../const/FriendConst";
import { handler } from "../../utils/handler";
import { SignalConst } from "../../const/SignalConst";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import { TextHelper } from "../../utils/TextHelper";
import { FunctionConst } from "../../const/FunctionConst";
import { FunctionCheck } from "../../utils/logic/FunctionCheck";
import { LogicCheckHelper } from "../../utils/LogicCheckHelper";
import { ChatConst } from "../../const/ChatConst";
import { ChatPlayerData } from "../../data/ChatPlayerData";
import { WayFuncDataHelper } from "../../utils/data/WayFuncDataHelper";
import PopupBase from "../PopupBase";
import { UIPopupHelper } from "../../utils/UIPopupHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupUserBaseInfo extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelInfo: cc.Node = null;

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMiniPop = null;

    @property({
        type: CommonNormalMiniPop4,
        visible: true
    })
    _commonNodeBk2: CommonNormalMiniPop4 = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _commonIcon: CommonHeroIcon = null;

    @property({
        type: CommonPlayerName,
        visible: true
    })
    _commonPlayerName: CommonPlayerName = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonBtn1: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonBtn2: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonBtn3: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonBtn4: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonBtn5: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonBtn6: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonBtn7: CommonButtonSwitchLevel1 = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_3: cc.Node = null;

    private static COMMON_LOOK_BTN = 1;
    private static COMMON_PRIVATE_BTN = 2;
    private static COMMON_ON_CHAT_BTN = 3;
    private static COMMON_PK_BTN = 4;
    private static COMMON_ADD_FRIEND_BTN = 5;
    private static COMMON_DEL_ENEMY_BTN = 6;
    private static COMMON_CREATE_TEAM = 7;
    private static BTN_NUM = 7;

    private _title: string;
    private _callback: any;
    private _signalAddFriend: any;
    private _signalDelFriend: any;
    private _signalDelEnemy: any;
    private _simpleUser: any;


    setInitData(callback) {
        this._callback = callback;
    }
    onCreate() {
        this._title = Lang.get('common_title_look_player_info');
        this._commonNodeBk.setTitle(this._title);
        this._commonNodeBk.hideBtnBg();
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._commonNodeBk2.setTitle(this._title);
        this._commonNodeBk2.hideBtnBg();
        this._commonNodeBk2.addCloseEventListener(handler(this, this.onBtnCancel));
    }
    onEnter() {
        this._signalAddFriend = G_SignalManager.add(SignalConst.EVENT_ADD_FRIEND_SUCCESS, handler(this, this._onAddFriendSuccess));
        this._signalDelFriend = G_SignalManager.add(SignalConst.EVENT_DEL_FRIEND_SUCCESS, handler(this, this._onDelFriendSuccess));
        this._signalDelEnemy = G_SignalManager.add(SignalConst.EVENT_DEL_ENEMY_SUCCESS, handler(this, this._onDelEnemySuccess));
    }
    onExit() {
        this._signalAddFriend.remove();
        this._signalAddFriend = null;
        this._signalDelFriend.remove();
        this._signalDelFriend = null;
        this._signalDelEnemy.remove();
        this._signalDelEnemy = null;
    }
    updateUI(simpleUser) {
        this._simpleUser = simpleUser;
        var guildName = simpleUser.guildName;
        if (simpleUser.guildName == null || simpleUser.guildName == '') {
            guildName = Lang.get('common_text_no');
        }
        var [baseId, avatarTable] = UserDataHelper.convertAvatarId(simpleUser);
        var head_frame_id = simpleUser['head_frame_id'] || 1;
        this._commonIcon.updateIcon(avatarTable, null, head_frame_id);
        this._commonPlayerName.updateUI(simpleUser.name, simpleUser.officeLevel);
        var updateNodeValue = function (node: cc.Node, value) {
            (node.getChildByName("Text_value") as cc.Node).getComponent(cc.Label).string = value;
        }
        updateNodeValue(this._node_1, simpleUser.level);
        updateNodeValue(this._node_2, TextHelper.getAmountText(simpleUser.power));
        updateNodeValue(this._node_3, guildName);
        var btnData = [];
        btnData.push({
            btnId: PopupUserBaseInfo.COMMON_LOOK_BTN,
            name: Lang.get('common_btn_look_team'),
            event: handler(this, this.onCommonBtnClick),
            highlight: true
        });
        btnData.push({
            btnId: PopupUserBaseInfo.COMMON_PRIVATE_BTN,
            name: Lang.get('common_btn_private_chat'),
            event: handler(this, this.onCommonBtnClick),
            highlight: true
        });
        if (G_UserData.getFriend().isUserIdInFriendList(simpleUser.userId)) {
            btnData.push({
                btnId: PopupUserBaseInfo.COMMON_ADD_FRIEND_BTN,
                name: Lang.get('common_btn_delete_friend'),
                event: handler(this, this.onCommonBtnClick),
                highlight: false
            });
        } else {
            btnData.push({
                btnId: PopupUserBaseInfo.COMMON_ADD_FRIEND_BTN,
                name: Lang.get('common_btn_add_friend'),
                event: handler(this, this.onCommonBtnClick),
                highlight: false
            });
        }
        if (G_UserData.getFriend().isUserIdInBlackList(simpleUser.userId)) {
            btnData.push({
                btnId: PopupUserBaseInfo.COMMON_ON_CHAT_BTN,
                name: Lang.get('common_btn_leave_black_list'),
                event: handler(this, this.onCommonBtnClick),
                highlight: true
            });
        } else {
            btnData.push({
                btnId: PopupUserBaseInfo.COMMON_ON_CHAT_BTN,
                name: Lang.get('common_btn_go_black_list'),
                event: handler(this, this.onCommonBtnClick),
                highlight: true
            });
        }
        btnData.push({
            btnId: PopupUserBaseInfo.COMMON_PK_BTN,
            name: Lang.get('common_btn_pk_target'),
            event: handler(this, this.onCommonBtnClick),
            highlight: true
        });
        if (G_UserData.getEnemy().isUserIdInEnemysList(simpleUser.userId)) {
            btnData.push({
                btnId: PopupUserBaseInfo.COMMON_DEL_ENEMY_BTN,
                name: Lang.get('common_btn_del_enemy'),
                event: handler(this, this.onCommonBtnClick),
                highlight: true
            });
        }
        if (FunctionCheck.funcIsOpened(FunctionConst.FUNC_GROUPS)[0]) {
            btnData.push({
                btnId: PopupUserBaseInfo.COMMON_CREATE_TEAM,
                name: Lang.get('common_btn_create_team'),
                event: handler(this, this.onCommonBtnClick),
                highlight: true
            });
        }
        for (var k = 1; k <= PopupUserBaseInfo.BTN_NUM; k++) {
            var button = this['_commonBtn' + k] as CommonButtonSwitchLevel1;
            button.setVisible(false);
        }
        for (var k = 1; k <= btnData.length; k++) {
            var v = btnData[k - 1];
            var button = this['_commonBtn' + k] as CommonButtonSwitchLevel1;
            button.setString(v.name);
            button.addClickEventListenerEx(v.event);
            button.enableHighLightStyle(v.highlight);
            button.setButtonTag(v.btnId);
            button.setVisible(true);
        }
        if (btnData.length > 6) {
            this._panelInfo.y = (37);
            this._commonNodeBk.node.active = (false);
            this._commonNodeBk2.node.active = (true);
            this._commonNodeBk.setCloseVisible(false);
            this._commonNodeBk2.setCloseVisible(true);
        } else {
            this._panelInfo.y = (0);
            this._commonNodeBk.node.active = (true);
            this._commonNodeBk2.node.active = (false);
            this._commonNodeBk.setCloseVisible(true);
            this._commonNodeBk2.setCloseVisible(false);
        }
    }
    onCommonBtnClick(sender) {
        if (!this._simpleUser) {
            return;
        }
        var simpleUser = this._simpleUser;
        var btnIndex = sender.getTag();
        if (btnIndex == PopupUserBaseInfo.COMMON_LOOK_BTN) {
            G_UserData.getBase().c2sGetUserDetailInfo(simpleUser.userId);
        }
        if (btnIndex == PopupUserBaseInfo.COMMON_PRIVATE_BTN) {
            if (!LogicCheckHelper.chatMsgSendCheck(ChatConst.CHANNEL_PRIVATE, true, true)[0]) {
                return;
            }
            var chatPlayerData = new ChatPlayerData();
            chatPlayerData.setDataBySimpleUser(simpleUser);
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT, [
                ChatConst.CHANNEL_PRIVATE,
                chatPlayerData
            ]);
            this.close();
            return;
        }
        if (btnIndex == PopupUserBaseInfo.COMMON_PK_BTN) {
            var sceneName = G_SceneManager.getRunningScene().getName();
            if (sceneName == 'fight') {
                G_Prompt.showTip(Lang.get('chat_pk_hint_when_infight'));
            }
            else if (sceneName == "guildTrain" && !G_UserData.getGuild().getTrainEndState())
                G_Prompt.showTipOnTop(Lang.get("chat_pk_when_train"))
            else {
                G_UserData.getBase().c2sPractice(simpleUser.userId);
            }
        }
        if (btnIndex == PopupUserBaseInfo.COMMON_ADD_FRIEND_BTN) {
            if (G_UserData.getFriend().isUserIdInFriendList(simpleUser.userId)) {
                UIPopupHelper.popupAlert(Lang.get('common_btn_delete_friend'), Lang.get('lang_friend_delete_tips', { name: simpleUser.name }), function () {
                    G_UserData.getFriend().c2sDelFriend(simpleUser.userId, FriendConst.FRIEND_DEL_FRIEND_TYPE);
                }, null)
            } else {
                if (G_UserData.getFriend().isUserIdInBlackList(simpleUser.userId)) {
                    G_Prompt.showTip(Lang.get('lang_friend_add_friend_leave_black_tip'));
                    return;
                }
                G_UserData.getFriend().c2sAddFriend(simpleUser.name, FriendConst.FRIEND_ADD_FRIEND_TYPE);
            }
        }
        if (btnIndex == PopupUserBaseInfo.COMMON_ON_CHAT_BTN) {
            if (G_UserData.getFriend().isUserIdInBlackList(simpleUser.userId)) {
                G_UserData.getFriend().c2sDelFriend(simpleUser.userId, FriendConst.FRIEND_DEL_BLACK_TYPE);
            } else {
                if (G_UserData.getFriend().isUserIdInFriendList(simpleUser.userId)) {
                    UIPopupHelper.popupAlert(Lang.get('common_btn_go_black_list'), Lang.get('lang_friend_black_tips2', { name: simpleUser.name }), function () {
                        G_UserData.getFriend().c2sAddFriend(simpleUser.name, FriendConst.FRIEND_ADD_BLACK_TYPE);
                    }, null)
                } else {
                    UIPopupHelper.popupAlert(Lang.get('common_btn_go_black_list'), Lang.get('lang_friend_black_tips1', { name: simpleUser.name }), function () {
                        G_UserData.getFriend().c2sAddFriend(simpleUser.name, FriendConst.FRIEND_ADD_BLACK_TYPE);
                    }, null)
                }
            }
        }
        if (btnIndex == PopupUserBaseInfo.COMMON_DEL_ENEMY_BTN) {
            UIPopupHelper.popupSystemAlert(Lang.get('common_btn_del_enemy'), Lang.get('lang_friend_enemy_delete_tip', { name: simpleUser.name }), function () {
                G_UserData.getEnemy().c2sDelEnemy(simpleUser.userId);
            }, null)
        }
        if (btnIndex == PopupUserBaseInfo.COMMON_CREATE_TEAM) {
            if (G_UserData.getGroups().getMyGroupData()) {
                G_UserData.getGroups().getMyGroupData().c2sInviteJoinTeam(simpleUser.userId);
            } else {
                G_Prompt.showTip(Lang.get('groups_tips_25'));
            }
        }
    }
    onBtnCancel() {
        this.close();
    }
    _onAddFriendSuccess(event, message) {
        var friend_type = message['friend_type'];
        if (friend_type) {
            if (friend_type == FriendConst.FRIEND_ADD_FRIEND_TYPE) {
                G_Prompt.showTip(Lang.get('lang_friend_apply_success_tip'));
            } else {
                G_Prompt.showTip(Lang.get('lang_friend_black_success_tip'));
            }
            this.updateUI(this._simpleUser);
        }
    }
    _onDelFriendSuccess(event, message) {
        var friend_type = message['friend_type'];
        if (friend_type) {
            if (friend_type == FriendConst.FRIEND_DEL_FRIEND_TYPE) {
                G_Prompt.showTip(Lang.get('lang_friend_delete_success_tip'));
                this.close();
                return;
            } else {
                G_Prompt.showTip(Lang.get('lang_friend_del_black_success_tip'));
            }
            this.updateUI(this._simpleUser);
        }
    }
    _onDelEnemySuccess() {
        this.close();
    }


}