import { PrioritySignal } from "../utils/event/PrioritySignal";
import { G_ConfigManager, G_StorageManager, G_GameAgent, G_NativeAgent, G_WaitingMask } from "../init";
import { ServerData } from "../data/ServerData";
import { config } from "../config";
import { handler } from "../utils/handler";
import { ServerGroupData } from "../data/ServerGroupData";
import { ServerListRoleUnitData } from "../data/ServerListRoleUnitData";
import { UIPopupHelper } from "../utils/UIPopupHelper";
import { Lang } from "../lang/Lang";

const { ccclass } = cc._decorator;

@ccclass
export class RoleListManager {
    private _lastRemoteTime: number;

    private _lastRequestTime: number;
    private _list: any[];
    private _uuid;
    public signal;
    private _httpRequest: XMLHttpRequest;

    constructor() {
        this._lastRemoteTime = 0;
        this._lastRequestTime = 0;
        this._list = [];
        this._uuid = null;
        this.signal = new PrioritySignal('RoleListManager');
        cc.director.getScheduler().enableForTarget(this);
    }

    public get lastRemoteTime(): number {
        return this._lastRemoteTime;
    }

    public clear() {
    }

    public reset() {
    }

    public isCheckUpdate() {
        if (!G_ConfigManager.isGetRoleList()) {
            return false;
        }
        var uuid = G_GameAgent.getTopUserId();
        if (this._uuid != uuid) {
            return true;
        }
        var time = 60;
        if (this._lastRemoteTime == 0 || (new Date().getTime() / 1000 - this._lastRemoteTime) > time || this._list.length == 0) {
            return true;
        }
        return false;
    }

    public checkUpdateList() {
        this._getRemoteServerList();
    }

    public setList(list) {
        this._list = list;
    }

    private _getRemoteServerList() {

        let fail = function () {
            //UIPopupHelper.showOfflineDialog(Lang.get("login_network_timeout"), null, this._getRemoteServerList.bind(this));
           // G_WaitingMask.showWaiting(false);
            this.signal.dispatch('fail');
            console.log('rolelist---->', 'fail');
        }.bind(this);
        var send = (ip, domain?) => {
            G_WaitingMask.showWaiting(true);
            var uuid = G_NativeAgent.getTopUserName();
            // if (!uuid) {
            //     this._lastRemoteTime = new Date().getTime() / 1000;
            //     this._uuid = uuid;
            //     this.setList({});
            //     this.signal.dispatch('success');
            //     return;
            // }
            console.log('rolelist---->', 'send');
            var url = config.ROLELIST_URL_TEMPLATE;
            url = url.replace('#domain#', ip);
            url = url.replace('#uuid#', (uuid).toString());
            url = url.replace('#gameOpId#', (G_NativeAgent.getOpGameId()).toString());
            url = url.replace('#opId#', (G_NativeAgent.getOpId()).toString());
            this._httpRequest = new XMLHttpRequest();
            // xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING;
            this._httpRequest.open('POST', url);
            this._httpRequest.onreadystatechange = (handler(this, this._onReadyStateChange));
            this._httpRequest.onerror = this._httpRequest.ontimeout = fail;
            this._httpRequest.send();
            this._lastRequestTime = (new Date().getTime() / 1000);
        };
        var t = 10;
        if ((new Date().getTime() / 1000) - this._lastRequestTime > 10) {
            t = 0;
        }
        setTimeout(() => {
            send(config.ROLELIST_URL);
        }, t);
    }

    private _onReadyStateChange() {
        var e = 'fail';
        if (this._httpRequest.readyState == 4) {
            if (this._httpRequest.status >= 200 && this._httpRequest.status < 207) {
                var ret = JSON.parse(this._httpRequest.response);
                console.log('rolelist---->', 'getInfo', ret);
              //  if (ret && ret.status == 1) {
                    var list = [];
                    if (ret.info && ret.info.length > 0) {
                        for (var i = 0; i < ret.info.length; i++) {
                            var info = ret.info[i];
                            var unitData = new ServerListRoleUnitData(info);
                            list.push(unitData);
                        }
                    }

                    this._lastRemoteTime = new Date().getTime() / 1000;
                    this.setList(list);
                    e = 'success';
               // }
            }
            this._httpRequest.abort();
            this._httpRequest = null;
            G_WaitingMask.showWaiting(false);
            this.signal.dispatch(e);
        }
    }

    public getList(): any[] {
        var ret = [];
        for (let i in this._list) {
            var v = this._list[i];
            ret.push(v);
        }
        return ret;
    }

    public getMaxLevelRoleInServer(serverId) {
        var retData = null;
        var roleList = this.getList();
        for (let m in roleList) {
            var roleData = roleList[m];
            if (roleData.getServer_id() == parseInt(serverId)) {
                if (retData == null) {
                    retData = roleData;
                } else if (roleData.getRole_lv() > retData.getRole_lv()) {
                    retData = roleData;
                }
            }
        }
        return retData;
    }
    public isNewPlayer() {
        var list = this.getList();
        return list.length == 0 && this._lastRemoteTime != 0;
    }
    public getEarliestServerId() {
        var role = null;
        var roleList = this.getList();
        for (let m in roleList) {
            var roleData = roleList[m];
            if (role == null) {
                role = roleData;
            } else if (roleData.getCreate_time() < role.getCreate_time()) {
                role = roleData;
            }
        }
        if (role) {
            return role.getServer_id();
        } else {
            return null;
        }
    }
}