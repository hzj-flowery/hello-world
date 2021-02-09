import { BaseData } from "./BaseData";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import { FunctionConst } from "../const/FunctionConst";
import { G_NetworkManager, G_ConfigLoader, G_ServerTime, G_ServiceManager, G_SignalManager, G_UserData, Colors } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { ArraySort } from "../utils/handler";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { SignalConst } from "../const/SignalConst";
import { AuctionConst } from "../const/AuctionConst";
import { RichTextHelper } from "../utils/RichTextHelper";
import { MessageErrorConst } from "../const/MessageErrorConst";

export interface WorldBossData {
    getBoss_id(): number
    setBoss_id(value: number): void
    getLastBoss_id(): number
    getStart_time(): number
    setStart_time(value: number): void
    getLastStart_time(): number
    getEnd_time(): number
    setEnd_time(value: number): void
    getFast_boss_end_time():number
    setFast_boss_end_time(value:number):void;
    getFastBossCnt():number
    setFastBossCnt(value:number):void
    getLastEnd_time(): number
    getUser_point(): number
    setUser_point(value: number): void
    getLastUser_point(): number
    getChallenge_boss_cnt(): number
    setChallenge_boss_cnt(value: number): void
    getLastChallenge_boss_cnt(): number
    getChallenge_boss_time(): number
    setChallenge_boss_time(value: number): void
    getLastChallenge_boss_time(): number
    getChallenge_user_cnt(): number
    setChallenge_user_cnt(value: number): void
    getLastChallenge_user_cnt(): number
    getChallenge_user_time(): number
    setChallenge_user_time(value: number): void
    getLastChallenge_user_time(): number
    getBechallenge_cnt(): number
    setBechallenge_cnt(value: number): void
    getLastBechallenge_cnt(): number
    getBechallenge_time(): number
    setBechallenge_time(value: number): void
    getLastBechallenge_time(): number
    getGuild_point(): number
    setGuild_point(value: number): void
    getLastGuild_point(): number
    getSelf_user_rank(): number
    setSelf_user_rank(value: number): void
    getLastSelf_user_rank(): number
    getSelf_guild_rank(): number
    setSelf_guild_rank(value: number): void
    getLastSelf_guild_rank(): number
    getEnd_notice(): Object
    setEnd_notice(value: Object): void
    getLastEnd_notice(): Object
    getUser_rank(): Object
    setUser_rank(value: Object): void
    getLastUser_rank(): Object
    getGuild_rank(): Object
    setGuild_rank(value: Object): void
    getLastGuild_rank(): Object
    getUsers(): Object
    setUsers(value: Object): void
    getLastUsers(): Object
    setVote_info(value:Array<any>):void
    getVote_info():Array<any>
}
let schema = {};
schema['boss_id'] = [
    'number',
    0
];
schema['start_time'] = [
    'number',
    0
];
schema["fast_boss_end_time"] = [
    'number',
    10
];
schema['end_time'] = [
    'number',
    0
];
schema['user_point'] = [
    'number',
    0
];
schema['fastBossCnt'] = [
    'number',
    0
];
schema['challenge_boss_cnt'] = [
    'number',
    0
];
schema['challenge_boss_time'] = [
    'number',
    0
];
schema['challenge_user_cnt'] = [
    'number',
    0
];
schema['challenge_user_time'] = [
    'number',
    0
];
schema['bechallenge_cnt'] = [
    'number',
    0
];
schema['bechallenge_time'] = [
    'number',
    0
];
schema['guild_point'] = [
    'number',
    0
];
schema['self_user_rank'] = [
    'number',
    0
];
schema['self_guild_rank'] = [
    'number',
    0
];
schema['end_notice'] = [
    'object',
    {}
];
schema['user_rank'] = [
    'object',
    {}
];
schema['guild_rank'] = [
    'object',
    {}
];
schema['users'] = [
    'object',
    {}
];
schema['vote_info'] = [
    'object',
    {}
];

export class WorldBossData extends BaseData {
    public static schema = schema;
    _noticeMsg;
    _msgWorldBossVote;
    _msgGetWorldBossVoteInfo;
    _msgEnterWorldBoss;
    _msgFastWorldBoss;
    _msgAttackWorldBoss;
    _msgGetWorldBossGrabList;
    _msgWorldBossNotice;
    _msgGrabWorldBossPoint;
    _msgGetWorldBossInfo;
    _msgUpdateWorldBossRank;

