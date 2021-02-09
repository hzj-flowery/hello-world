import { config } from "../config";
import { NativeConst } from "../const/NativeConst";
import { G_GameAgent, G_StorageManager, G_UserData, G_WaitingMask, G_RoleListManager } from "../init";
import { Lang } from "../lang/Lang";
import { HttpRequest } from "../network/HttpRequest";
import ALDStatistics from "../utils/ALDStatistics";
import { UIPopupHelper } from "../utils/UIPopupHelper";
import NativeAgent from "./NativeAgent";
import { handler } from "../utils/handler";
import { WayFuncDataHelper } from "../utils/data/WayFuncDataHelper";
import { FunctionConst } from "../const/FunctionConst";


const CryptoJS = window['CryptoJS'];
export default class NativeAgentWeChat extends NativeAgent {
    Collect_Scene: number[] = [1023, 1089];
    private _appkey = "8d1d669fe794f8a72c603551edebfdae";
    private _offerId = "1450024306";
    private _isTestEnv: boolean = false;// 是否是沙箱环境
    private _openid: string;
    private _topUserID: string;
    private _topUserName: string;
    private _sessionKey: string;
    private _orderID: string;

    private _aesKey;

    private options;

    abCode: number = 1;
    _signalRoleInfo: any;


    _data:any;


    constructor() {
        super();
        this._aesKey = CryptoJS.enc.Utf8.parse("topsdk");
        this._aesKey.sigBytes = 16;
        this._aesKey.words[3] = 0;
        this._aesKey.words[4] = 0;
    }

    public init() {
        this._dispatch({ event: NativeConst.SDKCheckVersionResult, ret: NativeConst.CHECK_VERSION_TYPE_WITHOUT });
        this.options = this.options || wx.getLaunchOptionsSync();
        wx.onShow(this.onShow.bind(this));
        zm.sendEvent('100001', '完成加载', this.getPlatformId().toString());
        this._signalRoleInfo = G_RoleListManager.signal.addOnce(handler(this, this.onGetRoleInfo));
    }

    private onShow(res) {
        this.options = res;
    }

    public isCollectScene(): boolean {
        return this.options && this.Collect_Scene.indexOf(this.options.scene) != -1;
    }


    private _dispatch(data) {
        this._onNativeCallback(data);
    }

    public getGameId() {
        return "1";
    }

    public getChannelId() {
        return "178";
    }

    public getDeviceId() {
        return this._topUserName;
    }

    public getOpId() {
        return 178;
    }

    public getOpGameId() {
        return 5001;
    }

    public getTopUserName() {
        return this._topUserName;
    }

    public login() {
        let wx: any = window['wx'];
        let fail = function () {
            UIPopupHelper.showOfflineDialog(Lang.get("login_network_timeout"), null, this.login.bind(this));
            G_WaitingMask.showWaiting(false);
        }.bind(this);
        let this1 = this;
        G_WaitingMask.showWaiting(true);
        wx.login({
            success(res) {
                this1._loginServer(res.code, (ret, data) => {
                    G_WaitingMask.showWaiting(false);
                    this1._onGetToken(ret, data);
                }, fail);
            },
            fail: fail
        })
    }

