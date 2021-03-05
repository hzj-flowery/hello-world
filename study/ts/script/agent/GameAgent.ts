import { ChatConst } from "../const/ChatConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { MessageIDConst } from "../const/MessageIDConst";
import { NativeConst } from "../const/NativeConst";
import ServerConst from "../const/ServerConst";
import { SignalConst } from "../const/SignalConst";
import { AgreementSetting } from "../data/AgreementSetting";
import { ServerData } from "../data/ServerData";
import { G_BulletScreenManager, G_ConfigManager, G_GameAgent, G_GuildSnatchRedPacketServe, G_MineNoticeService, G_NativeAgent, G_NetworkManager, G_PreloadManager, G_Prompt, G_RollNoticeService, G_SceneManager, G_ServerListManager, G_ServiceManager, G_SignalManager, G_TutorialManager, G_UserData, G_WaitingMask, G_RoleListManager, G_StorageManager } from "../init";
import { Lang } from "../lang/Lang";
import PopupSecretView from "../scene/view/login/PopupSecretView";
import PopupAlert from "../ui/PopupAlert";
import ALDStatistics from "../utils/ALDStatistics";
import { handler } from "../utils/handler";
import { Path } from "../utils/Path";
import { UIPopupHelper } from "../utils/UIPopupHelper";
import { Util } from "../utils/Util";
import PopupSystemAlert from "../ui/PopupSystemAlert";

// TODO:
export class GameAgent {

    private _signalLogin;
    private _signalCreate;
    private _signalFlush;
    private _signalKickOut;
    private _signalLevelup;
    private _signalChangeScene;
    private _signalNative;
    private _server: ServerData;
    private _isRealName: boolean;//是否实名认证
    private _topUserID: string;
    private _sdkUserName: string;
    private _wantAutoEnterGame: boolean;
    private _ticket;
    private _isLogin;

    private _isInit;
    private _needVersionUpdate;

    constructor() {
        this._signalLogin = G_NetworkManager.add(MessageIDConst.ID_S2C_Login, handler(this, this._recvLogin));
        this._signalCreate = G_NetworkManager.add(MessageIDConst.ID_S2C_Create, handler(this, this._recvCreateRole));
        this._signalFlush = G_NetworkManager.add(MessageIDConst.ID_S2C_Flush, handler(this, this._recvFlush));
        this._signalKickOut = G_NetworkManager.add(MessageIDConst.ID_S2C_KickOutUser, handler(this, this._recvKickOutUser));
        this._signalLevelup = G_SignalManager.add(SignalConst.EVENT_USER_LEVELUP, handler(this, this._onEventLevelUp));
        this._signalChangeScene = G_SignalManager.add(SignalConst.EVENT_CHANGE_SCENE, handler(this, this._onEventChangeScene));
    }

    public clear() {
        this._signalLogin.remove();
        this._signalCreate.remove();
        this._signalFlush.remove();
        this._signalKickOut.remove();
        this._signalLevelup.remove();
        this._signalChangeScene.remove();

        if (this._signalNative) {
            this._signalNative.remove();
            this._signalNative = null;
        }
    }

    public init() {
        if (G_GameAgent.isInit()) {
            G_GameAgent.openLoginPlatform();
        }
        else {
            G_GameAgent.initSDK();
        }
    }

    public initSDK() {
        this._isInit = true;
        this._signalNative = G_NativeAgent.signal.add(handler(this, this._onNativeCallback));
        G_NativeAgent.init();
    }

    public isInit() {
        return this._isInit;
    }

    public isRealName() {
        return true;
    }

    public get isLogin() {
        return this._isLogin;
    }

    public getTopUserId() {
        return this._topUserID;
    }

    public getSdkUserName() {
        return this._sdkUserName;
    }

    public setLoginServer(server) {
        var id = null;
        if (server) {
            id = server.getServer();
        }
        this._server = server;
    }
    /**
     * 获取当前登录服务器
     */
    public getLoginServer(): ServerData {
        if (this._server == null) {
            this._server = this.getRecommendServer();
        }
        return this._server;
    }

    public getRecommendServer() {
        var server = G_ServerListManager.getLastServer();
        if (server == null) {
            server = G_ServerListManager.getFirstServer();
        }
        return server;
    }

