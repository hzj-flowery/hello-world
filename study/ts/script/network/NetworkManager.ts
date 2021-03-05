const { ccclass, property } = cc._decorator;

import { ConfigNameConst } from "../const/ConfigNameConst";
import { MessageConst } from "../const/MessageConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { NET_LOG } from "../debug/DebugConfig";
import { G_ConfigLoader, G_ConfigManager, G_GameAgent, G_GatewayListManager, G_Prompt, G_SceneManager, G_SignalManager, G_SocketManager, G_UserData, G_WaitingMask } from "../init";
import { Lang } from "../lang/Lang";
import { Waiting_Show_Type } from "../ui/WaitingMask";
import { PrioritySignal } from "../utils/event/PrioritySignal";
import { handler } from "../utils/handler";
import { UserCheck } from "../utils/logic/UserCheck";
import { UIPopupHelper } from "../utils/UIPopupHelper";
import { HeartBeatService } from "./services/HeartBeatService";
import { RequestService } from "./services/RequestService";
import ServerTimeService from "./services/ServerTimeService";

@ccclass
export class NetworkManager extends cc.Component {
    public static FILTER_LIST = {
        [MessageIDConst.ID_S2C_KeepAlive]: true,
        [MessageIDConst.ID_S2C_BulletNotice]: true,
        [MessageIDConst.ID_S2C_UpdateRankCakeAndNotice]: true
    };
    public static FILTER_LIST_RET = {
        [MessageIDConst.ID_S2C_Login]: true,
        [MessageIDConst.ID_S2C_ActivateAccount]: true,
    }

    private _pbc: any;
    private _connectTime: number;
    private _signals: { [key: string]: PrioritySignal };
    private _sendSignal: PrioritySignal;
    private _receiveSignal: PrioritySignal;

    @property({
        type: HeartBeatService,
        visible: true
    })
    private _hearBeartService: HeartBeatService = null;
    @property({
        type: RequestService,
        visible: true
    })
    private _requestService: RequestService = null;
    @property({
        type: ServerTimeService,
        visible: true
    })
    private _serverTimeService: ServerTimeService = null;

    private _signalDeadNetwork
    private _signalConnect
    private _signalMessage

    private _connectingTimeout: boolean = false;
    private _dead: boolean = false;
    private _connecting: boolean = false;

    public onLoad() {
        cc.game.addPersistRootNode(this.node);
    }

    public init(callback: Function) {
        this._signals = {};
        this._sendSignal = new PrioritySignal("number", "table")
        this._receiveSignal = new PrioritySignal("number", "table")

        this._signalDeadNetwork = G_SignalManager.add(SignalConst.EVENT_NETWORK_DEAD, handler(this, this._onDeadNetwork))
        //
        this._signalConnect = G_SocketManager.connectSignal.add(handler(this, this._onConnectServer))
        this._signalMessage = G_SocketManager.messageSignal.add(handler(this, this._onRecvMessage))

        this._hearBeartService.init();
        this._requestService.init();
        this._serverTimeService.init();

        cc.resources.load("proto/cs", cc.TextAsset, (err, res: cc.TextAsset) => {
            this.loadProtoComplete(err, res, callback);
        });
    }

    private loadProtoComplete(err, res: any, callback: Function) {
        if (err) {
            return;
        }
        this.setProtobufRes(res);

        callback();
    }

    private setProtobufRes(res: any) {
        let protobuf = window['dcodeIO'].ProtoBuf;
        if (protobuf == null) {
            return;
        }

        this._pbc = protobuf.loadProto(res, 'proto/cs').build('cs');
        // this._pbc = new protobuf.Root();
        // protobuf.parse(res, this._pbc, { keepCase: true });
    }

    // 清除连接和定时器
    public clear() {
        this._signalDeadNetwork.remove()
        this._signalConnect.remove()
        this._signalMessage.remove()
        this.disconnect()
        this._hearBeartService.clear()
        this._serverTimeService.clear()
        this._requestService.clear()
    }

    // 发送协议
    public send(id, buff) {
        this._sendSignal.dispatch(id, buff);
        let msgBuff = this.encodeProtoBuff(id, buff);
        if (msgBuff == null) {
            cc.error("[NetworkManager] send:", id, buff);
            return;
        }
        //低于15级断线不自动重连
        if (G_UserData.getBase().getLevel() != 0 && G_UserData.getBase().getLevel() <= 15) {
            if (!this.isConnected()) {
                return;
            }
        } else {
            this.checkConnection();
        }

        this._requestService.addRequest(id, msgBuff);
        this.logSendNet(id, buff);
    }

