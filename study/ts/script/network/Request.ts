import { MessageConst } from "../const/MessageConst";
import { MessageIDConst } from "../const/MessageIDConst";
import { G_SocketManager } from "../init";

export class Request {
    public static readonly TIMEOUT = 30000

    private _id: number;
    private _msg: any;
    private _sent: boolean;
    private _reponseId: number;
    private _responsed: boolean; 
    private _sendTime: number;
    private _checkTime: number;

    constructor(id: number, msg: any) {
        this._id = id   //协议ID
        this._msg = msg
        this._sent = false                                     //是否已经发送
        this._reponseId = this.getResponseId(id) || 0        //响应的msgId, 只有monitor的协议, 这个字段才有意义
        this._responsed = false                                     //是否已经得到响应, 只有monitor的协议, 这个字段才有意义
        this._sendTime = 0                                         //发送时间
        this._checkTime = 0
    }


    // 是否已经发送
    public isSent() {
        return this._sent;
    }

    // 发送
    public send() {
        G_SocketManager.send(this._id, this._msg)
        this._sendTime = new Date().getTime();
        this._checkTime = this._sendTime
        this._sent = true
    }

    // 检查返回协议
    public checkResponse(responseId) {
        if (this._responsed) {
            return false
        }

        if (this._reponseId == responseId) {
            this._responsed = true
        }

        return this._responsed
    }

    // 获取协议ID
    public getId() {
        return this._id
    }

    // 获取返回协议ID
    public getResponseMsgId() {
        return this._reponseId
    }

    // 获取是否在等待返回协议
    public isWaiting() {
        if (this._reponseId == 0)
            return false
        if (this._sent && this._responsed == false)
            return true
        return false
    }

    // 获取是否协议发送超时
    public isTimeout(now) {
        if (this._reponseId == 0)
            return false
        if (this._responsed)
            return false
        if (now - this._checkTime > 5000)
            this._sendTime = now
        this._checkTime = now
        if (Request.TIMEOUT <= now - this._sendTime)
            return true
        return false
    }

    //过滤
    private FILTER_LIST = {
        [MessageIDConst.ID_C2S_KeepAlive]: true,
        [MessageIDConst.ID_C2S_GetServerTime]: true
    }

    private getResponseId(requestId: number): number {
        let requestStr: string = MessageConst["cs" + requestId].replace("cs.", "ID_");
        let responseStr = requestStr.replace("C2S", "S2C");
        if (MessageIDConst[responseStr] != null) {
            if (this.FILTER_LIST[MessageIDConst[requestStr]] == null) {
                return MessageIDConst[responseStr];
            }
        }
        return null;
    }
}