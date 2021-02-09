import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { StageBaseData } from "./StageBaseData";
import { SignalConst } from "../const/SignalConst";
import { ChapterData } from "./ChapterData";
import ChapterConst from "../const/ChapterConst";
import { FunctionConst } from "../const/FunctionConst";
import ALDStatistics from "../utils/ALDStatistics";
import { rawget } from "../utils/GlobleFunc";

let schema = {};
schema['stages'] = [
    'object',
    {}
];
schema['nowFightStage'] = [
    'number',
    0
];

export interface StageData {
    getStages(): Object
    setStages(value: Object): void
    getLastStages(): Object
    getNowFightStage(): number
    setNowFightStage(value: number): void
    getLastNowFightStage(): number

}
export class StageData extends BaseData {
    public static schema = schema;

    private _rebel;
    private _recvFirstKill;
    private _recvNewFirstKill;
    private _listenerExecuteStage;
    private _listenerFastExecute;
    private _listenerReset;

    constructor() {
        super()

        this._createStageData();
        this._rebel = null;
        this._recvFirstKill = G_NetworkManager.add(MessageIDConst.ID_S2C_GetFirstKill, this._s2cGetFirstKill.bind(this));
        this._recvNewFirstKill = G_NetworkManager.add(MessageIDConst.ID_S2C_NewFirstKill, this._s2cNewFirstKill.bind(this));
        this._listenerExecuteStage = G_NetworkManager.add(MessageIDConst.ID_S2C_ExecuteStage, this._s2cExecuteStage.bind(this));
        this._listenerFastExecute = G_NetworkManager.add(MessageIDConst.ID_S2C_FastExecuteStage, this._s2cFastExecuteStage.bind(this));
        this._listenerReset = G_NetworkManager.add(MessageIDConst.ID_S2C_ResetStage, this._s2cResetStage.bind(this));
    }

    private getRewards(awards) {
        var rewards = [];
        for (const key in awards) {
            var award = awards[key];
            var reward = {
                type: award.type,
                value: award.value,
                size: award.size
            };
            rewards.push(reward);
        }
        return rewards;
    }

    public clear() {
        this._recvFirstKill.remove();
        this._recvFirstKill = null;
        this._recvNewFirstKill.remove();
        this._recvNewFirstKill = null;
        this._listenerExecuteStage.remove();
        this._listenerExecuteStage = null;
        this._listenerFastExecute.remove();
        this._listenerFastExecute = null;
        this._listenerReset.remove();
        this._listenerReset = null;
        this._rebel = null;
    }

    public reset() {
    }

    public getStageById(stageId): StageBaseData {
        var stageList = this.getStages();
        return stageList[stageId];
    }

    public _createStageData() {
        var stageList = {};
        var StoryStage = G_ConfigLoader.getConfig(ConfigNameConst.STORY_STAGE)
        var stageCount = StoryStage.length();
        for (var i = 0; i < stageCount; i++) {
            var stageData = StoryStage.indexOf(i);
            var stage = new StageBaseData();
            stage.setId(stageData.id);
            stage.setConfigData(stageData);
            stageList[stageData.id] = stage;
        }
        this.setStages(stageList);
    }

    public updateStageByList(list) {
        for (const i in list) {
            var v = list[i];
            this.updateStage(v);
        }
    }

    public updateStage(data) {
        var stage = this.getStageById(data.id);
        stage.updateData(data);
    }

    public recvStageBox(stageId) {
        var stage = this.getStageById(stageId);
        stage.setReceive_box(true);
    }

    public _s2cGetFirstKill(id, message) {
        if (message.hasOwnProperty('first_kill')) {
            for (let i = 0; i < message.first_kill.length; i++) {
                var killData = message.first_kill[i];
                var stage = this.getStageById(killData.id);
                stage.setKiller(killData.name);
                stage.setKillerId(killData.user_id);
            }
        }
    }

    public _s2cNewFirstKill(id, message) {
        var stage = this.getStageById(message.stage_id);
        stage.setKiller(message.first_kill_name);
        stage.setKillerId(message.user_id);
    }

    public getStarById(stageId) {
        var stageData = this.getStageById(stageId);
        return stageData.getStar();
    }

    public isStageOpen(stageId) {
        var stageData = this.getStageById(stageId);
        if (stageData && stageData.isIs_finished()) {
            return true;
        }
        return false;
    }

    public getStageCount(stageId) {
        var stageData = this.getStageById(stageId);
        return [
            stageData.getExecute_count(),
            stageData.getConfigData().challenge_num
        ];
    }

