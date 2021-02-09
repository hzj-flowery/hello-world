import { MessageIDConst } from "../../const/MessageIDConst";
import { SignalConst } from "../../const/SignalConst";
import { handler } from "../../utils/handler";
import { NetworkManager } from "../NetworkManager";
import { G_SignalManager } from "../../init";
/**
 * 心跳服务
 */
const {ccclass, property} = cc._decorator
@ccclass
export class HeartBeatService extends cc.Component {

    private static readonly SECONDS = 15000 // 每X秒一次心跳
    private static readonly TIMEOUT_SECONDS = 20000 // X秒内都没收到过心跳包

    private _networkManager:NetworkManager;
    private _lastSendCounter: number;
    private _lastRecvCounter: number;
    private _lastCheckCounter: number;
    private _timer: number;

    init() {
        this._networkManager = this.getComponent(NetworkManager);
        let t = new Date().getTime();
        this._lastSendCounter = t
        this._lastRecvCounter = t
        this._lastCheckCounter = t

        this.schedule(this._onTimer, 1, cc.macro.REPEAT_FOREVER);
        this._networkManager.add(MessageIDConst.ID_S2C_KeepAlive, handler(this, this._onAlive))
    }

    // 启动心跳服务
    public run() {
        let t = new Date().getTime();
        this._lastSendCounter = t
        this._lastRecvCounter = t
        this._send()
    }

    // 心跳返回
    private _onAlive() {
        this._lastRecvCounter = new Date().getTime();
    }

    // 单位时间内通知一次服务器
    private _onTimer() {
        let t = new Date().getTime();
        if (t - this._lastCheckCounter > 5000) {
            this._lastRecvCounter = t
        }
        this._lastCheckCounter = t

        let elapsedSend = t - this._lastSendCounter
        let elapsedRecv = t - this._lastRecvCounter

        if (!this._networkManager.isConnected()) {
            return
        }

        if (elapsedRecv >= HeartBeatService.TIMEOUT_SECONDS) {
            this._lastRecvCounter = t
            G_SignalManager.dispatch(SignalConst.EVENT_NETWORK_DEAD)
            return
        }
        if (elapsedSend >= HeartBeatService.SECONDS) {
            this._send()
        }
    }

    // 发送心跳协议
    private _send() {
        this._lastSendCounter = new Date().getTime();
        this._networkManager.send(MessageIDConst.ID_C2S_KeepAlive, {})
    }

    public isTimeout() {
        let t = new Date().getTime();
        let elapsedRecv = t - this._lastRecvCounter
        if (elapsedRecv >= HeartBeatService.TIMEOUT_SECONDS) {
            return true
        }
        return false
    }
    //关闭心跳服务
    public clear() {
        this.unschedule(this._onTimer);
    }
}