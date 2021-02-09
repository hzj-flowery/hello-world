import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_ServerTime, G_UserData, G_ConfigLoader, G_RoleListManager, G_GameAgent } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { SignalConst } from "../const/SignalConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { FunctionConst } from "../const/FunctionConst";
import { TimeConst } from "../const/TimeConst";
import { HeroData } from "./HeroData";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { DataConst } from "../const/DataConst";
import ALDStatistics from "../utils/ALDStatistics";
import { ReturnSvrData } from "./ReturnSvrData";

export interface UserBaseData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getExp(): number
    setExp(value: number): void
    getLastExp(): number
    getCreate_time(): number
    setCreate_time(value: number): void
    getLastCreate_time(): number
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
    getPower(): number
    setPower(value: number): void
    getLastPower(): number
    getGuide_id(): number
    setGuide_id(value: number): void
    getLastGuide_id(): number
    getOrder_state(): number
    setOrder_state(value: number): void
    getLastOrder_state(): number
    getServer_name(): string
    setServer_name(value: string): void
    getLastServer_name(): string
    getChange_name_count(): number
    setChange_name_count(value: number): void
    getLastChange_name_count(): number
    getRecharge_total(): number
    setRecharge_total(value: number): void
    getLastRecharge_total(): number
    getRecharge_fake_total(): number
    setRecharge_fake_total(value: number): void
    getLastRecharge_fake_total(): number
    getToday_online_time(): number
    setToday_online_time(value: number): void
    getLastToday_online_time(): number
    getOnline_time_update_time(): number
    setOnline_time_update_time(value: number): void
    getLastOnline_time_update_time(): number
    getToday_init_level(): number
    setToday_init_level(value: number): void
    getLastToday_init_level(): number
    getServer_open_time(): number
    setServer_open_time(value: number): void
    getLastServer_open_time(): number
    getAvatar_base_id(): number
    setAvatar_base_id(value: number): void
    getLastAvatar_base_id(): number
    getAvatar_id(): number
    setAvatar_id(value: number): void
    getLastAvatar_id(): number
    getOn_team_pet_id(): number
    setOn_team_pet_id(value: number): void
    getLastOn_team_pet_id(): number
    getCamp(): number
    setCamp(value: number): void
    getLastCamp(): number
    getRecharge_today(): number
    setRecharge_today(value: number): void
    getLastRecharge_today(): number
    isNoticeToday(): boolean
    setNoticeToday(value: boolean): void
    isLastNoticeToday(): boolean
    getVip_qq(): number
    setVip_qq(value: number): void
    getLastVip_qq(): number
    isIs_admit(): boolean
    setIs_admit(value: boolean): void
    isLastIs_admit(): boolean
    getGrave_left_sec(): number
    setGrave_left_sec(value: number): void
    getLastGrave_left_sec(): number
    getGrave_begin_time(): number
    setGrave_begin_time(value: number): void
    getLastGrave_begin_time(): number
    getGrave_assist_sec(): number
    setGrave_assist_sec(value: number): void
    getLastGrave_assist_sec(): number
    getGrave_assist_begin_time(): number
    setGrave_assist_begin_time(value: number): void
    getLastGrave_assist_begin_time(): number
    isIs_white_list(): boolean
    setIs_white_list(value: boolean): void
    isLastIs_white_list(): boolean
    getHead_frame_id(): number
    setHead_frame_id(value: number): void
    getLastHead_frame_id(): number
    getReal_server_name(): string
    setReal_server_name(value: string): void
    getLastReal_server_name(): string
    isIs_regression():boolean
    setIs_regression(value:boolean):void
    getBrawlguilds_role():number
    setBrawlguilds_role(value:number):void
    getRecharge_jade_bi():number
    setRecharge_jade_bi(value:number):void
    getVip_max():number
    setVip_max(value:number):void
    getVip_level():number
    setVip_level():void
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['level'] = [
    'number',
    0
];
schema['exp'] = [
    'number',
    0
];
schema['create_time'] = [
    'number',
    0
];
schema['officer_level'] = [
    'number',
    0
];
schema['power'] = [
    'number',
    0
];
schema['guide_id'] = [
    'number',
    0
];
schema['order_state'] = [
    'number',
    0
];
schema['server_name'] = [
    'string',
    ''
];
schema['change_name_count'] = [
    'number',
    0
];
schema['recharge_total'] = [
    'number',
    0
];
schema['recharge_fake_total'] = [
    'number',
    0
];
schema['today_online_time'] = [
    'number',
    0
];
schema['online_time_update_time'] = [
    'number',
    0
];
schema['today_init_level'] = [
    'number',
    0
];
schema['server_open_time'] = [
    'number',
    0
];
schema['avatar_base_id'] = [
    'number',
    0
];
schema['avatar_id'] = [
    'number',
    0
];
schema['on_team_pet_id'] = [
    'number',
    0
];
schema['camp'] = [
    'number',
    0
];
schema['recharge_today'] = [
    'number',
    0
];
schema['noticeToday'] = [
    'boolean',
    false
];
schema['vip_qq'] = [
    'number',
    0
];
schema['is_admit'] = [
    'boolean',
    false
];
schema['grave_left_sec'] = [
    'number',
    0
];
schema['grave_begin_time'] = [
    'number',
    0
];
schema['grave_assist_sec'] = [
    'number',
    0
];
schema['grave_assist_begin_time'] = [
    'number',
    0
];
schema['is_white_list'] = [
    'boolean',
    false
];
schema['head_frame_id'] = [
    'number',
    0
];
schema['real_server_name'] = [
    'string',
    ''
];