    public c2sExecuteStage(stageId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ExecuteStage, { stage_id: stageId });
    }

    public _s2cExecuteStage(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('rebel_army_id')) {
            var rebel = {
                id: message.rebel_army_id,
                level: message.rebel_army_level
            };
            this._rebel = rebel;
            G_SignalManager.dispatch(SignalConst.EVENT_TRIGGER_REBEL_ARMY);
        }
        var firstPass = false;
        if (message.hasOwnProperty('stage')) {
            var stageId = message.stage_id;
            var data = message.stage;
            var oldData = this.getStageById(stageId);
            var oldPass = oldData.isIs_finished();
            if (!oldPass && data.is_finished) {
                firstPass = true;
            }
            G_SignalManager.dispatch(SignalConst.EVENT_EXECUTE_STAGE, message, firstPass, stageId, message.is_win);
            this.updateStage(data);
            var messageTable = {
                battleReport: message.battle_report,
                battleId: message.stage_id,
                firstPass: firstPass
            };
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_BATTLE_START, messageTable);

            var strStage = stageId + "";
            var zhangNumber = parseInt(strStage[1]) * 100 + parseInt(strStage[2]) * 10 + parseInt(strStage[3]) * 1;
            var guanNumber = parseInt(strStage[4]) * 10 + parseInt(strStage[5]) * 1;
            if (zhangNumber <= 2) {
                ALDStatistics.instance.aldSendEvent("第" + zhangNumber + "章第" + guanNumber + "关");
                if (message.hasOwnProperty('is_win')) {
                    ALDStatistics.instance.aldSendEvent("第" + zhangNumber + "章第" + guanNumber + "关挑战成功");
                }
                else {
                    ALDStatistics.instance.aldSendEvent("第" + zhangNumber + "章第" + guanNumber + "关挑战失败");
                }
            }
        }
        if (message.hasOwnProperty('is_win')) {
            var stageData = this.getStageById(message.stage_id);
            var chapterData = G_UserData.getChapter().getChapterByTypeId(ChapterConst.CHAPTER_TYPE_FAMOUS, stageData.getConfigData().chapter_id);
            if (chapterData) {
                var num = G_UserData.getChapter().getHero_chapter_challenge_count() + 1;
                G_UserData.getChapter().setHero_chapter_challenge_count(num);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_NEW_STAGE);
    }

    public c2sFastExecuteStage(stageId, count) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FastExecuteStage, {
            stage_id: stageId,
            count: count
        });
    }

    public _s2cFastExecuteStage(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('stage') != null) {
            this.updateStage(message.stage);
        }
        var sweepResults = [];
        var rebels = {};
        if (message.hasOwnProperty('rewards')) {

            for (let i = 0; i < message.rewards.length; i++) {
                var v = message.rewards[i];
                var singleResult: any = {};
                singleResult.money = v.stage_money || 0;
                singleResult.exp = v.stage_exp || 0;
                singleResult.isDouble = rawget(v, "is_double") || false
                if (v.awards) {
                    singleResult.rewards = this.getRewards(v.awards);
                }
                if (v.add_awards) {
                    singleResult.addRewards = this.getAddReward(v.add_awards);
                }
                sweepResults.push(singleResult);
                if (v.rebel_army_id) {
                    var rebel: any = {};
                    rebel.id = v.rebel_army_id;
                    rebel.level = v.rebel_army_level;
                    this._rebel = rebel;
                    G_SignalManager.dispatch(SignalConst.EVENT_TRIGGER_REBEL_ARMY);
                }
            }

            G_SignalManager.dispatch(SignalConst.EVENT_FAST_EXECUTE_STAGE, sweepResults);
        }
    }

    public resetRebel() {
        this._rebel = null;
    }

    public getNewRebel() {
        return this._rebel;
    }

    public c2sResetStage(stageId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ResetStage, { stage_id: stageId });
    }

    public _s2cResetStage(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('stage')) {
            this.updateStage(message.stage);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RESET_STAGE);
    }

    public isLastStage(stageId) {
        var stageConfigData = this.getStageById(stageId).getConfigData();
        var nextId = stageConfigData.next_id;
        if (nextId == 0) {
            return true;
        }
        var nextStageConfigData = this.getStageById(nextId).getConfigData();
        if (nextStageConfigData.chapter_id != stageConfigData.chapter_id) {
            return true;
        }
        return false;
    }

    public getChapterData(stageId) {
        var stageConfigData = this.getStageById(stageId).getConfigData();
        var chapterId = stageConfigData.chapter_id;
        var chapterData = G_UserData.getChapter().getGlobalChapterById(chapterId);
        return chapterData;
    }

    public needShowEnd() {
        var stageId = this.getNowFightStage();
        if (stageId == 0) {
            return false;
        }
        var stageData = this.getStageById(stageId);
        if (this.isLastStage(stageId) && !stageData.isLastIs_finished()) {
            this.setNowFightStage(0);
            return true;
        }
        return false;
    }

    private getAddReward(addAwards) {
        var rewards = [];
        for (const key in addAwards) {
            var val = addAwards[key];
            var addReward: any = {};
            addReward.reward = {
                type: val.award.type,
                value: val.award.value,
                size: val.award.size
            };
            addReward.index = val.index;
            rewards.push(addReward);
        }
        return rewards;
    }
}