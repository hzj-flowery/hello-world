local SiegeHelper = {}

local RebelBase = require("app.config.rebel_base")
local RebelRankReward = require("app.config.rebel_rank_reward")
local RebelTime = require("app.config.rebel_time")
local RebelDmgReward = require("app.config.rebel_dmg_reward")

-- function SiegeHelper.makeSimpleSiege(id, uid, endTime)
--     local configData = RebelBase.get(id)
--     assert("wrong rebel id = "..id)
--     local simpleData =
--     {
--         id = id,
--         uid = uid,
-- 		data = configData,		--表格数据
-- 		endTime = endTime,		--逃离时间，用于排序
--     }
--     return simpleData
-- end

-- function SiegeHelper.getEnemyListSorted()
--     local sortedList = {}   --整理后数组
-- 	local guildList = {}    --军团共享的数组
-- 	local enemyList = G_UserData:getSiegeData():getSiegeEnemys()    --数据表里面的数组
-- 	for i, v in pairs(enemyList) do
-- 		local strSiege = SiegeHelper.makeSimpleSiege(v:getId(), v:getUid(), v:getEnd_time())
-- 		if strSiege.uid == G_UserData:getBase():getId() then
-- 			table.insert(sortedList, strSiege)
-- 		else
-- 			table.insert(guildList, strSiege)
-- 		end
--     end
--
-- 	local function sortFunc(a, b)
-- 		if a.data.color > b.data.color then
-- 			return true
-- 		elseif a.data.color == b.data.color then
-- 			if a.endTime < b.endTime then
-- 				return true
-- 			end
-- 		end
--     end
--
-- 	table.sort(sortedList, sortFunc)
--     table.sort(guildList, sortFunc)
--
-- 	for i = 1, #guildList do
-- 		sortedList[#sortedList + 1] = guildList[i]
-- 	end
-- 	return sortedList
-- end

function SiegeHelper.getRankReward(type, rank)
	--获得奖励
	local reward = nil
	local totalCount = RebelRankReward.length()
	for i = 1, totalCount do
		local data = RebelRankReward.indexOf(i)
		if type == data.type and rank >= data.rank_min and rank <= data.rank_max then
			reward =
			{
				type = data.award_type,
				value = data.award_value,
				size = data.award_size,
			}
			break
		end
	end
	return reward
end

function SiegeHelper.getHalfTimeString()
    local function getTimeString(time)
        local hour = G_ServerTime:minToString(time)
        return hour
    end
    local halfPower = 1
    local beginTime = {}
    local endTime = {}
    for i = 1, 3 do
        local data = RebelTime.get(i)
        local start = data.start_time
        table.insert(beginTime, start)
        local finish = data.over_time
        table.insert(endTime, finish)
    end

    local isHalfTime = false
    local fontDark, fontGreen = Colors.getETypeColor()
    local fontColor =
    {
        fontDark, fontDark, fontDark,
    }
    local serverTime = G_ServerTime:getTime()
    for i = 1, 3 do
        local time1 = beginTime[i]
        local time2 = endTime[i]
        if serverTime >= G_ServerTime:getTimestampBySeconds(time1) and serverTime < G_ServerTime:getTimestampBySeconds(time2) then
            fontColor[i] = fontGreen
            isHalfTime = true
        end
    end

    local timeText = ccui.RichText:createWithContent(Lang.get("siege_half_token",{
            begin1 = getTimeString(beginTime[1]), end1 = getTimeString(endTime[1]), color1 = Colors.colorToNumber(fontColor[1]),
            begin2 = getTimeString(beginTime[2]), end2 = getTimeString(endTime[2]), color2 = Colors.colorToNumber(fontColor[2]),
            begin3 = getTimeString(beginTime[3]), end3 = getTimeString(endTime[3]), color3 = Colors.colorToNumber(fontColor[3]),
    }))
    timeText:setAnchorPoint(cc.p(0, 0))
	return isHalfTime, timeText
end

function SiegeHelper.parseRewardList(level, type)
    local totalCount = RebelDmgReward.length()
    local rewardList = {}
    for i = 1, totalCount do
		local data = RebelDmgReward.indexOf(i)
        if level >= data.lv_min and level <= data.lv_max and data.type == type then
			table.insert(rewardList, data)
        end
    end
    table.sort(rewardList, function(a, b) return a.index < b.index end)
    return rewardList
end

function SiegeHelper.getSortedRewardList(list)

    local sortedList = {}
    local getList = {}
    for i, v in pairs(list) do
        if G_UserData:getSiegeData():isHurtRewardGet(v.id) then
            table.insert(getList, v)
        else
            table.insert(sortedList, v)
        end
    end

    for i = 1, #getList do
        sortedList[#sortedList + 1] = getList[i]
    end

    return sortedList
end

return SiegeHelper
