local PopupHonorTitleHelper = {}

local UserCheck = require("app.utils.logic.UserCheck")

-- 获取称号配置
function PopupHonorTitleHelper.getConfigByTitleId(titleId)
	-- body
	local HonorTitleConfig = require("app.config.title")
	local curTitleConfig = HonorTitleConfig.get(titleId)
	assert(curTitleConfig, "not title by this id " .. titleId)
	return curTitleConfig
end

-- 转换称号有效期时间为天数
function PopupHonorTitleHelper.getExpireTimeString(expireTime)
	local leftTime = expireTime - G_ServerTime:getTime()
	local day, hour, min, second = G_ServerTime:convertSecondToDayHourMinSecond(leftTime)
	-- logWarn("time >>>>>>>> " .. leftTime / (24 * 3600))
	local dateStr = string.format(Lang.get("honor_expire_time"), day)
	if day < 1 then
		min = min < 1 and 1 or min
		dateStr = string.format("%02d:%02d", hour, min) --localdate.hour, localdate.min, localdate.se
	end
	return dateStr, day < 1
end

-- 获取已经装备的称号
function PopupHonorTitleHelper.getEquipedTitle()
	local titleList = G_UserData:getTitles():getHonorTitleList()
	assert(titleList, "title list is nil")
	for i = 1, #titleList do
		if titleList[i]:isIsEquip() then
			return titleList[i]
		end
	end
end

-- 检查等级和时间是否符合
function PopupHonorTitleHelper.enoughLevelAndOpendayByTitleId(titleId)
	-- body
	if titleId <= 0 then
		return false
	end

	local curConfig = PopupHonorTitleHelper.getConfigByTitleId(titleId)
	if UserCheck.enoughLevel(curConfig.limit_level) and UserCheck.enoughOpenDay(curConfig.day) then
		return true
	end
	return false
end

-- 获取称号图片资源
function PopupHonorTitleHelper.getTitleImg(id)
	local curConfig = PopupHonorTitleHelper.getConfigByTitleId(id)
	if curConfig and curConfig.resource then
		return Path.getImgTitle(curConfig.resource)
	end
	return "", ""
end

-- 显示称号装备与卸下提示
function PopupHonorTitleHelper.showEquipTip(id)
	if id == 0 then
		G_Prompt:showTip(Lang.get("honor_title_unload_tip"))
	else
		G_Prompt:showTip(Lang.get("honor_title_equip_tip"))
	end
end

-- 获取称号size
function PopupHonorTitleHelper.getTitleSize(titleId)
	local curConfig = PopupHonorTitleHelper.getConfigByTitleId(titleId)
	if not curConfig or not curConfig.resource then
		return
	end
	return PopupHonorTitleHelper.getTitleSizeByImageId(curConfig.resource)
end

function PopupHonorTitleHelper.getTitleSizeByImageId(imageId)
	local res = Path.getImgTitle(imageId)
	local titleImg = ccui.ImageView:create(res)
	titleImg:ignoreContentAdaptWithSize(true)
	return titleImg:getContentSize()
end

return PopupHonorTitleHelper
