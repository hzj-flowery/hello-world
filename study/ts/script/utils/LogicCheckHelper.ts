
import { assert, unpack } from "./GlobleFunc";
import { UserCheck } from "./logic/UserCheck";
import { ShopCheck } from "./logic/ShopCheck";
import { ChatCheck } from "./logic/ChatCheck";
import { GuildCheck } from "./logic/GuildCheck";
import { DailyDungeonCheck } from "./logic/DailyDungeonCheck";
import { TowerCheck } from "./logic/TowerCheck";
import { GuildWarCheck } from "./logic/GuildWarCheck";
import { FunctionCheck } from "./logic/FunctionCheck";
import { G_Prompt } from "../init";

interface ILogicCheckHelper {
    chatMsgSendCheck?(sendMsgChannel, popHint, ignoreCD?, msgType?)
    isDailyDungeonCanFight?(type, popHint)
    isDailyDungeonLevelEnough?(type, popHint)
    isDailyDungeonInOpenTime?(type, popHint)
    isDailyDungeonCountEnough?(type, popHint)
    getFunctionUpdateTime?(timeStr: string)
    functionOpen?(funcId, callback)
    funcIsOpened?(funcId, callback?, userLastLevel?): any[]
    funcIsShow?(funcId, callback?)
    checkGuildCanSnatchRedPacket?(popHint)
    checkGuildDungeonHasEnoughMember?(popHint)
    checkGuildDungeonInOpenTime?(popHint)
    checkGuildModuleIsOpen?(moduleId, popHint?): (boolean | Function)[]
    guildWarCanProclaim?(cityId, popHint)
    guildWarCheckActTime?(popHint)
    guildWarCheckMoveCD?(cityId, popHint)
    guildWarCheckRebornCD?(cityId, popHint)
    guildWarCheckAttackCD?(cityId, popHint)
    guildWarCanSeek?(cityId, pointId, popHint)
    guildWarCanShowPoint?(cityId, pointId, popHint)
    guildWarCheckIsCanMovePoint?(cityId, pointId, popHint)
    guildWarCanMove?(cityId, pointId, ignoreCD, popHint)
    guildWarCanAttackPoint?(cityId, pointId, ignoreCD, popHint)
    guildWarCanAttackUser?(cityId, otherGuildWarUser, popHint)
    guildWarCanExit?(cityId, popHint)
    checkPhone?(num: string, popHint)
    checkName?(num: string, popHint)
    checkBirthday?(num: string, popHint)
    checkQQ?(num, popHint)
    shopFixBtnCheck?(shopFixData)
    shopFixBtnCheckExt?(shopFixData)
    shopFixBuyCheck?(shopFixData, buyTimes, showErrorDlg)
    shopRandomBtnCheck?(shopRandomData)
    shopRandomBuyCheck?(shopRandomData)
    shoplevelShow?(levelShow)
    shoplevelMin?(levelMin)
    shoplevelMinExt?(levelMin)
    shoplevelMax?(levelMax)
    shopEnoughLimit?(limitType, limitValue)
    shopNumBanType?(banType, buyCount, vipTimes)
    shopGoodsLack?(type, value)
    shopHeroInBattle?(shopId, callback, refreshType)
    shopIsFreeRefresh?(shopId, callback)
    shopHasRefreshToken?(shopId, callback)
    shopHasRefreshCost?(shopId, callback)
    shopRefreshBtnCheck?(shopId, callback)
    shopCheckShopBuyRes?(itemType, itemValue, onlyShowTips?)
    checkTowerCanChallenge?(layerId, popHint?)
    init?()

