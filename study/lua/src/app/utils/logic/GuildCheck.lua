local UserDataHelper = require("app.utils.UserDataHelper")
local GuildCheck = {}

function GuildCheck.checkGuildCanSnatchRedPacket(popHint)
    local success = true
    local popFunc = nil
    popHint = popHint == nil and true or popHint
    local canSnatchNum = UserDataHelper.getCanSnatchRedPacketNum()
    if canSnatchNum <= 0 then
        success = false   
        popFunc = function()
            G_Prompt:showTip(Lang.get("guild_snatch_redpacket_num_limit_hint"))
        end  
    end
    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end

function GuildCheck.checkGuildDungeonHasEnoughMember(popHint)
    local success = true
    local popFunc = nil
    popHint = popHint == nil and true or popHint
    local stageOpenNum = UserDataHelper.getParameter(G_ParameterIDConst.GUILD_STAGE_OPENNUM )
    if G_UserData:getGuild():getGuildMemberCount() < stageOpenNum then
        success = false   
        popFunc = function()
            G_Prompt:showTip(Lang.get("guilddungeon_not_open_as_member_num",{value = stageOpenNum}))
        end    
    end
    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end

function GuildCheck.checkGuildDungeonInOpenTime(popHint)
    local success = true
    local popFunc = nil
    popHint = popHint == nil and true or popHint
    local openTimeHintStr = UserDataHelper.getGuildDungenoOpenTimeHintText()
    if openTimeHintStr then
        success = false   
        popFunc = function()
            G_Prompt:showTip(openTimeHintStr)
        end  
    end
    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end

--检查军团某模块是否可开启
function GuildCheck.checkGuildModuleIsOpen(moduleId,popHint)
    local success = true
    local popFunc = nil
    popHint = popHint == nil and true or popHint
    
	local GuildBuildPostion = require("app.config.guild_build_postion")
	local config = GuildBuildPostion.get(moduleId)
	assert(config, string.format("guild_build_postion config can not find id = %d", moduleId))
	if config.open == 0 then
        popFunc = function()
           	G_Prompt:showTip(Lang.get("common_tip_function_not_open"))
        end  
		success =  false
	end

	local level = config.show_level--开放需要的军团等级
	local guildLevel = G_UserData:getGuild():getMyGuildLevel()
	if success and guildLevel < level  then
        popFunc = function()
           	G_Prompt:showTip(Lang.get("guild_open_tip", {level = level}))
        end  
		success =  false
	end

    local GuildConst = require("app.const.GuildConst")
    if success and moduleId == GuildConst.CITY_DUNGEON_ID then
        --[[
        local successOfGuildDungeon,popFuncOfGuildDungeon =  GuildCheck.checkGuildDungeonHasEnoughMember(false)
        if not successOfGuildDungeon then
            success =  false
            popFunc = popFuncOfGuildDungeon
        end
        ]]

        local openday = UserDataHelper.getParameter(G_ParameterIDConst.GUILD_STAGE_OPENDAY)
        local openServerDayNum = G_UserData:getBase():getOpenServerDayNum()
        if openServerDayNum < openday then
            success =  false
            popFunc = function()
                G_Prompt:showTip(Lang.get("guilddungeon_tips_not_open_as_openserverday"))
            end  
        end
    end
    
    if popHint and popFunc then
        popFunc()
    end

    return success,popFunc
end


return GuildCheck