import { assert } from "../../utils/GlobleFunc";
import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import BuffManager from "../BuffManager";
import { FightSignalManager } from "../FightSignalManager";
import { handler } from "../../utils/handler";
import { FightSignalConst } from "../FightSignConst";

export class HistoryBuff {
    _heroData: any;
    _heroId: any;
    _stageId: any;
    _camp: any;
    _buffData: {};
    _listenerSignal: any;
    _callback: any;
    constructor(data) {
        this._heroData = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO_STEP).get(data.id, data.rank);
        this._heroId = data.id;
        assert(this._heroData, 'history hero id or step is wrong id = ' + (data.id + (' step = ' + data.rank)));
        this._stageId = data.stageId;
        this._camp = Math.floor(this._stageId / 100);
        this._createBuff();
    }
    _createBuff() {
        this._buffData = {};
    }
    getCamp() {
        return this._camp;
    }
    getBuffTime() {
        return this._heroData.skill_front;
    }
    getStageId() {
        return this._stageId;
    }
    playBuff(callback) {
        var skillInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(this._heroData.skill_id);
        assert(skillInfo, 'wrong skill id ' + (this._heroData.skill_id));
        var skillId = skillInfo.skill_show_id;
        var unit = BuffManager.getBuffManager().engine.getUnitById(this._stageId);
        if (unit) {
            unit.playHistoryShow(this._heroId, skillId);
        }
        var fightSignalManager = FightSignalManager.getFightSignalManager();
        this._listenerSignal = fightSignalManager.addListenerHandler(handler(this, this._onSignalEvent));
        this._callback = callback;
    }
    _onSignalEvent(event, stageId) {
        if (event == FightSignalConst.SIGNAL_HISTORY_BUFF && this._stageId == stageId) {
            var unit = BuffManager.getBuffManager().engine.getUnitById(this._stageId);
            if (unit) {
                unit.buffPlay(this._heroData.skill_effectid);
                var buffConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(this._heroData.skill_effectid);
                assert(buffConfig, 'wrong buff id = ' + this._heroData.skill_effectid);
                unit.playOnceBuff(null, buffConfig);
            }
        } else if (event == FightSignalConst.SIGNAL_HISTORY_SHOW_END && this._stageId == stageId) {
            if (this._callback) {
                this._callback();
            }
        }
    }
    clear() {
        this._listenerSignal.remove();
        this._listenerSignal = null;
    }
}