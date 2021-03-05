
local CakeActivityDataHelper = {}
local CakeActivityConst = require("app.const.CakeActivityConst")
local AudioConst = require("app.const.AudioConst")
local UTF8 = require("app.utils.UTF8")

function CakeActivityDataHelper.getCakeLevelConfig(type, id)
	local info = require("app.config.cake_level").get(type, id)
	-- assert(info, string.format("cake_level config can not find type = %d, id = %d", type, id))
	return info
end

function CakeActivityDataHelper.getCurCakeLevelConfig(id)
	local actType = G_UserData:getCakeActivity():getActType()
	local info = CakeActivityDataHelper.getCakeLevelConfig(actType, id)
	return info
end

function CakeActivityDataHelper.getCakeTaskConfig(type, id)
	local info = require("app.config.cake_task").get(type, id)
	assert(info, string.format("cake_task config can not find type = %d, id = %d", type, id))
	return info
end

function CakeActivityDataHelper.getCurCakeTaskConfig(id)
	local actType = G_UserData:getCakeActivity():getActType()
	local info = CakeActivityDataHelper.getCakeTaskConfig(actType, id)
	return info
end

function CakeActivityDataHelper.getCakeChargeConfig(id)
	local info = require("app.config.cake_charge").get(id)
	assert(info, string.format("cake_charge config can not find id = %d", id))
	return info
end

function CakeActivityDataHelper.getCakeDailyConfig(type, daily)
	local info = require("app.config.cake_daily").get(type, daily)
	assert(info, string.format("cake_daily config can not find type = %d, daily = %d", type, daily))
	return info
end

function CakeActivityDataHelper.getCurCakeDailyConfig(daily)
	local actType = G_UserData:getCakeActivity():getActType()
	local info = CakeActivityDataHelper.getCakeDailyConfig(actType, daily)
	return info
end

function CakeActivityDataHelper.getCakeResouceConfig(type)
	local info = require("app.config.cake_resouce").get(type)
	assert(info, string.format("cake_resouce config can not find type = %d", type))
	return info
end

function CakeActivityDataHelper.getCurCakeResouceConfig()
	local actType = G_UserData:getCakeActivity():getActType()
	local info = CakeActivityDataHelper.getCakeResouceConfig(actType)
	return info
end

function CakeActivityDataHelper.getMaterialItemId(type)
	local info = CakeActivityDataHelper.getCurCakeResouceConfig()
	local itemId = info["gift"..type.."_item_id"]
	return itemId, info
end

function CakeActivityDataHelper.getMaterialName(type)
	local itemId = CakeActivityDataHelper.getMaterialItemId(type)
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local itemName = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId).name
	return itemName
end

function CakeActivityDataHelper.getMaterialValue(type)
	local info = CakeActivityDataHelper.getCurCakeResouceConfig()
	local value = info["gift"..type.."_point"]
	return value
end

function CakeActivityDataHelper.getMaterialMoving(type)
	local info = CakeActivityDataHelper.getCurCakeResouceConfig()
	local moving = info["gift"..type.."_moving"]
	return moving
end

function CakeActivityDataHelper.getBulletPlayTime(type)
	local info = CakeActivityDataHelper.getCurCakeResouceConfig()
	local time = info["gift"..type.."_time"]
	return time
end

function CakeActivityDataHelper.getTabTitleNames()
	local result = {}
	local info = CakeActivityDataHelper.getCurCakeResouceConfig()
	for i = 1, 2 do
		table.insert(result, info["cake_name"..i])
	end
	
	return result
end

function CakeActivityDataHelper.getFoodName()
	local info = CakeActivityDataHelper.getCurCakeResouceConfig()
	return info.type_name
end

function CakeActivityDataHelper.getMaterialTypeWithId(id)
	for materialType = CakeActivityConst.MATERIAL_TYPE_1, CakeActivityConst.MATERIAL_TYPE_3 do
		local itemId = CakeActivityDataHelper.getMaterialItemId(materialType)
		if id == itemId then
			return materialType
		end
	end
	assert(false, string.format("CakeActivityDataHelper.getMaterialTypeWithId id is wrong, id = %d", id))
