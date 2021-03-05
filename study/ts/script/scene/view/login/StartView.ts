import { config } from "../../../config";
import { AudioConst } from "../../../const/AudioConst";
import { SignalConst } from "../../../const/SignalConst";
import { AgreementSetting } from "../../../data/AgreementSetting";
import { ServerData } from "../../../data/ServerData";
import { G_AudioManager, G_ConfigManager, G_GameAgent, G_SceneManager, G_ServerListManager, G_SignalManager, G_WaitingMask } from "../../../init";
import { HttpRequest } from "../../../network/HttpRequest";
import PopupNotice from "../../../ui/popup/PopupNotice";
import ALDStatistics from "../../../utils/ALDStatistics";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import { Util } from "../../../utils/Util";
import ViewBase from "../../ViewBase";
import { ChatItemPool } from "../chat/ChatMsgScrollView";
import DebugView from "./DebugView";
import PopupSecretView from "./PopupSecretView";
import PopupServerList from "./PopupServerList";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StartView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _panelDesign: cc.Node = null;

    @property({ type: cc.Button, visible: true })
    _btnUser: cc.Button = null;

    @property({ type: cc.Label, visible: true })
    _labelUser: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _btnServer: cc.Button = null;

    @property({ type: cc.Sprite, visible: true })
    _image_server_type: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _labelServer: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _btnEnter: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _buttonLogoutAccount: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _buttonGongGao: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _btnPlay: cc.Button = null;


    @property({ type: DebugView, visible: true })
    _debugView: DebugView = null;

    private _signalSdkLogin;
    private _signalSdkLogout;
    private _signalServer;
    private _openServerList;

    _isUnReleaseVersion;

    protected onCreate() {
        this.setSceneSize();
        this._buttonLogoutAccount.node.active = false;
        this._btnPlay.node.active = false;

        this._signalSdkLogin = G_SignalManager.add(SignalConst.EVENT_SDK_LOGIN, handler(this, this.updateUserName));
        this._signalSdkLogout = G_SignalManager.add(SignalConst.EVENT_SDK_LOGOUT, handler(this, this.updateUserName));
        this._signalServer = G_ServerListManager.signal.add(handler(this, this.onCheckUpdateList));

        this._debugView.node.active = CC_DEBUG ;
        // QA测试：
        if (CC_DEBUG) {
            this._isUnReleaseVersion = false;
            this._debugView.setServerUpdateFunc(this.checkUpdateList.bind(this));
        }
        this.handleH5PopupGongGao();
    }
    private handleH5PopupGongGao():void{
        let result = localStorage.getItem("lastLoginTime_001");
        if(!result)
        {
             //新玩家 第一次进游戏不可以弹
             let p = Date.now();
             localStorage.setItem("lastLoginTime_001",p.toString());           
        }
        else
        {
            //老玩家 自动弹公告
            let last = new Date(parseInt(result));
            let cur = new Date(Date.now());
            if(cur.getMonth()!=last.getMonth()&&cur.getDay()!=last.getDay())
            {
                //月不等 天不等 第二天强制弹
                this.onGongGaoButton(null);
                //新玩家 第一次进游戏不可以弹
                let p = Date.now();
                localStorage.setItem("lastLoginTime_001",p.toString());   
            }
            else if(!localStorage.getItem("lastLoginTime_002"))
            {
                //老玩家第二次进游戏 需要主动弹
                localStorage.setItem("lastLoginTime_002","111");
                 //月不等 天不等 第二天强制弹
                 this.onGongGaoButton(null);

            }

        }
    }

    protected onEnter() {
        // TODO:CGHelper
        // if (!CGHelper.checkCG(true)) {
        //     this._btnPlay.setVisible(false);
        //     this._buttonLogoutAccount.setPositionY(this._btnPlay.getPositionY());
        // }
        this.updateUserName();
        if (!this._debugView.node.active) {
            this.getVersion();
        }

        
    }

    protected onExit() {
        this._signalSdkLogin.remove();
        this._signalSdkLogin = null;
        this._signalSdkLogout.remove();
        this._signalSdkLogout = null;
        this._signalServer.remove();
        this._signalServer = null;
    }


    showView() {
        this.node.active = (true);
    }
    hideView() {
        this.node.active = (false);
    }
    onGongGaoButton(render) {
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupNotice"), (popupNotice: PopupNotice) => {
            popupNotice.init(null, null);
            popupNotice.openWithAction();
        });
        ALDStatistics.instance.aldSendEvent('登录-点击公告', null, true);
        // if (CONFIG_READ_REPORT) {
        //     G_SceneManager.showScene('fighttest');
        // }
    }
    onLogoutAccountButton(render) {
        // G_GameAgent.loginPlatform();
    }
    onCheckUpdateList(ret) {
        G_WaitingMask.showWaiting(false);
        if (ret == 'success') {
            if (this._openServerList) {
                G_SceneManager.openPopup(Path.getPrefab("PopupServerList", "login"), (popupServerList: PopupServerList) => {
                    popupServerList.init((server) => {
                        G_GameAgent.setLoginServer(server);
                        this.updateUserServer();
                    })
                    popupServerList.openWithAction();
                });
            } else {
                this.updateUserServer();
                G_GameAgent.init();
            }
        } else {
            var callback = () => {
                this.checkUpdateList();
            };
            UIPopupHelper.popupOkDialog(null, '获取服务器列表失败', callback, '更新');
        }
    }
    updateUserName() {
        // var str_name = G_GameAgent.getLoginUserName();
        // if (str_name) {
        //     this._buttonLogoutAccount.node.active = (true);
        //     this._labelUser.string = (str_name);
        // } else {
        //     this._buttonLogoutAccount.node.active = (false);
        //     this._labelUser.string =('');
        // }
    }
    updateUserServer() {
        var server = G_GameAgent.getLoginServer();
        if (server) {
            var [statusIcon, showStatusIcon] = Path.getServerStatusIcon(server.getStatus());
            this._image_server_type.node.active = (showStatusIcon);
            if (showStatusIcon) {
                UIHelper.loadTexture(this._image_server_type, statusIcon);
            }
            this._labelServer.string = (server.getName());
        } else {
            this._image_server_type.node.active = (false);
            this._labelServer.string = ('');
        }
    }
    checkUpdateList(open?) {
        if (this._isUnReleaseVersion == undefined) {
            return;
        }
        this._openServerList = open;
        G_GameAgent.setLoginServer(null);

        if (this._isUnReleaseVersion) {
            var server = new ServerData({
                "name": config.remoteCfg.serverName || '提审服',
                "status": 2,
                "server":  config.remoteCfg.server || 4,
                "opentime": "1596247200"
            })
            G_ServerListManager.setServerList([server]);
            this.onCheckUpdateList('success');
            return;
        }
        //QA测试：
        if (config.ENV < 0) {
            G_ServerListManager.setTestServerList(this._debugView.serverIdList);
        } else {
            if (G_ServerListManager.isCheckUpdate()) {
                G_WaitingMask.showWaiting(true);
                G_ServerListManager.checkUpdateList();
            } else {
                this.onCheckUpdateList('success');
            }
        }
    }

    getVersion() {
        if (this._isUnReleaseVersion != undefined) {
            this.checkUpdateList(false);
            return;
        }
        G_WaitingMask.showWaiting(true);
        let httpRequest = new HttpRequest();
        httpRequest.get(config.VERSION_URL, (response) => {
            var cfg = config.remoteCfg = JSON.parse(response);
            console.log('remote cfg', cfg);
            this._isUnReleaseVersion = G_ConfigManager.isUnReleaseVersion = Util.compareVersion(cfg.version, config.VERSION) == -1;
            this._buttonGongGao.node.active = G_ConfigManager.checkCanRecharge();
            this.checkUpdateList(false);
        }, () => {
            this._isUnReleaseVersion = false;
            this.checkUpdateList(false);
        });
    }


    onButtonEnter() {
        var server = G_GameAgent.getLoginServer();
        G_AudioManager.playSoundWithId(AudioConst.SOUND_BUTTON_START_GAME);
        if (server == null) {
            return;
        }
        if (!AgreementSetting.isAgreementCheckMayLogin() || !AgreementSetting.isAllAgreementCheck()) {
            G_SceneManager.openPopup(Path.getPrefab("PopupSecretView", "login"), (popup: PopupSecretView) => {
                popup.init(handler(this, this._onEnterGame));
                popup.openWithAction();
            });
            return;
        }
        this._onEnterGame();
        ALDStatistics.instance.aldSendEvent('登录-点击进入游戏', null, true);
        ChatItemPool.Instance.clear();
    }

    private _onEnterGame() {
        G_GameAgent.enterGame();
        
    }
    onButtonUser() {
        // G_GameAgent.loginPlatform();
    }
    onButtonServer() {
        this.checkUpdateList(true);
        ALDStatistics.instance.aldSendEvent('登录-点击选择服务器', null, true);
    }
    _onPlayClick() {
        // var cgNode = new (require('CGView'))('start.mp4', true);
        // this.addChild(cgNode);
    }
}