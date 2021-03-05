import { Colors, G_ConfigLoader, G_UserData, G_ServerTime } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import ParameterIDConst from "../../../const/ParameterIDConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import { Lang } from "../../../lang/Lang";
import { TextHelper } from "../../../utils/TextHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { TimeConst } from "../../../const/TimeConst";
import Greedy from "../../../utils/luagraphs/Greedy";

function bezierFix(posStart, posMid, posEnd, t) {
    return Math.pow(1 - t, 2) * posStart + 2 * t * (1 - t) * posMid + Math.pow(t, 2) * posEnd;
};
function bezierAngle(posStart, posEnd, t) {
    return posStart + (posEnd - posStart) * t;
};

export namespace MineCraftHelper {
    export const CenterPoint = 100;
    export const TYPE_MAIN_CITY = 2;
    export const  ARMY_TO_LEAVE = 50;
    export const RESOURCE_FONT_SIZE = 18;

    export function getStateColor(state) {
        let color = state + 1;
        return Colors.getMineStateColor(color);
    };

    export function  getRoad2(startId, endId) {
        var graph = G_UserData.getMineCraftData().getMineGraph();
        var shortestPath = Greedy.findPath(startId, endId, graph);
        shortestPath.splice(0,1);
        return shortestPath;
    };