    public checkContent(strContent: string, callback: Function) {
        // TODO:
        if (callback) {
            callback();
        }
        return;
    }

    public openLoginPlatform() {
        if (!this._isLogin) {
            this._wantAutoEnterGame = false;
            G_NativeAgent.login();
        }
    }

    public loginPlatform() {
        this._wantAutoEnterGame = false;
        this._loginPlatform();
    }

    public enterGame() {
        if (this._isLogin) {
            this.checkAndLoginGame();
        }
        else {
            this._wantAutoEnterGame = true;
            this._loginPlatform();
        }
        //G_NetworkManager.checkConnection();
    }

    public checkAndLoginGame() {
        if (!AgreementSetting.isAllAgreementCheck()) {
            G_SceneManager.openPopup(Path.getPrefab("PopupSecretView", "login"), (popup: PopupSecretView) => {
                popup.init(handler(this, this.loginGame));
                popup.openWithAction();
            });
        } else {
            this.loginGame();
        }
    }

    public logoutPlatform() {
        var t = G_NativeAgent.getLogoutType();
        if (t == NativeConst.LOGOUT_TYPE_HAS_DIALOG) {
            G_NativeAgent.logout();
        } else {
            this._openPopupLogout();
        }
    }

    public _loginPlatform() {
        if (!this._isLogin) {
            G_NativeAgent.login();
        }
        else {
            this.logoutPlatform();
        }
    }

