import { config } from "../config";
import { FunctionConst } from "../const/FunctionConst";
import { NativeConst } from "../const/NativeConst";
import { RECHARGE_TEST_URL_TEMPLATE, SPECIFIC_OP_ID } from "../debug/DebugConfig";
import { G_GameAgent, G_StorageManager, G_UserData } from "../init";
import { WayFuncDataHelper } from "../utils/data/WayFuncDataHelper";
import NativeAgent from "./NativeAgent";

export default class NativeAgentDevelop extends NativeAgent {

    private _userID: string;

    constructor() {
        super();
        this._userID = "";
    }

    public init() {
        this._dispatch({ event: NativeConst.SDKCheckVersionResult, ret: NativeConst.CHECK_VERSION_TYPE_WITHOUT });
    }

    private _dispatch(data) {
        this._onNativeCallback(data);
    }

    public getLoginName() {
        return this._userID;
    }

    public getDeviceId() {
        return "develop";
    }

    // 获取分包id
    public getChannelId() {
        return "0";
    }

    public login() {
        let info = G_StorageManager.load("NativeAgentDevelop")
        if (info != null && info.userName != "") {
            this._userID = info.userName
            this._getTokenLocal(config.SPECIFIC_OP_ID, info.userName);
        }
        //QA测试：
        // let wx = window['wx']
        // let this1 = this;

        // let fail = function () {
        //     UIPopupHelper.showOfflineDialog(Lang.get("login_network_timeout"));
        // }
        // wx.login({
        //     success(res) {
        //         //临时在客户端登录
        //         let xhr = new XMLHttpRequest;
        //         xhr.open('GET', `https://zmddzapi.rzcdz2.com/api/mingjiangzhuan/login?code=${res.code}&type=1`)
        //         xhr.onreadystatechange = function () {
        //             if (xhr.readyState == 4) {
        //                 if (xhr.status == 200) {
        //                     try {
        //                         let ret = JSON.parse(xhr.response);
        //                         this1._userID = ret.openid;
        //                         this1._getTokenLocal(config.SPECIFIC_OP_ID, ret.openid);
        //                     } catch (error) {
        //                         fail();
        //                     }
        //                 } else {
        //                     fail();
        //                 }
        //             }
        //         }
        //         xhr.send();
        //     },
        //     fail: fail
        // })
    }

    public onGetToken(ret, response) {
        if (ret == 1) {
            G_StorageManager.save("NativeAgentDevelop", { userName: this._userID });
            this._dispatch({ event: NativeConst.SDKLoginResult, ret: NativeConst.STATUS_SUCCESS, param: response });
        }
        else {
            this._dispatch({ event: NativeConst.SDKLoginResult, ret: NativeConst.STATUS_FAILED, param: "" });
        }
    }

    private _getTokenLocal(opId, uid, callback?) {
        let data = {}
        data['topUserID'] = uid;
        data['topUserName'] = uid;
        data['platformID'] = this.getOpGameId();
        data['sdkUserName'] = "";
        data['sdkUserID'] = uid;
        data['channelID'] = opId;
        data['token'] = "8150c2bcf918221df25313d46a18a033";
        data['timestamp'] = (new Date().getTime() * 1000).toString();
        data['sign'] = window['md5'](uid + uid + uid + "8150c2bcf918221df25313d46a18a033" + config.TOKEN_KEY);
        data['extension'] = "gptxxxxxxx|1|1";
        this.onGetToken(1, data);
    }

    public getLogoutType() {
        return NativeConst.LOGOUT_TYPE_UNAVAILABLE;
    }

    public logout() {
        G_StorageManager.save("NativeAgentDevelop", { userName: "" });
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
        let order = {};

        var info = G_StorageManager.load("NativeAgentDevelop");

        var server = G_GameAgent.getLoginServer();
        var value = "channelID=#channelID#&currency=RMB&extension=#extension#&gameID=#gameID#&money=#money#&orderID=#orderID#&orderTime=#orderTime#&platformID=#platformID#&productID=#productID#&serverID=#serverID#&userName=#userName#";
        var nowTime = new Date();
        var year = nowTime.getFullYear().toString();
        var month = (nowTime.getMonth() + 1).toString();
        var day = nowTime.getDate().toString();
        var hour = nowTime.getHours().toString();
        var minute = nowTime.getMinutes().toString();
        var seconds = nowTime.getSeconds().toString();
        var orderTime = year + month + day + hour + minute + seconds;//os.date("%y%m%d%H%M%S", os.time())
        var timeStr = nowTime.getTime().toString();
        var orderID = timeStr.substr(timeStr.length - 7, 7);
        var domain = config.RECHARGE_TEST_URL;
        var url = RECHARGE_TEST_URL_TEMPLATE;
        url = url.replace("http://url", domain);
        url = url.replace("#gameID#", config.SPECIFIC_GAME_ID.toString());
        url = url.replace('#platformID#', config.SPECIFIC_GAME_OP_ID.toString());
        url = url.replace('#channelID#', SPECIFIC_OP_ID.toString());
        url = url.replace('#extension#', "");
        url = url.replace('#productID#', productId.toString());
        url = url.replace('#orderID#', orderID);
        url = url.replace('#userName#', info.userName);
        url = url.replace('#serverID#', server.getServer().toString());
        url = url.replace('#money#', price.toString());
        url = url.replace('#orderTime#', orderTime);


        value = value.replace("http://url", domain);
        value = value.replace("#gameID#", config.SPECIFIC_GAME_ID.toString());
        value = value.replace("#platformID#", config.SPECIFIC_GAME_OP_ID.toString());
        value = value.replace("#channelID#", SPECIFIC_OP_ID.toString());
        value = value.replace("#extension#", "");
        value = value.replace("#productID#", productId.toString());
        value = value.replace("#orderID#", orderID);
        value = value.replace("#userName#", info.userName);
        value = value.replace("#serverID#", server.getServer().toString());
        value = value.replace("#money#", price.toString());
        value = value.replace("#orderTime#", orderTime);

        // url = string.gsub(url, "#sign#", md5.sum(value .. "common"))
        var sign = window['md5'](value + "common");
        url = url.replace("#sign#", sign);
        var xhr = new XMLHttpRequest()
        //xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
        console.log("url", url);
        xhr.open("GET", url);

        var lastRechargeTotal = G_UserData.getBase().getRecharge_total();

        var onReadyStateChange = function () {
            var result = "fail"
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 207)) {
                if (xhr.response != null && xhr.response != "") {
                    if (xhr.response == "ok") {
                        result = "success"
                        if (price >= 328 || (lastRechargeTotal < 1000 && (lastRechargeTotal + price) >= 1000)) {
                            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_SUPER_VIP);
                        }
                    }
                }
            }
        }.bind(this);
        xhr.onreadystatechange = onReadyStateChange;
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        //xhr.addEventListener()//.registerScriptHandler(onReadyStateChange)
        xhr.send();
    }

    public getversionAB(): string {
        if (G_GameAgent.isLogin) {
            return G_GameAgent.getLoginServer().getServer() % 2 != 0 ? "a" : 'b';
        } else {
            return 'a';
        }
    }
}