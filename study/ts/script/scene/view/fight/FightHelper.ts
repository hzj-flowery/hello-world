import { G_ConfigLoader, G_UserData, G_StorageManager } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { UserBaseData } from "../../../data/UserBaseData";
import FightEngine from "../../../fight/FightEngine";
import { BattleDataHelper } from "../../../utils/data/BattleDataHelper";
import { StoryChatConst } from "../../../const/StoryChatConst";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { FunctionConst } from "../../../const/FunctionConst";

export default class FightHelper {

    private SpeedCount = 4;
    private hpOutFile: any[];

    public processData(battleData, report) {
        battleData.star = report.getStar();
        battleData.loseType = report.getLoseType();
    }
    public checkMonsterTalk(monsterTeamId, battleStar): any[] {
        if (monsterTeamId == 0) {
            return [false, false, null];
        }
        let MonsterTalk = G_ConfigLoader.getConfig(ConfigNameConst.MONSTER_TALK);
        var count = MonsterTalk.length();
        var userLevel = G_UserData.getBase().getLevel();
        for (var i = 0; i < count; i++) {
            var talkConfig = MonsterTalk.indexOf(i);
            if (userLevel > talkConfig.lv_min && userLevel <= talkConfig.lv_max && talkConfig.teamid == monsterTeamId) {
                if (battleStar == 0) {
                    return [true, true, talkConfig];
                    // fightEngine.addLoseTalk(talkConfig);
                }
                if (talkConfig.battle == '9') {
                    return [true, false, talkConfig];
                    // fightEngine.addMonsterTalk(talkConfig);
                } else {
                    var star = talkConfig.battle.split('|');
                    for (let j = 0; j < star.length; j++) {
                        var v = star[j];
                        if (parseInt(v) == battleStar) {
                            return [true, false, talkConfig];
                            // fightEngine.addMonsterTalk(talkConfig);
                            break;
                        }
                    }
                }
            }
        }
        return [false, false, null];
    }
    public checkSpeedLead() {
        let lead = null;
        let args: any[] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_BATTLE_SPEED_2);
        let isDoubleOpen = args[0];
        let functionInfoDouble = args[2];

        args = FunctionCheck.funcIsOpened(FunctionConst.FUNC_BATTLE_SPEED_3);
        let isTripleOpen = args[0];
        let functionInfoTriple = args[2];

        args = FunctionCheck.funcIsOpened(FunctionConst.FUNC_BATTLE_SPEED_4);
        let isQuadruple = args[0];
        let functionInfoQuadruple = args[2];

