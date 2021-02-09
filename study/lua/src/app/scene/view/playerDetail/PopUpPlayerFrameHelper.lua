local PopUpPlayerFrameHelper = {}

local currentTouchIndexId = 0


function PopUpPlayerFrameHelper.getCurrentTouchIndex()
	return currentTouchIndexId
end

function PopUpPlayerFrameHelper.setCurrentTouchIndex(indexId)
	currentTouchIndexId = indexId
end


-- 转换称号有效期时间为天数
function PopUpPlayerFrameHelper.getExpireTimeString(expireTime, maxDay)
	local leftTime = expireTime - G_ServerTime:getTime()
	local day, hour, min, second = G_ServerTime:convertSecondToDayHourMinSecond(leftTime)
	-- logWarn("time >>>>>>>> " .. leftTime / (24 * 3600))
	day = math.min(day, maxDay)
	local dateStr = string.format(Lang.get("honor_expire_time"), day)
	if day < 1 then
		dateStr = string.format("%02d:%02d:%02d", hour, min, second) --localdate.hour, localdate.min, localdate.se
	end
	return dateStr, day < 1
end

return PopUpPlayerFrameHelper
