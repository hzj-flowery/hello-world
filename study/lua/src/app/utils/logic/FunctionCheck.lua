--逻辑检查函数列表
--用户数据逻辑检查

local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local FunctionCheck = {}

--策划配置格式 0|0 需要转化 成秒
local function getFunctionUpdateTime(timeStr)
	if not timeStr or timeStr == "" then
		return
	end
	local timeStrArr = string.split(timeStr, "|")
	assert( #timeStrArr == 2, "function_level config update_time  format error")
	local hour = tonumber(timeStrArr[1]) or 0
	local min = tonumber(timeStrArr[2]) or 0
	return hour * 3600 + min * 60
end


function FunctionCheck.functionOpen(funcId, callback)
	assert(FunctionSetting[funcId], "Invalid FunctionSetting key: "..tostring(funcId))

end
--[[
	判断一个模块是否开启
	一个模块是否开启分为两个维度
	1.是否达到开启条件
	2.当前功能是否能开启（就是是否被人为屏蔽）
]]

function FunctionCheck.funcIsOpened(funcId, callback, userLastLevel)	--是否使用上次记录的等级
	if not funcId then
		if callback then
			callback(false)
		end
		return false
	end

	-- 当前功能是否能开启（就是是否被人为屏蔽）
	local funcLevelInfo = require("app.config.function_level").get(funcId)
    assert(funcLevelInfo, "Invalid function_level can not find funcId "..funcId)

    local UserCheck = require("app.utils.logic.UserCheck")
    --funcLevelInfo.comment

	--dump(funcLevelInfo.level)
	--dump(G_UserData:getBase():getLevel())

	local commit = funcLevelInfo.comment
	local userCheck = UserCheck.enoughLevel(funcLevelInfo.level)
	if userLastLevel then
		userCheck = UserCheck.enoughLastLevel(funcLevelInfo.level)
	end

	if userCheck and funcLevelInfo.day > 0 then
		local resetTime = getFunctionUpdateTime(funcLevelInfo.update_time)
		userCheck = UserCheck.enoughOpenDay(funcLevelInfo.day, resetTime)
		commit = funcLevelInfo.comment_time
	end

	local needVipLevel = 99
	if funcLevelInfo.vip_level > 0 then
		needVipLevel = funcLevelInfo.vip_level
	end
	local userVipLevel = G_UserData:getVip():getLevel()

    if userCheck or userVipLevel >= needVipLevel then
        if callback then
            callback(true)
        end
        return true,funcLevelInfo.description,funcLevelInfo
	end

    return false, commit, funcLevelInfo
end

function FunctionCheck.funcIsShow(funcId, callback)
	local funcLevelInfo = require("app.config.function_level").get(funcId)
    assert(funcLevelInfo, "Invalid function_level can not find funcId "..funcId)
   	local UserCheck = require("app.utils.logic.UserCheck")
	local userCheck = UserCheck.enoughLevel(funcLevelInfo.show_level)

	local timeCheck = true
	if funcLevelInfo.show_day > 0 then
		local resetTime = getFunctionUpdateTime(funcLevelInfo.update_time)
		timeCheck = UserCheck.enoughOpenDay(funcLevelInfo.show_day, resetTime)
	end

	return userCheck and timeCheck
end




return FunctionCheck
