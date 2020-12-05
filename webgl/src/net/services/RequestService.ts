import { MessageIDConst } from "../../const/MessageIDConst";
import { NetworkManager } from "../NetworkManager";
import { SignalConst } from "../../const/SignalConst";
import { Request } from "../Request";
import { handler } from "../../utils/handler";
import { G_SignalManager } from "../SignalManager";

export class RequestService {
    private _networkManager: NetworkManager;
    private _requestList: Request[];
    private _cacheRequestList: Request[];

    public init() {
        // this._networkManager = this.getComponent(NetworkManager);
        this._requestList = [];
        //这里一般是空,当断线后, 把requestList的东西挪动到_cacheReuqestList里, 登陆成功后, 重新把 self._cacheRequestList发一遍
        this._cacheRequestList = [];

        // this.schedule(this._onTimer, 1, cc.macro.REPEAT_FOREVER);
        this._networkManager.addReceive(handler(this, this._onNetReceiveEvent));
    }

    // 添加协议请求
    public addRequest(id, msg) {
        let connected = this._networkManager.isConnected();
        if (!connected) {
            if (id == MessageIDConst.ID_C2S_Flush || id == MessageIDConst.ID_C2S_Login) {
                return
            }
        }
        let request = new Request(id, msg)
        if (!connected) {
            this._addCacheRequest(request)
        }
        else {
            this._requestList.push(request)
        }
        this.sendAll()
    }



    // 发送队列协议
    public sendAll() {
        if (!this._networkManager.isConnected()) {
            return false
        }

        for (let i = 0; i < this._requestList.length; i++) {
            if (!this._requestList[i].isSent()) {
                this._requestList[i].send();
            }
        }

        this._checkWaiting()

        return true
    }

    // 检查返回协议
    public _onNetReceiveEvent(msgId, content) {

        for (let i = 0; i < this._requestList.length; i++) {
            const request = this._requestList[i];
            if (request.isSent()) {
                if (request.checkResponse(msgId)) {
                    this._requestList.splice(i, 1);
                    break
                }
            }
        }
        this._checkWaiting()
    }

    // 检查是否有在等待的协议
    public _checkWaiting() {
        let waiting = false;
        for (let i = 0; i < this._requestList.length; i++) {
            if (this._requestList[i].isWaiting()) {
                waiting = true
                break
            }
        }
        this._showLoading(waiting)
    }

    //
    public hasWaiting() {
        let waiting = false
        for (let i = 0; i < this._requestList.length; i++) {
            if (this._requestList[i].isWaiting()) {
                waiting = true
                break
            }
        }
        return waiting
    }

    // 显示等待界面
    public _showLoading(b) {
        // G_WaitingMask.showWaiting(b);
    }

    // 添加协议请求到缓存列表
    public _addCacheRequest(request) {
        let id = request.getId();
        if (id != MessageIDConst.ID_C2S_KeepAlive && id != MessageIDConst.ID_C2S_Login) {
            this._cacheRequestList.push(request)
        }
    }

    // 网络断开处理，将发送队列协议添加到缓存队列
    public onDisconnected() {

        this._requestList = []
        this._cacheRequestList = []
        this._checkWaiting()
    }

    // 重新登陆游戏后发送缓存队列协议
    public checkLoginedGame() {
        for (let i = 0; i < this._cacheRequestList.length; i++) {
            this._requestList.push(this._cacheRequestList[i]);
        }

        this._cacheRequestList = []
        this.sendAll()
    }

    // 检查协议请求是否超时
    public _onTimer() {
        if (!this._networkManager.isConnected()) {
            return false
        }

        //check timeout
        let timeout = false
        let tick = new Date().getTime();

        for (let i = 0; i < this._requestList.length; i++) {
            if (this._requestList[i].isTimeout(tick)) {
                timeout = true
                break
            }
        }

        if (timeout) {
            G_SignalManager.dispatch(SignalConst.EVENT_NETWORK_DEAD)
        }
    }

    //
    public reset() {
        this._requestList = []
        this._cacheRequestList = []
    }

    // 清理队列
    public clear() {
        this.reset();
        // this.unschedule(this._onTimer);
    }
}