    private _openPopupLogout() {
        let callback = () => {
            // G_NativeAgent.logout();
            var scene = G_SceneManager.getRunningSceneName();
            if (scene != 'login') {
                this.returnToLogin();
            }
        };
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupAlert"), (alert: PopupAlert) => {
            alert.init(Lang.get('sdk_title_tishi'), Lang.get('sdk_exit_message'), callback);
            alert.openWithAction();
        });
    }

    channel;
    private _onNativeCallback(data: any) {
        var event = data.event;
        var ret = data.ret;
        var param = data.param;
        this.channel = data.channel;
        if (event == NativeConst.SDKCheckVersionResult) {
            if (ret == NativeConst.CHECK_VERSION_TYPE_NEW) {
                return;
            }
            G_SignalManager.dispatch(SignalConst.EVENT_SDK_CHECKVERSION);
        } else if (event == NativeConst.SDKLoginResult) {
            if (ret == NativeConst.STATUS_SUCCESS) {
                this._isRealName = false;
                this._isLogin = true;
                var sdkInfo = param;
                this._topUserID = sdkInfo.topUserName;
                this._sdkUserName = sdkInfo.sdkUserName;
                let dataStr = JSON.stringify(sdkInfo);
                console.log("_onNativeCallback", dataStr);
                let CryptoJS = window['CryptoJS'];
                this._ticket = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(dataStr));
                G_SignalManager.dispatch(SignalConst.EVENT_SDK_LOGIN);
                if (G_RoleListManager.isNewPlayer()  && !CC_DEBUG) {
                    this.checkAndLoginGame();
                }
            }
        } else if (event == NativeConst.SDKLogoutResult) {
            if (ret == NativeConst.STATUS_SUCCESS) {
                this._ticket = null;
                this._topUserID = null;
                this._sdkUserName = null;
                this._isLogin = false;
                this._isRealName = false;
                G_SignalManager.dispatch(SignalConst.EVENT_SDK_LOGOUT);
                var scene = G_SceneManager.getRunningSceneName();
                if (scene != 'login') {
                    this.returnToLogin();
                }
            }
        } else if (event == NativeConst.SDKExitResult) {
            if (ret == NativeConst.STATUS_SUCCESS) {
                G_NativeAgent.exitGame();
            }
        }
    }

    public pay(appid, price, productId, productName, productDesc) {
        // TODO:
        if (G_ConfigManager.checkCanRecharge() && G_ConfigManager._isIos == true) {
            G_SceneManager.openPopup(Path.getPrefab("PopupSystemAlert", "common"), (popupAlert: PopupSystemAlert) => {
                popupAlert.setup(Lang.get('lang_vip_tips'), Lang.get('ios_forbidden_tips'));
                popupAlert.showGoButton(Lang.get('fight_kill_comfirm'));
                popupAlert.setCheckBoxVisible(false);
                popupAlert.openWithAction();
            });
            return 1;
        }
        // if (G_ConfigManager.isRealName() && !this._isRealName) {
        //     //G_RealNameService.openRealNameDlg();
        //     return 1;
        // }
        // var rechargeLimit = G_ConfigManager.getRechargeLimit();
        // if (rechargeLimit != 0 && G_UserData.getBase().getRecharge_today() >= rechargeLimit) {
        //     var title = Lang.get('recharge_limit_title');
        //     var content = Lang.get('recharge_limit_content', { count: rechargeLimit });
        //     PopupBase.loadCommonPrefab('popupSystemAlert',(popup:PopupSystemAlert)=>{
        //         popup.setup(title, content);
        //         popup.showGoButton(Lang.get('fight_kill_comfirm'));
        //         popup.setCheckBoxVisible(false);
        //         popup.openWithAction();
        //     });

        //     return 1;
        // }
        //G_NetworkManager.send(MessageIDConst.ID_C2S_RechargeTest, { money: price, app_id:appid, product_id:productId });
        //G_NativeAgent.pay(appid, price, productId, productName, productDesc);
        G_NativeAgent.pay(appid, price, productId, productName, productDesc);
        return 0;
    }

    public loginGame() {
        if (!this._isLogin) return;
        let channel_id = this.channel || "0";
        let device_id = G_NativeAgent.getDeviceId();
        let server = this.getLoginServer().getServer();
        // console.log("loginGame:", this._ticket, channel_id, device_id);
        this._sendLoginGame(this._ticket, server, channel_id, device_id);
    }

    private _sendLoginGame(token, sid, channel_id, device_id) {
        G_NetworkManager.send(
            MessageIDConst.ID_C2S_Login,
            {
                token: token,
                sid: sid,
                channel_id: channel_id,
                device_id: device_id,
                version: 999999
            }
        )
    }

    private _recvLogin(id, msg) {
        // TODO:
        // if (this._checkGrayVesion(msg)) {
        //     return;
        // }
        // console.log("[GameAgent] _recvLogin", id, msg.ret);
        if (msg.ret == MessageErrorConst.RET_NO_FIND_USER) {
            // 创建角色
            this._onVerifyServerStatus();
        } else if (msg.ret == MessageErrorConst.RET_LOGIN_REPEAT) {
            this._onNeedRelogin();
        } else if (msg.ret == MessageErrorConst.RET_SERVER_MAINTAIN) {
            // this._onMaintain();
        } else if (msg.ret == MessageErrorConst.RET_LOGIN_BAN_USER) {
            // this._onBanUser();
        } else if (msg.ret == MessageErrorConst.RET_LOGIN_TOKEN_TIME_OUT) {
            // this._onTokenExpired();
        } else if (msg.ret == MessageErrorConst.RET_SERVER_NO_OPEN) {
            // this._onNotAllowed();
        } else if (msg.ret == MessageErrorConst.RET_VERSION_ERR) {
            // this._onWrongVersion();
        } else if (msg.ret == MessageErrorConst.RET_SERVER_CLOSE_REGIST) {
            this._onStopRegister();
        } else if (msg.ret == MessageErrorConst.RET_OK) {
            G_NetworkManager.setSession(msg.uid, msg.sid);
            G_UserData.setLogin(true);
            this._onLoginSuccess();
        } else if (msg.ret == MessageErrorConst.RET_UUID_NOT_ACTIVATE) {
            // this._onUUIDNotActivate();
        } else if (msg.ret == MessageErrorConst.RET_LOGIN_BAN_IP_ALL_SERVER) {
            // this._onBanIp();
        } else if (msg.ret == MessageErrorConst.RET_LOGIN_BAN_DEVICE_ALL_SERVER) {
            // this._onBanDevice();
        } else {
            // this._onUnknownError();
        }
    }

    //强制输入秘钥，成功后创角
    public _onVerifyServerStatus() {
        let secretKeyInputSuccess = () => {
            this._onNeedCreateRole();
        };
        let isNeedInputSecretKey = () => {
            if (G_ConfigManager.isAppstore()) {
                return false;
            }
            let server = G_GameAgent.getLoginServer();
            if (!server) {
                return false;
            }
            if (!ServerConst.isNeedSecretKeyServer(server.getStatus())) {
                return false;
            }
            return true;
        };
        if (isNeedInputSecretKey()) {
            let cancelCallback = () => {
                G_NetworkManager.reset();
            }
            UIPopupHelper.popupSecretKeyInput(secretKeyInputSuccess, cancelCallback);
        }
        else {
            secretKeyInputSuccess();
        }
    }

    //登陆游戏成功, 此时应该还没取到角色数据
    private _onLoginSuccess() {
        let server = this.getLoginServer();
        G_ServerListManager.setLastServerId(server.getServer());

        G_NetworkManager.startServerTimeService();
        this._sendFlush();
    }

    //需要创建角色
    private _onNeedCreateRole() {
        ALDStatistics.instance.aldSendEvent('进入CG流程');
        let server = this.getLoginServer();
        G_ServerListManager.setLastServerId(server.getServer());
        let scene = G_SceneManager.getRunningSceneName();
        if (scene == "create") {
            G_NetworkManager.checkLoginedGame();
        }
        else {
            let createRole = () => {
                ALDStatistics.instance.aldSendEvent('完成CG流程');
                G_SceneManager.showScene("create");
            }
            if (G_TutorialManager.isTutorialEnabled()) {
                createRole();   //去掉cg动画
                // var time = Date.now();
                // G_PreloadManager.preload('preload/newplayer', () => {
                //     var costSecond = Math.ceil((Date.now() - time) / 1000);
                //     ALDStatistics.instance.aldSendEvent('加载CG流程', { 'time': costSecond }, false, true);
                //     G_TutorialManager.hasOpeningTutorial(createRole);
                // })
            }
            else {
                createRole();
            }
        }
    }

    // 角色在他处登陆
    private _onNeedRelogin() {
        G_NetworkManager.reset();
        // TODO:G_NativeAgent
        // var opgame = G_NativeAgent.getOpGameId();
        // if (opgame == '1005' || opgame == '1006' || opgame == '1007' || opgame == '1008') {
        //     this._ticket = null;
        //     this._isLogin = false;
        // }
        UIPopupHelper.showOfflineDialog(Lang.get('sdk_platform_relogin'), true);
    }
    private _onStopRegister() {
        G_NetworkManager.reset();
        UIPopupHelper.showOfflineDialog(Lang.get('sdk_platform_stop_register'), true);
    }

    public createRole(roleName, heroType) {
        this._sendCreateRole(roleName, heroType);
    }

    private _sendCreateRole(roleName, heroType) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_Create, { name: roleName, type: heroType });
    }

    private _recvCreateRole(id, message) {
        if (message.ret == MessageErrorConst.RET_OK) {
            ALDStatistics.instance.aldSendEvent('创角成功');
            G_NetworkManager.setSession(message.uid, message.sid);
            G_UserData.setLogin(true);
            this._onCreatedRole();
            this._onLoginSuccess();
            G_SignalManager.dispatch(SignalConst.EVENT_CREATED_ROLE);
        }
    }

    private _onCreatedRole() {
        this._updateGameData();
        // TODO: G_NativeAgent
    }

    private _sendFlush() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_Flush, {})
    }

    private _recvFlush(id, msg) {
        // console.log("[GameAgent] _recvFlush", id, msg.ret);
        if (msg.ret == MessageErrorConst.RET_OK) {
            G_SignalManager.dispatch(SignalConst.EVENT_RECV_FLUSH_DATA);
            G_NetworkManager.checkLoginedGame();
            G_SignalManager.dispatch(SignalConst.EVENT_LOGIN_SUCCESS);

            if (G_UserData.isFlush()) {
                return
            }

            G_UserData.setFlush(true)
            G_UserData.getBase().setOnlineTime(msg.today_online_time)
            this._onLoginedGame();
        }
    }

    private _onLoginedGame() {
        // console.log("[GameAgent] _onLoginedGame")
        G_ServiceManager.start();
        // G_RollNoticeService.start();
        G_MineNoticeService.start();
        // G_RealNameService.start();
        G_GuildSnatchRedPacketServe.start();
        G_TutorialManager.reset();
        G_BulletScreenManager.start();
        G_TutorialManager.hasTutorial(function () {
            G_SceneManager.showScene('main');
        });
        var gameUserID = G_UserData.getBase().getId();
        // G_VoiceAgent.setOpenId(tostring(gameUserID));
        // G_VoiceAgent.applyMessageKey(15000);
        // G_VoiceAgent.setMicVolume(100);
        // G_VoiceAgent.setSpeakerVolume(168);
        // G_NotifycationManager.registerNotifycation();
        this._updateGameData();
        // G_NativeAgent.eventLogin();
        // G_NativeAgent.adLogin();
        // G_NativeAgent.retryPay();
        G_SignalManager.dispatch(SignalConst.EVENT_FINISH_LOGIN);
    }

    private _recvKickOutUser(id, message) {
        G_NetworkManager.reset();
        UIPopupHelper.showOfflineDialog(Lang.get('sdk_platform_kickoutuser'), true);
    }
    private _onEventLevelUp() {
        var gameUserLevel = G_UserData.getBase().getLevel();
        G_NativeAgent.setGameData('gameUserLevel', gameUserLevel);
        G_NativeAgent.eventLevelup();
    }
    private _onEventChangeScene(event, enter, sceneName) {
        if (enter) {
            if (sceneName != 'login' && sceneName != 'logo' && sceneName != 'cg') {
                if (!this._isLogin) {
                    G_NetworkManager.reset();
                    UIPopupHelper.showOfflineDialog(Lang.get('sdk_platform_logout_sdk'), true);
                }
            }
        }
    }

    public returnToLogin() {
        G_NetworkManager.reset();
        G_RollNoticeService.clear();
        G_MineNoticeService.clear();
        G_BulletScreenManager.clear();
        // G_RealNameService.clear();
        G_GuildSnatchRedPacketServe.clear();
        G_UserData.clear();
        G_TutorialManager.clear();
        // G_HeroVoiceManager.stopPlayMainMenuVoice();
        var scene = G_SceneManager.getRunningSceneName();
        if (scene != 'login') {
            G_SceneManager.showScene('login');
        } else {
            if (this._needVersionUpdate) {
                this._needVersionUpdate = false;
                G_SignalManager.dispatch(SignalConst.EVENT_LOGIN_VERSION_UPDATE);
            }
        }
        G_UserData.initUserData();
    }

    checkTalkAndSend(channel, strContent, chatPlayerData, msgType?, parameter?, voiceUrl?, voiceTime?) {
        if (!G_ConfigManager.isUrlFilter()) {
            if (msgType == ChatConst.MSG_TYPE_VOICE) {
                strContent = Util.format('%s#%s#%s', voiceUrl, voiceTime || '', strContent || '');
            }
            G_UserData.getChat().c2sChatRequest(channel, strContent, chatPlayerData, msgType, parameter);
            return;
        }
        var url = 'https://filterad.sanguosha.com/v1/query?';
        var urlContent = '';
        urlContent = urlContent + ('q=' + Util.urlencode(strContent));
        urlContent = urlContent + '&appid=1270';
        url = url + urlContent;
        //print('1112233 url = ', url);
        var xhr = new XMLHttpRequest();
        //xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING;
        G_WaitingMask.showWaiting(true);
        xhr.open('GET', url);
        var onCallback = function () {
            G_WaitingMask.showWaiting(false);
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 207)) {
                var ret = JSON.parse(xhr.response);
                //dump(ret);
                if (ret) {
                    var content = ret.text;
                    if (msgType == ChatConst.MSG_TYPE_VOICE) {
                        content = Util.format('%s#%s#%s', voiceUrl, voiceTime || '', content || '');
                    }
                    G_UserData.getChat().c2sChatRequest(channel, content, chatPlayerData, msgType, parameter);
                }
            }
            //xhr.unregisterScriptHandler();
        };
        xhr.onreadystatechange = onCallback;
        xhr.send();
    }
    private _updateGameData() {
        // TODO:
    }

    isCanReturnServer() {
        // var isBackUser = this._returnServerInfo.isBackUser;
        // if (isBackUser && isBackUser == 1) {
        //     return true;
        // }
        // return false;
        return false;
    }
    isLoginReturnServer () {
        // var server = this.getLoginServer();
        // return server.isBackserver();
        return false;
    }
}