end

function CakeActivityDataHelper.getMaterialIconWithId(id)
	local res = nil
	for materialType = CakeActivityConst.MATERIAL_TYPE_1, CakeActivityConst.MATERIAL_TYPE_3 do
		local itemId, info = CakeActivityDataHelper.getMaterialItemId(materialType)
		if id == itemId then
			local resName = info["gift"..materialType.."_resouce"]
			res = Path.getAnniversaryImg(resName)
			break
		end
	end
	
	if res == nil then
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, id)
		res = param.icon
	end
	return res
end

function CakeActivityDataHelper.getMaterialSoundIdWithId(id)
	local TYPE2SOUNDID = {
		[CakeActivityConst.MATERIAL_TYPE_1] = AudioConst.SOUND_CAKE_EGG,
		[CakeActivityConst.MATERIAL_TYPE_2] = AudioConst.SOUND_CAKE_CREAM,
		[CakeActivityConst.MATERIAL_TYPE_3] = AudioConst.SOUND_CAKE_FRUIT,
	}

	local type = CakeActivityDataHelper.getMaterialTypeWithId(id)
	local soundId = TYPE2SOUNDID[type] or 0
	return soundId
end

function CakeActivityDataHelper.getAllServerStageStartTime()
	local startTime1 = G_UserData:getCakeActivity():getActivityStartTime() --本服阶段开始时间
    local endTime1 = startTime1 + CakeActivityConst.CAKE_LOCAL_TIME --本服阶段结束时间
    local startTime2 = endTime1 + CakeActivityConst.CAKE_TIME_GAP --全服阶段开始时间
    return startTime2
end

--活动阶段
function CakeActivityDataHelper.getActStage()
	local startTime1 = G_UserData:getCakeActivity():getActivityStartTime() --本服阶段开始时间
    local endTime1 = startTime1 + CakeActivityConst.CAKE_LOCAL_TIME --本服阶段结束时间
    local startTime2 = endTime1 + CakeActivityConst.CAKE_TIME_GAP --全服阶段开始时间
    local endTime2 = startTime2 + CakeActivityConst.CAKE_CROSS_TIME --全服阶段结束时间
    local showEndTime = endTime2 + CakeActivityConst.CAKE_TIME_LEFT --整个活动结束显示的时间
    local curTime = G_ServerTime:getTime()

    if startTime1 == 0 then
    	return CakeActivityConst.ACT_STAGE_0 --没开活动
    end

	if curTime >= startTime1 and curTime < endTime1 then
		return CakeActivityConst.ACT_STAGE_1, startTime1, endTime1
	elseif curTime >= endTime1 and curTime < startTime2 then
		return CakeActivityConst.ACT_STAGE_2, endTime1, startTime2
	elseif curTime >= startTime2 and curTime < endTime2 then
		return CakeActivityConst.ACT_STAGE_3, startTime2, endTime2
	elseif curTime >= endTime2 and curTime < showEndTime then
		return CakeActivityConst.ACT_STAGE_4, endTime2, showEndTime
	else
		return CakeActivityConst.ACT_STAGE_0, startTime1, showEndTime
	end
end

--是否能捐材料
function CakeActivityDataHelper.isCanGiveMaterial(isShowTip)
	local actStage = CakeActivityDataHelper.getActStage()
	if actStage == CakeActivityConst.ACT_STAGE_0 then
		if isShowTip then
			G_Prompt:showTip(Lang.get("cake_activity_act_end_tip"))
		end
		return false
	elseif actStage == CakeActivityConst.ACT_STAGE_2 then
		if isShowTip then
			G_Prompt:showTip(Lang.get("cake_activity_act_end_tip2"))
		end
		return false
	elseif actStage == CakeActivityConst.ACT_STAGE_4 then
		if isShowTip then
			G_Prompt:showTip(Lang.get("cake_activity_act_end_tip3"))
		end
		return false
	end
	return true
end

