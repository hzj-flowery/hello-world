
import { handler } from "../utils/handler";
import { PrioritySignal } from "./event/PrioritySignal";
import { Socket } from "./socket/Socket";

class SocketManager {

    private _socket: Socket;
    private _connectIndex: number;
    private _socketHandler: Function;

    public connectSignal: PrioritySignal;
    public messageSignal: PrioritySignal;

    constructor() {
        this._socket = null;
        this._connectIndex = 0;
        this.connectSignal = new PrioritySignal("number", "string");
        this.messageSignal = new PrioritySignal("number", "number", "string", "number");
        this._socketHandler = handler(this, this.onSocketHandler);
    }

    public connectToServer(ip, port) {
        if (this._socket != null) {
            this.removeConnect();
        }

        this._socket = new Socket(this._connectIndex, ip, port);
        this._socket.registerHandler(this._socketHandler);
        this._socket.connect();
    }

    public removeConnect() {
        if (this._socket) {
            this._socket.disconnect();
            this._socket = null;
        }
    }

    public send(id, msg) {
        if (this._socket && this._socket.isConnected()) {
            // console.log("[SocketManager] send", "id", id);
            this._socket.send(id, msg);
        }
    }

    public setSession(uid, sid) {
        if (this._socket) {
            this._socket.setSession(uid, sid);
        }
    }

    public isConnected() {
        if (this._socket) {
            return this._socket.isConnected();
        }
        return false;
    }

    public onSocketHandler(event, connectIndex, msgId, msg, len) {
        if (connectIndex == this._connectIndex && this._socket) {
            if (event == "message") {
                // console.log("[SocketManager] onSocketHandler", "msgId", msgId);
                this.messageSignal.dispatch(msgId, msg, len);
            }
            else {
                if (event == "connect_success") {
                    this._socket.setConnected();
                }
                else if (event == "connect_fail" || event == "connect_broken" || event == "connect_close") {
                    this._socket.setDisconnected();
                }
                this.connectSignal.dispatch(event);
            }
        }
    }
}
export var G_SocketManager = new SocketManager();