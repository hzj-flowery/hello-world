import { config } from "../config";
import { ServerData } from "../data/ServerData";
import { ServerGroupData } from "../data/ServerGroupData";
import { G_ConfigManager, G_StorageManager } from "../init";
import ALDStatistics from "../utils/ALDStatistics";
import { PrioritySignal } from "../utils/event/PrioritySignal";
import { handler } from "../utils/handler";

const { ccclass } = cc._decorator;

@ccclass
export class ServerListManager {
    private _inited: boolean;
    private _useTestList: boolean;
    private _lastRemoteTime: number;
    private _lastRequestTime: number;
    private _lastRandServer;
    private _list: ServerData[];
    private _group;
    public signal;
    private _httpRequest: XMLHttpRequest;

    constructor() {
        this._inited = false;
        this._useTestList = false;
        this._lastRemoteTime = 0;
        this._lastRequestTime = 0;
        this._lastRandServer = null;
        this._list = [];
        this._group = {};
        this.signal = new PrioritySignal('string');
        cc.director.getScheduler().enableForTarget(this);
    }

    public clear() {
    }

    public reset() {
    }

    public isCheckUpdate() {
        if (CC_DEBUG) return true;
        var time = G_ConfigManager.getServerCacheTime() || 60;
        if (this._lastRemoteTime == 0 || (new Date().getTime() / 1000 - this._lastRemoteTime) > time || this._list.length == 0) {
            return true;
        }
        return false;
    }

    public checkUpdateList() {
        var remoteServer = G_ConfigManager.isRemoteServer();
        if (remoteServer) {
            this._getRemoteServerList();
        } else {
            var ret = [];
            var list_servers = G_ConfigManager.getListServer();
            if (list_servers != null && list_servers != '') {
                var list = JSON.parse(list_servers);
                for (let k in list) {
                    var v = list[k];
                    var server = new ServerData(v);
                    ret.push(server);
                }
            }
            this.setServerList(ret);
            this.signal.dispatch('success');
        }
    }

    public setTestServerList(serverIdList: number[]) {
        let list: ServerData[] = [];
        for (let i = 0; i < serverIdList.length; i++) {
            let server = new ServerData({
                "name": serverIdList[i].toString(),
                "status": 2,
                "server": serverIdList[i],
                "opentime": "1548882000"
            });
            list.push(server);
        }
        this.setServerList(list);
        this.signal.dispatch('success');
    }

    public setServerList(list) {
        this._list = list;
    }

    public getServerGroup() {
        return this._group;
    }

    private _setOpenTimeRankForList(list: any[]) {
        var sortFunc = function (a, b) {
            return parseInt(b.getOpentime()) - parseInt(a.getOpentime());
        };
        list.sort(sortFunc);
    }

    private _getAddServerList() {
        var ret = {};
        var addServerList = G_ConfigManager.getAddServer();
        if (addServerList != null && addServerList != '') {
            var list = JSON.parse(addServerList);
            for (let k in list) {
                var v = list[k];
                var server = new ServerData(v);
                ret[v.server] = server;
            }
        }
        return ret;
    }

    private _getRemoteServerList() {
        var send = (ip, domain?) => {
            var url = config.SERVERLIST_URL_TEMPLATE;
            url = url.replace('#domain#', ip);
            if (cc.sys.platform == cc.sys.WECHAT_GAME && config.ENV != 2) {
                url = url.replace('#userId#', ('wechat'));
                url = url.replace('#gameId#', '1');
                url = url.replace('#gameOpId#', "5001");
                // if (config.remoteCfg && config.remoteCfg.gameOpId) {
                //     url = url.replace('#gameOpId#', config.remoteCfg.gameOpId);
                // }

                url = url.replace('#opId#', '0');
                url = url.replace('#time#', Math.floor(new Date().getTime() / 1000).toString());
            }
            this._httpRequest = new XMLHttpRequest();
            // xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING;
            this._httpRequest.open('GET', url);
            this._httpRequest.onreadystatechange = (handler(this, this._onReadyStateChange));
            this._httpRequest.onerror = this._httpRequest.ontimeout = () => {
                ALDStatistics.instance.aldSendEvent('获取服务器列表失败');
                this.signal.dispatch('fail');
            };
            this._httpRequest.send();
            this._lastRequestTime = (new Date().getTime() / 1000);
        };
        var t = (new Date().getTime() / 1000) - this._lastRequestTime;
        if (t >= 3) {
            t = 0;
        } else {
            t = 3 - t
        }

        setTimeout(() => {
            send(config.SERVERLIST_URL);
        }, t);
    }

    private _onReadyStateChange() {
        var e = 'fail';
        if (this._httpRequest.readyState == 4) {
            if (this._httpRequest.status >= 200 && this._httpRequest.status < 207) {
                var ret = JSON.parse(this._httpRequest.response);
                if (ret && ret.status == 1) {
                    var list = [];
                    var group = [];
                    var addServerList = this._getAddServerList();
                    for (let k in addServerList) {
                        var v = addServerList[k];
                        if (v.isHide() == false) {
                            list.push(v);
                        }
                    }
                    if (ret.data && ret.data.length > 0) {
                        for (var i = 0; i < ret.data.length; i++) {
                            var info = ret.data[i];
                            if (addServerList[info.server] == null) {
                                var server = new ServerData(info);
                                list.push(server);
                            }
                        }
                    }
                    if (ret.group && ret.group.length > 0) {
                        for (var i = 0; i < ret.group.length; i++) {
                            var info = ret.group[i];
                            var serverGroup = new ServerGroupData(info);
                            group.push(serverGroup);
                        }
                    }
                    this._setOpenTimeRankForList(list);
                    this._lastRemoteTime = new Date().getTime() / 1000;
                    this.setServerList(list);
                    this._group = group;
                    e = 'success';
                }
            }
            this._httpRequest.abort();
            this._httpRequest = null;
            this.signal.dispatch(e);
        }
    }

    public getList(): ServerData[] {
        var ret = [];
        for (let i in this._list) {
            var v = this._list[i];
            ret.push(v);
        }
        return ret;
    }

    public getServerById(serverId) {
        for (let i in this._list) {
            var server = this._list[i];
            if ((server.getServer().toString()) == (serverId).toString()) {
                return server;
            }
        }
        return null;
    }

    public getFirstServer() {
        var default_server = G_ConfigManager.getDefaultServer();
        var newList = [];
        var list = this.getList();
        if (list && list.length) {
            for (let i in list) {
                var server = list[i];
                if ((server.getServer().toString()) == (default_server).toString()) {
                    return server;
                }
                if (server.getStatus() == 2) {
                    newList.push(server);
                }
            }
            if (newList.length > 1) {
                return newList[Math.randInt(1, newList.length) - 1];
            }
            return list[0];
        }
        return null;
    }

    public getLastServer() {
        var serverInfo = G_StorageManager.load('server');
        if (serverInfo) {
            return this.getServerById(serverInfo.lastServerId);
        } else {
            return null;
        }
    }

    public setLastServerId(sid) {
        G_StorageManager.save('server', { lastServerId: sid });
    }
}