    //UserCheck
    isLevelUp?(callback)
    enoughLevel?(currLv)
    enoughOpenDay?(openDay, resetTime?)
    enoughLastLevel?(funcLevel)
    enoughVip?(vip)
    enoughMoney?(needMoney, popupDlg?): any[]
    enoughSoul?(needSoul, popupDlg)
    enoughJade?(needValue, popupDlg)
    enoughManna?(needValue, popupDlg)
    enoughBaowuzhihun?(needValue, popupDlg)
    enoughEquipStone?(needValue, popupDlg)
    enoughHoner?(needValue, popupDlg)
    enoughGongXian?(needValue, popupDlg)
    enoughSupportTicket?(needValue, popupDlg)
    enoughHorseWhistle?(needValue, popupDlg)
    enoughHorseWhistleFragment?(needValue, popupDlg)
    enoughCash?(needCash, popupDlg?)
    enoughRecruitToken?(needToken)
    enoughAvatarActivityToken?(needToken)
    getNormalFailDialog?(type, value)
    enoughVit?(needVit)
    enoughArmyFood?(needFood)
    enoughArmyToken?(needCount)
    enoughSiegeToken?(needCount)
    enoughSpirit?(needSprite)
    enoughTowerCount?(needCount)
    timeExpire?(checkTime)
    isPackageFull?(type, value, size)
    isHeroFull?()
    isEquipmentFull?()
    isTreasureFull?()
    isInstrumentFull?()
    isHorseFull?()
    isPackFull?(itemType, itemValue?)
    checkBeforeUseItem?(itemId)
    checkPackFullByBoxId?(boxId, itemId): any
    checkPackFullByDropId?(dropId)
    checkPackFullByAwards?(awards)
    getLeftPackCapacity?(itemType): any
    checkOfficialLevelUp?()
    commonEnoughResValue?(checkSize, resId)
    _getResourceFailDlg?(checkType, checkValue, checkSize)
    enoughValue?(checkType, checkValue, checkSize, popupDlg?)
    vipFuncIsOpened?(funcType, callback)
    _getVipFuncDlg?(funcType, vipLevel)
    vipTimesOutCheck?(funcType, times, shopTip, notShowVipDialog?)
    resCheck?(resValue, checkSize, popupDlg?)
    isResReachTimeLimit?(resValue)
    isResReachMaxLimit?(resValue)
    enoughValueList?(resValueList, popupDlg)


    //LogicCheckHelper
    _procCheckList(funcName, value)
    doCheckListExt(p, c)
    _procCheck(funcName, value)
    doCheckList(params, callBack?: Function)
    doCheck(funcName, params, callBack?)
    doExample()
    initAllCheckers();
}

