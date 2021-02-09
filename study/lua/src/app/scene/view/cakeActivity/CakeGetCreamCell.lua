--
-- Author: Liangxu
-- Date: 2019-4-30
-- 蛋糕活动获取奶油Cell

local ListViewCellBase = require("app.ui.ListViewCellBase")
local CakeGetCreamCell = class("CakeGetCreamCell", ListViewCellBase)
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local UserCheck = require("app.utils.logic.UserCheck")

function CakeGetCreamCell:ctor()
	local resource = {
		file = Path.getCSB("CakeGetCreamCell", "cakeActivity"),
		binding = {
			_buttonBuy = {
				events = {{event = "touch", method = "_onClickBuy"}}
			},
			_imageAward = {
				events = {{event = "touch", method = "_onClickIcon"}}
			},
		}
	}
	CakeGetCreamCell.super.ctor(self, resource)
end

function CakeGetCreamCell:onCreate()
	local size = self._panelBg:getContentSize()
	self:setContentSize(size.width, size.height)
	self._info = nil
	self._imageAward:setSwallowTouches(false)
	self._nodeResource:setImageResScale(0.9)
	self._nodeResource:setTextCountSize(24)
end

function CakeGetCreamCell:update(id)
	local info = CakeActivityDataHelper.getCakeChargeConfig(id)
	self._info = info
	self._imageAward:loadTexture(Path.getAnniversaryImg(info.award1))
	self._textCount:setString("x"..info.size1)
	
	self._nodeResource:updateUI(info.cost_type, info.cost_value, info.cost_size)
	
	self._nodeResource:setTextColor(cc.c3b(0xff, 0xff, 0xff))
	self._nodeResource:setTextOutLine(cc.c3b(0xd1, 0x4a, 0x14))
	
	self._buttonBuy:setString(Lang.get("shop_btn_buy"))
end

function CakeGetCreamCell:_onClickBuy()
	if CakeActivityDataHelper.isCanRecharge() == false then
		return	
	end
	
	local retValue = UserCheck.enoughJade2(self._info.cost_size, true)
	if retValue == false then
		return
	end
	
	self:dispatchCustomCallback(1)
end

function CakeGetCreamCell:_onClickIcon()
	local popup = require("app.ui.PopupItemInfo").new()
	popup:updateUI(self._info.type1, self._info.value1)
	popup:openWithAction()
end

return CakeGetCreamCell
