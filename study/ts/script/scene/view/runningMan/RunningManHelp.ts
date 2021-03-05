import { G_ServerTime, G_UserData } from "../../../init";
import { RunningManConst } from "../../../const/RunningManConst";
import { ArraySort } from "../../../utils/handler";

export namespace RunningManHelp {

    export function getRunningState() {
        var currTime = G_ServerTime.getTime();
        let currTimeMis = G_ServerTime.getTimeElapsed();
        var startTime = G_UserData.getRunningMan().getStart_time();
        var endTime = G_UserData.getRunningMan().getEnd_time();
        var betEndTime = G_UserData.getRunningMan().getBet_end();
        var matchStart = G_UserData.getRunningMan().getMatch_start();
        var matchEnd = G_UserData.getRunningMan().getMatch_end();
        if (currTime <= startTime) {
            return RunningManConst.RUNNING_STATE_PRE_START;
        }
        if (currTime >= endTime) {
            return RunningManConst.RUNNING_STATE_END;
        }
        if (currTime >= startTime && currTime <= betEndTime) {
            return RunningManConst.RUNNING_STATE_BET;
        }
        if (currTimeMis >= betEndTime && currTimeMis <= matchStart) {
            return RunningManConst.RUNNING_STATE_WAIT;
        }
        if (currTimeMis >= matchStart && currTimeMis <= matchEnd) {
            return RunningManConst.RUNNING_STATE_RUNNING;
        }
        if (currTimeMis >= matchEnd && currTimeMis <= endTime) {
            return RunningManConst.RUNNING_STATE_RUNNING_END;
        }
        return RunningManConst.RUNNING_STATE_END;
    };
    export function getRunningRank(heroId) {
        var runningList = G_UserData.getRunningMan().getMatch_info();
        ArraySort(runningList, function (value1, value2) {
            return value1.getRunningDistance() > value2.getRunningDistance();
        });
        for (let i in runningList) {
            var value = runningList[i];
            if (value.getHero_id() == heroId) {
                return i;
            }
        }
    };
    export function getTopUnitDistance() {
        var runningList = G_UserData.getRunningMan().getMatch_info();
        var [runningTable, index] = RunningManHelp.runningProcess();
        return runningList[index];
    };
    export function runningProcess(): any[] {
        var maxDistance = G_UserData.getRunningMan().getMaxDistance();
        var runningTable = [];
        var runningList = G_UserData.getRunningMan().getMatch_info();
        ArraySort(runningList, function (value1, value2) {
            return value1.getRunningTime() < value2.getRunningTime();
        });
        var maxIndex = 0;
        var maxPercent = 0;
        for (let i = 0; i < runningList.length; i++) {
            var unitData = runningList[i];
            var distance = unitData.getRunningDistance();
            var percent = distance / maxDistance;
            runningTable.push({
                dist: distance,
                maxDist: maxDistance,
                percent: percent,
                roadNum: unitData.getRoad_num(),
                runningTime: unitData.getRunningTime()
            });
            if (maxPercent < percent) {
                maxIndex = i;
                maxPercent = percent;
            }
        }
        return [
            runningTable,
            maxIndex
        ];
    };
    export function getRunningResult(heroId) {
        var retTable: any = {};
        var unitData = G_UserData.getRunningMan().getRunningUnit(heroId);
        retTable.heroId = heroId;
        retTable.time = unitData.getRunningTime();
        var betInfo = G_UserData.getRunningMan().getBetInfo(heroId);
        if (betInfo) {
            retTable.heroOdds = betInfo.heroOdds;
            retTable.isPlayer = betInfo.isPlayer;
            retTable.user = betInfo.user;
        }
        return retTable;
    };
    export function getRunningFinishList(runEndList?: any[]) {
        var retTable = [];
        var state = RunningManHelp.getRunningState();
        if (state == RunningManConst.RUNNING_STATE_PRE_START) {
            var lastListInfo = G_UserData.getRunningMan().getLastMatchInfo();
            return lastListInfo;
        }
        function getHeroId(heroData) {
            if (heroData.isPlayer == 1) {
                return heroData.user.user_id;
            }
            return heroData.heroId;
        }
        function isInRunEndList(heroData) {
            if (runEndList && runEndList.length > 0) {
                var heroId = getHeroId(heroData);
                if (runEndList[heroId] != null) {
                    return true;
                }
            }
            return false;
        }
        var runningList = G_UserData.getRunningMan().getMatch_info();
        if (runningList && runningList.length > 0) {
            ArraySort(runningList, function (item1, item2) {
                return item1.getRank() < item2.getRank();
            });
            for (let i in runningList) {
                var value = runningList[i];
                if (value.isRunning() == false) {
                    var tempTable = RunningManHelp.getRunningResult(value.getHero_id());
                    if (isInRunEndList(tempTable) == false) {
                        retTable.push(tempTable);
                    }
                }
            }
        }
        return retTable;
    };
}