import { BaseData } from './BaseData';
import { Slot } from '../utils/event/Slot';
import { G_NetworkManager, G_SignalManager } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { SignalConst } from '../const/SignalConst';
import { CountryBossVoteUnitData } from './CountryBossVoteUnitData';
import { CountryBossInterceptUnitData } from './CountryBossInterceptUnitData';
import { CountryBossUnitData } from './CountryBossUnitData';
import { UserDataHelper } from '../utils/data/UserDataHelper';
import { FunctionConst } from '../const/FunctionConst';

let schema = {};
schema['challenge_boss_time1'] = [
    'number',
    0
];

schema['challenge_boss_time2'] = [
    'number',
    0
];

schema['challenge_boss_user'] = [
    'number',
    0
];

schema['self_vote'] = [
    'number',
    0
];

schema['final_vote'] = [
    'number',
    0
];

schema['ahead_time1'] = [
    'number',
    0
];

schema['ahead_time3'] = [
    'number',
    0
];

export interface CountryBossData {
    getChallenge_boss_time1(): number
    setChallenge_boss_time1(value: number): void
    getLastChallenge_boss_time1(): number
    getChallenge_boss_time2(): number
    setChallenge_boss_time2(value: number): void
    getLastChallenge_boss_time2(): number
    getChallenge_boss_user(): number
    setChallenge_boss_user(value: number): void
    getLastChallenge_boss_user(): number
    getSelf_vote(): number
    setSelf_vote(value: number): void
    getLastSelf_vote(): number
    getFinal_vote(): number
    setFinal_vote(value: number): void
    getLastFinal_vote(): number
    getAhead_time1(): number
    setAhead_time1(value: number): void
    getLastAhead_time1(): number
    getAhead_time3(): number
    setAhead_time3(value: number): void
    getLastAhead_time3(): number
}
export class CountryBossData extends BaseData {

    public static schema = schema;

