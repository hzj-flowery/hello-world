import { G_Prompt, G_UserData, G_ServerTime } from "../../init";
import { Lang } from "../../lang/Lang";
import { LogicCheckHelper } from "../LogicCheckHelper";
import { GuildWarConst } from "../../const/GuildWarConst";
import { GuildWarDataHelper } from "../data/GuildWarDataHelper";

export namespace GuildWarCheck {
    export function guildWarCanProclaim(cityId, popHint) {
        let success = true;
        let popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        if (success) {
            let level = GuildWarDataHelper.getGuildWarProclaimGuildLv();
            let guildLevel = G_UserData.getGuild().getMyGuildLevel();
            if (guildLevel < level) {
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guild_open_tip', { level: level }));
                };
                success = false;
            }
        }
        let guildWarCity = G_UserData.getGuildWar().getCityById(cityId);
        if (!guildWarCity) {
            success = false;
        } else {
            let maxNum = GuildWarDataHelper.getGuildWarProclaimMax();
            if (guildWarCity.getDeclare_guild_num() >= maxNum) {
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_proclaim_count_limit', { value: maxNum }));
                };
                success = false;
            }
        }
        if (success) {
            let guild = G_UserData.getGuild().getMyGuild();
            let lastDeclareTime = guild && guild.getWar_declare_time() || 0;
            // let curTime = G_ServerTime.getTime();
            let money = GuildWarDataHelper.getGuildWarProclaimCD();
            if (lastDeclareTime > 0) {
                success = LogicCheckHelper.enoughCash(money, false), popFunc = null;
            }
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function guildWarCheckActTime(popHint) {
        let success = true;
        let popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        let isTodayOpen = GuildWarDataHelper.isTodayOpen();
        if (!isTodayOpen) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('guildwar_tip_not_open'));
            };
        }
        if (success) {
            let timeData = GuildWarDataHelper.getGuildWarTimeRegion();
            let curTime = G_ServerTime.getTime();
            if (curTime < timeData.startTime || curTime >= timeData.endTime) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_not_open'));
                };
            } else if (curTime >= timeData.startTime && curTime < timeData.time1) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_in_prepare'));
                };
            }
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function guildWarCheckMoveCD(cityId, popHint) {
        let success = true;
        let popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        let guildWarUser = G_UserData.getGuildWar().getMyWarUser(cityId);
        let moveTime = guildWarUser.getMove_time();
        let moveCD = GuildWarDataHelper.getGuildWarMoveCD();
        let curTime = G_ServerTime.getTime();
        if (curTime <= moveTime + moveCD) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('guildwar_tip_in_move_cd'));
            };
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function guildWarCheckRebornCD(cityId, popHint) {
        let success = true;
        let popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        let guildWarUser = G_UserData.getGuildWar().getMyWarUser(cityId);
        let rebornTime = guildWarUser.getRelive_time();
        let curTime = G_ServerTime.getTime();
        if (curTime <= rebornTime) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('guildwar_tip_in_reborn_cd'));
            };
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function guildWarCheckAttackCD(cityId, popHint) {
        let success = true;
        let popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        let guildWarUser = G_UserData.getGuildWar().getMyWarUser(cityId);
        let challengeTime = guildWarUser.getChallenge_time();
        let challengeCd = guildWarUser.getChallenge_cd();
        let cd = GuildWarDataHelper.getGuildWarAtkCD();
        let maxCd = GuildWarDataHelper.getGuildWarTotalAtkCD();
        let nextTime = challengeTime + challengeCd;
        let countDownTime = nextTime - G_ServerTime.getTime();
        countDownTime = Math.max(countDownTime, 0);
        if (countDownTime > 0 && challengeCd >= maxCd) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('guildwar_tip_in_attack_cd'));
            };
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function guildWarCanSeek(cityId, pointId, popHint) {
        let success = true;
        let popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        let guildWarUser = G_UserData.getGuildWar().getMyWarUser(cityId);
        cityId = guildWarUser.getCity_id();
        let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, pointId);
        let campId = GuildWarDataHelper.getCampPoint(cityId);
        if (config.point_type == GuildWarConst.POINT_TYPE_EXIT) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('guildwar_tip_cannot_seek_exit'));
            };
        } else if (config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK || config.point_type == GuildWarConst.POINT_TYPE_CAMP_DEFENDER) {
            if (campId != pointId) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_cannot_seek_camp'));
                };
            }
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function guildWarCanShowPoint(cityId, pointId, popHint) {
        let success = true;
        let popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        let guildWarUser = G_UserData.getGuildWar().getMyWarUser(cityId);
        cityId = guildWarUser.getCity_id();
        let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, pointId);
        if (config.point_type == GuildWarConst.POINT_TYPE_EXIT) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('guildwar_tip_cannot_seek_exit'));
            };
        } else if (config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK || config.point_type == GuildWarConst.POINT_TYPE_CAMP_DEFENDER) {
            let campId = GuildWarDataHelper.getCampPoint(cityId);
            if (campId != pointId) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_not_my_camp'));
                };
            }
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function guildWarCheckIsCanMovePoint(cityId, pointId, popHint) {
        let success = true;
        let popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, pointId);
        if (config.point_type == GuildWarConst.POINT_TYPE_EXIT) {
            let exitPointId = GuildWarDataHelper.getExitPoint(cityId);
            if (exitPointId != pointId) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_not_my_exit'));
                };
            }
        } else if (config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK || config.point_type == GuildWarConst.POINT_TYPE_CAMP_DEFENDER) {
            let campId = GuildWarDataHelper.getCampPoint(cityId);
            if (campId != pointId) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_not_my_camp'));
                };
            }
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function guildWarCanMove(cityId, pointId, ignoreCD, popHint) {
        let success = true;
        let popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        if (!ignoreCD) {
            [success, popFunc] = GuildWarCheck.guildWarCheckActTime(false);
        }
        let guildWarUser = G_UserData.getGuildWar().getMyWarUser(cityId);
        let currPoint = guildWarUser.getCurrPoint();
        cityId = guildWarUser.getCity_id();
        if (success) {
            if (currPoint <= 0) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_cannot_move_in_run'));
                };
            }
        }
        if (success && !ignoreCD) {
            [success, popFunc] = GuildWarCheck.guildWarCheckRebornCD(cityId, false);
        }
        if (success && !ignoreCD) {
            [success, popFunc] = GuildWarCheck.guildWarCheckMoveCD(cityId, false);
        }
        if (success) {
            [success, popFunc] = GuildWarCheck.guildWarCheckIsCanMovePoint(cityId, pointId, false);
        }
        if (success) {
            let movePointList = GuildWarDataHelper.findNextMovePointData(cityId, currPoint);
            if (!movePointList[pointId]) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_not_can_move_point'));
                };
            }
        }
        if (success) {
            let isHasHinder = GuildWarDataHelper.isHasHinder(cityId, currPoint, pointId);
            if (isHasHinder) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_has_hinder'));
                };
            }
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function guildWarCanAttackPoint(cityId, pointId, ignoreCD, popHint) {
        let success = true;
        let popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        let guildWarUser = G_UserData.getGuildWar().getMyWarUser(cityId);
        if (!ignoreCD) {
            [success, popFunc] = GuildWarCheck.guildWarCheckActTime(false);
        }
        if (success) {
            let a = guildWarUser.getCurrPoint();
            if (guildWarUser.getCurrPoint() != pointId) {
                success = false;
                popFunc = function () {
                    // G_Prompt.showTip(Lang.get('guildwar_tip_cannot_attack_not_in_point'));
                };
            }
        }
        if (success) {
            let cityId = guildWarUser.getCity_id();
            let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, pointId);
            if (config.build_hp <= 0 || GuildWarDataHelper.isWatcherDeath(cityId, pointId)) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_cannot_attack_not_building'));
                };
            }
        }
        if (success) {
            let cityId = guildWarUser.getCity_id();
            let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, pointId);
            let isDefender = GuildWarDataHelper.selfIsDefender(cityId);
            if (config.point_type == GuildWarConst.POINT_TYPE_CRYSTAL && isDefender) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_cannot_attack_self_crystal'));
                };
            } else if (config.point_type == GuildWarConst.POINT_TYPE_GATE && isDefender) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_cannot_attack_self_gate'));
                };
            }
        }
        if (success && !ignoreCD) {
            [success, popFunc] = GuildWarCheck.guildWarCheckAttackCD(cityId, false);
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function guildWarCanAttackUser(cityId, otherGuildWarUser, popHint) {
        let success = true;
        let popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        let guildWarUser = G_UserData.getGuildWar().getMyWarUser(cityId);
        let currPoint = guildWarUser.getCurrPoint();
        [success, popFunc] = GuildWarCheck.guildWarCheckActTime(false);
        if (success) {
            if (guildWarUser.getGuild_id() == otherGuildWarUser.getGuild_id()) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_cannot_attack_same_guild'));
                };
            }
        }
        if (success) {
            if (currPoint == 0 || guildWarUser.getCurrPoint() != otherGuildWarUser.getCurrPoint()) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_cannot_attack_not_in_same_point'));
                };
            }
        }
        if (success) {
            [success, popFunc] = GuildWarCheck.guildWarCheckAttackCD(cityId, false);
        }
        if (success && currPoint != 0) {
            let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, currPoint);
            if (config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_cannot_attack_in_camp'));
                };
            }
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
    export function guildWarCanExit(cityId, popHint) {
        let success = true;
        let popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        [success, popFunc] = GuildWarCheck.guildWarCheckActTime(false);
        let guildWarUser = G_UserData.getGuildWar().getMyWarUser(cityId);
        let currPoint = guildWarUser.getCurrPoint();
        if (success) {
            [success, popFunc] = GuildWarCheck.guildWarCheckRebornCD(cityId, false);
        }
        if (currPoint <= 0) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('guildwar_tip_cannot_exit'));
            };
        }
        if (success && currPoint > 0) {
            let config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(guildWarUser.getCity_id(), currPoint);
            if (config.point_type != GuildWarConst.POINT_TYPE_CAMP_ATTACK && config.point_type != GuildWarConst.POINT_TYPE_CAMP_DEFENDER) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guildwar_tip_cannot_exit'));
                };
            }
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
}