    export function getRoad(startId, endId) {
        let roads = G_UserData.getMineCraftData().getMineRoads();
        var getRoadByIndex = function(road, startIdx:number, endIdx:number) {
            let path = [];
            if (startIdx > endIdx) {
                for (let i = startIdx - 1; i >= endIdx; i += -1) {
                    path.push(road[i]);
                }
            } else {
                for (let i = startIdx + 1; i <= endIdx; i++) {
                    path.push(road[i]);
                }
            }
            return path;
        }
        var getRoadArray = function(startId:number, endId:number) {
            let distance = 100;
            let retRoad = null;
            for (let index in roads) {
                let road = roads[index];
                let startIndex:number = null;
                let endIndex:number = null;
                for (let idx=0;idx<road.length;idx++) {
                    let v = road[idx];
                    if (startId == v) {
                        startIndex = idx;
                    }
                    if (endId == v) {
                        endIndex = idx;
                    }
                    if (startIndex!=null && endIndex!=null) {
                        let dis = Math.abs(startIndex - endIndex);
                        if (dis < distance) {
                            distance = dis;
                            retRoad = getRoadByIndex(road, startIndex, endIndex);
                        }
                    }
                }
            }
            return retRoad;
        }
        let startType = Math.floor(startId / 100);
        let endType = Math.floor(endId / 100);
        if (startType != endType) {
            let road1 = getRoadArray(startId, MineCraftHelper.CenterPoint);
            let road2 = getRoadArray(MineCraftHelper.CenterPoint, endId);
            for (let j in road2) {
                let id = road2[j];
                road1.push(id);
            }
            return road1;
        } else {
            let retRoad = getRoadArray(startId, endId);
            if (retRoad) {
                return retRoad;
            }
            let containRoad = [];
            for (let index in roads) {
                let road = roads[index];
                for (let i in road) {
                    let v = road[i];
                    if (v == startId) {
                        containRoad.push(road);
                    }
                }
            }
            let distance = 100;
            let road2 = null;
            let startPt = null;
            for (let index in containRoad) {
                let road = containRoad[index];
                for (let i in road) {
                    let v = road[i];
                    let secondRoad = getRoadArray(v, endId);
                    if (secondRoad && secondRoad.length < distance) {
                        distance = secondRoad.length;
                        road2 = secondRoad;
                        startPt = v;
                    }
                }
            }
            let road1 = getRoadArray(startId, startPt);
            for (let i in road2) {
                let v = road2[i];
                road1.push(v);
            }
            return road1;
        }
    };
    export function getBezierPosition(bezier, t) {
        let xa = bezier[0].x;
        let xb = bezier[1].x;
        let xc = bezier[2].x;
        let ya = bezier[0].y;
        let yb = bezier[1].y;
        let yc = bezier[2].y;
        let posx1 = bezierAngle(xa, xb, t);
        let posy1 = bezierAngle(ya, yb, t);
        let posx2 = bezierAngle(xb, xc, t);
        let posy2 = bezierAngle(yb, yc, t);
        let angle = Math.atan2(posy2 - posy1, posx2 - posx1);
        let angleRet = -Math.floor(angle * 180 / 3.14);
        return [
            bezierFix(xa, xb, xc, t),
            bezierFix(ya, yb, yc, t),
            angleRet
        ];
    };
    export function isShowMoneyIcon() {
        let serverGetMoneyTime = G_UserData.getMineCraftData().getSelfLastTime();
        let nowTime = G_ServerTime.getTime();
        let timeDuration = nowTime - serverGetMoneyTime;
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        let param = Parameter.get(ParameterIDConst.MINE_HAVEST_TIME);
        console.assert(param, 'wrong param id = ' + ParameterIDConst.MINE_HAVEST_TIME);
        let defautTime = Number(param.content);
        if (timeDuration <= defautTime) {
            return false;
        }
        return true;
    };
    export function openAlertDlg(title, content) {
        //TODO:
        // let popupSystemAlert = new (require('PopupSystemAlert'))(title, content);
        // popupSystemAlert.showGoButton(Lang.get('fight_kill_comfirm'));
        // popupSystemAlert.setCheckBoxVisible(false);
        // popupSystemAlert.openWithAction();
    };
    export function getOutputState(mineData) {
        let [outputConfig,baseOutput] = mineData.getMineStateConfig();
        let minus = (outputConfig.output_change - baseOutput.output_change) / 10;
        let guildId = mineData.getGuildId();
        let add = 0;
        let onlyAdd = 0;
        if (guildId != 0) {
            let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
            let parameterContent = Parameter.get(ParameterIDConst.MINE_OUTPUT_ADD);
            console.assert(parameterContent, 'not id, ' + ParameterIDConst.MINE_OUTPUT_ADD);
            add = Number(parameterContent.content) / 10;
            if (mineData.isOwn()) {
                let parameterContent = Parameter.get(ParameterIDConst.MINE_ONLY_GUILD);
                console.assert(parameterContent, 'not id, ' + ParameterIDConst.MINE_ONLY_GUILD);
                onlyAdd = Number(parameterContent.content) / 10;
            }
        }
        let baseOutputSec = baseOutput.output / 100000;
        let double = mineData.getMultiple();
        if (double >= 2) {
            baseOutputSec = baseOutputSec * double;
        }
        return [
            baseOutputSec,
            minus,
            add,
            onlyAdd,
            outputConfig.description
        ];
    };
    export function getSelfOutputSec() {
        let mineData = G_UserData.getMineCraftData().getMyMineData();
        let [ baseOutputSec, minus, add, onlyAdd ] = MineCraftHelper.getOutputState(mineData);
        let change = 100 + minus;
        if (mineData.isMyGuildMine()) {
            change = change + add + onlyAdd;
        }
        let outputSec = baseOutputSec * change / 100;
        return outputSec;
    };
    export function getOutputDetail(mineId) {
        let mineData = G_UserData.getMineCraftData().getMineDataById(mineId);
        let [ baseOutputSec, minus, add, onlyAdd, des ] = MineCraftHelper.getOutputState(mineData);
        let change = 100 + minus;
        if (mineData.isMyGuildMine()) {
            change = change + add + onlyAdd;
        }
        let outputSec = baseOutputSec * change / 100;
        let outputDay = Math.floor(outputSec * 86400 / 10) * 10;
        let strOutputDay = Lang.get('mine_day_money', { count: outputDay });
        let finalChange = minus + add + onlyAdd;
        return [
            finalChange,
            add,
            onlyAdd,
            minus,
            outputDay,
            strOutputDay,
            des
        ];
    };
    export function getNeedArmy() {
        let nowArmy = G_UserData.getMineCraftData().getMyArmyValue();
        let maxArmy = Number(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.TROOP_MAX).content);
        if (G_UserData.getMineCraftData().isSelfPrivilege()) {
            let soilderAdd = MineCraftHelper.getParameterContent(ParameterIDConst.MINE_CRAFT_SOILDERADD);
            maxArmy = maxArmy + soilderAdd;
        }
        return maxArmy - nowArmy;
    };
    export function getMoneyDetail(output) {
        let serverMoney = G_UserData.getMineCraftData().getSelfMoney();
        let serverMoneyTime = G_UserData.getMineCraftData().getSelfLastProduceTime();
        let serverGetMoneyTime = G_UserData.getMineCraftData().getSelfLastTime();
        let nowTime = G_ServerTime.getTime();
        let timeDiff = nowTime - serverMoneyTime;
        let getTimeDiff = nowTime - serverGetMoneyTime;
        let timeLimit = Number(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.MINE_TIME_LIMIT).content);
        if (getTimeDiff > timeLimit) {
            getTimeDiff = timeLimit;
            let overTime = nowTime - serverGetMoneyTime - timeLimit;
            timeDiff = timeDiff - overTime;
            if (timeDiff < 0) {
                timeDiff = 0;
            }
        }
        let moneyCount = Math.floor(serverMoney / 100000 + timeDiff * output);
        let moneyText = TextHelper.getAmountText3(moneyCount);
        let nowMoneyDetail = serverMoney / 100000 + timeDiff * output - moneyCount;
        let percent = nowMoneyDetail * 100;
        if (getTimeDiff == timeLimit) {
            percent = 100;
        }
        return [
            moneyCount,
            moneyText,
            percent
        ];
    };
    export function getBuyArmyDetail() {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        let food = null;
        let money = null;
        let nowArmy = G_UserData.getMineCraftData().getMyArmyValue();
        let maxArmy = Number(Parameter.get(ParameterIDConst.TROOP_MAX).content);
        if (G_UserData.getMineCraftData().isSelfPrivilege()) {
            let soilderAdd = MineCraftHelper.getParameterContent(ParameterIDConst.MINE_CRAFT_SOILDERADD);
            maxArmy = maxArmy + soilderAdd;
        }
        let needFood = maxArmy - nowArmy;
        let maxFood = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD);
        let goldToFood = Number(Parameter.get(ParameterIDConst.MINE_GOLD_TO_FOOD).content);
        if (maxFood >= needFood) {
            food = needFood;
        } else if (maxFood == 0) {
            money = goldToFood * needFood;
        } else {
            food = maxFood;
            money = (needFood - maxFood) * goldToFood;
        }
        return [
            food,
            money,
            needFood
        ];
    };
    export function getParameterContent(constId) {
        return UserDataHelper.getParameter(constId);
    };
    export function getPrivilegeVipCfg() {
        let VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
        let privilegeCfg = VipPay.get(10098);
        console.assert(privilegeCfg, 'vip_pay id = ' + 10098);
        return privilegeCfg;
    };

     export function  getInfameReduceRelative() {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var reduceVip = Parameter.get(ParameterIDConst.PEACE_VIPEVIL_REDUCE).content;
        var reduceNormal = Parameter.get(ParameterIDConst.PEACE_EVIL_REDUCE).content;
        var arrayVip = reduceVip.split('|');
        var arrayNormal = reduceNormal.split('|');
        var rateVip = arrayVip[1] / arrayVip[0];
        var rateNormal = arrayNormal[1] / arrayNormal[0];
        return rateVip / rateNormal;
    };
     export function  getInfameRelative() {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var maxVip = parseInt(Parameter.get(ParameterIDConst.PEACE_EVIL_VIPLIMIT).content);
        var maxNormal = parseInt(Parameter.get(ParameterIDConst.PEACE_EVIL_LIMIT).content);
        return maxVip - maxNormal;
    };
     export function  getInfameCfg(bIsVip) {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var content = '';
        if (bIsVip) {
            content = Parameter.get(ParameterIDConst.PEACE_VIPEVIL_REDUCE).content;
        } else {
            content = Parameter.get(ParameterIDConst.PEACE_EVIL_REDUCE).content;
        }
        var array = content.split('|');
        return [
            parseInt(array[0]),
            parseInt(array[1])
        ];
    };
     export function  getMaxInfameValue(bIsVip) {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var content = '';
        if (bIsVip) {
            content = Parameter.get(ParameterIDConst.PEACE_EVIL_VIPLIMIT).content;
        } else {
            content = Parameter.get(ParameterIDConst.PEACE_EVIL_LIMIT).content;
        }
        return parseInt(content);
    };
     export function  getGoldMineRefreshTime() {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var content = Parameter.get(ParameterIDConst.OUTPUT_UP_REFRESH).content;
        var array = content.split('|');
        return parseInt(array[0]) * 3600 + parseInt(array[1]) + parseInt(array[2]);
    };
     export function  getPeaceRefreshTimeOffset() {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        return parseInt(Parameter.get(ParameterIDConst.PEACE_BEGIN).content);
    };
     export function  getInfameValueAddPerAttack() {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        return parseInt(Parameter.get(ParameterIDConst.PEACE_EVIL).content);
    };
     export function  getNextPeaceStartTime() {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var content = Parameter.get(ParameterIDConst.PEACE_WEEK).content;
        var array = content.split('|');
        var weekRefreshTime = [];
        var goldMineRefreshTime = MineCraftHelper.getGoldMineRefreshTime();
        var peaceRefreshTime = MineCraftHelper.getPeaceRefreshTimeOffset();
        for (let k in array) {
            var v = parseInt(array[k]);
            var time = G_ServerTime.getTimeByWdayandSecond(v + 1, goldMineRefreshTime + peaceRefreshTime);
            weekRefreshTime.push(time);
        }
        var nextRefreshTime = 0;
        var index = 1;
        var curTime = G_ServerTime.getTime();
        while (index <= weekRefreshTime.length) {
            if (curTime < weekRefreshTime[index]) {
                nextRefreshTime = weekRefreshTime[index];
                break;
            }
            index = index + 1;
        }
        if (index == weekRefreshTime.length + 1) {
            nextRefreshTime = weekRefreshTime[1] + TimeConst.SECONDS_ONE_WEEK;
        }
        return nextRefreshTime;
    };

}