import ChapterConst from "../const/ChapterConst";
import CommonConst from "../const/CommonConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { FunctionConst } from "../const/FunctionConst";
import { MessageIDConst } from "../const/MessageIDConst";
import ParameterIDConst from "../const/ParameterIDConst";
import { SignalConst } from "../const/SignalConst";
import { G_ConfigLoader, G_NetworkManager, G_ServerTime, G_SignalManager, G_UserData } from "../init";
import { handler } from "../utils/handler";
import { BaseData } from "./BaseData";
import { ChapterBaseData } from "./ChapterBaseData";
import { ChapterGeneralData } from "./ChapterGeneralData";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";

var schema = {};
schema['total_star'] = [
    'number',
    0
];
schema['total_e_star'] = [
    'number',
    0
];
schema['chapters'] = [
    'object',
    []
];
schema['e_chapters'] = [
    'object',
    []
];
schema['f_chapters'] = [
    'object',
    []
];
schema['generals'] = [
    'object',
    []
];
schema['hero_chapter_challenge_count'] = [
    'number',
    0
];
schema['showBossPage'] = [
    'boolean',
    false
];
schema['resList'] = [
    'object',
    []
];

export interface ChapterData {
    getTotal_star(): number
    setTotal_star(value: number): void
    getLastTotal_star(): number
    getTotal_e_star(): number
    setTotal_e_star(value: number): void
    getLastTotal_e_star(): number
    getChapters(): ChapterBaseData[]
    setChapters(value: ChapterBaseData[]): void
    getLastChapters(): ChapterBaseData[]
    getE_chapters(): ChapterBaseData[]
    setE_chapters(value: ChapterBaseData[]): void
    getLastE_chapters(): ChapterBaseData[]
    getF_chapters(): ChapterBaseData[]
    setF_chapters(value: ChapterBaseData[]): void
    getLastF_chapters(): ChapterBaseData[]
    getGenerals(): ChapterGeneralData[]
    setGenerals(value: ChapterGeneralData[]): void
    getLastGenerals(): ChapterGeneralData[]
    getHero_chapter_challenge_count(): number
    setHero_chapter_challenge_count(value: number): void
    getLastHero_chapter_challenge_count(): number
    isShowBossPage(): boolean
    setShowBossPage(value: boolean): void
    isLastShowBossPage(): boolean
    getResList(): any[]
    setResList(value: any[]): void
    getLastResList(): any[]
}
export class ChapterData extends BaseData {
    public static schema = schema;
    private _lastCheckBossTime
    private _stageListData
    private _listenerChapterData
    private _listenerActDailyBoss
    private _listenerStarBox
    private _listenerEnterStage
    private _listenerStageBox
    private _listenerBossFight
    private _listenerGetAllAward
    private _listenerChallengeFamous