    public c2sEnterWorldBoss() {
        let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_WORLD_BOSS)[0];
        if (isOpen == false) {
            return;
        }
        let message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_EnterWorldBoss, message);
    }
    public c2sUpdateWorldBossRank() {
        let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_WORLD_BOSS)[0];
        if (isOpen == false) {
            return;
        }
        let message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_UpdateWorldBossRank, message);
    }
    //玩家报名
    public c2sWorldBossVote():void{
       G_NetworkManager.send(MessageIDConst.ID_C2S_WorldBossVote,{});
    }
    private _s2cWorldBossVote(id,message):void{
        if (message.ret != 1) {
            return;
        }
        //再一次刷新
        this.c2sGetWorldBossVoteInfo();
        G_SignalManager.dispatch(SignalConst.EVENT_WORLD_BOSS_VOTE_SUCCESS,{})//报名成功
    }
    //获取玩家报名信息
    public c2sGetWorldBossVoteInfo():void{
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetWorldBossVoteInfo,{});
    }
    private _s2cGetWorldBossVoteInfo(id,message):void{
        if (message.ret != 1) {
            return;
        }
        this.setVote_info(message["vote_info"]);
        G_SignalManager.dispatch(SignalConst.EVENT_GET_WORLD_BOSS_VOTE_INFO,{});
    }
    /**
     * 是否可以报名
     */
    public isCanVote():boolean{
        let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_WORLD_BOSS)[0];
        if (isOpen == false) {
            return false;
        }

        let startTime = G_UserData.getWorldBoss().getStart_time();
        let endTime = G_UserData.getWorldBoss().getEnd_time();
        let curTime = G_ServerTime.getTime();
        let config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        let configInfor12 = config.get(2020);
        let configInfor19 = config.get(2021);
        let p1 = configInfor12.content.split("|");
        let p2 = configInfor19.content.split("|");
        let time1 = [parseInt(p1[0]),parseInt(p1[1])];
        let time2 = [parseInt(p2[0]),parseInt(p2[1])];
        let s1 = G_ServerTime.secondsFromToday(curTime)/60/60;



        if(time1[0]<s1&&time1[1]>s1)
        {
            
            //处于第一阶段报名
            return !this.isHasVote();
        }
        else if(time2[0]<s1&&time2[1]>s1)
        {
            //处于第二阶段报名
            return !this.isHasVote();
        }

        return false;
    }
    public isHasVote():boolean{
        let userid = G_UserData.getBase().getId();
            let voteInfor:Array<any> = this.getVote_info();
            if(voteInfor&&voteInfor.length>0)
            {
                for(let j = 0;j<voteInfor.length;j++)
                {
                    if(voteInfor[j].ids.indexOf(userid)>=0)
                    {
                        //已经报名
                        return true;
                    }
                }
            }
            return false;
    }
    public getBossInfo() {
        let bossId = this.getBoss_id();
        if (bossId == null || bossId == 0) {
            console.assert(false, 'can not get boss info');
        }
        let bossInfo = G_ConfigLoader.getConfig(ConfigNameConst.BOSS_INFO).get(bossId);
        console.assert(bossInfo, 'boss_info cfg can not find boss by id ' + bossId);
        return bossInfo;
    }
    public _registerAlarmClock(startTime, endTime) {
        if (!startTime || !endTime) {
            return;
        }
        let curTime = G_ServerTime.getTime();
        if (curTime <= endTime) {
            G_ServiceManager.registerOneAlarmClock('WORLD_BOSS_GET_NEXT', endTime + 1, function () {
                let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_WORLD_BOSS)[0];
                if (isOpen) {
                    this.c2sEnterWorldBoss();
                }
            }.bind(this));
        }
    }
    public _updateWorldBossRank(message) {
        this.setUser_point(message.user_point);
        this.setGuild_point(message.guild_point);
        this.setSelf_user_rank(message.self_user_rank);
        this.setSelf_guild_rank(message.self_guild_rank);
        function convertUserRank(message) {
            let rankList = [];
            let userRankList = message['user_rank'] || [];
            for (let i in userRankList) {
                let value = userRankList[i];
                let temp: any = {};
                temp.userId = value.user_id;
                temp.rank = value.rank;
                temp.name = value.name;
                temp.point = value.point;
                temp.official = value.office_level;
                rankList.push(temp);
            }
            ArraySort(rankList, function (sort1, sort2) {
                return sort1.rank < sort2.rank;
            });
            return rankList;
        }
        function convertGuildRank(message) {
            let rankList = [];
            let guildRankList = message['guild_rank'] || [];
            for (let i in guildRankList) {
                let value = guildRankList[i];
                let temp: any = {};
                temp.guildId = value.guild_id;
                temp.rank = value.rank;
                temp.name = value.name;
                temp.point = value.point;
                temp.num = value.num;
                rankList.push(temp);
            }
            ArraySort(rankList, function (sort1, sort2) {
                return sort1.rank < sort2.rank;
            });
            return rankList;
        }
        this.setUser_rank(convertUserRank(message));
        this.setGuild_rank(convertGuildRank(message));
    }

    public c2sFastWorldBoss(){
       let message = {};
       G_NetworkManager.send(MessageIDConst.ID_C2S_FastWorldBoss,message);
    }
    /**
     * 
     * @param id 
     * @param message 
     * 
     * optional BattleReport report = 2;//战报
	optional uint32 point = 3;//获得积分
	optional uint64 hurt = 4;//造成伤害
     */
    public _s2cFastWorldBoss(id,message){
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WORLDBOSS_FAST_BOSS, message);
    }
    public _s2cEnterWorldBoss(id, message) {
        if (message.ret != 1) {
            return;
        }
        this.setBoss_id(message.boss_id);
        this.setStart_time(message.start_time);
        this.setEnd_time(message.end_time);
        this._registerAlarmClock(message.start_time, message.end_time);
        this.setChallenge_boss_cnt(message.challenge_boss_cnt);
        this.setChallenge_boss_time(message.challenge_boss_time);
        this.setChallenge_user_cnt(message.challenge_user_cnt);
        this.setChallenge_user_time(message.challenge_user_time);
        this.setBechallenge_cnt(message.bechallenge_cnt);
        this.setBechallenge_time(message.bechallenge_time);
        this.setFast_boss_end_time(message.fast_boss_end_time);
        this.setFastBossCnt(message.FastBossCnt);
        this._updateWorldBossRank(message);
        let endNotice = {};
        function converEndNotice(message) {
            let noticeList = [];
            let endNotice = message['end_notice'] || {};
            let endNoticeList = endNotice['sys_notice'] || {};
            for (let i in endNoticeList) {
                let value = endNoticeList[i];
                noticeList[value.key] = value.value;
            }
            return noticeList;
        }
        this.setEnd_notice(converEndNotice(message));
        let showUsers = {};
        function convertUsers(message) {
            let userList = [];
            let serverList = message['users'] || [];
            for (let i in serverList) {
                let value = serverList[i];
                let [converId, playerInfo]= UserDataHelper.convertAvatarId(value);
                let data: any = {};
                data.userId = value.user_id;
                data.name = value.name;
                data.officialLevel = value.officer_level;
                data.baseId = converId;
                data.playerInfo = playerInfo;
                data.index = i;
                data.titleId = value.title;
                userList.push(data);
            }
            return userList;
        }
        this.setUsers(convertUsers(message));
        G_SignalManager.dispatch(SignalConst.EVENT_WORLDBOSS_GET_INFO, message);
    }
    public getEndNoticeValue(key) {
        let noticeTable = this.getEnd_notice();
        cc.log(noticeTable);
        if (noticeTable) {
            return Number(noticeTable[key]);
        }
        return null;
    }
    public c2sAttackWorldBoss() {
        let message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_AttackWorldBoss, message);
    }
    public _s2cAttackWorldBoss(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WORLDBOSS_ATTACK_BOSS, message);
    }
    public _s2cWorldBossNotice(id, message) {
        let snType = message.sn_type;
        let noticePairs = message.content;
        let config = G_ConfigLoader.getConfig(ConfigNameConst.BOSS_CONTENT).get(snType);
        console.assert(config, 'boss_content config can not find id = %d');
        let source = config.text;
        let clientPairs = RichTextHelper.convertServerNoticePairs(noticePairs, function (data) {
            if (data.key == 'integral') {
                data.key_type = 2;
                data.key_value = 1;
            }
            return data;
        });
        cc.log(clientPairs);
        let text = RichTextHelper.convertRichTextByNoticePairs(source, clientPairs, 20, Colors.DARK_BG_TWO);
        cc.log(text);
        let textType = config.text_type;
        this._noticeMsg['k' + textType] = this._noticeMsg['k' + textType] || {};
        this._noticeMsg['k' + textType].push(text);
        let tableList = this._noticeMsg['k' + textType];
        if (tableList.length > 2) {
            this._noticeMsg['k' + textType].shift();
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WORLDBOSS_NOTICE, message);
    }
    public getNoticeMsg(type) {
        let msgList = this._noticeMsg['k' + type];
        return msgList || {};
    }
    public c2sGetWorldBossGrabList() {
        let message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetWorldBossGrabList, message);
    }
    public _s2cGetWorldBossGrabList(id, message) {
        if (message.ret != 1) {
            return;
        }
        function convertAvatarId(temp) {
            for (let i in temp.heroList) {
                let value = temp.heroList[i];
                temp.heroList[i] = [
                    value,
                    0
                ];
                if (value > 0 && value < 100 && temp.avatarId > 0) {
                    let [baseId, limit] = UserDataHelper.convertToBaseIdByAvatarBaseId(temp.avatarId);
                    temp.heroList[i] = [
                        baseId,
                        limit
                    ];
                }
            }
            return temp;
        }
        function convertGrabList(message) {
            let rankList = [];
            let grabList = message['list'] || {};
            for (let i in grabList) {
                let value = grabList[i];
                let temp: any = {};
                if (value.rank > 0) {
                    temp.userId = value.user_id;
                    temp.rank = value.rank;
                    temp.name = value.name;
                    temp.point = value.point;
                    temp.official = value.office_level;
                    temp.heroList = value['hero_base_id'] || {};
                    temp.guildName = value['guild_name'] || '';
                    temp.avatarId = value['avatar_base_id'] || 0;
                    temp = convertAvatarId(temp);
                    rankList.push(temp);
                }
            }
            ArraySort(rankList, function (sort1, sort2) {
                return sort1.rank < sort2.rank;
            });
            return rankList;
        }
        let grabList = convertGrabList(message);
        G_SignalManager.dispatch(SignalConst.EVENT_WORLDBOSS_GET_GRAB_LIST, grabList);
    }
    public c2sGrabWorldBossPoint(userId) {
        let message = { user_id: userId };
        G_NetworkManager.send(MessageIDConst.ID_C2S_GrabWorldBossPoint, message);
    }
    public _s2cGrabWorldBossPoint(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WORLDBOSS_GET_GRAB_POINT, message);
    }
    public _s2cUpdateWorldBossRank(id, message) {
        if (message.ret != 1) {
            return;
        }
        this._updateWorldBossRank(message);
        G_SignalManager.dispatch(SignalConst.EVENT_WORLDBOSS_UPDATE_RANK, message);
    }
    public _s2cGetWorldBossInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        this.setBoss_id(message.boss_id);
        this.setStart_time(message.start_time);
        this.setEnd_time(message.end_time);
        this.setFast_boss_end_time(message.fast_boss_end_time);
        this._registerAlarmClock(message.start_time, message.end_time);
    }
    constructor(properties?) {
        super(properties);
        this._noticeMsg = {};
        this._msgWorldBossVote = G_NetworkManager.add(MessageIDConst.ID_S2C_WorldBossVote,this._s2cWorldBossVote.bind(this));
        this._msgGetWorldBossVoteInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetWorldBossVoteInfo,this._s2cGetWorldBossVoteInfo.bind(this));
        this._msgEnterWorldBoss = G_NetworkManager.add(MessageIDConst.ID_S2C_EnterWorldBoss, this._s2cEnterWorldBoss.bind(this));
        this._msgFastWorldBoss = G_NetworkManager.add(MessageIDConst.ID_S2C_FastWorldBoss,this._s2cFastWorldBoss.bind(this));
        this._msgAttackWorldBoss = G_NetworkManager.add(MessageIDConst.ID_S2C_AttackWorldBoss, this._s2cAttackWorldBoss.bind(this));
        this._msgGetWorldBossGrabList = G_NetworkManager.add(MessageIDConst.ID_S2C_GetWorldBossGrabList, this._s2cGetWorldBossGrabList.bind(this));
        this._msgWorldBossNotice = G_NetworkManager.add(MessageIDConst.ID_S2C_WorldBossNotice, this._s2cWorldBossNotice.bind(this));
        this._msgGrabWorldBossPoint = G_NetworkManager.add(MessageIDConst.ID_S2C_GrabWorldBossPoint, this._s2cGrabWorldBossPoint.bind(this));
        this._msgGetWorldBossInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetWorldBossInfo, this._s2cGetWorldBossInfo.bind(this));
        this._msgUpdateWorldBossRank = G_NetworkManager.add(MessageIDConst.ID_S2C_SyncWorldBossRank, this._s2cUpdateWorldBossRank.bind(this));
    }
    public clear() {
        this._msgWorldBossVote.remove();
        this._msgWorldBossVote = null;
        this._msgGetWorldBossVoteInfo.remove();
        this._msgGetWorldBossVoteInfo = null;
        this._msgEnterWorldBoss.remove();
        this._msgEnterWorldBoss = null;
        this._msgAttackWorldBoss.remove();
        this._msgAttackWorldBoss = null;
        this._msgGetWorldBossGrabList.remove();
        this._msgGetWorldBossGrabList = null;
        this._msgWorldBossNotice.remove();
        this._msgWorldBossNotice = null;
        this._msgGrabWorldBossPoint.remove();
        this._msgGrabWorldBossPoint = null;
        this._msgGetWorldBossInfo.remove();
        this._msgGetWorldBossInfo = null;
        this._msgUpdateWorldBossRank.remove();
        this._msgUpdateWorldBossRank = null;
        this._msgFastWorldBoss.remove();
        this._msgFastWorldBoss = null;
    }
    public isBossStart(): [boolean, number] {
        let startTime = this.getStart_time();
        let endTime = this.getEnd_time();
        let currTime = G_ServerTime.getTime();
        if (currTime >= startTime && currTime <= endTime) {
            return [true, null];
        }
        return [
            false,
            startTime
        ];
    }
    public isAuctionEnd() {
        let [r] = this.isBossStart();
        if (r == false) {
            return;
        }
        let auctionCfg = G_ConfigLoader.getConfig(ConfigNameConst.AUCTION);
        let worldBossAuction = auctionCfg.get(AuctionConst.AC_TYPE_GUILD_ID);
        console.assert(worldBossAuction, 'app.config.auction can\'t find by id ' + AuctionConst.AC_TYPE_GUILD_ID);
        let endTime = this.getStart_time() + worldBossAuction.auction_open_time + worldBossAuction.auction_continued_time;
        let currTime = G_ServerTime.getTime();
        if (currTime >= endTime) {
            return true;
        }
        return false;
    }
    public needShopPromptDlg() {
        let endTime = this.getEnd_time();
        let currTime = G_ServerTime.getTime();
        let value = G_UserData.getUserConfig().getConfigValue('bossEndTime') || 0;
        cc.log(value);
        let oldEndTime = Number(value);
        let [isCurrOpen] = this.isBossStart();
        if (isCurrOpen == true) {
            this._saveCurrTime();
            cc.warn(' WorldBossData:needShopPromptDlg is open  ret false');
            return false;
        }
        if (oldEndTime == 0) {
            this._saveCurrTime();
            cc.warn(' WorldBossData:needShopPromptDlg  oldEndTime = 0 ret true');
            return true;
        }
        if (oldEndTime < endTime) {
            this._saveCurrTime();
            cc.warn(' WorldBossData:needShopPromptDlg  oldEndTime < endTime ret true');
            return true;
        }
        cc.log(oldEndTime);
        cc.log(endTime);
        return false;
    }
    public _saveCurrTime() {
        let endTime = this.getEnd_time();
        let value = G_UserData.getUserConfig().getConfigValue('bossEndTime') || 0;
        let oldEndTime = Number(value);
        if (oldEndTime < endTime) {
            G_UserData.getUserConfig().setConfigValue('bossEndTime', endTime);
        }
    }
    public reset() {
    }
}
