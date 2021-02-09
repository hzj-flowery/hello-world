import { UserDataHelper } from "../data/UserDataHelper";
import { Lang } from "../../lang/Lang";
import { G_Prompt, G_UserData, G_ConfigLoader } from "../../init";
import ParameterIDConst from "../../const/ParameterIDConst";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { GuildConst } from "../../const/GuildConst";

export namespace GuildCheck {
    export function checkGuildCanSnatchRedPacket  (popHint) {
        var success = true;
        var popFunc = null;
        popHint = popHint == null && true || popHint;
        var canSnatchNum = UserDataHelper.getCanSnatchRedPacketNum();
        if (canSnatchNum <= 0) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('guild_snatch_redpacket_num_limit_hint'));
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
    export function checkGuildDungeonHasEnoughMember (popHint) {
        var success = true;
        var popFunc = null;
        popHint = popHint == null && true || popHint;
        var stageOpenNum = UserDataHelper.getParameter(ParameterIDConst.GUILD_STAGE_OPENNUM);
        if (G_UserData.getGuild().getGuildMemberCount() < stageOpenNum) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('guilddungeon_not_open_as_member_num', { value: stageOpenNum }));
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
    export function checkGuildDungeonInOpenTime (popHint) {
        var success = true;
        var popFunc = null;
        popHint = popHint == null && true || popHint;
        var openTimeHintStr = UserDataHelper.getGuildDungenoOpenTimeHintText();
        if (openTimeHintStr) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(openTimeHintStr);
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
    export function checkGuildModuleIsOpen (moduleId, popHint) {
        var success = true;
        var popFunc = null;
        popHint = popHint == null && true || popHint;
        let GuildBuildPostion = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_BUILD_POSTION);
        var config = GuildBuildPostion.get(moduleId);
        console.assert(config, 'guild_build_postion config can not find id = %d');
        if (config.open == 0) {
            popFunc = function () {
                G_Prompt.showTip(Lang.get('common_tip_function_not_open'));
            };
            success = false;
        }
        var level = config.show_level;
        var guildLevel = G_UserData.getGuild().getMyGuildLevel();
        if (success && guildLevel < level) {
            popFunc = function () {
                G_Prompt.showTip(Lang.get('guild_open_tip', { level: level }));
            };
            success = false;
        }
        if (success && moduleId == GuildConst.CITY_DUNGEON_ID) {
            var openday = UserDataHelper.getParameter(ParameterIDConst.GUILD_STAGE_OPENDAY);
            var openServerDayNum = G_UserData.getBase().getOpenServerDayNum();
            if (openServerDayNum < openday) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('guilddungeon_tips_not_open_as_openserverday'));
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