    public encodeProtoBuff(id, buff) {
        let protoId: string = MessageConst["cs" + id];
        let proto = new this._pbc[protoId.substr(3)];
        for (let i in buff) {
            proto[i] = buff[i];
        }
        return proto.toArrayBuffer();
    }

    // 回到登陆界面时需要重置
    public reset() {
        this.disconnect()
        this._requestService.reset()
    }

    //
    public checkLoginedGame() {
        this._requestService.checkLoginedGame()
    }

    // 开启心跳服务
    public startServerTimeService() {
        this._serverTimeService.run()
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 
    public setSession(uid, sid) {
        G_SocketManager.setSession(uid, sid)
    }

    //
    public isConnected() {
        return G_SocketManager.isConnected()
    }

    // 如果现在网络没有联通, 进行连接
    public checkConnection() {
        if (!this.isConnected()) {
            //没有连接过服务器, 先开始连接服务器
            if (this._connectingTimeout) {
                return;
            }
            this._connectingTimeout = true;
            // 开始连接
            this._showLoading(true);
            this._connectToServer();
          
            cc.director.getScheduler().schedule(this.timeoutJob, this, 30, 0, 0);
        }
    }

    private timeoutJob() {
        //超时了
        UIPopupHelper.showOfflineDialog(Lang.get("login_network_timeout"))
        this._showLoading(false)
        this.disconnect()
        this._connectingTimeout = false;
    }

    //连接服务器
    private _connectToServer(gateway?, port?) {
        if (!gateway || !port) {
            G_GatewayListManager.signal.addOnce(handler(this, this._onGateway));
            this._showLoading(true);
            G_GatewayListManager.checkUpdateList()
            // this._onGateway("success");
        }
        else {
            console.log("[NetworkManager] connectToServer", gateway, port);
            this._connecting = true
            this._connectTime = new Date().getTime();

            this._dead = false
            G_SocketManager.connectToServer(gateway, port)
        }
    }

    //
    public _onGateway(ret) {
        this._showLoading(false);
        if (ret == "success") {
            let gateway = G_GatewayListManager.getGateway()
            if (gateway) {
                this._connectToServer(gateway.getIp(), gateway.getPort())
            }
        }
        else {
            this._connectingTimeout = false;
            UIPopupHelper.showOfflineDialog(Lang.get("login_get_server_fail"))
        }
    }

    // 连接成功失败socket相关消息
    public _onConnectServer(ret) {
        console.log("[NetworkManager] connectServer", ret);
        if (ret == "connect_success") { // socket连接成功 发送心跳包 绑定消息
            this._showLoading(false)
            if (this._connectingTimeout) {
                cc.director.getScheduler().unschedule(this.timeoutJob, this);
                this._connectingTimeout = false
            }

            if (this._connecting) {
                this._dead = false
                G_SocketManager.setSession(0, 0)
                this._hearBeartService.run()
                G_GameAgent.loginGame();
            }
        }
        else {  // socket 断开 
            if (this._connectingTimeout) {
                // 连接服务器时socket断开
                this.timeoutJob();
                cc.director.getScheduler().unschedule(this.timeoutJob, this);
                this._connectingTimeout = false;
            }
            else {
                this.disconnect()
                //低于15级断线后弹窗回登录界面
                if (G_UserData.getBase().getLevel() != 0 && G_UserData.getBase().getLevel() <= 15) {
                    UIPopupHelper.showOfflineDialog(Lang.get("login_network_disconnect"))//
                }
                
            }
        }
    }

    //
    public disconnect() {
        this._connecting = false
        if (this._dead) {
            return
        }

        G_SocketManager.removeConnect()
        this._requestService.onDisconnected()
        this._dead = true
    }

    //
    private _onDeadNetwork() {

        //如果现在有协议在等待返回， 断开后弹框提示
        let isWaiting = this._requestService.hasWaiting()
        if (isWaiting) {
            UIPopupHelper.showOfflineDialog(Lang.get("login_network_disconnect"))//
        } else {
            //低于15级断线后弹窗回登录界面
            if (G_UserData.getBase().getLevel() <= 15) {
                UIPopupHelper.showOfflineDialog(Lang.get("login_network_disconnect"))//
            }
        }

        this.disconnect()
    }

    // 显示等待菊花
    private _showLoading(b) {
        G_WaitingMask.showWaiting(b, Waiting_Show_Type.NET);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    public addSend(listener: Function, priority?) {
        return this._sendSignal.registerListenerWithPriority(listener, false, priority || 0)
    }

    //
    public addReceive(listener: Function, priority?) {
        return this._receiveSignal.registerListenerWithPriority(listener, false, priority || 0)
    }
    //
    public add(messageID, listener: Function, priority?) {
        return this._registerListener(messageID, listener, false, priority || 0)
    }

    //
    public addOnce(messageID, listener: Function, priority) {
        return this._registerListener(messageID, listener, true, priority || 0)
    }

    //
    public _registerListener(messageID, listener: Function, once, priority) {
        let key = "signal_" + messageID
        let signal = this._signals[key]
        if (!signal) {
            signal = new PrioritySignal("number", "table")
            this._signals[key] = signal
        }

        return signal.registerListenerWithPriority(listener, once || false, priority || 0)
    }


    //
    public _onRecvMessage(msgId, msgBuf, msgLen) {
        let cs = MessageConst["cs" + msgId]
        if (!cs) {
            console.log('not find msg id =', msgId);
            return;
        }
        let proto = this._pbc[cs.substr(3)]
        let buff = proto.decode(msgBuf)

        this.logReceiveNet(msgId, buff);

        if (buff) {

            let convtbuff = buff //this:_metatableTransToTable(buff)

            if (convtbuff.ret) {
                if (NetworkManager.FILTER_LIST_RET[msgId] == null) {
                    this._onMessageError(convtbuff.ret)
                }
            }

            //
            this._receiveSignal.dispatch(msgId, convtbuff)

            //
            let key = "signal_" + msgId;
            let signal = this._signals[key]
            if (signal) {
                signal.dispatch(msgId, convtbuff)
            }
        }
    }

    private _procMessageError(errorId) {
        if (errorId == MessageErrorConst.RET_HERO_BAG_FULL) {
            let popupDlg: Function = UserCheck.isHeroFull()[2];
            popupDlg();
            return true;
        }
        if (errorId == MessageErrorConst.RET_EQUIP_BAG_FULL) {
            let popupDlg: Function = UserCheck.isEquipmentFull()[2];
            popupDlg();
            return true;
        }
        if (errorId == MessageErrorConst.RET_TREASURE_BAG_FULL) {
            let popupDlg = UserCheck.isTreasureFull()[2]
            popupDlg();
            return true
        }
        if (errorId == MessageErrorConst.RET_TINSTRUMENT_BAG_FULL) {
            let popupDlg = UserCheck.isInstrumentFull()[2]
            popupDlg();
            return true;
        }
        if (errorId == MessageErrorConst.RET_FIGHTS_MATCH_TIMEOUT ||
            errorId == MessageErrorConst.RET_FIGHTS_CANCEILMATCH_TIMEOUT ||
            errorId == MessageErrorConst.RET_FIGHTS_MATCH_FORBIT ||
            errorId == MessageErrorConst.RET_FIGHTS_SEASONREWARDS_GOT) {
            return true
        }
        return false
    }

    private _onMessageError(ret) {
        if (ret != MessageErrorConst.RET_OK) {
            //服务器返回错误消息时，清理回调信号
            G_SceneManager.clearWaitEnterSignal()
            //处理过背包已满，则不用弹提示信息了
            if (this._procMessageError(ret) == true) {
                return;
            }
            let errMsg = G_ConfigLoader.getConfig(ConfigNameConst.NET_MSG_ERROR).get(ret);
            let txt = errMsg && errMsg.error_msg || "";
            if (ret == MessageErrorConst.RET_ERROR) {
                let tip = G_ConfigManager.getServerUnknownErrorTip()
                if (tip != null && tip != "") {
                    txt = tip
                }
                return
            }

            if (txt != null && txt != "") {
                G_Prompt.showTip(txt)
            }
            else {
                G_Prompt.showTip("Unknown ret: " + (ret).toString())

            }
        }
    }

    private logSendNet(id: number, json: any) {
        if (NET_LOG == 0) {
            return;
        }
        if (id == 30000) {
            return;
        }
        this.logNet("send", MessageConst["cs" + id], json);
    }

    private logReceiveNet(msgId: number, json: any) {
        if (NET_LOG == 0) {
            return;
        }
        if (msgId == 30001) {
            return;
        }
        this.logNet("receive", MessageConst["cs" + msgId], json);
    }

    private logNet(netStr: string, proto: string, json: any) {
        let str: string = "[NetWorkManager] " + netStr + " " + proto;
        if (NET_LOG == 1) {
            str += "\n" + JSON.stringify(json, null, 1);
        }
        console.log(str);
    }
}