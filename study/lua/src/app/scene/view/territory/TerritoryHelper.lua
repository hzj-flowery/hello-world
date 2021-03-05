--领地系统帮助类

local TerritoryHelper = {}

--领地弹出界面状态更新逻辑


--根据领地Id，获得领地数据
function TerritoryHelper.getTerritoryData(index)
    index = index or 1
    local retData = {}
    local TerritoryMgr = G_UserData:getTerritory()
    retData.state = TerritoryMgr:getTerritoryState(index)
    retData.name  = TerritoryMgr:getTerritoryName(index)
    retData.heroId = TerritoryMgr:getTerritoryHeroId(index)
    dump(retData.heroId)
    retData.startTime = TerritoryMgr:getStartTime(index)
    retData.endTime = TerritoryMgr:getTerritoryEndTime(index)
    retData.isReady = TerritoryMgr:getTerritoryReady(index)
    retData.limitLevel = TerritoryMgr:getTerritoryLimitLevel(index)
    retData.limitRedLevel = TerritoryMgr:getTerritoryLimitRedLevel(index)
    retData.lockMsg = TerritoryMgr:getLockMsg(index)
    retData.heroDrop = TerritoryMgr:getHeroDrop(index)
    retData.cfg = TerritoryMgr:getTerritoryCfg(index)
   -- dump(retData)
    return retData
end

function TerritoryHelper.isRoitState( index )
    local TerritoryConst = require("app.const.TerritoryConst")
    local TerritoryMgr = G_UserData:getTerritory()
    local state = TerritoryMgr:getTerritoryState(index)
    if state == TerritoryConst.STATE_RIOT then
        return true
    end
    return false
end

function TerritoryHelper.getTerritoryParameter(keyIndex)
    local TerritoryParameter = require("app.config.territory_parameter")
    for i=1, TerritoryParameter.length() do
        local territoryData = TerritoryParameter.indexOf(i)
        if territoryData.key == keyIndex then
            return territoryData.content
        end
    end
    assert(false," can't find key index in TerritoryParameter "..keyIndex)
    return nil
end


function TerritoryHelper.getTerritoryPatrolCost(keyIndex)
	local keyValue = TerritoryHelper.getTerritoryParameter(keyIndex)
	local time,itemType = unpack(string.split(keyValue,"|"))
	local type,value,size = unpack(string.split(itemType,":"))
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local typeItem = TypeConvertHelper.convert(tonumber(type),tonumber(value),tonumber(size))

    return typeItem, tonumber(time)
end

function TerritoryHelper.getRiotInfo(infoId)
    local RiotInfo = require("app.config.territory_riot")
    local riotData = RiotInfo.get(infoId)

    assert(riotData," can't find infoId in territory_riot "..infoId)
    return riotData
end

function TerritoryHelper.getEventInfo(infoId)
    local eventInfo = require("app.config.territory_event")
    local data = eventInfo.get(infoId)

    assert(data," can't find infoId in territory_event "..infoId)
    return data
end

--获取领地帮助文字内容
function TerritoryHelper.getTerritoryHelpBubble()
    local content = TerritoryHelper.getTerritoryParameter("help_bubble")
    local idList = string.split(content,"|")
    dump(idList)
    if #idList > 0 then
        local index = math.random(1, #idList)
        local bubbleId = tonumber(idList[index])
        return TerritoryHelper.getBubbleContentById(bubbleId)
    end
    return ""
end

function TerritoryHelper.getBubbleContentById(bubbleId)
    local BubbleInfo = require("app.config.bubble")
    local data = BubbleInfo.get(tonumber(bubbleId))
    assert(data, "bubble cfg data can not find by bubbleId "..bubbleId)
    return data.content
end

function TerritoryHelper.getBubbleEmjById(bubbleId)
    local BubbleInfo = require("app.config.bubble")
    local data = BubbleInfo.get(tonumber(bubbleId))
    assert(data, "bubble cfg data can not find by bubbleId "..bubbleId)
    return data.emote_value
end


--巡逻中发生的暴动有领取、军团求助、已求助、超时、已领取五中状态。
--
--[[message TerritoryEvent {
	required uint32 id = 1;      //自增ID
	required uint32 time = 2;    //发生时间
	required uint32 info_id = 3; //事件ID
	required uint32 event_type = 4; //事件类型
	optional bool is_repress = 5;   //是否已经镇压
	optional bool for_help = 6;   //是否已求助
	optional string fname = 7;   //镇压好友名字
	repeated Award awards = 8;   //事件奖励
}]]

--判定超时后，是否过期
function TerritoryHelper.isRiotEventExpiredTime(event)
    local TerritoryConst = require("app.const.TerritoryConst")
    local riotNeedTime = tonumber(TerritoryHelper.getTerritoryParameter("riot_continue_time"))
    local riotEndTime = event.time + riotNeedTime
    if  TerritoryConst.RIOT_OVERTIME == TerritoryHelper.getRiotEventState(event) then
        local nextUpdateTime, isExpired = G_ServerTime:getNextUpdateTime(riotEndTime)
        return isExpired
    end
    return false
end

function TerritoryHelper.getRiotEventState(event)

    local TerritoryConst = require("app.const.TerritoryConst")

    local riotNeedTime = tonumber(TerritoryHelper.getTerritoryParameter("riot_continue_time"))
    local riotEndTime = event.time + riotNeedTime
    local terrItoryId = rawget(event,"territory_id")
    --这里特殊处理，如果时间有end_time 则说明是好友领地时间结束时间
    local endTime = rawget(event, "end_time") or G_UserData:getTerritory():getTerritoryEndTime(terrItoryId)
    local isPartolFinish = endTime < G_ServerTime:getTime()
    local isOverRitoTime = riotEndTime < G_ServerTime:getTime()

    --已领取
    if event.is_award ==  true  then
        return TerritoryConst.RIOT_TAKEN
    end

    if event.is_repress == true then
        return TerritoryConst.RIOT_TAKE
    end

    if isPartolFinish or isOverRitoTime  then
        return TerritoryConst.RIOT_OVERTIME
    end

    if event.for_help == false then
        return TerritoryConst.RIOT_HELP
    end

    if event.is_repress == false then
        return TerritoryConst.RIOT_HELPED
    end

    if event.is_award ==  false then
        return TerritoryConst.RIOT_TAKE
    end

    return TerritoryConst.RIOT_TAKEN
end


-- 获取下一次巡逻收获时间
function TerritoryHelper.getNextEventTime(cityData, event)
    local profitTime = tonumber(TerritoryHelper.getTerritoryParameter("patrol_profit_time"))
    local remainTime = cityData.endTime
    local nextTime = nil
    if event == nil then
        nextTime = cityData.startTime + profitTime
    else
        nextTime = event.time + profitTime
    end

    local nextTimeStr = G_ServerTime:getLeftSecondsString(nextTime)
    return nextTimeStr
end

function TerritoryHelper.setTextBgByColor(imageWidget,color)
	if not imageWidget then
		return
	end
    if color == 3 then
        imageWidget:loadTexture(Path.getComplexRankUI("img_midsize_ranking05"))
	elseif color == 4 then
        imageWidget:loadTexture(Path.getComplexRankUI("img_midsize_ranking03"))
	elseif color == 5 then
        imageWidget:loadTexture(Path.getComplexRankUI("img_midsize_ranking02"))
	end
end



return TerritoryHelper