    private _loginServer(code: string, success?: Function, fail?: Function) {
        // console.log("NativeAgentWeChat loginServer", code);
        let url = config.LOGIN_URL_TEMPLATE;
        url = url.replace("#domain#", config.LOGIN_URL);

        let requestData = {
            appID: this.getGameId(),
            channelID: this.getChannelId(),
            extension: "",
            sdkVersionCode: "1.0",
            deviceID: "",
            userType: "",
            sign: ""
        }
        requestData.extension = JSON.stringify({ code: code });
        let sign = "appID=" + requestData.appID + "channelID=" + requestData.channelID + "extension=" + requestData.extension + this._appkey;
        // console.log("sign:", sign);
        requestData.sign = window['md5'](sign);


        let srcs = JSON.stringify(requestData);
        // console.log("requestData", srcs);
        let aesRequestData = CryptoJS.AES.encrypt(srcs, this._aesKey, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
        // console.log(aesRequestData.toString());

        url = url.replace("#data#", encodeURIComponent(aesRequestData));
        // console.log(url);

        let http = new HttpRequest();
        http.get(url, (response) => {
            // console.log(response);
            let ret = JSON.parse(response);
            if (ret.state != 1 || ret.data == null) {
                fail && fail();
                return;
            }
            let decrypt = CryptoJS.AES.decrypt(ret.data, this._aesKey, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
            let data = decrypt.toString(CryptoJS.enc.Utf8);
            console.log("decrypt", data);
            success && success(ret.state, data);
        }, fail);
    }

    private _onGetToken(ret, response?: string) {
        if (ret != 1) {
            this._dispatch({ event: NativeConst.SDKLoginResult, ret: NativeConst.STATUS_FAILED, param: "" });
            return;
        }
        let responseData = JSON.parse(response);
        console.log("_onGetToken:", ret, responseData);
        this._openid = responseData.extension.openid;
        this._sessionKey = responseData.extension.session_key;
        // if (!ALDStatistics.instance.isFirstLoginGame() && !ALDStatistics.instance.hasMarkAB) {
        //     this.abCode = this._openid.charCodeAt(this._openid.length - 1);
        // } else {
        //     var code = window['md5'](this._openid);
        //     this.abCode = code.charCodeAt(code.length - 1);
        // }

        // wx.aldUserAB(this.getversionAB());
        // console.log('AB_code: ', this.getversionAB());
        this._topUserID = responseData.topUserID.toString();
        let topUserName = responseData.topUserName.toString();
        this._topUserName = topUserName;

        let data: any = {};
        data.topUserID = topUserName;
        data.topUserName = topUserName;
        data.platformID = responseData.platformID;
        data.sdkUserName = "";
        data.sdkUserID = this._openid;
        data.channelID = this.getPlatformId(); // responseData.channelID;
        data.token = "8150c2bcf918221df25313d46a18a033";
        data.timestamp = (new Date().getTime() * 1000).toString();
        data.extension = "gptxxxxxxx|1|1";
        let sign = topUserName + topUserName + data.sdkUserID + data.token + config.TOKEN_KEY;
        data.sign = window['md5'](sign);
        console.log("_onGetToken:", data);
        this._data = data;
        if (G_StorageManager.load('server')) {
            this._dispatch({ event: NativeConst.SDKLoginResult, ret: NativeConst.STATUS_SUCCESS, param: data, channel: this.channel });
        }else {
            G_RoleListManager.checkUpdateList();
        }
    }

    onGetRoleInfo(ret) {
       // if (ret == 'success') {
            this._dispatch({ event: NativeConst.SDKLoginResult, ret: NativeConst.STATUS_SUCCESS, param: this._data, channel: this.channel });
       // }
    }

    channel;
    public getPlatformId() {
        var platFormId = Number(this.getChannelId());
        console.log('options:', this.options);
        if (this.options) {
            // if (this.options.path && this.options.path.indexOf('channel=') != -1) {
            //     return Number(this.options.path.substring(this.options.path.indexOf('=') + 1, this.options.path.length - 1));
            // }
            if (this.options.query) {
                var opId = Number(this.options.query.opid);
                this.channel = this.options.query.channel;
                this.invitorUserId = Number(this.options.query.uerId) || this.invitorUserId;
                this.invitorServerId =   Number(this.options.query.serverId) ||this.invitorUserId;
                console.log('invite ----', this.invitorUserId ,  this.invitorServerId);
            }
            var scene = this.options.scene
            if (scene) {
                switch (scene) {
                    case 1006:
                        platFormId = 90001;
                        break;
                    case 1007:
                    case 1008:
                    case 1044:
                        platFormId = 90002;
                        break;
                    case 1037:
                        platFormId = 90003;
                        break;
                    case 1035:
                    case 1058:
                        platFormId = 90004;
                        break;
                    case 1095:
                        platFormId = 90005;
                        break;
                    case 1079:
                        platFormId = 90006;
                        break;
                    case 1005:
                        platFormId = 90007;
                        break;
                    case 1011:
                        platFormId = 90008;
                        break;
                    case 1012:
                        platFormId = 90009;
                        break;
                    case 1053:
                        platFormId = 90010;
                        break;
                    case 1106:
                        platFormId = 90011;
                        break;
                    case 1055:
                        platFormId = 90012;
                        break;
                    case 1045:
                        platFormId = 90013;
                        break;
                    case 1067:
                        platFormId = 90014;
                        break;
                    case 1089:
                        platFormId = 90015;
                        break;
                    case 1023:
                        platFormId = 90016;
                        break;
                    case 1103:
                        platFormId = 90017;
                        break;
                    case 1131:
                        platFormId = 90018;
                        break;
                    case 1027:
                        platFormId = 90019;
                        break;
                }
            }
        }
        if (!this.channel) {
            this.channel = 'wx_' + scene;
        }
        if (opId) {
            return opId;
        }
        return platFormId;
    }

    public getLogoutType() {
        return NativeConst.LOGOUT_TYPE_UNAVAILABLE;
    }

    public logout() {
        G_StorageManager.save("NativeAgentWeChat", { userName: "" });
        this._dispatch({
            event: NativeConst.SDKLogoutResult,
            ret: NativeConst.STATUS_SUCCESS,
            param: ""
        });
    }

    public getExitType() {
        return 0;
    }

    public exit() {
    }

    public hasFloatWindow() {
        return false;
    }

    public openFloatWindow() {
        return false;
    }

    public closeFloatWindow() {
        return false;
    }

    public pay(appid, price, productId, productName, productDesc) {
        var lastRechargeTotal = G_UserData.getBase().getRecharge_total();
        let success = () => {
            if (price >= 328 || ( lastRechargeTotal < 1000 && (lastRechargeTotal + price) >= 1000)) {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_SUPER_VIP);
            }
            console.log("pay success");
        };
        let fail = () => {
            console.log("pay fail");
        };
        this._checkSessionKey(() => {
            this._getOrderID(price, productId, productName, productDesc, (orderID: string) => {
                this._onGetOrderIDSuccess(orderID, price, success, fail);
            }, fail);
        }, fail);
        console.log("pay:", price, productId, productName, productDesc);
    }

    private _onGetOrderIDSuccess(orderID, money, paySuccess?: Function, payFail?: Function) {
        console.log("_onGetOrderIDSuccess:", orderID);
        this._getBalance(orderID, (balance) => {
            if (balance != null && balance >= money * 10) {
                this._onBalanceEnough(orderID, paySuccess, payFail);
            }
            else {
                this._onBalanceNotEnough(orderID, money, paySuccess, payFail);
            }
        }, payFail);
    }

    private _onBalanceEnough(orderID, paySuccess?: Function, payFail?: Function) {
        console.log("_onBalanceEnough");
        this._getCharge(orderID, paySuccess, payFail);
    }

    private _onBalanceNotEnough(orderID, money, paySuccess?: Function, payFail?: Function) {
        console.log("_onBalanceNotEnough");
        this._wxRequestMidasPayment(money, () => {
            this._onBalanceEnough(orderID, paySuccess, payFail);
        }, payFail);
    }

    // 支付前检测session_key是否失效，失效重新登陆更新session_key
    private _checkSessionKey(success?: Function, fail?: Function) {
        let wx: any = window['wx'];
        let this1 = this;
        wx.checkSession({
            success(res) {
                success && success();
            },
            fail(res) {
                this1._reLoginUpdateSessionKey(success, fail);
            }
        })
    }

    private _reLoginUpdateSessionKey(success: Function, fail: Function) {
        let wx: any = window['wx'];
        let this1 = this;
        wx.login({
            success(res) {
                this1._loginServer(res.code, (ret, data) => {
                    if (ret != 1) {
                        fail && fail();
                        return;
                    }
                    let responseData = JSON.parse(data);
                    console.log("_reLoginUpdateSessionKey:", responseData);
                    this1._sessionKey = responseData.extension.session_key;
                    success && success();
                }, fail);
            },
            fail: fail
        })
    }

    private _getOrderID(price: number, productID, productName, productDesc, success?: Function, fail?: Function) {
        let userID = this._topUserID;
        let money = (price * 100).toString(); // money字段的单位是分
        let roleID = G_UserData.getBase().getId().toString();
        let roleName = G_UserData.getBase().getName();
        let roleLevel = G_UserData.getBase().getLevel().toString();
        let serverID = G_GameAgent.getLoginServer().getServer().toString();
        let serverName = G_UserData.getBase().getServer_name();
        let extension = "";
        // let notifyUrl = "";
        let signType = "md5";
        let payType = ""; 
        let sign =
            "userID=" + userID + "&" +
            "productID=" + productID + "&" +
            "productName=" + productName + "&" +
            "productDesc=" + productDesc + "&" +
            "money=" + money + "&" +
            "roleID=" + roleID + "&" +
            "roleName=" + roleName + "&" +
            "roleLevel=" + roleLevel + "&" +
            "serverID=" + serverID + "&" +
            "serverName=" + serverName + "&" +
            "extension=" + extension +
            this._appkey;
        console.log("_getOrderID:", encodeURIComponent(sign));
        sign = window['md5'](encodeURIComponent(sign));

        let requestData = {
            userID: userID,
            productID: productID,
            productName: productName,
            productDesc: productDesc,
            money: money,
            roleID: roleID,
            roleName: roleName,
            roleLevel: roleLevel,
            serverID: serverID,
            serverName: serverName,
            extension: extension,
            // notifyUrl: "",
            signType: signType,
            payType: payType,
            sign: sign,
        }

        let srcs = JSON.stringify(requestData);
        console.log("_getOrderID:", srcs);
        let aesRequestData = CryptoJS.AES.encrypt(srcs, this._aesKey, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });

        let url = config.PAY_GET_ORDER_ID_URL_TEMPLATE;
        url = url.replace("#domain#", config.LOGIN_URL);
        url = url.replace("#data#", encodeURIComponent(aesRequestData));
        console.log("_getOrderID:", url);

        let http = new HttpRequest();
        http.get(url, (response) => {
            console.log("_getOrderID:", response);
            let ret = JSON.parse(response);
            if (ret.state != 1 || ret.data == null) {
                fail && fail();
                return;
            }
            let decrypt = CryptoJS.AES.decrypt(ret.data, this._aesKey, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
            let dataStr = decrypt.toString(CryptoJS.enc.Utf8);
            dataStr = dataStr.replace(/\"orderID\":(\d+)/, '"orderID":"$1"');//orderID整形太大丢失精度
            // console.log("_getOrderID:", dataStr);
            let data = JSON.parse(dataStr);
            if (data.orderID == null) {
                fail && fail();
            }
            else {
                success && success(data.orderID);
            }
        }, fail);
    }

    private _getBalance(orderID: string, success?: Function, fail?: Function) {
        let channelID = this.getChannelId();
        let userID = this._topUserID;
        let accountType = "1";
        let openID = this._openid;
        let openKey = this._sessionKey;
        let pf = "android";
        let pfkey = "";
        let zoneid = "1";
        let sign =
            "accountType=" + accountType +
            "channelID=" + channelID +
            "openID=" + openID +
            "openKey=" + openKey +
            "orderID=" + orderID +
            "pf=" + pf +
            "pfkey=" + pfkey +
            "userID=" + userID +
            "zoneid=" + zoneid +
            this._appkey;
        sign = window['md5'](sign);

        let url = config.PAY_QUERY_URL_TEMPLATE;
        url = url.replace("#domain#", config.LOGIN_URL);
        url = url.replace("#orderID#", orderID);
        url = url.replace("#channelID#", channelID);
        url = url.replace("#userID#", userID);
        url = url.replace("#accountType#", accountType);
        url = url.replace("#openID#", encodeURIComponent(openID));
        url = url.replace("#openKey#", encodeURIComponent(openKey));
        url = url.replace("#pf#", pf);
        url = url.replace("#pfkey#", pfkey);
        url = url.replace("#zoneid#", zoneid);
        url = url.replace("#sign#", sign);
        console.log("_getBalance url:", url);

        let http = new HttpRequest();
        http.get(url, (response) => {
            console.log("_getBalance:", response);
            let ret = JSON.parse(response);
            if (ret.state != 1) {
                fail && fail();
                return;
            }
            // console.log("_getBalance", ret.money);
            success && success(ret.money);
        }, fail);
    }

    private _getCharge(orderID: string, success?: Function, fail?: Function) {
        let channelID = this.getChannelId();
        let userID = this._topUserID;
        let accountType = "1";
        let openID = this._openid;
        let openKey = this._sessionKey;
        let pf = "android";
        let pfkey = "";
        let zoneid = "1";
        let sign =
            "accountType=" + accountType +
            "channelID=" + channelID +
            "openID=" + openID +
            "openKey=" + openKey +
            "orderID=" + orderID +
            "pf=" + pf +
            "pfkey=" + pfkey +
            "userID=" + userID +
            "zoneid=" + zoneid +
            this._appkey;
        // console.log("_getCharge:", sign);
        sign = window['md5'](sign);

        let url = config.PAY_CHARGE_URL_TEMPLATE;
        url = url.replace("#domain#", config.LOGIN_URL);
        url = url.replace("#orderID#", orderID);
        url = url.replace("#channelID#", channelID);
        url = url.replace("#userID#", userID);
        url = url.replace("#accountType#", accountType);
        url = url.replace("#openID#", encodeURIComponent(openID));
        url = url.replace("#openKey#", encodeURIComponent(openKey));
        url = url.replace("#pf#", pf);
        url = url.replace("#pfkey#", pfkey);
        url = url.replace("#zoneid#", zoneid);
        url = url.replace("#sign#", sign);
        console.log("_getCharge url:", url);

        let http = new HttpRequest();
        http.get(url, (response) => {
            console.log("_getCharge:", response);
            let ret = JSON.parse(response);
            if (ret.state != 1) {
                fail && fail();
                return;
            }
            success && success();
        }, fail);
    }

    private _wxRequestMidasPayment(money: number, success?: Function, fail?: Function) {
        console.log("_wxRequestMidasPayment");

        ALDStatistics.instance.aldSendEvent("打开充值", {
            openid: this._openid,
            money: money,
            username: this._topUserName,
            servername: G_UserData.getBase().getServer_name()
        })
        let wx: any = window['wx'];
        let object = {
            mode: "game",
            env: this._isTestEnv ? 1 : 0,
            offerId: this._offerId,
            currencyType: "CNY",
            platform: "android",
            buyQuantity: money * 10,
            zoneId: "1",
            success: (ret) => {
                console.log("success:", ret);
                success();
                ALDStatistics.instance.aldSendEvent("充值成功", {
                    openid: this._openid,
                    money: money,
                    username: this._topUserName,
                    servername: G_UserData.getBase().getServer_name()
                })
            },
            fail: (ret) => {
                console.log("fail:", ret);
                fail();
            },
            // complete: (ret) => {
            //     console.log("complete:", ret);
            // }
        }
        wx.requestMidasPayment(object);
    }


    public getversionAB(): string {
        return this.abCode % 2 == 1 ? 'a' : 'b';
    }
}
