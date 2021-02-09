import { G_UserData, G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { DataConst } from "../../const/DataConst";
import { FunctionConst } from "../../const/FunctionConst";
import { FunctionCheck } from "../logic/FunctionCheck";
import { clone2 } from "../GlobleFunc";
import { table } from "../table";
import { CrossWorldBossHelperT } from "../../scene/view/crossWorldBoss/CrossWorldBossHelperT";


export namespace BattleDataHelper {
    export let BATTLE_TYPE_NORMAL_DUNGEON = 1;
    export let BATTLE_TYPE_CHALLENGE_DAILY = 2;
    export let BATTLE_TYPE_CHALLENGE_TOWER = 3;
    export let BATTLE_TYPE_SIEGE = 4;
    export let BATTLE_TYPE_ARENA = 5;
    export let BATTLE_TYPE_DAILY_BOSS = 6;
    export let BATTLE_TYPE_REPORT = 7;
    export let BATTLE_TYPE_EXPLORE_REBEL = 8;
    export let BATTLE_TYPE_EXPLORE_BOSS = 9;
    export let BATTLE_TYPE_TERRITORY = 10;
    export let BATTLE_TYPE_TOWER_SURPRISE = 11;
    export let BATTLE_TYPE_FRIEND = 12;
    export let BATTLE_TYPE_WORLDBOSS = 13;
    export let BATTLE_TYPE_WORLDBOSS_POINT = 14;
    export let BATTLE_TYPE_TOWER_SUPER = 15;
    export let BATTLE_TYPE_FAMOUS = 16;
    export let BATTLE_TYPE_GENERAL = 17;
    export let BATTLE_TYPE_GUILD_DUNGEON = 18;
    export let BATTLE_TYPE_MINE = 19;
    export let BATTLE_TYPE_REVENGE = 20;
    export let BATTLE_TYPE_COUNTRY_BOSS = 21;
    export let BATTLE_TYPE_COUNTRY_BOSS_INTERCEPT = 22;
    export let BATTLE_TYPE_CAMP_RACE = 23;
    export let BATTLE_TYPE_GUILD_WAR = 24;
    export let BATTLE_TYPE_SEASON_FIGHTS = 25;
    export let BATTLE_TYPE_SINGLE_RACE = 26;
    export let BATTLE_TYPE_GUILD_REPORT = 27;
    export let BATTLE_TYPE_UNIVERSE_RACE = 28;
    export let BATTLE_TYPE_CROSS_WORLDBOSS = 29;
    export let BATTLE_TYPE_CROSS_WORLDBOSS_POINT = 30;
    export let getTypeName = function (typeId) {
        for (const key in BattleDataHelper) {
            let value = BattleDataHelper[key];
            if (key.indexOf('BATTLE_TYPE_') > -1 && value == typeId) {
                return key;
            }
        }
        return '';
    };
    export let initBaseData = function (data) {
        let reportData = G_UserData.getFightReport();
        data.attackName = reportData.getLeftName();
        data.defenseName = reportData.getRightName();
        data.attackPower = reportData.getLeftPower();
        data.defensePower = reportData.getRightPower();
        data.attackBaseId = reportData.getLeftBaseId();
        data.attackOffLevel = reportData.getLeftOfficerLevel();
        data.defenseBaseId = reportData.getRightBaseId();
        data.defenseOffLevel = reportData.getRightOfficerLevel();
        data.firstOrder = reportData.getFirstOrder();
        data.isWin = reportData.isWin();
        return data;
    };

    export function  parseCrossWorldBossFight (message, isCharge) {
        var battleData = clone2(BattleDataHelper.getInitBattleData());
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_CROSS_WORLDBOSS;
        battleData.point = message['point'];
        battleData.hurt = message['hurt'];
        battleData.needShowJump = true;
        battleData.awards = {};
        if (message['award']) {
            for (let _ in message.award) {
                var val = message.award[_];
                var award = {
                    type: val.type,
                    value: val.value,
                    size: val.size
                };
                table.insert(battleData.awards, val);
            }
        }
        battleData.ignoreBgm = true;
        var normalSceneId = CrossWorldBossHelperT.getParameterValue('battle_scene_1');
        var chargeSceneId = CrossWorldBossHelperT.getParameterValue('battle_scene_2');
        table.insert(battleData.background, isCharge == true && chargeSceneId || normalSceneId);
        return battleData;
    };
    
    export function parseCrossWorldBossPoint(message, isCharge) {
        var battleData = clone2(BattleDataHelper.getInitBattleData());
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_CROSS_WORLDBOSS_POINT;
        battleData.point = message['point'];
        battleData.needShowJump = true;
        battleData.ignoreBgm = true;
        var normalSceneId = CrossWorldBossHelperT.getParameterValue('battle_scene_1');
        var chargeSceneId = CrossWorldBossHelperT.getParameterValue('battle_scene_2');
        table.insert(battleData.background, isCharge == true && chargeSceneId || normalSceneId);
        return battleData;
    };

    export let getInitBattleData = function () {
        let battleData = {
            money: 0,
            exp: 0,
            star: 0,
            awards: [],
            chapterRewards: [],
            addAwards: [],
            background: [],
            stageId: 0,
            alreadyPass: false,
            battleType: 0,
            needShowJump: false,
            showBossId: 0,
            oldRank: 0,
            newRank: 0,
            monsterTeamId: 0,
            oldGuildRank: 0,
            newGuildRank: 0,
            totalHurt: 0,
            bgm: 0,
            defenseName: '',
            attackName: '',
            attackPower: 0,
            defensePower: 0,
            attackBaseId: 0,
            attackOffLevel: 0,
            defenseOffLevel: 0,
            defenseBaseId: 0,
            firstOrder: 0,
            isWin: false,
            result: false,
            point: 0,
            hurt: 0,
            attackLevel: 0,
            attackRank: 0,
            defenseRank: 0,
            defenseLevel: 0,
            selfData: {},
            leftName: "",
            rightName: "",
            leftOfficer: "",
            rightOfficer: "",
            winPos: 0,

        }
        return battleData;
    }

    function checkMonsterTalk(battleData, monsterTeamId) {
        battleData.monsterTalk = [];
        battleData.monsterTeamId = monsterTeamId;
        let MonsterTalk = G_ConfigLoader.getConfig(ConfigNameConst.MONSTER_TALK)
        let count = MonsterTalk.length();
        for (let i = 0; i < count; i++) {
            let talkConfig = MonsterTalk.indexOf(i);
            if (talkConfig.teamid == monsterTeamId) {
                battleData.monsterTalk.push(talkConfig);
            }
        }
    }
    export let parseNormalDungeonData = function (message, stageInfo, isFamous, isFirstPass) {
        let battleData = BattleDataHelper.getInitBattleData();
        if (isFamous) {
            battleData.battleType = BattleDataHelper.BATTLE_TYPE_FAMOUS;
        } else {
            battleData.battleType = BattleDataHelper.BATTLE_TYPE_NORMAL_DUNGEON;
        }
        battleData.money = message.stage_money;
        battleData.exp = message.stage_exp;
        battleData.star = message.stage_star;
        battleData.bgm = stageInfo.bgm;
        let stageId = stageInfo.id;
        let background = stageInfo.in_res;
        let strArr = background.toString().split('|');

        for (let i = 0; i < strArr.length; i++) {
            let v = strArr[i];
            let number = parseFloat(v);
            battleData.background.push(number);
        }

        for (let i = 0; i < message.awards.length; i++) {
            let val = message.awards[i];
            let award = {
                type: val.type,
                value: val.value,
                size: val.size
            };
            battleData.awards.push(val);
        }

        for (let i = 0; i < message.chapter_awards.length; i++) {
            let val = message.chapter_awards[i];
            let award = {
                type: val.type,
                value: val.value,
                size: val.size
            };
            battleData.chapterRewards.push(val);
        }


        for (let i = 0; i < message.add_awards.length; i++) {
            let val = message.add_awards[i];
            let addAward = {
                index: val.index,
                award: {
                    type: val.award.type,
                    value: val.award.value,
                    size: val.award.size
                }
            };
            battleData.addAwards.push(addAward);
        }

        checkMonsterTalk(battleData, stageInfo.monster_team_id);
        battleData.monsterTeamId = stageInfo.monster_team_id;
        let stageData = G_UserData.getStage().getStageById(stageId);
        battleData.stageId = stageId;
        battleData.alreadyPass = stageData.isIs_finished();
        if (isFirstPass) {
            battleData.alreadyPass = false;
        }
        if (battleData.alreadyPass) {
            battleData.needShowJump = true;
        } else {
            battleData.monsterTeamId = stageInfo.monster_team_id;
            if (G_UserData.getStage().isLastStage(stageId) && battleData.star != 0) {
                let chapterData = G_UserData.getStage().getChapterData(stageId);
                chapterData.setShowEnding(true);
                chapterData.setShowRunningMap(true);
            }
        }
        battleData.showBossId = stageData.getConfigData().show_boss;
        G_UserData.getStage().setNowFightStage(stageId);
        return battleData;
    };

    export let parseChallengeDailyData = function (message, configData, maxId?) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_CHALLENGE_DAILY;
        battleData.background.push(configData.battle_background);

        let type = configData.type;
        maxId = G_UserData.getDailyDungeonData().getMaxIdByType(type);
        if (maxId >= configData.id) {
            battleData.needShowJump = true;
        }

        for (let i = 0; i < message.awards.length; i++) {
            let val = message.awards[i];
            let award = {
                type: val.type,
                value: val.value,
                size: val.size
            };
            battleData.awards.push(val);
        }

        return battleData;
    };
    export let parseChallengeTowerData = function (message, layerConfig, star, historyStar?) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_CHALLENGE_TOWER;
        battleData.background.push(layerConfig.in_res);

        let layerId = layerConfig.id;
        historyStar = G_UserData.getTowerData().getHistoryStarByLayer(layerId);
        battleData.monsterTeamId = layerConfig['monster_team_id_' + star];
        battleData.star = star;
        if (historyStar >= battleData.star) {
            battleData.needShowJump = true;
        }

        for (let i = 0; i < message.total_award.length; i++) {
            let val = message.total_award[i];
            let award = {
                type: val.type,
                value: val.value,
                size: val.size
            };
            battleData.awards.push(val)
        }

        for (let i = 0; i < message.add_award.length; i++) {
            let val = message.add_award[i];
            let addAward = {
                index: val.index,
                award: {
                    type: val.award.type,
                    value: val.award.value,
                    size: val.award.size
                }
            };
            battleData.addAwards.push(addAward);
        }

        return battleData;
    };
    export let parseChallengeSuperTowerData = function (message, layerConfig, pass) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_TOWER_SUPER;
        battleData.background.push(layerConfig.in_res);

        let layerId = layerConfig.id;
        battleData.monsterTeamId = layerConfig['monster_team'];
        battleData.star = 3;
        battleData.needShowJump = pass;

        for (let i = 0; i < message.reward.length; i++) {
            let val = message.reward[i];
            let award = {
                type: val.type,
                value: val.value,
                size: val.size
            };
            battleData.awards.push(award);
        }

        return battleData;
    };

    export let parseSiegeBattleData = function (message, background) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_SIEGE;
        battleData.background.push(background);
        battleData.needShowJump = true;

        if (message.reward) {

            for (let i = 0; i < message.reward.length; i++) {
                let val = message.reward[i];
                let award = {
                    type: val.type,
                    value: val.value,
                    size: val.size
                };
                battleData.awards.push(val);
            }
        }
        if (message.add_rewards) {
            for (let i = 0; i < message.add_rewards.length; i++) {
                let val = message.add_rewards[i];
                let addAward = {
                    index: val.index,
                    award: {
                        type: val.award.type,
                        value: val.award.value,
                        size: val.award.size
                    }
                };
                battleData.addAwards.push(addAward);
            }
        }
        battleData.oldRank = message.user_begin_rank;
        battleData.newRank = message.user_end_rank;
        battleData.oldGuildRank = message.guild_begin_rank;
        battleData.newGuildRank = message.guild_end_rank;
        battleData.totalHurt = message.once_hurt;
        return battleData;
    };
    export let parseArenaData = function (message, background) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_ARENA;
        battleData.needShowJump = true;
        battleData.background.push(1);
        battleData.defenseName = message.battle_report.defense_name;
        battleData.attackName = message.battle_report.attack_name;
        battleData.oldRank = message.old_rank || 0;
        battleData.newRank = message.new_rank || 0;
        battleData.attackPower = message.battle_report.attack_power;
        battleData.defensePower = message.battle_report.defense_power;
        battleData.attackBaseId = message.battle_report.attack_base_id;
        battleData.attackOffLevel = message.battle_report.attack_officer_level;
        battleData.defenseOffLevel = message.battle_report.defense_officer_level;
        battleData.defenseBaseId = message.battle_report.defense_base_id;
        battleData.firstOrder = message.battle_report.first_order;
        battleData.result = message.result || true;
        if (message.rewards) {

            for (let i = 0; i < message.rewards.length; i++) {
                let val = message.rewards[i];
                let award = {
                    type: val.type,
                    value: val.value,
                    size: val.size
                };
                battleData.awards.push(val);
            }
        }
        if (message.add_rewards) {
            for (let i = 0; i < message.add_rewards.length; i++) {
                let val = message.add_rewards[i];
                let addAward = {
                    index: val.index,
                    award: {
                        type: val.award.type,
                        value: val.award.value,
                        size: val.award.size
                    }
                };
                battleData.addAwards.push(addAward);
            }
        }
        return battleData;
    };
    export let parseFriendFight = function () {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_FRIEND;
        battleData.needShowJump = true;
        battleData.background.push(1);
        return battleData;
    };
    export let parseWorldBossFight = function (message, background?) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_WORLDBOSS;
        battleData.point = message.point;
        battleData.hurt = message.hurt;
        battleData.needShowJump = true;
        battleData.awards = [];
        if (message.award) {
            for (let i = 0; i < message.award.length; i++) {
                let val = message.award[i];
                let award = {
                    type: val.type,
                    value: val.value,
                    size: val.size
                };
                battleData.awards.push(val);
            }
        }
        battleData.background.push(1);
        return battleData;
    };
    export let parseWorldBossPoint = function (message, background?) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_WORLDBOSS_POINT;
        battleData.point = message.point;
        battleData.needShowJump = true;
        battleData.background.push(1);
        return battleData;
    };
    export let parseDailyBossData = function (message, background, needSkipFight) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_DAILY_BOSS;
        if (needSkipFight) {
            battleData.needShowJump = needSkipFight;
        }
        battleData.background.push(background);
        battleData.money = message.silver;
        battleData.exp = message.exp;
        if (message.awards) {
            for (let i = 0; i < message.awards.length; i++) {
                let val = message.awards[i];
                let award = {
                    type: val.type,
                    value: val.value,
                    size: val.size
                };
                battleData.awards.push(val);
            }
        }
        return battleData;
    };
    export let parseTerritoryBattleData = function (message, background) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_TERRITORY;
        battleData.money = 0;
        battleData.exp = message.exp || 0;
        battleData.needShowJump = true;
        battleData.background.push(1);
        if (message.awards) {
            for (let i = 0; i < message.awards.length; i++) {
                let val = message.awards[i];
                let award = {
                    type: val.type,
                    value: val.value,
                    size: val.size
                };
                battleData.awards.push(val);
            }
        }
        return battleData;
    };
    export let parseBattleReportData = function (message, background?) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_REPORT;
        battleData.background.push(1);
        battleData.needShowJump = true;
        battleData.attackName = message.attack.user.name;
        battleData.defenseName = message.defense.user.name;
        battleData.attackLevel = message.attack.user.officer_level;
        battleData.attackRank = message.attack_rank;
        battleData.defenseRank = message.defense_rank;
        battleData.defenseLevel = message.defense.user.officer_level;
        battleData.isWin = true;
        return battleData;
    };
    export let parseGuildDungeonBattleReportData = function (message, leftName, leftOfficer, rightName, rightOfficer, isWin) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_GUILD_REPORT;
        battleData.background.push(1);
        battleData.attackOffLevel = leftOfficer;
        battleData.defenseOffLevel = leftOfficer;
        battleData.defenseName = rightName;
        battleData.attackName = leftName;
        battleData.attackLevel = leftOfficer;
        battleData.defenseLevel = rightOfficer;
        battleData.isWin = isWin;
        battleData.needShowJump = true;
        return battleData;
    };
    export let parseExploreRebelBattleData = function (message, background) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_EXPLORE_REBEL;
        battleData.needShowJump = true;
        battleData.background.push(background);
        if (message.awards) {
            for (let i = 0; i < message.awards.length; i++) {
                let val = message.awards[i];
                if (val.type == TypeConvertHelper.TYPE_RESOURCE && val.value == DataConst.RES_EXP) {
                    battleData.exp = val.size;
                } else if (val.type == TypeConvertHelper.TYPE_RESOURCE && val.value == DataConst.RES_GOLD) {
                    battleData.money = val.size;
                } else {
                    let award = {
                        type: val.type,
                        value: val.value,
                        size: val.size
                    };
                    battleData.awards.push(val);
                }
            }
        }
        return battleData;
    };
    export let parseExploreBossBattleData = function (message, background) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_EXPLORE_BOSS;
        battleData.background.push(background);
        battleData.needShowJump = true;
        if (message.awards) {
            for (let i = 0; i < message.awards.length; i++) {
                let val = message.awards[i];
                if (val.type == TypeConvertHelper.TYPE_RESOURCE && val.value == DataConst.RES_EXP) {
                    battleData.exp = val.size;
                } else if (val.type == TypeConvertHelper.TYPE_RESOURCE && val.value == DataConst.RES_GOLD) {
                    battleData.money = val.size;
                } else {
                    let award = {
                        type: val.type,
                        value: val.value,
                        size: val.size
                    };
                    battleData.awards.push(val);
                }
            }
        }
        return battleData;
    };
    export let parseTowerSurprise = function (message, background) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_TOWER_SURPRISE;
        battleData.background.push(background);
        battleData.needShowJump = true;
        if (message.reward) {
            for (let i = 0; i < message.reward.length; i++) {
                let val = message.reward[i];
                if (val.type == TypeConvertHelper.TYPE_RESOURCE && val.value == DataConst.RES_GOLD) {
                    battleData.money = val.size;
                } else {
                    let award = {
                        type: val.type,
                        value: val.value,
                        size: val.size
                    };
                    battleData.awards.push(val);
                }
            }
        }
        return battleData;
    };
    export let parseFamousDungeon = function (message, stageData) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_GENERAL;
        let configData = stageData.getConfigData();
        let background = configData.in_res;
        let strArr = background.toString().split('|');
        for (let i = 0; i < strArr.length; i++) {
            let v = strArr[i];
            let number = parseFloat(v);
            battleData.background.push(number);
        }

        battleData.needShowJump = false;
        for (let i = 0; i < message.awards.length; i++) {
            let val = message.awards[i];
            let award = {
                type: val.type,
                value: val.value,
                size: val.size
            };
            battleData.awards.push(val);
        }
        return battleData;
    };

    export let parseGuildDungeon = function (message, atkName?, atkLevel?, defName?, defOfficer?) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_GUILD_DUNGEON;
        battleData.background.push(1);
        let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_DUNGEON_SKIP)[0];
        battleData.needShowJump = isOpen;
        for (let i = 0; i < message.rewards.length; i++) {
            let val = message.rewards[i];
            let award = {
                type: val.type,
                value: val.value,
                size: val.size
            };
            battleData.awards.push(award);
        }
        return battleData;
    };
    export let parseMineBattle = function (mineUser, background, selfData) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_MINE;
        let strArr = background.toString().split('|');
        for (let i = 0; i < strArr.length; i++) {
            let v = strArr[i];
            let number = parseFloat(v);
            battleData.background.push(number);
        }
        battleData.defenseOffLevel = mineUser.officer_level;
        battleData.defenseName = mineUser.user_name;
        battleData.needShowJump = true;
        battleData.selfData = selfData;
        return battleData;
    };
    export let parseGuildWar = function (message, attackUser, defenderUser) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_GUILD_WAR;
        battleData.background.push(1);
        battleData.needShowJump = true;
        battleData.defenseOffLevel = defenderUser.getOfficer_level();
        battleData.defenseName = defenderUser.getUser_name();
        battleData.isWin = message.report.is_win || false;
        let selfData = null;
        if (battleData.isWin) {
            selfData = {
                myBeginVit: attackUser.getWar_value(),
                myEndVit: attackUser.getWar_value() - 1,
                tarBeginVit: defenderUser.getWar_value(),
                tarEndVit: 0
            };
        } else {
            selfData = {
                myBeginVit: attackUser.getWar_value(),
                myEndVit: 0,
                tarBeginVit: defenderUser.getWar_value(),
                tarEndVit: defenderUser.getWar_value() - 1
            };
        }
        battleData.selfData = selfData;
        return battleData;
    };
    export let parseEnemyRevenge = function (message, background?) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_REVENGE;
        battleData.awards = message.awards || {};
        battleData.needShowJump = true;
        battleData.background.push(1);
        return battleData;
    };
    export let parseCampRace = function (leftName, rightName, leftOfficer, rightOfficer, winPos) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_CAMP_RACE;
        battleData.needShowJump = true;
        battleData.leftName = leftName;
        battleData.rightName = rightName;
        battleData.leftOfficer = leftOfficer;
        battleData.rightOfficer = rightOfficer;
        battleData.winPos = winPos;
        battleData.background.push(1);
        return battleData;
    };
    export let parseSingleRace = function (leftName, rightName, leftOfficer, rightOfficer, winPos) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_SINGLE_RACE;
        battleData.needShowJump = true;
        battleData.leftName = leftName;
        battleData.rightName = rightName;
        battleData.leftOfficer = leftOfficer;
        battleData.rightOfficer = rightOfficer;
        battleData.winPos = winPos;
        battleData.background.push(17);
        return battleData;
    };
    export let parseCountryBoss = function (message, background) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_COUNTRY_BOSS;
        battleData.hurt = message.hurt || 0;
        battleData.needShowJump = true;
        battleData.background.push(background);
        return battleData;
    };
    export let parseCountryBossIntercept = function (message, background) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_COUNTRY_BOSS_INTERCEPT;
        battleData.needShowJump = true;
        battleData.background.push(background);
        return battleData;
    };
    export let parseSeasonSportData = function (message, bJump) {
        let battleData = BattleDataHelper.getInitBattleData();
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_SEASON_FIGHTS;
        battleData.needShowJump = bJump;
        battleData.background.push(1);
        return battleData;
    };
}
