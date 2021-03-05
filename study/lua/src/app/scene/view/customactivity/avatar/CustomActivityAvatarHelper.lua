
local AvatarActivity = require("app.config.avatar_activity")
local CustomActivityAvatarHelper = {}
local ParamConfig = require("app.config.parameter")


function CustomActivityAvatarHelper.getInitViewData(id)
	if not id then
		id = 1
	end
	local config = AvatarActivity.get(id)
	assert(config ~= nil, "avatar_activity can no find drop id ="..(id or "nil"))
	local awardsList = {}
	for i = 1, 14 do
		table.insert(awardsList, {
			type = config["type_"..i],
			value = config["value_"..i],
			size = config["size_"..i]
		})

	end
	local costRes =  {
		type = config.drop_type,
		value = config.drop_value,
		size = config.drop_size
	}
	return awardsList ,costRes
end

function CustomActivityAvatarHelper.getCosRes(id)
	if not id then
		id = 1
	end
	local config = AvatarActivity.get(id)
	assert(config ~= nil, "avatar_activity can no find drop id ="..(id or "nil"))
	return  {
		type = config.drop_type,
		value = config.drop_value,
		size = config.drop_size
	}
end

function CustomActivityAvatarHelper.getMaxFreeNum(id)
	if not id then
		id = 1
	end
	local config = AvatarActivity.get(id)
	assert(config ~= nil, "avatar_activity can no find drop id ="..(id or "nil"))
	return config.day_free
end


function CustomActivityAvatarHelper.getFreeCount(id)
	if not id then
		id = 1
	end
	local maxFreeCount = CustomActivityAvatarHelper.getMaxFreeNum(id)
	local useCount = G_UserData:getDailyCount():getCountById(G_UserData:getDailyCount().DAILY_RECORD_AVATAR_ACTVITY_CNT)
	local freeCount = maxFreeCount - useCount
	if freeCount <= 0 then
		freeCount = 0
	end
	return freeCount
end



function CustomActivityAvatarHelper.getItemPositionByIndex(index)
	local x, y
	local colNum = 5
	local rowNum = 4 - 2 --抛去 首行和尾行
	local gapX = 131
	local gapY = 112.5
	local maxHeight = (rowNum + 1) * gapY
	if index <= colNum then
		x = (index - 1) * gapX
		y = 0
	elseif index <= colNum + rowNum then
		x = (colNum - 1) * gapX
		y = -1 * (index - colNum)*gapY
	elseif index <= colNum + rowNum + colNum then
		x = (colNum + rowNum + colNum - index) * gapX
		y = -1 * maxHeight
	else
		x = 0
		y = -1 *(((colNum + rowNum) * 2 - index + 1) *gapY)
	end
	return cc.p(x, y)
end

-- 手动变身卡活动 开始天数
function CustomActivityAvatarHelper.getManualInsertAvatarActivityStartDay()
	local config = ParamConfig.get(226)
	assert(config ~= nil, "can not find ParamConfig id = 226")
	return tonumber(config.content)
end

-- 手动变身卡活动 结束天数
function CustomActivityAvatarHelper.getManualInsertAvatarActivityEndDay()
	local config = ParamConfig.get(227)
	assert(config ~= nil, "can not find ParamConfig id = 227")
	return tonumber(config.content)
end


-- function CustomActivityAvatarHelper:getManualInsertAvatarActivityInfo()
-- 	local openServerTime = G_UserData:getBase():getServer_open_time()
-- 	local date = G_ServerTime:getDateObject(openServerTime)
-- 	local t1 = date.hour*3600 + date.min*60 + date.sec
-- 	local zeroTime = openServerTime - t1
-- 	local curTime = G_ServerTime:getTime()
-- 	local oneDay = 24* 60* 60
-- 	local statDay = CustomActivityAvatarHelper.getManualInsertAvatarActivityStartDay()
-- 	local endDay = CustomActivityAvatarHelper.getManualInsertAvatarActivityEndDay()
--
-- 	local startTime = zeroTime + (statDay - 1) * oneDay
-- 	local endTime = zeroTime + endDay * oneDay
-- 	-- logError("============222=================11============222============")
-- 	-- logError(G_ServerTime:getTimeString(openServerTime))
-- 	-- logError(G_ServerTime:getTimeString(startTime))
-- 	-- logError(G_ServerTime:getTimeString(endTime))
-- 	-- logError(G_ServerTime:getTimeString(curTime))
-- 	if curTime >= startTime and curTime <= endTime then
-- 		local activityData = {
-- 			act_id               = -1001,
-- 			act_type             = 5,
-- 			award_time           = endTime,
-- 			button_id            = 1,
-- 			desc                 = Lang.get("customactivity_avatar_act_title1"),
-- 			detail               = "",
-- 			end_time             = endTime,
-- 			icon_type            = 0,
-- 			icon_type_top_one    = 0,
-- 			icon_type_top_three  = 0,
-- 			icon_type_top_two    = 0,
-- 			icon_value           = 1010,
-- 			icon_value_top_one   = 0,
-- 			icon_value_top_three = 0,
-- 			icon_value_top_two   = 0,
-- 			max_level            = 999,
-- 			max_vip              = 16,
-- 			min_level            = 0,
-- 			min_vip              = 0,
-- 			preview_time         = startTime,
-- 			show_schedule        = 1,
-- 			start_time           = startTime,
-- 			sub_title            = Lang.get("customactivity_avatar_act_title1"),
-- 			title                = Lang.get("customactivity_avatar_act_title1"),
-- 			batch                = 1,
-- 		}
-- 		return activityData
-- 	end
-- end
return CustomActivityAvatarHelper
