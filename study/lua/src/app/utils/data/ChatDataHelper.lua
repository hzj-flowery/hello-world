local ChatConst = require("app.const.ChatConst")
local Chat = require("app.config.chat")
local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")
local ChatDataHelper = {}

ChatDataHelper.allChannelIds = {
	ChatConst.CHANNEL_CROSS_SERVER, 
	ChatConst.CHANNEL_ALL,
	ChatConst.CHANNEL_WORLD,
	ChatConst.CHANNEL_GUILD,
	ChatConst.CHANNEL_TEAM,
    ChatConst.CHANNEL_PRIVATE
}

function ChatDataHelper.getChatParameterById(id)
	local config =  Chat.get(id)
	assert(config,"chat config not find id "..tostring(id))
	return tonumber(config.content) or 0
end

function ChatDataHelper.getShowChatChannelIds()
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	local ids = {}
	for k,v in ipairs(ChatDataHelper.allChannelIds) do
		if v == ChatConst.CHANNEL_TEAM then
			local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GROUPS)
			if isOpen then
				table.insert(ids,v)
			end
		elseif v == ChatConst.CHANNEL_CROSS_SERVER then
			local isOpen = ChatDataHelper.isCanCrossServerChat()
			if isOpen then
				table.insert(ids,v)
			end
		else
			table.insert(ids,v)
		end
	  	
	end
	return  ids
end

--是否在跨发聊天限制的时间内
function ChatDataHelper.isInCrossServerTime()
	local SingleRaceDataHelper = require("app.utils.data.SingleRaceDataHelper")
	local startTime = SingleRaceDataHelper.getStartTimeOfChat()
	local endTime = SingleRaceDataHelper.getEndTimeOfChat()
	local curTime = G_ServerTime:getTime()
	if curTime >= startTime and curTime < endTime then
		return true
	else
		return false
	end
end

--是否在跨服军团战时间
function ChatDataHelper.isInCrossGuildWarServerTime( ... )
    -- body
    local _, bOpenToday = GuildCrossWarHelper.isTodayOpen()
    if not bOpenToday then
        return false
    end

    local curTime = G_ServerTime:getTime()
    local zeroTime = G_ServerTime:secondsFromZero()
    local startTime = (zeroTime + GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_CHAT_SHOW))
    local endTime   = (zeroTime + GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_CHAT_CLOSE))
    if curTime >= startTime and curTime < endTime then
        return true
    end
    return false
end

--是否在跨服军团Boss时间
function ChatDataHelper.isInCrossWorldBossServerTime( ... )
    -- body
	local CrossWorldBossHelper = require("app.scene.view.crossworldboss.CrossWorldBossHelper")
    return CrossWorldBossHelper.getIsChatOpen()
end

--是否在跨服跨服拍卖时间
function ChatDataHelper.isInCrossAuction( ... )
    local TenJadeAuctionDataHelper = require("app.scene.view.tenJadeAuction.TenJadeAuctionDataHelper")
    return TenJadeAuctionDataHelper.isAuctionStart()
end

--是否能跨服聊天
function ChatDataHelper.isCanCrossServerChat()
	local SingleRaceConst = require("app.const.SingleRaceConst")
	local isInTime = {    -- 1. 是否活动时间内 
        ChatDataHelper.isInCrossServerTime(),           -- 1.1 跨服个人竞技跨服聊天时间段
		ChatDataHelper.isInCrossGuildWarServerTime(),    -- 1.2 跨服军团战跨服聊天时间段
		ChatDataHelper.isInCrossWorldBossServerTime(),
        ChatDataHelper.isInCrossAuction(),
    }
    
	local bGuildCrossWarOpen,_ = GuildCrossWarHelper.isGuildCrossWarEntry()
	local isCrossWorldBossOpen = ChatDataHelper.isInCrossWorldBossServerTime()
	local isCrossAuctionOpen = ChatDataHelper.isInCrossAuction()
    local isOpenAct = {    -- 2. 是否活动开启
        G_UserData:getSingleRace():getStatus() ~= SingleRaceConst.RACE_STATE_NONE, -- 2.1 跨服个人竞技是否开启
		bGuildCrossWarOpen,                                                        -- 2.2 跨服军团战是否开启
		isCrossWorldBossOpen,
        isCrossAuctionOpen
    }

    local maxNum = math.min(#isInTime, #isOpenAct)
    for i=1, maxNum do
        if isInTime[i] and isOpenAct[i] then
            return true
        end
    end
	return false
end

return ChatDataHelper