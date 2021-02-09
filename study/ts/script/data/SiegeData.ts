import { BaseData } from "./BaseData";
import { G_NetworkManager, G_UserData, G_ConfigLoader, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { Slot } from "../utils/event/Slot";
import { ArraySort } from "../utils/handler";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { SignalConst } from "../const/SignalConst";
import { FunctionConst } from "../const/FunctionConst";
import { SiegeBaseData } from "./SiegeBaseData";

export interface SiegeData {
    getTotal_hurt(): number
    setTotal_hurt(value: number): void
    getLastTotal_hurt(): number
    getHurtRewardIds(): any[]
    setHurtRewardIds(value: any[]): void
    getLastHurtRewardIds(): any[]
    getCountRewardIds(): any[]
    setCountRewardIds(value: any[]): void
    getLastCountRewardIds(): any[]
    getUserLevel(): number
    setUserLevel(value: number): void
    getLastUserLevel(): number
    getUserRank(): number
    setUserRank(value: number): void
    getLastUserRank(): number
    getUserGuildRank(): number
    setUserGuildRank(value: number): void
    getLastUserGuildRank(): number
    getSiegeEnemys(): any[]
    setSiegeEnemys(value: any[]): void
    getLastSiegeEnemys(): any[]
    isHasEnemy(): boolean
    setHasEnemy(value: boolean): void
    isLastHasEnemy(): boolean
}



let schema = {};
schema['total_hurt'] = [
    'number',
    0
];
schema['hurtRewardIds'] = [
    'object',
    {}
];
schema['countRewardIds'] = [
    'object',
    []
];
schema['userLevel'] = [
    'number',
    0
];
schema['userRank'] = [
    'number',
    0
];
schema['userGuildRank'] = [
    'number',
    0
];
schema['siegeEnemys'] = [
    'object',
    []
];
schema['hasEnemy'] = [
    'boolean',
    false
];
export class SiegeData extends BaseData {
    public static REWARD_TYPE_DAMAGE = 1;
    public static REWARD_TYPE_COUNT = 2;
    public static schema = schema;
    public _listenerSiegeData: Slot;
    public _listenerShare: Slot;
    public _listenerBoxReward: Slot;
    public _listenerBattle: Slot;
    public _listenerHurtReward: Slot;
    public _listenerAllShare: Slot;
    public _listenerAllTake: Slot;
    public _isClean: boolean;

    constructor(properties?) {
        super(properties);
        this._listenerSiegeData = G_NetworkManager.add(MessageIDConst.ID_S2C_GetRebelArmy, this._s2cGetRebelArmy.bind(this));
        this._listenerShare = G_NetworkManager.add(MessageIDConst.ID_S2C_RebArmyPublic, this._s2cRebArmyPublic.bind(this));
        this._listenerBoxReward = G_NetworkManager.add(MessageIDConst.ID_S2C_RebArmyKillReward, this._s2cRebArmyKillReward.bind(this));
        this._listenerBattle = G_NetworkManager.add(MessageIDConst.ID_S2C_RebelArmyBattle, this._s2cRebelArmyBattle.bind(this));
        this._listenerHurtReward = G_NetworkManager.add(MessageIDConst.ID_S2C_RebArmyHurtReward, this._s2cRebArmyHurtReward.bind(this));
        this._listenerAllShare = G_NetworkManager.add(MessageIDConst.ID_S2C_RebArmyPublicMulti, this._s2cRebArmyPublicMulti.bind(this));
        this._listenerAllTake = G_NetworkManager.add(MessageIDConst.ID_S2C_RebArmyKillRewardMulti, this._s2cRebArmyKillRewardMulti.bind(this));
        this._isClean = false;
    }
    public clear() {
        this._listenerSiegeData.remove();
        this._listenerSiegeData = null;
        this._listenerShare.remove();
        this._listenerShare = null;
        this._listenerBoxReward.remove();
        this._listenerBoxReward = null;
        this._listenerHurtReward.remove();
        this._listenerHurtReward = null;
        this._listenerBattle.remove();
        this._listenerBattle = null;
        this._listenerAllShare.remove();
        this._listenerAllShare = null;
        this._listenerAllTake.remove();
        this._listenerAllTake = null;
    }
    public reset() {
        this._isClean = false;
    }
    public refreshRebelArmy(isForce = false) {
        this.c2sGetRebelArmy();
        this._isClean = isForce;
    }
    public _sortEnemys(enemyList) {
        let sortedList = [];
        let guildList = [];
        let myId = G_UserData.getBase().getId();
        for (let i in enemyList) {
            let v = enemyList[i];
            if (v.getUid() == myId) {
                sortedList.push(v);
            } else {
                guildList.push(v);
            }
        }

        let RebelBase = G_ConfigLoader.getConfig(ConfigNameConst.REBEL_BASE);
        function sortFunc(a, b) {
            let aConfigData = RebelBase.get(a.getId());
            let bConfigData = RebelBase.get(b.getId());
            if (aConfigData.color == bConfigData.color) {
                let aEndTime = a.getEnd_time();
                let bEndTime = b.getEnd_time();
                return aEndTime < bEndTime;
            } else {
                return aConfigData.color > bConfigData.color;
            }
        }
        ArraySort(sortedList, sortFunc);
        ArraySort(guildList, sortFunc);
        for (let i = 0; i < guildList.length; i++) {
            sortedList[sortedList.length] = guildList[i];
        }
        return sortedList;
    }
    public _updateSiegeEnemys(message) {
        let oldEnemys: any[] = this.getSiegeEnemys();
        if (this._isClean) {
            oldEnemys = [];
            this._isClean = false;
        }
        function makeKey(enemy) {
            return '%s_%s'.format(enemy.getUid(), enemy.getId());
        }
        if (message.hasOwnProperty('army_info')) {
            let sieges = {};

            for (let i in message.army_info) {
                let v = message.army_info[i];

                let siegeBaseData = new SiegeBaseData(v);
                let key = makeKey(siegeBaseData);
                sieges[key] = siegeBaseData;
            }
            for (let k in oldEnemys) {
                let v = oldEnemys[k];
                let key = makeKey(v);
                let newData = sieges[key];
                if (newData) {
                    oldEnemys[k] = newData;
                }
                sieges[key] = null;
            }
            let newEnemys: any[] = [];
            for (let k in sieges) {
                let v = sieges[k];
                if (v != null) {
                    newEnemys.push(v);
                }
            }
            newEnemys = this._sortEnemys(newEnemys);
            for (let k in newEnemys) {
                let v = newEnemys[k];
                oldEnemys.push(v);
            }
            this.setSiegeEnemys(oldEnemys);
            this.setHasEnemy(true);
        } else {
            for (let k in oldEnemys) {
                let v = oldEnemys[k];
                v.setNotExist(true);
            }
            this.setSiegeEnemys(oldEnemys);
            this.setHasEnemy(false);
        }
    }
    public c2sGetRebelArmy() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetRebelArmy, {});
    }
    public _s2cGetRebelArmy(id, message) {
        let ret = message.ret;
        if (ret == 1) {
            this.resetTime();
            let army_user = message.army_user || {};
            this.setTotal_hurt(army_user.total_hurt || 0);
            this.setUserLevel(army_user.user_level || 0);
            this.setUserRank(army_user.self_rank || 0);
            this.setUserGuildRank(army_user.self_guild_rank || 0);
            this.setHurtRewardIds([]);
            if (army_user.hasOwnProperty('hurt_reward')) {
                let ids = [];
                for (let i in message.army_user.hurt_reward) {
                    let v = message.army_user.hurt_reward[i];
                    let id = v;
                    ids.push(id);
                }
                this.setHurtRewardIds(ids);
            }
            this.setCountRewardIds([]);
            if (army_user.hasOwnProperty('cnt_reward')) {
                let ids = [];
                for (let i in message.army_user.cnt_reward) {
                    let v = message.army_user.cnt_reward[i];
                    let id = v;
                    ids.push(id);
                }
                this.setCountRewardIds(ids);
            }
            this._updateSiegeEnemys(message);
            G_SignalManager.dispatch(SignalConst.EVENT_REBEL_ARMY);
        }
    }
    public getSiegeEnemyData(finderId, bossId) {
        let enemyList = this.getSiegeEnemys();
        for (let i in enemyList) {
            let v = enemyList[i];
            if (v.getUid() == finderId && v.getId() == bossId) {
                return v;
            }
        }
        return null;
    }
    public updateEnemyData(data) {
        let siegeData = this.getSiegeEnemyData(data.uid, data.id);
        siegeData.updateData(data);
    }
    public updateData(data) {
    }
    public getRewardCount() {
        let ids = this.getHurtRewardIds();
        return ids.length;
    }
    public isHurtRewardGet(index) {
        let rewards = this.getHurtRewardIds();
        for (let i in rewards) {
            let v = rewards[i];
            if (v == index) {
                return true;
            }
        }
        return false;
    }
    public isCountRewardGet(index) {
        let countRewards = this.getCountRewardIds();
        for (let i in countRewards) {
            let v = countRewards[i];
            if (v == index) {
                return true;
            }
        }
        return false;
    }
    public getMyEnemyById(id) {
        let enemys = this.getSiegeEnemys();
        for (let i in enemys) {
            let v = enemys[i];
            if (v.getId() == id && v.getUid() == G_UserData.getBase().getId()) {
                return v;
            }
        }
    }
    public getDataById(id) {
        let enemys = this.getSiegeEnemys();
        for (let i in enemys) {
            let v = enemys[i];
            if (v.getId() == id) {
                return v;
            }
        }
    }
    public c2sRebArmyPublic(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_RebArmyPublic, { boss_id: id });
    }
    public _s2cRebArmyPublic(id, message) {
        if (message.ret != 1) {
            this.refreshRebelArmy();
            return;
        }
        let siegeData = this.getDataById(message.boss_id);
        siegeData.setPublic(true);
        G_SignalManager.dispatch(SignalConst.EVENT_SIEGE_SHARE);
    }
    public c2sRebArmyPublicMulti() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_RebArmyPublicMulti, {});
    }
    public _s2cRebArmyPublicMulti(id, message) {
        if (message.ret != 1) {
            this.refreshRebelArmy();
            return;
        }
        if (message.hasOwnProperty('boss_id')) {
            for (let k in message.boss_id) {
                let v = message.boss_id[k];
                let siegeData = this.getDataById(v);
                siegeData.setPublic(true);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SIEGE_SHARE);
    }
    public isThereArmyCanShare() {
        let enemyList = G_UserData.getSiegeData().getSiegeEnemys();
        for (let k in enemyList) {
            let v = enemyList[k];
            let siegeBaseData = this.getSiegeEnemyData(v.getUid(), v.getId());
            if (!siegeBaseData.isPublic() && !siegeBaseData.isNotExist() && siegeBaseData.getKiller_id() == 0) {
                return true;
            }
        }
        return false;
    }
    public c2sRebArmyKillReward(finderId, armyId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_RebArmyKillReward, {
            uid: finderId,
            boss_id: armyId
        });
    }
    public _s2cRebArmyKillReward(id, message) {
        if (message.ret != 1) {
            return;
        }
        let rewards = [];
        if (message.hasOwnProperty('reward')) {
            for (let _ in message.reward) {
                let v = message.reward[_];
                let reward = {
                    type: v.type,
                    value: v.value,
                    size: v.size
                };
                rewards.push(reward);
            }
        }
        if (message.hasOwnProperty('boss_id') && message.hasOwnProperty('user_id')) {
            let siegeBaseData = this.getSiegeEnemyData(message.user_id, message.boss_id);
            siegeBaseData.setBoxEmpty(true);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SIEGE_BOX_REWARD, rewards);
    }
    public c2sRebArmyKillRewardMulti() {
        let finderIds = [];
        let enemyList = G_UserData.getSiegeData().getSiegeEnemys();
        for (let k in enemyList) {
            let v = enemyList[k];
            let siegeBaseData = this.getSiegeEnemyData(v.getUid(), v.getId());
            if (!siegeBaseData.isNotExist() && siegeBaseData.getKiller_id() != 0 && !siegeBaseData.isBoxEmpty()) {
                let finderId = siegeBaseData.getUid();
                finderIds.push(finderId);
            }
        }
        if (finderIds.length != 0) {
            G_NetworkManager.send(MessageIDConst.ID_C2S_RebArmyKillRewardMulti, { uids: finderIds });
        }
    }
    public _s2cRebArmyKillRewardMulti(id, message) {
        if (message.ret != 1) {
            return;
        }
        let rewards = [];
        if (message.hasOwnProperty('reward')) {
            for (let _ in message.reward) {
                let v = message.reward[_];
                let reward = {
                    type: v.type,
                    value: v.value,
                    size: v.size
                };
                rewards.push(reward);
            }
        }
        if (message.hasOwnProperty('boss_id')) {
            let enemyList = this.getSiegeEnemys();
            for (let k in enemyList) {
                let v = enemyList[k];
                for (let i = 0; i < message.boss_id.length; i++) {
                    if (v.getId() == message.boss_id[i]) {
                        v.setBoxEmpty(true);
                    }
                }
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SIEGE_BOX_REWARD, rewards);
    }
    public c2sRebelArmyBattle(finderId, bossId, type) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_RebelArmyBattle, {
            uid: finderId,
            boss_id: bossId,
            battle_type: type
        });
    }
    public _s2cRebelArmyBattle(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('army')) {
            this.updateEnemyData(message.army);
        }
        this.setTotal_hurt(message.total_hurt);
        this.setUserRank(message.user_end_rank);
        this.setUserGuildRank(message.guild_end_rank);
        G_SignalManager.dispatch(SignalConst.EVENT_SIEGE_BATTLE, message);
    }
    public c2sRebArmyHurtReward(rewardId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_RebArmyHurtReward, { reward_id: rewardId });
    }
    public _s2cRebArmyHurtReward(id, message) {
        if (message.ret != 1) {
            return;
        }
        let rewards = [];
        for (let _ in message.reward) {
            let v = message.reward[_];
            let reward = {
                type: v.type,
                value: v.value,
                size: v.size
            };
            rewards.push(reward);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SIEGE_HURT_REWARD, rewards);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_SIEGE);
    }
    public hasRedPoint() {
        let value1 = this.canGetRewards();
        let value2 = !this.isTakedAllAwards();
        return value1 || value2;
    }
    public isTakedAllAwards() {
        let enemyList = this.getSiegeEnemys();
        for (let i in enemyList) {
            let v = enemyList[i];
            let siegeBaseData = this.getSiegeEnemyData(v.getUid(), v.getId());
            if (!siegeBaseData.isBoxEmpty()) {
                return false;
            }
        }
        return true;
    }
    public haveNotTakedAward() {
        let enemyList = this.getSiegeEnemys();
        for (let i in enemyList) {
            let v = enemyList[i];
            let siegeBaseData = this.getSiegeEnemyData(v.getUid(), v.getId());
            if (!siegeBaseData.isNotExist() && siegeBaseData.getKiller_id() != 0 && !siegeBaseData.isBoxEmpty()) {
                return true;
            }
        }
        return false;
    }
    public canGetRewards() {
        let totalDamage = this.getTotal_hurt();
        let rewardList01 = this._getRewardList(SiegeData.REWARD_TYPE_DAMAGE);
        let rewardList02 = this._getRewardList(SiegeData.REWARD_TYPE_COUNT);
        let isCanGetRewards = false;
        for (let k in rewardList01) {
            let v = rewardList01[k];
            if (totalDamage >= v.target_size * 10000) {
                if (!this.isHurtRewardGet(v.id)) {
                    isCanGetRewards = true;
                    break;
                }
            }
        }
        if (isCanGetRewards) {
            return isCanGetRewards;
        }
        for (let k in rewardList02) {
            let v = rewardList02[k];
            if (this.getRewardCount() >= v.target_size) {
                if (!this.isCountRewardGet(v.id)) {
                    isCanGetRewards = true;
                    break;
                }
            }
        }
        return isCanGetRewards;
    }
    public _getRewardList(type) {
        let level = this.getUserLevel();
        let RebelDmgReward = G_ConfigLoader.getConfig(ConfigNameConst.REBEL_DMG_REWARD);
        let totalCount = RebelDmgReward.length();
        let rewardList = [];
        for (let i = 0; i < totalCount; i++) {
            let data = RebelDmgReward.indexOf(i);
            if (level >= data.lv_min && level <= data.lv_max && data.type == type) {
                rewardList.push(data);
            }
        }
        return rewardList;
    }
}
