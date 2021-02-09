import { NativeConst } from "../const/NativeConst";
import { PrioritySignal } from "../utils/event/PrioritySignal";
import { config } from "../config";

export default abstract class NativeAgent {

    protected _init: boolean;
    protected _nativeVersion: number;
    protected _opId: string;
    protected _opGameId: string;
    protected _adCode: string;
    protected _nativeType: string;
    protected _nativeModel: string;
    protected _appPackage: string;
    protected _deviceId: string;

    public signal;

    private _invitorUserId = 0;

    private _invitorServerId = 0;
    constructor() {
        this._init = false;
        this._nativeVersion = 0;
        this._opId = 'unknown';
        this._opGameId = 'unknown';
        this._adCode = '0';
        this._nativeType = 'unknown';
        this._nativeModel = 'unknown';
        this._appPackage = 'unknown';
        this._deviceId = 'unknown';
        this.signal = new PrioritySignal('table');
    }

    public init() {

    }

    _initAgent() {
        this.callNativeFunction('initSDK');
    }

    protected _onNativeCallback(data) {
        var result = data;
        if (result) {
            if (result.event == NativeConst.SDKAgentVersion) {
                this._nativeVersion = result.ret || 0;
                this._initAgent();
            } else if (result.event == NativeConst.SDKCheckVersionResult) {
                this._init = true;
                // this.crashSetAppVersion(this.getAppVersion() + ('_' + VERSION_RES));
            }
        }
        this.signal.dispatch(result);
    }

    static callStaticFunction(func, params, returnType) {
        // if (targetPlatform == cc.PLATFORM_OS_ANDROID) {
        //     return LuaNativeBridge.call('org.cocos2dx.sdk.NativeAgent', func, params, returnType);
        // } else if (targetPlatform == cc.PLATFORM_OS_IPHONE || targetPlatform == cc.PLATFORM_OS_IPAD) {
        //     return LuaNativeBridge.call('NativeAgent', func, params, returnType);
        // } else if (targetPlatform == cc.PLATFORM_OS_WINDOWS) {
        //     if (func == 'getDeviceModel') {
        //         return getDeviceModel();
        //     } else if (func == 'clipboard') {
        //         clipboard(params[1]['str']);
        //     }
        // }
        // return null;
        return null;
    }


    callNativeFunction(func, params?, returnType?) {
        if (func != 'crashLog') {
            this.crashLog('NativeAgent:' + func);
        }
        return NativeAgent.callStaticFunction(func, params, returnType);
    }
    crashLog(log, level?, tag?) {
        if (this._init) {
            this.callNativeFunction('crashLog', [
                { level: level || 5 },
                { tag: tag || 'xgame' },
                { log: log }
            ]);
        }
    }

    public getPlatformId(){
        return 178;
    }

    public getLoginName() {
    }

    public getDeviceId() {
        return "develop";
    }

    // 获取分包id
    public getChannelId() {
        return "0";
    }

    public getGameId():string {
        return "1";
    }

    public getOpId() {
        return config.SPECIFIC_OP_ID;
    }

    public getOpGameId() {
        return config.SPECIFIC_GAME_OP_ID;
    }

    public getLogoutType(): number {
        return 0;
    }

    public login() {

    }

    public logout() {

    }

    public pay(appid, price, productId, productName, productDesc) {
        console.log("nativeagent pay");
    }

    public setGameData(k, v) {
        // this.callNativeFunction('setGameData', [
        //     { key: k },
        //     { value: tostring(v) }
        // ]);
    }

    public eventLevelup() {

    }

    public exitGame() {

    }

    public getTopUserName() {
        return '';
    }

    public getversionAB():string {
        return 'a';
    }

    public isCollectScene():boolean {
        return false;
    }

    public get invitorUserId() {
        return this._invitorUserId;
    }
    public set invitorUserId(value) {
        this._invitorUserId = value;
    }
    public get invitorServerId() {
        return this._invitorServerId;
    }
    public set invitorServerId(value) {
        this._invitorServerId = value;
    }

    hasForum() {
        return this.callNativeFunction('hasForum', null, 'boolean');
    }
}