export let LogicCheckHelper: ILogicCheckHelper = {

    //逻辑检查帮助类
    //外部调用
    //根据函数名处理逻辑
    _procCheckList(funcName, value) {
        let checkFunc = LogicCheckHelper[funcName] as Function;
        if (checkFunc && typeof checkFunc == 'function') {
            let typeStr = typeof value;
            if (typeStr == 'object') {
                let param = value.param;
                if (param && param.length == undefined) {
                    param = [param];
                }
                let errorMsg = value.errorMsg;
                if (param) {
                    let ok, msg;
                    let result = checkFunc.apply(null, param);
                    if (result.length != undefined) {
                        if (result.length > 0) {
                            ok = result[0];
                        }
                        if (result.length > 1) {
                            msg = result[1];
                        }
                    } else {
                        ok = result;
                    }
                    return [
                        ok,
                        msg || errorMsg
                    ];
                } else {
                    let ok, msg;
                    let result = checkFunc(null);
                    if (result.length != undefined) {
                        if (result.length > 0) {
                            ok = result[0];
                        }
                        if (result.length > 1) {
                            msg = result[1];
                        }
                    } else {
                        ok = result;
                    }
                    return [
                        ok,
                        msg || errorMsg
                    ];
                }
            }
        } else {
            return [
                null,
                null
            ];
            //assert((checkFunc, 'LogicCheckHelper._procCheck checkFunc not find funcName is : ' + funcName);
        }
    },
    //根据函数名处理逻辑
    _procCheck(funcName, value) {
        let checkFunc = LogicCheckHelper[funcName];
        if (checkFunc && typeof checkFunc == 'function') {
            let typeStr = typeof value;
            if (typeStr == 'object') {
                let param = value.param;
                if (param && typeof param != 'object') {
                    param = [param];
                }
                let errorMsg = value.errorMsg;
                let result = checkFunc.apply(null, param);
                let ok, msg;
                if (result && result.length > 0) {
                    ok = result[0];
                    msg = result[1];
                } else {
                    ok = result;
                }

                return [
                    ok,
                    msg || errorMsg
                ];
            } else {
                let [ok, msg] = checkFunc(null);
                return [
                    ok,
                    msg
                ];
            }
        } else {
            //assert((checkFunc, 'LogicCheckHelper._procCheck checkFunc not find funcName is : ' + funcName);
        }
    },
    doCheckList(params, callBack?: Function) {
        for (let key in params) {
            let value = params[key];
            let funcName = value.funcName;
            let [checkValue, errorMsg] = LogicCheckHelper._procCheckList(funcName, value);
            if (checkValue == false) {
                //console.warn('check function name %s, ===============================Begin'.format(funcName));
                //console.log(params);
                //console.warn('check function name %s, ===============================End'.format(funcName));
                if (callBack && typeof callBack == 'function') {
                    callBack(checkValue, errorMsg, funcName);
                }
                return [
                    false,
                    errorMsg,
                    funcName
                ];
            }
        }
        if (callBack && typeof callBack == 'function') {
            callBack(true);
        }
        return [true];
    },
    doCheckListExt(params, callback) {
        var result = true;
        var errorMsgs = [];
        var funcNames = [];
        for (var key in params) {
            var value = params[key];
            var funcName = value.funcName;
            var [checkValue, errorMsg] = LogicCheckHelper._procCheckList(funcName, value);
            if (checkValue == false) {
                result = false;
                // logWarn(string.format('check function name %s, ===============================Begin', funcName));
                // dump(params);
                // logWarn(string.format('check function name %s, ===============================End', funcName));
                if (callback && typeof (callback) == 'function') {
                    callback(checkValue, errorMsg, funcName);
                }
                errorMsgs.push(errorMsg);
                funcNames[funcName] = 1;
            }
        }
        if (callback && typeof (callback) == 'function') {
            callback(true);
        }
        return [
            result,
            errorMsgs,
            funcNames
        ];
    },
    doCheck(funcName, params, callBack?) {
        let [checkValue, errorMsg] = LogicCheckHelper._procCheck(funcName, params);
        if (callBack && typeof callBack == 'function') {
            callBack(checkValue, errorMsg, funcName);
        }
        return [
            checkValue,
            errorMsg
        ];
    },
    doExample() {
        let checkParams = {
            [1]: {
                funcName: 'enoughLevel',
                param: 10,
                errorMsg: 'level not enough'
            },
            [2]: {
                funcName: 'enoughMoney',
                param: 100,
                errorMsg: 'money not enough'
            },
            [3]: {
                funcName: 'enoughCash',
                param: 10,
                errorMsg: 'cash not enough'
            }
        };
        let [success, errorMsg] = LogicCheckHelper.doCheckList(checkParams, function (errorMsg) {
            console.debug('LogicCheckHelper.doCheckList check ok');
        });
        let checkParams2 = {
            [1]: {
                funcName: 'enoughLevel',
                param: 1,
                errorMsg: 'level not enough'
            },
            [2]: {
                funcName: 'enoughMoney',
                param: 100,
                errorMsg: 'money not enough'
            },
            [3]: {
                funcName: 'enoughCash',
                param: 99999999,
                errorMsg: 'cash not enough'
            }
        };
        [success, errorMsg] = LogicCheckHelper.doCheckList(checkParams2, function () {
            console.debug('check ok');
        });
        if (success == false && errorMsg) {
            G_Prompt.showTip(errorMsg);
        }
        [success, errorMsg] = LogicCheckHelper.doCheck('enoughCash', 99, function () {
            console.debug('LogicCheckHelper.doCheck check ok');
        });
        if (success == false) {
            G_Prompt.showTip(' LogicCheckHelper.doCheck enoughCash not enough');
        }
    },

    initAllCheckers() {
        addCheck(UserCheck);
        addCheck(ShopCheck);
        addCheck(FunctionCheck);
        addCheck(ChatCheck);
        addCheck(GuildCheck);
        addCheck(DailyDungeonCheck);
        addCheck(TowerCheck);
        addCheck(GuildWarCheck);

    }
}

function addCheck(cla: any) {
    for (let key in cla) {
        //assert((!LogicCheckHelper[key], 'There is an another check named: ' + key);
        LogicCheckHelper[key] = cla[key];
    }
}