    constructor() {
        super()
        this._lastCheckBossTime = null;
        this._stageListData = {};
        this._initStageData();
        this._createChapterData();
        this._listenerChapterData = G_NetworkManager.add(MessageIDConst.ID_S2C_GetChapterList, this._s2cGetChapterList.bind(this));
        this._listenerActDailyBoss = G_NetworkManager.add(MessageIDConst.ID_S2C_GetActDailyBoss, this._s2cGetActDailyBoss.bind(this));
        this._listenerStarBox = G_NetworkManager.add(MessageIDConst.ID_S2C_FinishChapterBoxRwd, this._s2cFinishChapterBoxRwd.bind(this));
        this._listenerEnterStage = G_NetworkManager.add(MessageIDConst.ID_S2C_FirstEnterChapter, this._s2cFirstEnterChapter.bind(this));
        this._listenerStageBox = G_NetworkManager.add(MessageIDConst.ID_S2C_ReceiveStageBox, this._s2cReceiveStageBox.bind(this));
        this._listenerBossFight = G_NetworkManager.add(MessageIDConst.ID_S2C_ActDailyBoss, this._s2cActDailyBoss.bind(this));
        this._listenerGetAllAward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetAllAwardBox, this._s2cGetAllAwardBox.bind(this));
        this._listenerChallengeFamous = G_NetworkManager.add(MessageIDConst.ID_S2C_ChallengeHeroChapter, this._s2cChallengeHeroChapter.bind(this));
    }

    public clear() {
        this._listenerChapterData.remove();
        this._listenerChapterData = null;
        this._listenerActDailyBoss.remove();
        this._listenerActDailyBoss = null;
        this._listenerStarBox.remove();
        this._listenerStarBox = null;
        this._listenerEnterStage.remove();
        this._listenerEnterStage = null;
        this._listenerStageBox.remove();
        this._listenerStageBox = null;
        this._listenerBossFight.remove();
        this._listenerBossFight = null;
        this._listenerGetAllAward.remove();
        this._listenerGetAllAward = null;
        this._listenerChallengeFamous.remove();
        this._listenerChallengeFamous = null;
    }

    public reset() {
    }

    public _createChapterData() {
        var StoryChapter = G_ConfigLoader.getConfig(ConfigNameConst.STORY_CHAPTER);
        var chapters = [];
        var chapterData = StoryChapter.indexOf(0);
        var firstChapter = this._createSingleData(chapterData);
        chapters.push(firstChapter);
        while (chapterData.next_chapter_id != 0) {
            var nextChapterId = chapterData.next_chapter_id;
            var configData = StoryChapter.get(nextChapterId);
            var chapter = this._createSingleData(configData);
            chapters.push(chapter);
            chapterData = configData;
        }
        this.setChapters(chapters);
        var eChapters = [];
        var eliteData = null;
        var famousData = null;
        var countChapter = StoryChapter.length();
        for (var i = 0; i < countChapter; i++) {
            var data = StoryChapter.indexOf(i);
            if (data.type == ChapterConst.CHAPTER_TYPE_ELITE && !eliteData) {
                eliteData = data;
            } else if (data.type == ChapterConst.CHAPTER_TYPE_FAMOUS && !famousData) {
                famousData = data;
            }
        }
        var firstEChapter = this._createSingleData(eliteData);
        eChapters.push(firstEChapter);
        while (eliteData.next_chapter_id != 0) {
            var nextChapterId = eliteData.next_chapter_id;
            var configData = StoryChapter.get(nextChapterId);
            var chapter = this._createSingleData(configData);
            eChapters.push(chapter);
            eliteData = configData;
        }
        this.setE_chapters(eChapters);

        var fChapters = [];
        var firstFChapter = this._createSingleData(famousData);
        fChapters.push(firstFChapter);
        while (famousData.next_chapter_id != 0) {
            var nextChapterId = famousData.next_chapter_id;
            var configData = StoryChapter.get(nextChapterId);
            var chapter = this._createSingleData(configData);
            fChapters.push(chapter);
            famousData = configData;
        }
        this.setF_chapters(fChapters);;

        var StoryGeneralPlan = G_ConfigLoader.getConfig(ConfigNameConst.STORY_GENERAL_PLAN);
        var generals = [];
        for (var i = 0; i < StoryGeneralPlan.length(); i++) {
            var configData = StoryGeneralPlan.indexOf(i);
            var general = this._createGeneralData(configData);
            generals.push(general);
        }
        this.setGenerals(generals);
    }

    private _createGeneralData(configData) {
        var chapterGeneralData = new ChapterGeneralData();
        chapterGeneralData.setConfigData(configData);
        chapterGeneralData.setId(configData.id);
        return chapterGeneralData;
    }

    private _initStageData() {
        this._stageListData = {};
        var StoryStage = G_ConfigLoader.getConfig(ConfigNameConst.STORY_STAGE);
        var countStage = StoryStage.length();
        for (var i = 0; i < countStage; i++) {
            var stageData = StoryStage.indexOf(i);
            if (!this._stageListData[stageData.chapter_id]) {
                this._stageListData[stageData.chapter_id] = [];
            }
            this._stageListData[stageData.chapter_id].push(stageData.id);
        }
    }

    private _createSingleData(configData) {
        var chapter = new ChapterBaseData();
        chapter.setConfigData(configData);
        chapter.setId(configData.id);
        var stageIdList: any[] = this._stageListData[configData.id];
        stageIdList.sort(function (a, b) {
            return a - b;
        });
        chapter.setStageIdList(stageIdList);
        var resList = this.getResList();
        var newRes = true;
        for (let i = 0; i < resList.length; i++) {
            var v = resList[i];
            if (v == configData.island_eff) {
                newRes = false;
            }
        }

        if (newRes) {
            resList.push(configData.island_eff);
            this.setResList(resList);
        }
        return chapter;
    }

    public getChapterByTypeId(type, id): ChapterBaseData {
        var chapterList = null;
        if (type == ChapterConst.CHAPTER_TYPE_NORMAL) {
            chapterList = this.getChapters();
        } else if (type == ChapterConst.CHAPTER_TYPE_ELITE) {
            chapterList = this.getE_chapters();
        } else if (type == ChapterConst.CHAPTER_TYPE_FAMOUS) {
            chapterList = this.getF_chapters();
        }
        if (!chapterList) {
            return null;
        }
        for (let i = 0; i < chapterList.length; i++) {
            var v = chapterList[i];
            if (v.getId() == id) {
                return v;
            }
        }
    }
    //性能优化,避免遍历
    public getGlobalChapterById(chapterId, chapterType?): ChapterBaseData {
        chapterType = chapterType || G_ConfigLoader.getConfig(ConfigNameConst.STORY_CHAPTER).get(chapterId).type;
        var chapter;
        if (chapterType) {
            switch(chapterType) {
                case ChapterConst.CHAPTER_TYPE_NORMAL:
                    chapter = this.getChapterDataById(chapterId);
                    break;
                case ChapterConst.CHAPTER_TYPE_ELITE:
                    chapter = this.getEChapterDataById(chapterId);
                    break;
                case ChapterConst.CHAPTER_TYPE_FAMOUS:
                    chapter = this.getFChapterDataById(chapterId);
                    break;
            }
        }
        return chapter;
        //  chapter = this.getChapterDataById(chapterId);
        // if (!chapter) {
        //     chapter = this.getEChapterDataById(chapterId);
        // }
        // if (!chapter) {
        //     chapter = this.getFChapterDataById(chapterId);
        // }
        // return chapter;
    }

    public getChapterDataById(id): ChapterBaseData {
        var chapterList = this.getChapters();
        for (let i = 0; i < chapterList.length; i++) {
            var v = chapterList[i];
            if (v.getId() == id) {
                return v;
            }
        }
    }

    public getEChapterDataById(id): ChapterBaseData {
        var eChapterList = this.getE_chapters();
        for (let i = 0; i < eChapterList.length; i++) {
            var v = eChapterList[i];
            if (v.getId() == id) {
                return v;
            }
        }
    }

    public getFChapterDataById(id): ChapterBaseData {
        var fChapterList = this.getF_chapters();
        for (let i = 0; i < fChapterList.length; i++) {
            var v = fChapterList[i];
            if (v.getId() == id) {
                return v;
            }
        }
    }

    public c2sGetChapterList() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetChapterList, {});
    }

    private _s2cGetChapterList(id, message) {
        if (message.ret != 1) {
            return;
        }
        this.resetTime();
        if (message.hasOwnProperty('chapters')) {
            for (let i = 0; i < message.chapters.length; i++) {
                var data = message.chapters[i];
                var chapter = this.getChapterDataById(data.id);
                chapter.updateData(data);
                G_UserData.getStage().updateStageByList(data.stages);
            }
        }
        if (message.hasOwnProperty('e_chapters')) {
            for (let i = 0; i < message.e_chapters.length; i++) {
                var data = message.e_chapters[i];
                var chapter = this.getEChapterDataById(data.id);
                chapter.updateData(data);
                G_UserData.getStage().updateStageByList(data.stages);
            }
        }
        if (message.hasOwnProperty('hero_chapters')) {
            for (let i = 0; i < message.hero_chapters.length; i++) {
                var data = message.hero_chapters[i];
                var chapter = this.getFChapterDataById(data.id);
                chapter.updateData(data);
                G_UserData.getStage().updateStageByList(data.stages);
            }
        }
        if (message.hasOwnProperty('chapter_box_ids')) {
            G_UserData.getChapterBox().updateData(message.chapter_box_ids);
        }
        if (message.hasOwnProperty('hero_chapter_ids')) {
            for (let i = 0; i < message.hero_chapter_ids.length; i++) {
                var id = message.hero_chapter_ids[i];
                var generalData = this.getGeneralById(id);
                generalData.setPass(true);
            }
        }

        if (message.hasOwnProperty('first_kill')) {
            for (let i = 0; i < message.first_kill.length; i++) {
                var killData = message.first_kill[i];
                var stageData = G_UserData.getStage().getStageById(killData.id);
                stageData.setKiller(killData.name);
                stageData.setKillerId(killData.user_id);
            }
        }
        this.setHero_chapter_challenge_count(message.hero_chapter_challenge_count);
        G_SignalManager.dispatch(SignalConst.EVENT_CHAPTER_INFO_GET);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_NEW_STAGE);
    }

    private _enterChapter(chapterId) {
        var chapter = this.getGlobalChapterById(chapterId);
        chapter.setHas_entered(true);
    }

    private _refreshStarBox(chapterId, boxType) {
        var chapter = this.getGlobalChapterById(chapterId);
        if (chapter) {
            if (boxType == CommonConst.BOX_TYPE_COPPER) {
                chapter.setBreward(1);
            } else if (boxType == CommonConst.BOX_TYPE_SILVER) {
                chapter.setSreward(1);
            } else if (boxType == CommonConst.BOX_TYPE_GOLD) {
                chapter.setGreward(1);
            } else if (boxType == CommonConst.BOX_TYPE_PASS) {
                chapter.setPreward(1);
            }
        }
    }

    public _getNextOpenChapter(chapterData: ChapterBaseData): ChapterBaseData {
        var nextId = chapterData.getConfigData().next_chapter_id;
        if (nextId != 0) {
            var chapter = this.getGlobalChapterById(nextId, chapterData.getConfigData().type);
            if (chapter.isHas_entered()) {
                return chapter;
            } else if (chapterData.isLastStagePass()) {
                return chapter;
            }
        }
        return null;
    }

    public getOpenChapter(type): ChapterBaseData[] {
        var chapterList: ChapterBaseData[] = null;
        if (type == ChapterConst.CHAPTER_TYPE_NORMAL) {
            chapterList = this.getChapters();
        } else if (type == ChapterConst.CHAPTER_TYPE_ELITE) {
            chapterList = this.getE_chapters();
        } else if (type == ChapterConst.CHAPTER_TYPE_FAMOUS) {
            chapterList = this.getF_chapters();
        }
        var chapterDataList = [];
        var chapter = chapterList[0];
        while (chapter) {
            chapterDataList.push(chapter)
            chapter = this._getNextOpenChapter(chapter);
        }
        return chapterDataList;
    }

    public getLastOpenChapterId(): number {
        var list = this.getOpenChapter(1);
        return list[list.length - 1].getId();
    }

    public getNextChapter(type: number, chapter: ChapterBaseData, count): any[] {
        var nowChapter = chapter;
        var nextChapterList = [];
        var index = 0;
        while (index < count) {
            var nextId = nowChapter.getConfigData().next_chapter_id;
            if (nextId == 0) {
                return nextChapterList;
            }
            var chapterData = this.getChapterByTypeId(type, nextId);
            var structNext = {
                before: nowChapter,
                now: chapterData
            };
            nextChapterList.push(structNext);
            nowChapter = chapterData;
            index = index + 1;
        }
        return nextChapterList;
    }

    public _s2cGetActDailyBoss(id, message) {
        if (message.ret != 1) {
            return;
        }
        var time = G_ServerTime.getTime();
        if (!this._lastCheckBossTime) {
            this.setShowBossPage(true);
            this._lastCheckBossTime = G_ServerTime.secondsFromToday(time);
        } else {
            var nowSec = G_ServerTime.secondsFromToday(time);
            var configBossInfo = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DAILY_BOSS_TIME);
            var bossTime: string = configBossInfo.content.toString();
            var bossSecs = bossTime.split('|');
            for (let i = 0; i < bossSecs.length; i++) {
                var v = bossSecs[i];
                var secondToday = parseFloat(v) * 3600;
                if (this._lastCheckBossTime < secondToday && secondToday < nowSec) {
                    this._lastCheckBossTime = nowSec;
                    this.setShowBossPage(true);
                    break;
                }

            }
        }
        var eChapterList = this.getE_chapters();
        for (let i = 0; i < eChapterList.length; i++) {
            var eChapter: ChapterBaseData = eChapterList[i];
            eChapter.setBossId(0);
            eChapter.setBossState(0);

        }

        if (message.hasOwnProperty('boss_state')) {
            for (let i = 0; i < message.boss_state.length; i++) {
                var bossState = message.boss_state[i];
                var chapter = this.getEChapterDataById(bossState.chapter_id);
                chapter.setBossId(bossState.boss_id);
                chapter.setBossState(bossState.boss_state);

            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ACTIVITY_DAILY_BOSS);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_CHAPTER_BOSS);
    }

    public getBossChapters(): ChapterBaseData[] {
        var list: ChapterBaseData[] = this.getE_chapters();
        var bossChapters = [];
        for (let i = 0; i < list.length; i++) {
            var v = list[i];
            if (v.getBossId() != 0) {
                bossChapters.push(v);
            }

        }
        return bossChapters;
    }

    public isAliveBoss() {
        var bossChapters = this.getBossChapters();
        for (let i = 0; i < bossChapters.length; i++) {
            var v = bossChapters[i];
            if (v.getBossState() == 0) {
                return true;
            }
        }

        return false;
    }

    public defeatBoss(chapterId) {
        var chapter = this.getEChapterDataById(chapterId);
        chapter.setBossState(1)
    }

    public c2sGetActDailyBoss() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetActDailyBoss, {});
    }

    public pullData() {
        this.c2sGetChapterList();
        this.c2sGetActDailyBoss();
    }

    public c2sFinishChapterBoxRwd(chapterId, boxId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FinishChapterBoxRwd, {
            ch_id: chapterId,
            box_type: boxId
        });
    }

    public _s2cFinishChapterBoxRwd(id, message) {
        if (message.ret != 1) {
            return;
        } else {
            var id = message.ch_id;
            var boxType = message.box_type;
            this._refreshStarBox(id, boxType);
            var rewards = [];
            for (let i = 0; i < message.awards.length; i++) {
                var v = message.awards[i];
                var reward = {
                    type: v.type,
                    value: v.value,
                    size: v.size
                };
                rewards.push(reward);

            }
            G_SignalManager.dispatch(SignalConst.EVENT_CHAPTER_BOX, rewards, boxType);
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_NEW_STAGE);
        }
    }

    public c2sFirstEnterChapter(chapterId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FirstEnterChapter, { ch_id: chapterId });
    }

    public _s2cFirstEnterChapter(id, message) {
        if (message.ret != 1) {
            return;
        } else {
            var id = message.ch_id;
            this._enterChapter(id);
            G_SignalManager.dispatch(SignalConst.EVENT_CHAPTER_ENTER_STAGE, id);
            if (message.hasOwnProperty('first_kill')) {
                for (let i = 0; i < message.first_kill.length; i++) {
                    var killData = message.first_kill[i];
                    var stageData = G_UserData.getStage().getStageById(killData.id);
                    stageData.setKiller(killData.name);
                    stageData.setKillerId(killData.user_id);
                }

            }
        }
    }

    public c2sReceiveStageBox(stageId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ReceiveStageBox, { stage_id: stageId });
    }

    public _s2cReceiveStageBox(id, message) {
        if (message.ret != 1) {
            return;
        } else {
            var stageId = message.stage_id;
            G_UserData.getStage().recvStageBox(stageId);
            G_SignalManager.dispatch(SignalConst.EVENT_CHAPTER_STAGE_BOX, stageId);
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_NEW_STAGE);
        }
    }

    public hasRedPoint() {
        var normalExplore = this.hasRedPointForExplore(ChapterConst.CHAPTER_TYPE_NORMAL);
        var eliteExplore = this.hasRedPointForExplore(ChapterConst.CHAPTER_TYPE_ELITE);
        var famousExplore = this.hasRedPointForExplore(ChapterConst.CHAPTER_TYPE_FAMOUS);
        return normalExplore || eliteExplore || famousExplore;
    }

    public hasRedPointForExplore(type) {
        if (type == ChapterConst.CHAPTER_TYPE_FAMOUS) {
            var isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_FAMOUS_CHAPTER)[0];
            if (!isOpen) {
                return false;
            }
            var leftCount = this.getFamousLeftCount();
            if (leftCount > 0) {
                return true;
            }
        }
        var list = this.getChapterListByType(type);
        if (!list) {
            return false;
        }
        for (let i = 0; i < list.length; i++) {
            var v = list[i];
            var redPoint = this.hasRedPointForChapter(v.getId(), type);
            if (redPoint) {
                return true;
            }
        }

        if (type == ChapterConst.CHAPTER_TYPE_NORMAL) {
            return G_UserData.getChapterBox().isCurBoxAwardsCanGet();
        }
        if (type == ChapterConst.CHAPTER_TYPE_ELITE) {
            var chapterData = G_UserData.getChapter();
            var bossChapters = chapterData.getBossChapters();
            var hasAliveBoss = false;
            for (let i = 0; i < bossChapters.length; i++) {
                var v = bossChapters[i];
                if (v.getBossState() == 0) {
                    hasAliveBoss = true;
                    break;
                }

            }
            if (hasAliveBoss) {
                return true;
            }
        }
        return false;
    }

    public getChapterListByType(type): ChapterBaseData[] {
        var chapterList = null;
        if (type == ChapterConst.CHAPTER_TYPE_NORMAL) {
            chapterList = this.getChapters();
        } else if (type == ChapterConst.CHAPTER_TYPE_ELITE) {
            chapterList = this.getE_chapters();
        } else if (type == ChapterConst.CHAPTER_TYPE_FAMOUS) {
            chapterList = this.getF_chapters();
        }
        return chapterList;
    }

    public hasRedPointForChapter(chapterId, chapterType) {
        var chapter = this.getGlobalChapterById(chapterId, chapterType);
        if (!chapter.isHas_entered()) {
            return false;
        }
        var redPoint01 = chapter.canGetStageBoxReward();
        var redPoint02 = chapter.canGetStarBox();
        return redPoint01 || redPoint02;
    }

    public c2sActDailyBoss(chapterId, bossId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActDailyBoss, {
            chapter_id: chapterId,
            boss_id: bossId
        });
    }

    public _s2cActDailyBoss(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_DAILY_BOSS_FIGNT, message);
    }

    public c2sGetAllAwardBox(chapterId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetAllAwardBox, { chapter_id: chapterId });
    }

    public _s2cGetAllAwardBox(id, message) {
        if (message.ret != 1) {
            return;
        }
        var chapterBaseData = this.getGlobalChapterById(message.chapter_id);
        for (let i = 0; i < message.box_type.length; i++) {
            var boxType = message.box_type[i];
            if (boxType == CommonConst.BOX_TYPE_COPPER) {
                chapterBaseData.setBreward(1);
            } else if (boxType == CommonConst.BOX_TYPE_SILVER) {
                chapterBaseData.setSreward(1);
            } else if (boxType == CommonConst.BOX_TYPE_GOLD) {
                chapterBaseData.setGreward(1);
            } else if (boxType == CommonConst.BOX_TYPE_PASS) {
                chapterBaseData.setPreward(1);
            }
        }

        for (let i = 0; i < message.stage_ids.length; i++) {
            var v = message.stage_ids[i];
            var stageData = G_UserData.getStage().getStageById(v);
            stageData.setReceive_box(true);

        }

        G_SignalManager.dispatch(SignalConst.EVENT_GET_ALL_BOX, message.awards);
    }

    public c2sChallengeHeroChapter(stageId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ChallengeHeroChapter, { stage_id: stageId });
    }

    public _s2cChallengeHeroChapter(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.win) {
            var generalData = this.getGeneralById(message.stage_id);
            generalData.setPass(true);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CHALLENGE_HERO_GENERAL, message);
    }

    public getGeneralById(stageId): ChapterGeneralData {
        var generals: ChapterGeneralData[] = this.getGenerals();
        for (let i = 0; i < generals.length; i++) {
            var v = generals[i];
            if (v.getId() == stageId) {
                return v;
            }

        }
    }

    public getOpenGeneralIds(): ChapterGeneralData[] {
        var generalList: ChapterGeneralData[] = this.getGenerals();
        var openChapter = this.getOpenChapter(ChapterConst.CHAPTER_TYPE_FAMOUS);
        var openGenerals: ChapterGeneralData[] = [];
        for (let i = 0; i < generalList.length; i++) {
            var data = generalList[i];
            var configData = data.getConfigData();
            var chapter = this.getChapterByTypeId(ChapterConst.CHAPTER_TYPE_FAMOUS, configData.need_chapter);
            if (chapter.isLastStagePass()) {
                openGenerals.push(data);
            }

        }

        if (openGenerals.length > 3) {
            for (let i = 0; i < openGenerals.length - 3; i++) {
                if (openGenerals[i].isPass()) {
                    openGenerals.splice(i, 1);
                }
            }
        }
        return openGenerals;
    }

    public getFamousLeftCount() {
        var famousCount = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.FAMOUS_MAX_COUNT).content);
        var nowCount = this.getHero_chapter_challenge_count();
        return famousCount - nowCount;
    }

    public getChapterTotalStarNum(type) {
        var list = this.getChapterListByType(type);
        if (!list) {
            return 0;
        }
        var totalStarNum = 0;
        for (let i = 0; i < list.length; i++) {
            var v = list[i];
            //local isFinish, getStar, totalStar = v:getChapterFinishState()
            var getStar = v.getChapterFinishState()[1];
            totalStarNum = totalStarNum + getStar;

        }
        return totalStarNum;
    }

    public getElitePassCount() {
        return this.getChapterTotalStarNum(ChapterConst.CHAPTER_TYPE_ELITE);
    }

    public getFamousPassCount() {
        return this.getChapterTotalStarNum(ChapterConst.CHAPTER_TYPE_FAMOUS);
    }
}