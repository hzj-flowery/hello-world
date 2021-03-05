import { BaseData } from "../data/BaseData";
import { PrioritySignal } from "../utils/event/PrioritySignal";
import { G_Prompt, G_UserData } from "../init";
import { ExploreResCfg } from "../scene/view/exploreMain/ExploreResCfg";
import { config } from "../config";

export interface ConfigManager {
    getPopupUrl(): string
    setPopupUrl(value: string): void
    getLastPopupUrl(): string
    getDefaultServer(): number
    setDefaultServer(value: number): void
    getLastDefaultServer(): number
    getAppVersion():number
    getAppVersionDesc(): string
    setAppVersionDesc(value: string): void
    getLastAppVersionDesc(): string
    getAppVersionUrl(): string
    setAppVersionUrl(value: string): void
    getLastAppVersionUrl(): string
    getAppVersionType(): string
    setAppVersionType(value: string): void
    getLastAppVersionType(): string
    getResVersionUrl(): string
    setResVersionUrl(value: string): void
    getLastResVersionUrl(): string
    getRunCode(): number
    setRunCode(value: number): void
    getLastRunCode(): number
    getRunCodeDesc(): string
    setRunCodeDesc(value: string): void
    getLastRunCodeDesc(): string
    isReportFight(): boolean
    setReportFight(value: boolean): void
    isLastReportFight(): boolean
    isError(): boolean
    setError(value: boolean): void
    isLastError(): boolean
    getErrorTip(): string
    setErrorTip(value: string): void
    getLastErrorTip(): string
    getServerNotAllowedTip(): string
    setServerNotAllowedTip(value: string): void
    getLastServerNotAllowedTip(): string
    getServerUnknownErrorTip(): string
    setServerUnknownErrorTip(value: string): void
    getLastServerUnknownErrorTip(): string
    isGiftcode(): boolean
    setGiftcode(value: boolean): void
    isLastGiftcode(): boolean
    isAlwaysShowToolBar(): boolean
    setAlwaysShowToolBar(value: boolean): void
    isLastAlwaysShowToolBar(): boolean
    isDnspod(): boolean
    setDnspod(value: boolean): void
    isLastDnspod(): boolean
    isRecharge(): boolean
    setRecharge(value: boolean): void
    isLastRecharge(): boolean
    isRechargeTip(): boolean
    setRechargeTip(value: boolean): void
    isLastRechargeTip(): boolean
    isSandbox(): boolean
    setSandbox(value: boolean): void
    isLastSandbox(): boolean
    isAppstore(): boolean
    setAppstore(value: boolean): void
    isLastAppstore(): boolean
    isShowBindWeChat(): boolean
    setShowBindWeChat(value: boolean): void
    isLastShowBindWeChat(): boolean
    isShare(): boolean
    setShare(value: boolean): void
    isLastShare(): boolean
    isReview(): boolean
    setReview(value: boolean): void
    isLastReview(): boolean
    isRemoteServer(): boolean
    setRemoteServer(value: boolean): void
    isLastRemoteServer(): boolean
    getServerCacheTime(): number
    setServerCacheTime(value: number): void
    getLastServerCacheTime(): number
    getListServer(): string
    setListServer(value: string): void
    getLastListServer(): string
    getAddServer(): string
    setAddServer(value: string): void
    getLastAddServer(): string
    isRemoteGateway(): boolean
    setRemoteGateway(value: boolean): void
    isLastRemoteGateway(): boolean
    getGatewayCacheTime(): number
    setGatewayCacheTime(value: number): void
    getLastGatewayCacheTime(): number
    getListGateway(): string
    setListGateway(value: string): void
    getLastListGateway(): string
    getAddGateway(): string
    setAddGateway(value: string): void
    getLastAddGateway(): string
    getBlackList(): string
    setBlackList(value: string): void
    getLastBlackList(): string
    getPatchCode(): string
    setPatchCode(value: string): void
    getLastPatchCode(): string
    isNotification(): boolean
    setNotification(value: boolean): void
    isLastNotification(): boolean
    isGetRoleList(): boolean
    setGetRoleList(value: boolean): void
    isLastGetRoleList(): boolean
    isVoiceAutoPay(): boolean
    setVoiceAutoPay(value: boolean): void
    isLastVoiceAutoPay(): boolean
    getRechargeLimit(): number
    setRechargeLimit(value: number): void
    getLastRechargeLimit(): number
    isRealName(): boolean
    setRealName(value: boolean): void
    isLastRealName(): boolean
    isAvoidHooked(): boolean
    setAvoidHooked(value: boolean): void
    isLastAvoidHooked(): boolean
    getAvoidOnlineTime(): number
    setAvoidOnlineTime(value: number): void
    getLastAvoidOnlineTime(): number
    isSvipOpen(): boolean
    setSvipOpen(value: boolean): void
    isLastSvipOpen(): boolean
    getSvipQQ(): string
    setSvipQQ(value: string): void
    getLastSvipQQ(): string
    getSvipImage(): string
    setSvipImage(value: string): void
    getLastSvipImage(): string
    isSvipOpen2(): boolean
    setSvipOpen2(value: boolean): void
    isLastSvipOpen2(): boolean
    getSvipQQ2(): string
    setSvipQQ2(value: string): void
    getLastSvipQQ2(): string
    getSvipImage2(): string
    setSvipImage2(value: string): void
    getLastSvipImage2(): string
    isSvipRegisteOpen(): boolean
    setSvipRegisteOpen(value: boolean): void
    isLastSvipRegisteOpen(): boolean
    isLargeCashReCharge(): boolean
    setLargeCashReCharge(value: boolean): void
    isLastLargeCashReCharge(): boolean
    isDownloadThreeKindoms(): boolean
    setDownloadThreeKindoms(value: boolean): void
    isLastDownloadThreeKindoms(): boolean
    getDownloadThreeKindomsUrl(): string
    setDownloadThreeKindomsUrl(value: string): void
    getLastDownloadThreeKindomsUrl(): string
    isDalanVersion(): boolean
    setDalanVersion(value: boolean): void
    isLastDalanVersion(): boolean
    isServerListReIndex(): boolean
    setServerListReIndex(value: boolean): void
    isLastServerListReIndex(): boolean
    isUrlFilter(): boolean
    setUrlFilter(value: boolean): void
    isLastUrlFilter(): boolean
}
var schema = {};
schema['popupUrl'] = [
    'string',
    ''
];
schema['defaultServer'] = [
    'number',
    0
];
schema['appVersion'] = [
    'string',
    '0.0.0'
];
schema['appVersionDesc'] = [
    'string',
    ''
];
schema['appVersionUrl'] = [
    'string',
    ''
];
schema['appVersionType'] = [
    'string',
    ''
];
schema['resVersion'] = [
    'string',
    '0.0.0'
];
schema['resVersionUrl'] = [
    'string',
    ''
];
schema['runCode'] = [
    'number',
    0
];
schema['runCodeDesc'] = [
    'string',
    ''
];
schema['reportFight'] = [
    'boolean',
    false
];
schema['error'] = [
    'boolean',
    false
];
schema['errorTip'] = [
    'string',
    ''
];
schema['serverNotAllowedTip'] = [
    'string',
    ''
];
schema['serverUnknownErrorTip'] = [
    'string',
    ''
];
schema['giftcode'] = [
    'boolean',
    true
];
schema['alwaysShowToolBar'] = [
    'boolean',
    false
];
schema['dnspod'] = [
    'boolean',
    false
];
schema['recharge'] = [
    'boolean',
    true
];
schema['rechargeTip'] = [
    'boolean',
    false
];
schema['sandbox'] = [
    'boolean',
    false
];
schema['appstore'] = [
    'boolean',
    false
];
schema['showBindWeChat'] = [
    'boolean',
    false
];
schema['share'] = [
    'boolean',
    false
];
schema['review'] = [
    'boolean',
    false
];
schema['remoteServer'] = [
    'boolean',
    true
];
schema['serverCacheTime'] = [
    'number',
    60
];
schema['listServer'] = [
    'string',
    ''
];
schema['addServer'] = [
    'string',
    ''
];
schema['remoteGateway'] = [
    'boolean',
    true
];
schema['gatewayCacheTime'] = [
    'number',
    900
];
schema['listGateway'] = [
    'string',
    ''
];
schema['addGateway'] = [
    'string',
    ''
];
schema['blackList'] = [
    'string',
    ''
];
schema['patchCode'] = [
    'string',
    ''
];
schema['notification'] = [
    'boolean',
    true
];
schema['getRoleList'] = [
    'boolean',
    true
];
schema['voiceAutoPay'] = [
    'boolean',
    true
];
schema['rechargeLimit'] = [
    'number',
    0
];
schema['realName'] = [
    'boolean',
    false
];
schema['avoidHooked'] = [
    'boolean',
    false
];
schema['avoidOnlineTime'] = [
    'number',
    10800
];
schema['svipOpen'] = [
    'boolean',
    true
];
schema['svipQQ'] = [
    'string',
    ''
];
schema['svipImage'] = [
    'string',
    ''
];
schema['svipOpen2'] = [
    'boolean',
    false
];
schema['svipQQ2'] = [
    'string',
    ''
];
schema['svipImage2'] = [
    'string',
    ''
];
schema['svipRegisteOpen'] = [
    'boolean',
    false
];
schema['largeCashReCharge'] = [
    'boolean',
    false
];
schema['downloadThreeKindoms'] = [
    'boolean',
    false
];
schema['downloadThreeKindomsUrl'] = [
    'string',
    ''
];
schema['dalanVersion'] = [
    'boolean',
    false
];
schema['serverListReIndex'] = [
    'boolean',
    false
];
schema['urlFilter'] = [
    'boolean',
    false
];
export class ConfigManager extends BaseData {
    public static schema = schema;
    signal: PrioritySignal;

