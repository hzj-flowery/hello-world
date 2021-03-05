import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import GuildServerAnswerAvatar from "../scene/view/guildServerAnswer/GuildServerAnswerAvatar";
import { ArraySort } from "../utils/handler";
import { GuildDungeonRecordData } from "./GuildDungeonRecordData";
import { GuildDungeonRankData } from "./GuildDungeonRankData";
import { GuildDungeonInfoData } from "./GuildDungeonInfoData";

export interface GuildDungeonData {
    isSynRecordData(): boolean
    setSynRecordData(value: boolean): void
    isLastSynRecordData(): boolean
}
let schema = {};
schema['synRecordData'] = [
    'boolean',
    false
];
export class GuildDungeonData extends BaseData {
    public static schema = schema;

        _dungeonInfoDataList;
        _dungeonRankDataList;
        _dungeonRecordDataList: GuildDungeonRecordData[];
        _dungeonRecordDataListByRank;
        _dungeonRecordDataListByPlayerId;
        _myGuildRankData: GuildDungeonRankData;
        _s2cGetGuildDungeonListener;
        _s2cGuildDungeonBattleListener;
        _s2cGuildSourceRewardListener;
        _s2cGetGuildDungeonRecordListener;
        _s2cGuildDungeonRecordRespondListener;

