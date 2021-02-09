import { config } from "../config";
import { GatewayData } from "../data/GatawayData";
import { G_ConfigManager } from "../init";
import { PrioritySignal } from "../utils/event/PrioritySignal";
import { handler } from "../utils/handler";
import ALDStatistics from "../utils/ALDStatistics";

export class GatewayListManager {
    private _list: GatewayData[];
    private _inited;
    private _useTestList;
    private _lastRemoteTime;
    private _lastRequestTime;
    private _lastRandServer;
    private _httpRequest: XMLHttpRequest;
    public signal;

    constructor() {
        this._inited = false;
        this._useTestList = false;
        this._lastRemoteTime = 0;
        this._lastRequestTime = 0;
        this._lastRandServer = null;
        this._list = [];
        this.signal = new PrioritySignal('string');
    }

    public getGateway(): GatewayData {
        return this._list[0];
    }

    public isCheckUpdate() {
        if (CC_DEBUG) return true;
        var time = G_ConfigManager.getGatewayCacheTime() || 900;
        if (this._lastRemoteTime == 0 || new Date().getTime() / 1000 - this._lastRemoteTime > time || this._list.length == 0) {
            return true;
        }
        return false;
    }

    public checkUpdateList() {
        //QA测试：
        if (config.ENV < 3) {
            this._list = [];
            let gatewayData = new GatewayData();
            gatewayData.setIp(config.WEBSOCKET_IP);
            gatewayData.setPort(config.WEBSOCKET_PORT);
            this._list.push(gatewayData)
            this.signal.dispatch('success');
            return;
        } else {
            if (this.isCheckUpdate()) {
                var remoteGateway = G_ConfigManager.isRemoteGateway();
                if (remoteGateway) {
                    this._getRemoteServerList();
                } else {
                    var ret = G_ConfigManager.getListGateway();
                    if (ret != null && ret != '') {
                        var infos = this._decode(ret);
                        if (infos.length > 0) {
                            var list = [];
                            for (let i = 0; i < infos.length; i++) {
                                var info = infos[i];
                                var gateway = new GatewayData(info);
                                list.push(gateway);
                            }
                            this.setGatewayList(list);
                        }
                    }
                    this.signal.dispatch('success');
                }
            } else {
                this.signal.dispatch('success');
            }
        }
    }
    public setGatewayList(list) {
        this._list = list;
    }
    private _onCheckGatewayCache() {
        this._getRemoteServerList();
    }
    private _getRemoteServerList() {
        if (this._httpRequest == null) {
            var url = config.GATEWAYLIST_URL_TEMPLATE;
            url = url.replace('#domain#', config.GATEWAYLIST_URL);
            this._httpRequest = new XMLHttpRequest();
            // this._httpRequest.responseType =XMLHTTPREQUEST_RESPONSE_STRING;
            this._httpRequest.open('GET', url);
            this._httpRequest.onreadystatechange = (handler(this, this._onReadyStateChange));
            this._httpRequest.onerror = this._httpRequest.ontimeout = () => {
                ALDStatistics.instance.aldSendEvent('获取服务器地址和端口失败');
                this.signal.dispatch('fail');
            };
            this._httpRequest.send();
        }
    }
    private _onReadyStateChange() {
        var e = 'fail';
        if (this._httpRequest.readyState == 4) {
            if (this._httpRequest.status >= 200 && this._httpRequest.status < 207) {
                var response = this._httpRequest.response;
                var infos = this._decode(this._httpRequest.response);
                if (infos.length > 0) {
                    var list = [];
                    var addServerList = G_ConfigManager.getAddGateway();
                    if (addServerList != null && addServerList != '') {
                        var list = this._decode(addServerList);
                        for (let k in list) {
                            var v = list[k];
                            var gateway = new GatewayData(v);
                            list.push(gateway);
                        }
                    }
                    for (let i = 0; i < infos.length; i++) {
                        var info = infos[i];
                        var gateway = new GatewayData(info);
                        list.push(gateway)
                    }
                    this.setGatewayList(list);
                    this._lastRemoteTime = new Date().getTime() / 1000;
                    e = 'success';
                }
            }
            this._httpRequest.abort();
            this._httpRequest = null;
            this.signal.dispatch(e);
        }
    }
    private _decode(response: string): any[] {
        var cache = [];
        var gateways: string[] = response.split(',');
        if (gateways && gateways.length >= 1) {
            for (let i in gateways) {
                var v = gateways[i];
                var ret = v.split('|');
                var info: any = {};
                info.ip = ret[0];
                if (info.ip.indexOf('wss://') == -1) {
                    info.ip = 'wss://' + info.ip;
                }
                info.port = 0;
                if (ret[1] != null) {
                    info.port = parseInt(ret[1]);
                }
                cache.push(info);
            }
        }
        return cache;
    }
}