import { config } from "../../../config";
import { SERVER_CONFIG1, SERVER_CONFIG2, SERVER_CONFIG3, SERVER_CONFIG4 } from "../../../debug/DebugConfig";
import { G_NativeAgent, G_StorageManager, G_TutorialManager } from "../../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DebugView extends cc.Component {

    @property({ type: cc.EditBox, visible: true })
    _userIdEdit: cc.EditBox = null;

    @property({ type: cc.ToggleContainer, visible: true })
    _serverToggle: cc.ToggleContainer = null;

    @property({ type: cc.Toggle, visible: true })
    _guideToggle: cc.Toggle = null;

    @property({ type: cc.Toggle, visible: true })
    _saveFightReportToggle: cc.Toggle = null;

    private _serverIndex: number;
    public serverIdList: number[];
    private _serverUpdateFunc: Function;

    public onLoad() {
        if (CC_DEBUG) {
            this._serverIndex = cc.sys.localStorage.getItem('testServer');
            if (this._serverIndex == null) {
                this._serverIndex = 0;
            }
            this._guideToggle.isChecked = cc.sys.localStorage.getItem('testGuideOpen') == "1" && true || false;
            this._saveFightReportToggle.isChecked = cc.sys.localStorage.getItem('testSaveFightReport') == "1" && true || false;
            config.CONFIG_TUTORIAL_ENABLE = this._guideToggle.isChecked;
            config.FIGHT_REPORT_SAVE_FILE = this._saveFightReportToggle.isChecked;
        } else {
            //外网服务器关闭，先用测试服
            this._serverIndex = cc.sys.localStorage.getItem('testServer') || 3;
        }
        this._guideToggle.isChecked = cc.sys.localStorage.getItem('testGuideOpen') == "1" && true || false;
        this._saveFightReportToggle.isChecked = cc.sys.localStorage.getItem('testSaveFightReport') == "1" && true || false;
        config.CONFIG_TUTORIAL_ENABLE = this._guideToggle.isChecked;
        config.FIGHT_REPORT_SAVE_FILE = this._saveFightReportToggle.isChecked;

        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            config.CONFIG_TUTORIAL_ENABLE = true;
            config.FIGHT_REPORT_SAVE_FILE = false;
            this._userIdEdit.node.active = true;
        }
        else {
            let info = G_StorageManager.load("NativeAgentDevelop");
            if (info != null && info.userName != "") {
                this._userIdEdit.string = info.userName;
            }
            else {
                G_StorageManager.save("NativeAgentDevelop", { userName: this._userIdEdit.string });
                G_NativeAgent.login();
            }
        }
        G_TutorialManager.setTutorialEnabled(config.CONFIG_TUTORIAL_ENABLE);
        this.setServer();
    }

    public setServerUpdateFunc(func: Function) {
        this._serverUpdateFunc = func;
    }

    public onEditDidEnded() {
        G_StorageManager.save("NativeAgentDevelop", { userName: this._userIdEdit.string });
        G_NativeAgent.login();
    }

    public onServerToggle() {
        for (let i = 0; i < this._serverToggle.toggleItems.length; i++) {
            if (this._serverToggle.toggleItems[i].isChecked) {
                this._serverIndex = i;
                break;
            }
        }
        cc.sys.localStorage.setItem('testServer', this._serverIndex);
        this.setServer();
    }

    public onGuideTogge() {
        config.CONFIG_TUTORIAL_ENABLE = this._guideToggle.isChecked;
        cc.sys.localStorage.setItem('testGuideOpen', (this._guideToggle.isChecked && 1 || 0).toString());
        G_TutorialManager.setTutorialEnabled(config.CONFIG_TUTORIAL_ENABLE);
    }

    public onSaveFightReportTogge() {
        config.FIGHT_REPORT_SAVE_FILE = this._saveFightReportToggle.isChecked;
        cc.sys.localStorage.setItem('testSaveFightReport', (this._saveFightReportToggle.isChecked && 1 || 0).toString());
    }

    public setServer() {
        config.ENV = this._serverIndex;
        //QA测试：
        if (this._serverIndex >= this._serverToggle.toggleItems.length) {
            this._serverIndex = 0;
        }
        if (this._serverIndex == 0) {
            config.SPECIFIC_GAME_OP_ID = SERVER_CONFIG1.SPECIFIC_GAME_OP_ID;
            config.WEBSOCKET_IP = SERVER_CONFIG1.WEBSOCKET_IP;
            config.WEBSOCKET_PORT = SERVER_CONFIG1.WEBSOCKET_PORT;
            config.RECHARGE_TEST_URL = SERVER_CONFIG1.RECHARGE_TEST_URL;
            this.serverIdList = SERVER_CONFIG1.SERVER_ID;
            config.TOKEN_KEY = SERVER_CONFIG1.TOKEN_KEY;
            config.SERVERLIST_URL = SERVER_CONFIG1.SERVERLIST_URL;
            config.GATEWAYLIST_URL = SERVER_CONFIG1.GATEWAYLIST_URL;
            config.LOGIN_URL = SERVER_CONFIG3.LOGIN_URL;
        }
        else if (this._serverIndex == 1) {
            config.SPECIFIC_GAME_OP_ID = SERVER_CONFIG2.SPECIFIC_GAME_OP_ID;
            config.WEBSOCKET_IP = SERVER_CONFIG2.WEBSOCKET_IP;
            config.WEBSOCKET_PORT = SERVER_CONFIG2.WEBSOCKET_PORT;
            config.RECHARGE_TEST_URL = SERVER_CONFIG2.RECHARGE_TEST_URL;
            this.serverIdList = SERVER_CONFIG2.SERVER_ID;
            config.TOKEN_KEY = SERVER_CONFIG2.TOKEN_KEY;
            config.SERVERLIST_URL = SERVER_CONFIG2.SERVERLIST_URL;
            config.GATEWAYLIST_URL = SERVER_CONFIG2.GATEWAYLIST_URL;
            config.LOGIN_URL = SERVER_CONFIG3.LOGIN_URL;
        } else if (this._serverIndex == 2) {
            config.SPECIFIC_GAME_OP_ID = SERVER_CONFIG3.SPECIFIC_GAME_OP_ID;
            config.RECHARGE_TEST_URL = SERVER_CONFIG3.RECHARGE_TEST_URL;
            config.TOKEN_KEY = SERVER_CONFIG3.TOKEN_KEY;
            config.SERVERLIST_URL = SERVER_CONFIG3.SERVERLIST_URL;
            config.GATEWAYLIST_URL = SERVER_CONFIG3.GATEWAYLIST_URL;
            config.LOGIN_URL = SERVER_CONFIG3.LOGIN_URL;
            config.WEBSOCKET_IP = SERVER_CONFIG3.WEBSOCKET_IP;
            config.WEBSOCKET_PORT = SERVER_CONFIG3.WEBSOCKET_PORT;
        } else {
            config.SPECIFIC_GAME_OP_ID = SERVER_CONFIG3.SPECIFIC_GAME_OP_ID;
            config.RECHARGE_TEST_URL = SERVER_CONFIG4.RECHARGE_TEST_URL;
            config.TOKEN_KEY = SERVER_CONFIG4.TOKEN_KEY;
            config.SERVERLIST_URL = SERVER_CONFIG4.SERVERLIST_URL;
            config.GATEWAYLIST_URL = SERVER_CONFIG4.GATEWAYLIST_URL;
            config.LOGIN_URL = SERVER_CONFIG4.LOGIN_URL;
            config.WEBSOCKET_IP = SERVER_CONFIG4.WEBSOCKET_IP;
            config.WEBSOCKET_PORT = SERVER_CONFIG4.WEBSOCKET_PORT;
        }
        // if (CC_DEBUG) {
        if (!this._serverToggle.toggleItems[this._serverIndex].isChecked) {
            this._serverToggle.toggleItems[this._serverIndex].isChecked = true;
        } else {
            this._serverUpdateFunc();
        }
        // }
    }
}