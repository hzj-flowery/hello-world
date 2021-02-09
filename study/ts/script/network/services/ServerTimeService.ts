import { MessageIDConst } from "../../const/MessageIDConst";
import { handler } from "../../utils/handler";
import { G_ServerTime } from "../../init";
import { NetworkManager } from "../NetworkManager";

/**
 *  服务器时间同步服务
 */
const {ccclass, property} = cc._decorator;
@ccclass
export default class ServerTimeService extends cc.Component {
    public static readonly SECONDS = 120 // 每X秒一次同步

    private _counter: number;
    private _networkManager: NetworkManager;
    private _signalServerTime;

    public init() {
        this._networkManager = this.getComponent(NetworkManager);
        this._counter = 0;
        this._signalServerTime = this._networkManager.add(MessageIDConst.ID_S2C_GetServerTime, handler(this, this._recvGetServerTime))
    }

    // 启动时间同步服务
    public run() {
        this.schedule(this._checkServerTime, 1, cc.macro.REPEAT_FOREVER);
        this._sendGetServerTime()
    }

    // 单位时间内同步一次服务器时间
    private _checkServerTime() {
        if (!this._networkManager.isConnected()) {
            return
        }

        this._counter = this._counter + 1
        if (this._counter >= ServerTimeService.SECONDS) {
            this._sendGetServerTime()
        }
    }

    // 发送时间同步协议
    private _sendGetServerTime() {
        this._networkManager.send(MessageIDConst.ID_C2S_GetServerTime, {})
        this._counter = 0
    }

    // 关闭时间同步服务
    public clear() {
        this.unschedule(this._checkServerTime);
        this._signalServerTime.remove()
        this._signalServerTime = null
    }

    //客户端服务器时间同步
    public _recvGetServerTime(id, message) {
        let zoneMiniutes = message.zone
        let t = message.time
        zoneMiniutes = zoneMiniutes - 720
        let zone = zoneMiniutes / 60
        G_ServerTime.setTime(t, zone)
    }
}