schema['is_regression'] = [
    'boolean',
    false
];
schema['brawlguilds_role'] = [
    'number',
    0
];
schema['recharge_jade_bi'] = [
    'number',
    0
];
schema['vip_max'] = [
    'number',
    0
];
schema['vip_level'] = [
    'number',
    0
];

export class UserBaseData extends BaseData {
    public static schema = schema;
    private _lastCurrencys;
    private _currencys;
    private _recovers;
    private _serverRecovers;
    private _opCount;
    private _isLevelUp;
    private _oldPlayerLevel;
    private _isBindedWeChat;
    private _bindCode;

    private _recvGetUser;
    private _recvGetCurrency;
    private _recvGetRecover;
    private _recvOfficialRankUp;
    private _s2cGetGameGiftBagListener;
    private _s2cGetUserBaseInfoListener;
    private _s2cOpBlackListListener;
    private _s2cPracticeListener;
    private _s2cGetUserDetailInfoListener;
    private _s2cGetOpCountListener;
    private _s2cGetWeChatBindInfoListener;
    private _s2cGetWeChatBindCodeListener;
    private _s2cGetTotalOnlineTimeListener;
    private _s2cGetReturnSvrListener;
    private _s2cCheckInListener;
    private _s2cRecvBonusListener;

    private _returnSvr;
    constructor() {
        super()
        this._lastCurrencys = {};
        this._currencys = {};
        this._recovers = {};
        this._serverRecovers = {};
        this._opCount = {};
        this._returnSvr = null;
        this._isLevelUp = false;
        this._oldPlayerLevel = 0;
        this._isBindedWeChat = false;
        this._bindCode = '';

        this._recvGetUser = G_NetworkManager.add(MessageIDConst.ID_S2C_GetUser, this._recvRoleInfo.bind(this));
        this._recvGetCurrency = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCurrency, this._recvGetCurrencyInfo.bind(this));
        this._recvGetRecover = G_NetworkManager.add(MessageIDConst.ID_S2C_GetRecover, this._recvGetRecoverInfo.bind(this));
        this._recvOfficialRankUp = G_NetworkManager.add(MessageIDConst.ID_S2C_UpOfficerLevel, this._s2cUpOfficerLevel.bind(this));
        this._s2cGetGameGiftBagListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGameGiftBag, this._s2cGetGameGiftBag.bind(this));
        this._s2cGetUserBaseInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetUserBaseInfo, this._s2cGetUserBaseInfo.bind(this));
        this._s2cOpBlackListListener = G_NetworkManager.add(MessageIDConst.ID_S2C_OpBlackList, this._s2cOpBlackList.bind(this));
        this._s2cPracticeListener = G_NetworkManager.add(MessageIDConst.ID_S2C_Practice, this._s2cPractice.bind(this));
        this._s2cGetUserDetailInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetUserDetailInfo, this._s2cGetUserDetailInfo.bind(this));
        this._s2cGetOpCountListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetOpCount, this._s2cGetOpCount.bind(this));
        this._s2cGetWeChatBindInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetWeChatBindInfo, this._s2cGetWeChatBindInfo.bind(this));
        this._s2cGetWeChatBindCodeListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetWeChatBindCode, this._s2cGetWeChatBindCode.bind(this));
        this._s2cGetTotalOnlineTimeListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetTotalOnlineTime, this._s2cGetTotalOnlineTime.bind(this));

        this._s2cGetReturnSvrListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetReturnSvr, handler(this, this._s2cGetReturnSvr));
        this._s2cCheckInListener = G_NetworkManager.add(MessageIDConst.ID_S2C_CheckIn, handler(this, this._s2cCheckIn));
        this._s2cRecvBonusListener = G_NetworkManager.add(MessageIDConst.ID_S2C_RecvBonus, handler(this, this._s2cRecvBonus));
    }

    public clear() {
        this.setNoticeToday(false);
        this._recvGetUser.remove();
        this._recvGetUser = null;
        this._recvGetCurrency.remove();
        this._recvGetCurrency = null;
        this._recvGetRecover.remove();
        this._recvGetRecover = null;
        this._recvOfficialRankUp.remove();
        this._recvOfficialRankUp = null;
        this._s2cGetGameGiftBagListener.remove();
        this._s2cGetGameGiftBagListener = null;
        this._s2cGetUserBaseInfoListener.remove();
        this._s2cGetUserBaseInfoListener = null;
        this._s2cOpBlackListListener.remove();
        this._s2cOpBlackListListener = null;
        this._s2cPracticeListener.remove();
        this._s2cPracticeListener = null;
        this._s2cGetUserDetailInfoListener.remove();
        this._s2cGetUserDetailInfoListener = null;
        this._s2cGetOpCountListener.remove();
        this._s2cGetOpCountListener = null;
        this._s2cGetWeChatBindInfoListener.remove();
        this._s2cGetWeChatBindInfoListener = null;
        this._s2cGetWeChatBindCodeListener.remove();
        this._s2cGetWeChatBindCodeListener = null;
        this._s2cGetTotalOnlineTimeListener.remove();
        this._s2cGetTotalOnlineTimeListener = null;

        this._s2cGetReturnSvrListener.remove();
        this._s2cGetReturnSvrListener = null;
        this._s2cCheckInListener.remove();
        this._s2cCheckInListener = null;
        this._s2cRecvBonusListener.remove();
        this._s2cRecvBonusListener = null;
    }

    public reset() {
    }

    private _s2cGetOpCount(id, message) {
        this._opCount = {};
        var opCountList = message.op_count || {};
        for (const i in opCountList) {
            var opCount = opCountList[i];
            if (opCount.op_type) {
                this._opCount['k' + opCount.op_type] = opCount.op_count || 0;
            }
        }
    }

    private _s2cGetGameGiftBag(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GIFT_CODE_REWARD, message);
    }
    private _recvRoleInfo(id, message) {
        this.updateUserData(message.user);
        G_SignalManager.dispatch(SignalConst.EVENT_RECV_ROLE_INFO);
    }

    private _s2cUpOfficerLevel(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_OFFICIAL_LEVEL_UP, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_OFFICIAL);
    }

    private _recvGetCurrencyInfo(id, message) {
        var currencys = message.currencys || {};
        this.updateCurrencys(currencys);
        G_SignalManager.dispatch(SignalConst.EVENT_RECV_CURRENCYS_INFO);
    }

    private _recvGetRecoverInfo(id, message) {
        var recover = message.recovers || {};
        this.updateRecover(recover);
        G_SignalManager.dispatch(SignalConst.EVENT_RECV_RECOVER_INFO);
    }

    public updateUserData(data) {
        this.backupProperties();
        this.setProperties(data);
        if (this.getLastLevel() > 0 && this.getLastLevel() < this.getLevel()) {
            this._isLevelUp = true;
            this._oldPlayerLevel = this.getLastLevel();
            G_SignalManager.dispatch(SignalConst.EVENT_USER_LEVELUP);
            ALDStatistics.instance.aldSendEvent('玩家等级提升', {'level':this.getLevel()});
        }
        if (this.getLastVip_qq() != this.getVip_qq()) {
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SUPER_VIP);
        }
        if (this.getLastHead_frame_id() != 0) {
            var frame = G_UserData.getHeadFrame().getFrameDataWithId(this.getHead_frame_id());
            G_UserData.getHeadFrame().setCurrentFrame(frame);
        }
    }

    public isLevelUp() {
        return [
            this._isLevelUp,
            this._oldPlayerLevel
        ];
    }

    public getOldPlayerLevel() {
        if (this._oldPlayerLevel == 0) {
            this._oldPlayerLevel = this.getLevel();
        }
        return this._oldPlayerLevel;
    }

    public clearLevelUpFlag() {
        this._isLevelUp = false;
    }

    public updateCurrencys(currencys) {
        this._lastCurrencys = {};
        this._lastCurrencys = this._currencys;
        for (const i in currencys) {
            var value = currencys[i];
            var currValue = {
                id: value.id,
                num: value.num
            };
            this._currencys['_' + value.id] = value.num;
        }
    }

    public updateRecover(recover) {
        for (const i in recover) {
            var value = recover[i];
            var currValue = {
                id: value.recover_id,
                num: value.recover_num,
                time: value.refresh_time
            };
            this._recovers['_' + value.recover_id] = currValue;
            this._serverRecovers['_' + value.recover_id] = currValue;
        }
    }

    public setRecoverData(recoverId, recoverNum) {
        var recoverItem = this._recovers['_' + recoverId];
        if (recoverItem) {
            recoverItem.num = recoverNum;
            this._recovers['_' + recoverId] = recoverItem;
        }
    }

    public getServerRecoverData(recoverId) {
        var recoverItem = this._serverRecovers['_' + recoverId];
        return recoverItem;
    }

    public getRecoverData(recoverId) {
        var recoverItem = this._recovers['_' + recoverId];
        return recoverItem;
    }

    public getLastResValue(resId) {
        var name = DataConst.getResName(resId);
        var size = this._lastCurrencys['_' + resId];
        return size;
    }

    private _isRecoverType(resId) {
        var ResourceCfg = G_ConfigLoader.getConfig(ConfigNameConst.RESOURCE);
        var resData = ResourceCfg.get(resId);
        if (resData && resData.is_recover == 1) {
            return true;
        }
        return false;
    }

    public getResValue(resId) {
        var name = DataConst.getResName(resId);
        if (this._isRecoverType(resId)) {
            return this._getRecoverValue(resId);
        }
        var size = this._currencys['_' + resId] || 0;
        return size;
    }

    private _getRecoverItem(recoverId) {
        var recoverItem = this._recovers['_' + recoverId];
        return recoverItem;
    }

    private _getRecoverValue(recoverId) {
        var item = this._getRecoverItem(recoverId);
        if (item) {
            return item.num;
        }
        return 0;
    }

    public getPlayerBaseId() {

        var id = G_UserData.getHero().getRoleBaseId();
        var avatarBaseId = this.getAvatar_base_id();
        if (avatarBaseId > 0) {
            id = UserDataHelper.convertToBaseIdByAvatarBaseId(avatarBaseId, id)[0];
        }
        return id;
    }

    public getPlayerShowInfo() {
        var id = G_UserData.getHero().getRoleBaseId();
        var avatarBaseId = this.getAvatar_base_id();
        var playerShowInfo = UserDataHelper.convertAvatarId({
            avatar_base_id: avatarBaseId,
            base_id: id
        })[1];
        return playerShowInfo;
    }

    public isMale() {
        var heroCfg = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        var myHeroId = G_UserData.getHero().getRoleBaseId();
        if (myHeroId) {
            if (heroCfg.get(myHeroId).gender == 2) {
                return false;
            }
        }
        return true;
    }

    public getOfficialLevel() {
        return this.getOfficer_level()
    }

    public getOfficialInfo(level?: number) {
        var officialLevel = this.getOfficialLevel();
        if (level >= 0) {
            officialLevel = level;
        }
        var officialInfo = G_ConfigLoader.getConfig(ConfigNameConst.OFFICIAL_RANK).get(officialLevel);
        return [
            officialInfo,
            officialLevel
        ];
    }

    public getOfficialName() {
        var playerName = this.getName();
        var officialInfo = this.getOfficialInfo()[0];
        var officialLevel = this.getOfficialLevel();
        if (officialInfo) {
            var returnName = officialInfo.name;
            return [
                officialLevel,
                returnName
            ];
        }
        return officialLevel;
    }

    public setOnlineTime(onlineTime) {
        this.setToday_online_time(onlineTime);
        this.setOnline_time_update_time(G_ServerTime.getTime());
    }

    public getOnlineTime() {
        var time = this.getToday_online_time();
        var updateTime = this.getOnline_time_update_time();
        var elapsed = 0;
        if (updateTime > 0) {
            elapsed = G_ServerTime.getTime() - updateTime;
        }
        return time + elapsed;
    }

    public isEquipAvatar() {
        var avatarId = this.getAvatar_id();
        return avatarId > 0;
    }

    public c2sGetGameGiftBag(code) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGameGiftBag, { code_id: code });
    }

    public c2sGetUserBaseInfo(userId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetUserBaseInfo, { user_id: userId });
    }

    public c2sOpBlackList(opType, userId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_OpBlackList, {
            op_type: opType,
            user_id: userId
        });
    }

    public c2sPractice(userId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_Practice, { user_id: userId });
    }

    public c2sGetUserDetailInfo(userId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetUserDetailInfo, { user_id: userId });
    }

    private _s2cGetUserBaseInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        var simpleUser: any = {};
        simpleUser.userId = message.user_id;
        simpleUser.name = message.name;
        simpleUser.baseId = message.base_id;
        simpleUser.avatarId = message.avatar_id;
        simpleUser.avatarBaseId = message.avatar_base_id;
        simpleUser.officeLevel = message.office_level || 0;
        simpleUser.level = message.level;
        simpleUser.power = message.power;
        simpleUser.guildName = message.guild_name;
        simpleUser.is_friend = message.is_friend;
        simpleUser.head_frame_id = message.head_frame_id;

        var [id, playerInfo] = UserDataHelper.convertAvatarId(message);
        simpleUser.player_info = playerInfo;
        G_SignalManager.dispatch(SignalConst.EVENT_GET_USER_BASE_INFO, simpleUser);
    }

    private _s2cOpBlackList(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_OP_BLACK_LIST, message);
    }

    private _s2cPractice(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_PRACTICE_PLAYER, message);
    }

    private _s2cGetUserDetailInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        var userDetail = message.user;
        G_SignalManager.dispatch(SignalConst.EVENT_GET_USER_DETAIL_INFO, userDetail);
    }

    public getOpenServerDayNum(resetTime?) {
        if (!resetTime) {
            resetTime = TimeConst.RESET_TIME_SECOND;
        }

        var openServerTime = this.getServer_open_time();
        var currTime = G_ServerTime.getTime();
        var openZeroTime = G_ServerTime.secondsFromZero(openServerTime, resetTime);
        var currZeroTime = G_ServerTime.secondsFromZero(currTime, resetTime);
        var day = Math.ceil((currZeroTime - openZeroTime) / (3600 * 24));
        day = day + 1;
        day = Math.max(day, 1);
        return day;
    }

    public getOpCountReHero() {
        return this.getOpCount(DataConst.USER_OP_TYPE_RE_HERO);
    }

    public getOpCountSiege() {
        return this.getOpCount(DataConst.USER_OP_TYPE_SIEGE);
    }

    public getOpCount(opType) {
        var obj = this._opCount['k' + opType];
        if (obj && obj > 0) {
            return obj;
        }
        return 0;
    }

    public isBindedWeChat() {
        return this._isBindedWeChat;
    }

    private _s2cGetWeChatBindInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var isBind = message.is_bind || 0;
        if (isBind == 1) {
            this._isBindedWeChat = true;
        } else if (isBind == 0) {
            this._isBindedWeChat = false;
        }
    }

    public c2sGetWeChatBindCode() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetWeChatBindCode, {});
    }

    private _s2cGetWeChatBindCode(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var bindCode = message.bind_code || '';
        this._bindCode = bindCode;
        G_SignalManager.dispatch(SignalConst.EVENT_GET_WECHAT_BIND_CODE);
    }

    public getBindCode() {
        return this._bindCode;
    }

    public c2sGetTotalOnlineTime() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetTotalOnlineTime, {});
    }

    public checkRealName() {
        return true;
        // TODO:
        // if (G_GameAgent.isRealName()) {
        //     return true;
        // }
        // if (G_TutorialManager.isDoingStep() || this.getLevel() <= 5) {
        //     return true;
        // }
        // var onlineTime = this.getOnlineTime();
        // var isAvoid = G_ConfigManager.isAvoidHooked();
        // var isRealName = G_ConfigManager.isRealName();
        // var avoidTime = G_ConfigManager.getAvoidOnlineTime();
        // if (isAvoid) {
        //     if (onlineTime == Math.ceil(avoidTime / 3)) {
        //         G_SignalManager.dispatch(SignalConst.EVENT_AVOID_NOTICE, 1);
        //     } else if (onlineTime == Math.ceil(avoidTime / 3 * 2)) {
        //         G_SignalManager.dispatch(SignalConst.EVENT_AVOID_NOTICE, 2);
        //     }
        // }
        // if (onlineTime < avoidTime) {
        //     return true;
        // }
        // if (isAvoid) {
        //     G_SignalManager.dispatch(SignalConst.EVENT_AVOID_GAME);
        // } else if (isRealName) {
        //     G_SignalManager.dispatch(SignalConst.EVENT_OPEN_REAL_NAME);
        // }
        return false;
    }

    private _s2cGetTotalOnlineTime(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setOnlineTime(message.total_online_time);
        this.checkRealName();
    }

    c2sUpOfficerLevel() {
        var message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_UpOfficerLevel, message);
    }

    isCanEnterReturnServer(serverData) {
        var serverId = serverData.getServer();
        var roleList = G_RoleListManager.getList();
        var haveRole = false;
        for (var i in roleList) {
            var v = roleList[i];
            if (v.getServer_id() == serverId) {
                haveRole = true;
            }
        }
        if (haveRole == false && G_GameAgent.isCanReturnServer() == false) {
            return false;
        }
        return true;
    }
    getReturnAward() {
        var vipMax = 0;
        var goldMax = 0;
        if (this._returnSvr) {
            vipMax = this._returnSvr.getVip_max();
            goldMax = this._returnSvr.getGold_max();
        } else {
            vipMax = this.getVip_max();
            goldMax = this.getVip_max();
        }
        return [
            vipMax,
            goldMax
        ];
    }
    getReturnVipLevel() {
        var vipLevel = 0;
        if (this._returnSvr) {
            vipLevel = this._returnSvr.getVip_level();
        } else {
            vipLevel = this.getVip_level();
        }
        return vipLevel;
    }


    _s2cGetReturnSvr(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var rs = message['rs'];
        if (this._returnSvr == null) {
            this._returnSvr = new ReturnSvrData();
        }
        this._returnSvr.updateData(rs);
    }
    getReturnSvr() {
        return this._returnSvr;
    }
    c2sCheckIn() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CheckIn, {});
    }
    _s2cCheckIn(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var rs = message['rs'];
        if (this._returnSvr == null) {
            this._returnSvr = new ReturnSvrData();
        }
        this._returnSvr.updateData(rs);
        G_SignalManager.dispatch(SignalConst.EVENT_RETURN_CHECK_IN_SUCCESS);
    }
    c2sRecvBonus(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_RecvBonus, { id: id });
    }
    _s2cRecvBonus(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var id = message['id'] || 0;
        var awards = message['awards'] || {};
        var rs = message['rs'];
        if (this._returnSvr == null) {
            this._returnSvr = new ReturnSvrData();
        }
        this._returnSvr.updateData(rs);
        G_SignalManager.dispatch(SignalConst.EVENT_RETURN_RECV_BONUS_SUCCESS, id, awards);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_RETURN_AWARD);
    }

}