    _isIos:boolean = false;
    isUnReleaseVersion = false;
    constructor() {
        super();
        this.signal = new PrioritySignal('string');

        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this._isIos = wx.getSystemInfoSync().platform == "ios";
        }
    }
    public clear() {
    }
    public reset() {
    }
    public fresh() {
        // var domain = CONFIG_URL;
        // var url = CONFIG_URL_TEMPLATE;
        // url = string.gsub(url, '#domain#', domain);
        // if (G_GameAgent.isGrayTest()) {
        //     url = string.gsub(url, '#o#', tostring(G_GameAgent.getGrayOpId()));
        //     url = string.gsub(url, '#g#', tostring(G_GameAgent.getGrayOpGameId()));
        // } else {
        //     url = string.gsub(url, '#o#', tostring(G_NativeAgent.getOpId()));
        //     url = string.gsub(url, '#g#', tostring(G_NativeAgent.getOpGameId()));
        // }
        // url = string.gsub(url, '#g#', tostring(G_NativeAgent.getOpGameId()));
        // url = string.gsub(url, '#v#', G_NativeAgent.getAppVersion());
        // url = string.gsub(url, '#d#', G_NativeAgent.getDeviceId());
        // url = string.gsub(url, '#r#', tostring(VERSION_RES));
        // url = string.gsub(url, '#p#', G_NativeAgent.getNativeType());
        // url = string.gsub(url, '#t#', tostring(os.time()));
        // print('get setting url = ' + url);
        // var xhr = new cc.XMLHttpRequest();
        // xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING;
        // xhr.open('GET', url);
        // function onReadyStateChange() {
        //     var result = 'fail';
        //     if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 207)) {
        //         if (xhr.response != null && xhr.response != '') {
        //             var ret = json.decode(xhr.response);
        //             if (ret != null && ret.status != null && ret.status == 0) {
        //                 var data;
        //                 if (ret.version != null && ret.version == 1) {
        //                     data = base64.decode(string.sub(ret.data, 15));
        //                 } else {
        //                     data = ret.data;
        //                 }
        //                 data = json.decode(data);
        //                 if (data != null && data != '') {
        //                     this.setProperties(data);
        //                     var patch = this.getPatchCode();
        //                     if (patch != null && patch != '') {
        //                         var patch_md5 = md5.sum(patch + 'CLIENT_PATCH_CODE_SIG');
        //                         if (patch_md5 == data['patchCodeSig']) {
        //                             PatchCode.loadPatchCode(patch);
        //                         } else {
        //                             error('Error(666)');
        //                         }
        //                     }
        //                     result = 'success';
        //                 }
        //             }
        //         }
        //     }
        //     this.signal.dispatch(result, tostring(G_NativeAgent.getOpId()), tostring(G_NativeAgent.getOpGameId()));
        // }
        // xhr.registerScriptHandler(onReadyStateChange);
        // xhr.send();
    }

    public  checkCanRecharge(showTips:boolean = false):boolean{
        if (this._isIos ) {
            if (this.isUnReleaseVersion) {
                showTips && G_Prompt.showTip('充值未开放');
                return false;
            }else if(config.remoteCfg.forbidIos) {
                var lv = G_UserData ? G_UserData.getBase().getLevel() : 0;
                var needLv = config.remoteCfg.iosLv || 18;
                if (lv >= needLv && !config.remoteCfg.checkIosLv ) {
                    return true;
                }
                showTips && G_Prompt.showTip('充值未开放');
                return false;
            }
        }
        return true;
    }
}