--是否能充值买奶油
function CakeActivityDataHelper.isCanRecharge()
	local actStage = CakeActivityDataHelper.getActStage()
	if actStage == CakeActivityConst.ACT_STAGE_0 or actStage == CakeActivityConst.ACT_STAGE_4 then
		G_Prompt:showTip(Lang.get("cake_activity_act_end_tip"))
		return false
	end
	return true
end

--获取每日奖励信息
function CakeActivityDataHelper.getDailyAwardInfo()
	local result = {}
	local Config = require("app.config.cake_daily")
	local actType = G_UserData:getCakeActivity():getActType()
	local len = Config.length()
	for i = 1, len do
		local info = Config.indexOf(i)
		if info.type == actType then
			local temp = {}
			temp.awards = {}
			temp.day = info.daily
			temp.state = CakeActivityDataHelper.getDailyAwardState(info.daily)
			for j = 1, 5 do
				if info["type_"..j] > 0 and info["id_"..j] > 0 and info["size_"..j] > 0 then
					table.insert(temp.awards, {type = info["type_"..j], value = info["id_"..j], size = info["size_"..j]})	
				end
			end
			table.insert(result, temp)
		end
	end
	return result
end

--获取登录奖励的最大天数
function CakeActivityDataHelper.getDailyAwardMaxDay()
	local maxDay = 0
	local Config = require("app.config.cake_daily")
	local actType = G_UserData:getCakeActivity():getActType()
	local len = Config.length()
	for i = 1, len do
		local info = Config.indexOf(i)
		if info.type == actType then
			maxDay = info.daily
		end
	end
	return maxDay
end

function CakeActivityDataHelper.getDailyAwardState(day)
	local state = nil
	local data = G_UserData:getCakeActivity():getLoginRewardWithDay(day)
	if data then
		if data.isReceived then
			state = CakeActivityConst.DAILY_AWARD_STATE_3
		else
			state = CakeActivityConst.DAILY_AWARD_STATE_2
		end
	else
		local startTime = G_UserData:getCakeActivity():getActivityStartTime()
		local curTime = G_ServerTime:getTime()
		local openZeroTime = G_ServerTime:secondsFromZero(startTime)
		local currZeroTime = G_ServerTime:secondsFromZero(curTime)
		local curDay = math.ceil( (currZeroTime - openZeroTime) / (3600*24) )
		curDay = curDay + 1
		if day < curDay then
			state = CakeActivityConst.DAILY_AWARD_STATE_1
		elseif day > curDay then
			state = CakeActivityConst.DAILY_AWARD_STATE_4
		else
			state = CakeActivityConst.DAILY_AWARD_STATE_0 --跨天的情况,需要重新拉取数据
		end
	end

	return state
end

--获取等级奖励信息
function CakeActivityDataHelper.getLevelAwardInfo(curLevel)
	local result = {}
	local limitLevel = 0 --奖励显示到X级
	if curLevel <= 3 then
		limitLevel = 5
	else
		limitLevel = curLevel + 2
	end
	local Config = require("app.config.cake_level")
	local len = Config.length()
	local actType = G_UserData:getCakeActivity():getActType()
	for i = 1, len do
		local info = Config.indexOf(i)
		if info.type == actType then
			local temp = {}
			if info.lv <= limitLevel then
				temp.level = info.lv
				temp.state = CakeActivityDataHelper.getLevelAwardState(info.lv)
				temp.awards = {}
				for j = 1, 4 do
					if info["type_"..j] > 0 and info["id_"..j] > 0 and info["size_"..j] > 0 then
						table.insert(temp.awards, {type = info["type_"..j], value = info["id_"..j], size = info["size_"..j]})	
					end
				end
				if #temp.awards > 0 then
					table.insert(result, temp)
				end
			end
		end
	end
	return result
end

function CakeActivityDataHelper.getLevelAwardState(level)
	local awardId = level
	local state = nil
	local data = G_UserData:getCakeActivity():getUpRewardWithId(awardId)
	if data then
		if data.isReceived then
			state = CakeActivityConst.AWARD_STATE_3
		else
			state = CakeActivityConst.AWARD_STATE_2
		end
	else
		state = CakeActivityConst.AWARD_STATE_1
	end
	return state
end

return CakeActivityDataHelper