    constructor(properties?) {
        super(properties);
        this._dungeonInfoDataList = {};
        this._dungeonRankDataList = {};
        this._dungeonRecordDataList = [];
        this._dungeonRecordDataListByRank = {};
        this._dungeonRecordDataListByPlayerId = {};
        this._myGuildRankData = null;
        this._s2cGetGuildDungeonListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildDungeon, this._s2cGetGuildDungeon.bind(this));
        this._s2cGuildDungeonBattleListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildDungeonBattle, this._s2cGuildDungeonBattle.bind(this));
        this._s2cGuildSourceRewardListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildSourceReward, this._s2cGuildSourceReward.bind(this));
        this._s2cGetGuildDungeonRecordListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildDungeonRecord, this._s2cGetGuildDungeonRecord.bind(this));
        this._s2cGuildDungeonRecordRespondListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildDungeonRecordRespond, this._s2cGuildDungeonRecordRespond.bind(this));
    }
    public clear() {
        this._s2cGetGuildDungeonListener.remove();
        this._s2cGetGuildDungeonListener = null;
        this._s2cGuildDungeonBattleListener.remove();
        this._s2cGuildDungeonBattleListener = null;
        this._s2cGuildSourceRewardListener.remove();
        this._s2cGuildSourceRewardListener = null;
        this._s2cGetGuildDungeonRecordListener.remove();
        this._s2cGetGuildDungeonRecordListener = null;
        this._s2cGuildDungeonRecordRespondListener.remove();
        this._s2cGuildDungeonRecordRespondListener = null;
    }
    public reset() {
        this._dungeonInfoDataList = {};
        this._dungeonRankDataList = {};
        this._dungeonRecordDataList = [];
        this._dungeonRecordDataListByRank = {};
        this._dungeonRecordDataListByPlayerId = {};
        this._myGuildRankData = null;
    }
    public c2sGetGuildDungeon() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildDungeon, {});
    }
    public c2sGuildDungeonBattle(uid) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildDungeonBattle, { uid: uid });
    }
    public c2sGuildSourceReward(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildSourceReward, { id: id });
    }
    public c2sGetGuildDungeonRecord() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildDungeonRecord, {});
    }
    public _s2cGetGuildDungeon(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.resetTime();
        if (message.is_begin) {
            this._dungeonInfoDataList = {};
        }
        let dungeons = message['dungeons'] || {};
        for (let k in dungeons) {
            let v = dungeons[k];
            this._createDungeonInfoData(v);
        }
        if (message.is_end) {
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET);
        }
    }
    public _s2cGuildDungeonBattle(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_DUNGEON_CHALLENGE, message);
    }
    public _s2cGuildSourceReward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
    }
    public _s2cGetGuildDungeonRecord(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let members = message['members'] || {};
        G_UserData.getGuild().updateMemberList(members);
        this._dungeonRecordDataList = [];
        let dungeonRecord = message['dungeon_record'] || {};
        for (let k in dungeonRecord) {
            let v = dungeonRecord[k];
            this._createDungeonRecordData(v);
        }
        this._updateRecordData();
        this._dungeonRankDataList = {};
        let guildDungeonRank = message['guild_dungeon_rank'] || {};
        for (let k in guildDungeonRank) {
            let v = guildDungeonRank[k];
            this._createDungeonRankData(v);
        }
        this._myGuildRankData = this._createMyGuildRankData(message);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_GET_MEMBER_LIST);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN);
    }
    public _s2cGuildDungeonRecordRespond(id, message) {
        if (!this.isSynRecordData()) {
            return;
        }
        let member = message['members'];
        if (member) {
            G_UserData.getGuild().updateGuildMemberData(member);
        }
        let dungeonRecord = message['dungeon_record'];
        if (dungeonRecord) {
            this._createDungeonRecordData(dungeonRecord);
        }
        this._updateRecordData();
        this._dungeonRankDataList = {};
        let guildDungeonRank = message['guild_dungeon_rank'] || {};
        for (let k in guildDungeonRank) {
            let v = guildDungeonRank[k];
            this._createDungeonRankData(v);
        }
        if (message.hasOwnProperty('self_rank')) {
            this._myGuildRankData = this._createMyGuildRankData(message);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_GET_MEMBER_LIST);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN);
    }
    public _updateRecordData() {
        ArraySort(this._dungeonRecordDataList, this._sortRecordDataList.bind(this));
        this._dungeonRecordDataListByRank = {};
        this._dungeonRecordDataListByPlayerId = {};
        for (let k in this._dungeonRecordDataList) {
            let v = this._dungeonRecordDataList[k];
            if (!this._dungeonRecordDataListByRank[v.getTarget_rank()]) {
                this._dungeonRecordDataListByRank[v.getTarget_rank()] = [];
            }
            if (!this._dungeonRecordDataListByPlayerId[v.getPlayer_id()]) {
                this._dungeonRecordDataListByPlayerId[v.getPlayer_id()] = [];
            }
            this._dungeonRecordDataListByRank[v.getTarget_rank()].push(v);
            this._dungeonRecordDataListByPlayerId[v.getPlayer_id()].push(v);
        }
    }
    public _createDungeonInfoData(msg) {
        let data = new GuildDungeonInfoData();
        data.initData(msg);
        this._dungeonInfoDataList[msg.rank] = data;
    }
    public _createDungeonRankData(msg) {
        let data = new GuildDungeonRankData();
        data.initData(msg);
        this._dungeonRankDataList[msg.rank] = data;
    }
    public _createDungeonRecordData(msg) {
        let data = new GuildDungeonRecordData();
        data.initData(msg);
        this._dungeonRecordDataList.push(data);
    }
    public _createMyGuildRankData(message) {
        let data = new GuildDungeonRankData();
        data.setRank(message.self_rank);
        data.setNum(message.self_player_num);
        data.setPoint(message.self_guild_point);
        return data;
    }
    public _sortRecordDataList(obj1, obj2) {
        if (obj1.getTime() != obj2.getTime()) {
            return obj1.getTime() < obj2.getTime();
        }
        if (obj1.getTarget_rank() != obj2.getTarget_rank()) {
            return obj1.getTarget_rank() < obj2.getTarget_rank();
        }
        return obj1.getPlayer_id() < obj2.getPlayer_id();
    }
    public getDungeonInfoDataList() {
        return this._dungeonInfoDataList;
    }
    public getDungeonRankDataList() {
        return this._dungeonRankDataList;
    }
    public getDungeonRecordDataList() {
        return this._dungeonRecordDataList;
    }
    public getMyGuildRankData() {
        return this._myGuildRankData;
    }
    public getDungeonRecordDataByRank(rank) {
        return this._dungeonRecordDataListByRank[rank] || {};
    }
    public getDungeonRecordDataByPlayerId(playerId) {
        return this._dungeonRecordDataListByPlayerId[playerId] || {};
    }
    public getDungeonInfoDataByRank(rank) {
        return this._dungeonInfoDataList[rank];
    }
    public pullData() {
        G_UserData.getGuild().pullData();
        this.c2sGetGuildDungeonRecord();
        this.c2sGetGuildDungeon();
    }
    public saveAutionDlgTime(endTime) {
        let value = G_UserData.getUserConfig().getConfigValue('guild_dungeon_aution_end_time') || 0;
        let oldEndTime = Number(value);
        if (oldEndTime < endTime) {
            G_UserData.getUserConfig().setConfigValue('guild_dungeon_aution_end_time', endTime);
        }
    }
    public getAutionDlgTime() {
        let value = G_UserData.getUserConfig().getConfigValue('guild_dungeon_aution_end_time') || 0;
        cc.log(value);
        let oldEndTime = Number(value);
        return oldEndTime;
    }
}
