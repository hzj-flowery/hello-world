import { config } from "../config";
import { G_ConfigLoader, G_GameAgent, G_SceneManager, G_ServerListManager } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";

export default class ALDStatistics {
    private _aldGuidData: any;
    private static _instance: ALDStatistics;
    _isFirst: boolean;
    _model;
    public hasMarkAB: boolean = false;
    public static get instance(): ALDStatistics {
        if (this._instance == null) {
            this._instance = new ALDStatistics();
            this._instance.init();
        }
        return this._instance;
    }

    public init() {
        this.checkIsFreshPlayer();
    }





    private checkIsFreshPlayer(): void {
        var infor = cc.sys.localStorage.getItem("isFirstLoginGame");
        if (!infor) {
            this._isFirst = true;
            cc.sys.localStorage.setItem("isFirstLoginGame", 1)
        }else {
            this._isFirst = false;
        }
        
        if (this._isFirst) {
            infor = cc.sys.localStorage.getItem("markAB");
            if (!infor) {
                this.hasMarkAB = true;
                cc.sys.localStorage.setItem("markAB", 1)
            }
        }else {
            this.hasMarkAB = cc.sys.localStorage.getItem("markAB") ? true : false;
        }
    }
    public isFirstLoginGame(): boolean {
        return this._isFirst;
    }

    private initGuidData(): void {
        this._aldGuidData = G_ConfigLoader.getConfig(ConfigNameConst.ALDGUIDE);
    }

    public aldSendGuideEvent(id: number): void {
        if (id <= 0) return;
        let serverId = G_GameAgent.getLoginServer().getServer();
        let guildId = id;
        let saveName = "ald_guild"+serverId+"_"+guildId;
        if(cc.sys.localStorage.getItem(saveName))
        {
            return;
        }
        cc.sys.localStorage.setItem(saveName,1);

        if(!this._aldGuidData)
        {
            this.initGuidData();
        }

        var des = this._aldGuidData.get(id).des2;
        let sendDes = serverId+"_"+guildId+"_"+des;
        this.aldSendEvent(sendDes);
    }

    public aldSendEvent(name: string, arg: any = null, checkFresh: boolean = false, needCellModel: boolean = false) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {

            let wx = window['wx'];
            if (checkFresh) {
                name = (this._isFirst ? '新玩家' : '老玩家') + ':' + name;
            };

            if (wx.getSystemInfoSync().platform == "windows") {
                name = "pc_" + name;
            }
            else if (wx.getSystemInfoSync().platform == "android") {
                name = "android_" + name;
            }
            else if (wx.getSystemInfoSync().platform == "ios") {
                name = "ios_" + name;
            }

            if (needCellModel) {
                this._model = this._model || wx.getSystemInfoSync().model;
                if (!arg) {
                    arg = { "model": this._model };
                }
                else {
                    for (var k in arg) {

                        var value = arg[k] + "+" + this._model;
                        arg[k] = null;
                        var key = k + "+model:";
                        arg[key] = value;
                        break;
                    }
                }
            }
            wx.aldSendEvent(name, arg);
        }
        else {
            console.log("发送统计数据-----", name, arg);
        }
    }
}