
-- Author: nieming
-- Date:2018-04-13 16:38:51
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CustomActivityAvatarAdView = class("CustomActivityAvatarAdView", ViewBase)
local CustomActivityAvatarHelper = import(".CustomActivityAvatarHelper")
local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")

local IMAGE = {
	[1] = {
		["bgName"] = "img_activity_bg04",
		["timeBgName"] = "img_activity_changecard0",
		["dayName"] = "img_activity_changecard",
	},
	[2] = {
		["bgName"] = "img_activity_bg07",
		["timeBgName"] = "img_activity_hong0",
		["dayName"] = "img_activity_hong",
	},
}

function CustomActivityAvatarAdView:ctor(parentView)

	--csb bind var name
	self._buttonGoto = nil  --CommonButtonHighLight
	self._imageCostIcon = nil  --ImageView
	self._imageRemainDay = nil  --ImageView
	self._textResCost = nil  --Text
	self._parentView = parentView

	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("CustomActivityAvatarAdView", "customactivity/avatar"),
		binding = {
			_buttonGoto = {
				events = {{event = "touch", method = "_onButtonGoto"}}
			},
		},
	}
	CustomActivityAvatarAdView.super.ctor(self, resource)
end

-- Describle：
function CustomActivityAvatarAdView:onCreate()
	self._buttonGoto:setString(Lang.get("common_btn_goto_activity"))
	local cosRes = CustomActivityAvatarHelper.getCosRes()
	local itemParams = TypeConvertHelper.convert(cosRes.type, cosRes.value, cosRes.size)
	if itemParams.res_mini then
		self._imageCostIcon:loadTexture(itemParams.res_mini)
	end
	self:enterModule()
end

function CustomActivityAvatarAdView:_updateDayNum()
	local actUnitdata = G_UserData:getCustomActivity():getAvatarActivity()
	if actUnitdata then
		local batch = actUnitdata:getBatch()
		local bgIndex = require("app.config.avatar_activity").get(batch).Background
		local endTime = actUnitdata:getEnd_time()
		local leftTime = endTime - G_ServerTime:getTime()
		local day,hour,min,second = G_ServerTime:convertSecondToDayHourMinSecond(leftTime)
		local imageInfo = IMAGE[bgIndex]
		if imageInfo then
			self._imageBg:loadTexture(Path.getCustomActivityUIBg(imageInfo.bgName))
		end

		if day >= 1 and day <= 3 then
			if imageInfo then
				self._imageTime:loadTexture(Path.getCustomActivityUI(imageInfo.dayName..day))
			end
			self._textTime:setVisible(false)
		else
			if imageInfo then
				self._imageTime:loadTexture(Path.getCustomActivityUI(imageInfo.timeBgName))
			end
			self._textTime:setVisible(true)
			self._textTime:stopAllActions()
			local timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitdata:getEnd_time())
			self._textTime:setString(timeStr)
			local UIActionHelper = require("app.utils.UIActionHelper")
			local action = UIActionHelper.createUpdateAction(function()
				local timeStr1 = CustomActivityUIHelper.getLeftDHMSFormat(actUnitdata:getEnd_time())
				self._textTime:setString(timeStr1)
			end, 0.5)
			self._textTime:runAction(action)
		end
	end
end



function CustomActivityAvatarAdView:enterModule()
	self._textResCost:setString(string.format("x%s", G_UserData:getItems():getItemNum(DataConst.ITEM_AVATAR_ACTIVITY_TOKEN)))
	self:_updateDayNum()

end


-- Describle：
function CustomActivityAvatarAdView:onEnter()

end

-- Describle：
function CustomActivityAvatarAdView:onExit()

end
-- Describle：
function CustomActivityAvatarAdView:_onButtonGoto()
	-- body
	self._parentView:jumpToAvatarActivity()
end

return CustomActivityAvatarAdView