    _signalRecvAttackCountryBoss: Slot;
    _signalRecvSyncCountryBossVote: Slot;
    _signalRecvInterceptCountryBossList: Slot;
    _signalRecvSyncCountryBossUser: Slot;
    _signalRecvCountryBossVote: Slot;
    _signalRecvSyncCountryBoss: Slot;
    _signalRecvEnterCountryBoss: Slot;
    _signalRecvInterceptCountryBossUser: Slot;
    _signalRecvGetMaxCountryBossList: Slot;
    _signalRecvSyncCountryBossTime: Slot;
    _bossDatas;
    _bossVotes;
    _interceptList;
    constructor(properties?) {
        super(properties)
        this._signalRecvAttackCountryBoss = G_NetworkManager.add(MessageIDConst.ID_S2C_AttackCountryBoss, this._s2cAttackCountryBoss.bind(this));
        this._signalRecvSyncCountryBossVote = G_NetworkManager.add(MessageIDConst.ID_S2C_SyncCountryBossVote, this._s2cSyncCountryBossVote.bind(this));
        this._signalRecvInterceptCountryBossList = G_NetworkManager.add(MessageIDConst.ID_S2C_InterceptCountryBossList, this._s2cInterceptCountryBossList.bind(this));
        this._signalRecvSyncCountryBossUser = G_NetworkManager.add(MessageIDConst.ID_S2C_SyncCountryBossUser, this._s2cSyncCountryBossUser.bind(this));
        this._signalRecvCountryBossVote = G_NetworkManager.add(MessageIDConst.ID_S2C_CountryBossVote, this._s2cCountryBossVote.bind(this));
        this._signalRecvSyncCountryBoss = G_NetworkManager.add(MessageIDConst.ID_S2C_SyncCountryBoss, this._s2cSyncCountryBoss.bind(this));
        this._signalRecvEnterCountryBoss = G_NetworkManager.add(MessageIDConst.ID_S2C_EnterCountryBoss, this._s2cEnterCountryBoss.bind(this));
        this._signalRecvInterceptCountryBossUser = G_NetworkManager.add(MessageIDConst.ID_S2C_InterceptCountryBossUser, this._s2cInterceptCountryBossUser.bind(this));
        this._signalRecvGetMaxCountryBossList = G_NetworkManager.add(MessageIDConst.ID_S2C_GetMaxCountryBossList, this._s2cGetMaxCountryBossList.bind(this));
        this._signalRecvSyncCountryBossTime = G_NetworkManager.add(MessageIDConst.ID_S2C_SyncCountryBossTime, this._s2cSyncCountryBossTime.bind(this));
        this._bossDatas = {};
        this._bossVotes = {};
        this._interceptList = null;
    }
    public clear() {
        this._signalRecvAttackCountryBoss.remove();
        this._signalRecvAttackCountryBoss = null;
        this._signalRecvSyncCountryBossVote.remove();
        this._signalRecvSyncCountryBossVote = null;
        this._signalRecvInterceptCountryBossList.remove();
        this._signalRecvInterceptCountryBossList = null;
        this._signalRecvSyncCountryBossUser.remove();
        this._signalRecvSyncCountryBossUser = null;
        this._signalRecvCountryBossVote.remove();
        this._signalRecvCountryBossVote = null;
        this._signalRecvSyncCountryBoss.remove();
        this._signalRecvSyncCountryBoss = null;
        this._signalRecvEnterCountryBoss.remove();
        this._signalRecvEnterCountryBoss = null;
        this._signalRecvInterceptCountryBossUser.remove();
        this._signalRecvInterceptCountryBossUser = null;
        this._signalRecvGetMaxCountryBossList.remove();
        this._signalRecvGetMaxCountryBossList = null;
        this._signalRecvSyncCountryBossTime.remove();
        this._signalRecvSyncCountryBossTime = null;
    }
    public reset() {
        this._bossDatas = {};
        this._bossVotes = {};
        this._interceptList = null;
    }
    public getBossDatas() {
        return this._bossDatas;
    }
    public getBossDataById(id) {
        return this._bossDatas[id];
    }
    public getBossVotes() {
        return this._bossVotes;
    }
    public getVoteById(id) {
        let voteData = this._bossVotes[id];
        if (voteData) {
            return voteData.getVote();
        }
        return 0;
    }
    public getInterceptList() {
        return this._interceptList;
    }
    public cleanInterceptList() {
        this._interceptList = null;
    }
    public c2sAttackCountryBoss(boss_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_AttackCountryBoss, { boss_id: boss_id });
    }
    public _s2cAttackCountryBoss(id, message) {
        if (message.ret == 8400) {
            this.c2sEnterCountryBoss();
            return;
        }
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let challenge_boss_time1 = message['challenge_boss_time1'];
        if (challenge_boss_time1) {
            this.setChallenge_boss_time1(challenge_boss_time1);
        }
        let challenge_boss_time2 = message['challenge_boss_time2'];
        if (challenge_boss_time2) {
            this.setChallenge_boss_time2(challenge_boss_time2);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ATTACK_COUNTRY_BOSS_SUCCESS, message);
    }
    public _s2cSyncCountryBossVote(id, message) {
        let boss_vote = message['boss_vote'];
        if (boss_vote) {
            let voteData = new CountryBossVoteUnitData();
            voteData.setProperties(boss_vote);
            this._bossVotes[voteData.getBoss_id()] = voteData;
        }
        let final_vote = message['final_vote'];
        if (final_vote) {
            this.setFinal_vote(final_vote);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SYNC_COUNTRY_BOSS_VOTE_SUCCESS);
    }
    public c2sInterceptCountryBossList(boss_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_InterceptCountryBossList, { boss_id: boss_id });
    }
    public _s2cInterceptCountryBossList(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let list = message['list'];
        if (list) {
            let datas = [];
            for (let k in list) {
                let v = list[k];
                let interceptData = new CountryBossInterceptUnitData();
                interceptData.setProperties(v);
                datas.push(interceptData);
            }
            this._interceptList = datas;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_INTERCEPT_COUNTRY_BOSS_LIST_SUCCESS);
    }
    public _s2cSyncCountryBossUser(id, message) {
        let challenge_boss_time2 = message['challenge_boss_time2'];
        if (challenge_boss_time2) {
            this.setChallenge_boss_time2(challenge_boss_time2);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SYNC_COUNTRY_BOSS_USER_SUCCESS);
    }
    public c2sCountryBossVote(boss_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CountryBossVote, { boss_id: boss_id });
    }
    public _s2cCountryBossVote(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setSelf_vote(message.boss_id);
        G_SignalManager.dispatch(SignalConst.EVENT_COUNTRY_BOSS_VOTE_SUCCESS);
    }
    public _s2cSyncCountryBoss(id, message) {
        let country_boss = message['country_boss'];
        if (country_boss) {
            for (let k in country_boss) {
                let v = country_boss[k];
                let bossData = new CountryBossUnitData();
                bossData.updateData(v);
                this._bossDatas[bossData.getBoss_id()] = bossData;
            }
        }
        let oldAhead_time1 = this.getAhead_time1();
        let oldAhead_time3 = this.getAhead_time3();
        let ahead_time1 = message['ahead_time1'];
        if (ahead_time1) {
            this.setAhead_time1(ahead_time1);
        }
        let ahead_time3 = message['ahead_time3'];
        if (ahead_time3) {
            this.setAhead_time3(ahead_time3);
        }
        if (this.getAhead_time1() != oldAhead_time1 || this.getAhead_time3() != oldAhead_time3) {
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_COUNTRY_BOSS);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SYNC_COUNTRY_BOSS_SUCCESS);
    }
    public c2sEnterCountryBoss() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EnterCountryBoss, {});
    }
    public _s2cEnterCountryBoss(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let oldAhead_time1 = this.getAhead_time1();
        let oldAhead_time3 = this.getAhead_time3();
        this.setProperties(message);
        if (this.getAhead_time1() != oldAhead_time1 || this.getAhead_time3() != oldAhead_time3) {
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_COUNTRY_BOSS);
        }
        this._bossDatas = {};
        let country_boss = message['country_boss'];
        if (country_boss) {
            for (let k in country_boss) {
                let v = country_boss[k];
                let bossData = new CountryBossUnitData();
                bossData.updateData(v);
                this._bossDatas[bossData.getBoss_id()] = bossData;
            }
        }
        let boss_vote = message['boss_vote'];
        if (boss_vote) {
            for (let k in boss_vote) {
                let v = boss_vote[k];
                let voteData = new CountryBossVoteUnitData();
                voteData.setProperties(v);
                this._bossVotes[voteData.getBoss_id()] = voteData;
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS);
    }
    public c2sInterceptCountryBossUser(user_id, boss_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_InterceptCountryBossUser, {
            user_id: user_id,
            boss_id: boss_id
        });
    }
    public _s2cInterceptCountryBossUser(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let challenge_boss_user = message['challenge_boss_user'];
        if (challenge_boss_user) {
            this.setChallenge_boss_user(challenge_boss_user);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_INTERCEPT_COUNTRY_BOSS_USER_SUCCESS, message);
    }
    public c2sGetMaxCountryBossList(boss_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetMaxCountryBossList, { boss_id: boss_id });
    }
    public _s2cGetMaxCountryBossList(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let users = message['users'];
        let userList = [];
        if (users) {
            for (let k in users) {
                let v = users[k];
                let data:any = {
                    userId: v.user_id,
                    name: v.name,
                    officialLevel: v.officer_level,
                };
                let [covertId, param] = UserDataHelper.convertAvatarId(v);
                data.baseId = covertId;
                data.limitLevel = param.limitLevel;
                data.titleId = v.title;
                userList.push(data);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GET_MAX_COUNTRY_BOSS_LIST_SUCCESS, userList);
    }
    public _s2cSyncCountryBossTime(id, message) {
        this.setProperties(message);
    }
}