        let userLevel = G_UserData.getBase().getLevel();
        let params = G_StorageManager.loadUser('lead_speed') || {};
        let hasLeadDouble = params.leadDouble || 0;
        let hasleadTriple = params.leadTriple || 0;
        let hasleadQuadruple = params.leadQuadruple || 0;
        if (isDoubleOpen && userLevel <= functionInfoDouble.level + 1 && hasLeadDouble == 0) {
            lead = 2;
        } else if (isTripleOpen && userLevel <= functionInfoTriple.level + 1 && hasleadTriple == 0) {
            lead = 3;
        } else if (isQuadruple && userLevel <= functionInfoQuadruple.level + 1 && hasleadQuadruple == 0) {
            lead = 4;
        }
        return lead;
    }
    public writeSpeedLead(leadType) {
        var lead = [
            0,
            0,
            0
        ];
        for (var i = 0; i < leadType - 1; i++) {
            if (lead[i] != null) {
                lead[i] = 1;
            }
        }
        G_StorageManager.saveWithUser('lead_speed', {
            leadDouble: lead[0],
            leadTriple: lead[1],
            leadQuadruple: lead[2]
        });
    }

    public checkIsChatType(battleType) {
        if (battleType == BattleDataHelper.BATTLE_TYPE_NORMAL_DUNGEON || battleType == BattleDataHelper.BATTLE_TYPE_FAMOUS || battleType == BattleDataHelper.BATTLE_TYPE_GENERAL) {
            return true;
        }
        return false;
    }

    public checkStoryChat(fightEngine: FightEngine, checkType, waveId, stageId, isWin, heroId): any[] {
        let StoryTouch = G_ConfigLoader.getConfig(ConfigNameConst.STORY_TOUCH);
        var count = StoryTouch.length();
        for (var i = 0; i < count; i++) {
            var touch = StoryTouch.indexOf(i);
            if (touch.control_value1 == stageId && touch.control_type == checkType) {
                if (checkType == StoryChatConst.TYPE_BEFORE_FIGHT) {
                    if (touch.control_value2 == waveId) {
                        return [false, touch.story_touch];
                    }
                } else if (checkType == StoryChatConst.TYPE_WIN) {
                    if (isWin && touch.control_value2 == waveId) {
                        return [false, touch.story_touch];
                    }
                } else if (checkType == StoryChatConst.TYPE_MONSTER_DIE) {
                    if (heroId == touch.hero_id) {
                        //Engine.getEngine():pause()
                        return [true, touch.story_touch];
                    }
                } else if (checkType == StoryChatConst.TYPE_START_ATTACK) {
                    if (heroId == touch.hero_id && waveId == touch.control_value2) {
                        return [false, touch.story_touch];
                    }
                } else if (checkType == StoryChatConst.TYPE_ENTER_STAGE) {
                    if (heroId == touch.hero_id) {
                        return [false, touch.story_touch];
                    }
                }
            }
        }
        return [false, null];
    }
    public getFightSpeed() {
        var params = G_StorageManager.loadUser('battle_speed') || {};
        var openState = [
            FunctionCheck.funcIsOpened(FunctionConst.FUNC_BATTLE_SPEED_2)[0],
            FunctionCheck.funcIsOpened(FunctionConst.FUNC_BATTLE_SPEED_3)[0],
            FunctionCheck.funcIsOpened(FunctionConst.FUNC_BATTLE_SPEED_4)[0]
        ];
        var maxSpeed = 1;
        for (var i = 0; i < openState.length; i++) {
            if (openState[i] == true) {
                maxSpeed = i + 2;
            }
        }
        var showUI = openState[0];
        var manual = params.manual || 0;
        var double = params.double || 1;
        if (manual == 1) {
            if (params.double <= maxSpeed) {
                return [
                    params.double,
                    showUI
                ];
            }
        }
        if (manual != 1 && maxSpeed > double) {
            this.writeSpeedFile(maxSpeed);
        }
        return [
            maxSpeed,
            showUI
        ];
    }
    public checkNextSpeed(nowSpeed) {
        var nextSpeed = nowSpeed + 1;
        nextSpeed = (nextSpeed - 1) % this.SpeedCount + 1;
        if (nextSpeed == 1) {
            return [
                true,
                nextSpeed,
                null
            ];
        }
        let args: any[] = FunctionCheck.funcIsOpened(FunctionConst['FUNC_BATTLE_SPEED_' + nextSpeed]);
        let ret = args[0];
        let errMsg = args[1];
        if (!ret) {
            nextSpeed = 1;
        }
        return [
            ret,
            nextSpeed,
            errMsg
        ];
    }
    public writeSpeedFile(speed, isManual?) {
        var m = 0;
        if (isManual) {
            m = 1;
        }

        G_StorageManager.saveWithUser('battle_speed', {
            double: speed,
            manual: m
        });
    }
    public pushDamageData(data) {
        if (!this.hpOutFile) {
            this.hpOutFile = [];
        }
        this.hpOutFile.push(data);
    };
    public saveHpTestFile(name) {
        var filename = name || 'damage_test.json';
        G_StorageManager.save(filename, this.hpOutFile);
        this.hpOutFile = [];
    };
}