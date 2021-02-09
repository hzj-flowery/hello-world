local PopUpGuildFlagSettingHelper = {}

local currentTouchIndexId = 0


function PopUpGuildFlagSettingHelper.getCurrentTouchIndex()
	return currentTouchIndexId
end

function PopUpGuildFlagSettingHelper.setCurrentTouchIndex(indexId)
	currentTouchIndexId = indexId
end


-- 转换称号有效期时间为天数
function PopUpGuildFlagSettingHelper.getExpireTimeString(expireTime)
	local leftTime = expireTime - G_ServerTime:getTime()
	local day, hour, min, second = G_ServerTime:convertSecondToDayHourMinSecond(leftTime)
	-- logWarn("time >>>>>>>> " .. leftTime / (24 * 3600))
	local dateStr = string.format(Lang.get("honor_expire_time"), day)
	if day < 1 then
		dateStr = string.format("%02d:%02d:%02d", hour, min, second) --localdate.hour, localdate.min, localdate.se
	end
	return dateStr, day < 1
end

return PopUpGuildFlagSettingHelper
