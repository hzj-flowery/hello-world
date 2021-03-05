-- Author: conley
-- 通用价格信息

local CommonPriceInfo = class("CommonPriceInfo")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


local EXPORTED_METHODS = {
    "updateUI",
    "setCount",
	"setCountColorRed",
	"setCountColorBeige",
	"setCountUnknown",
	"showResName",
	"setTextColor",
    "showDiscountLine"
}

function CommonPriceInfo:ctor()
end

function CommonPriceInfo:_init()
	self._imageRes = ccui.Helper:seekNodeByName(self._target, "Image")
	self._textCount =  ccui.Helper:seekNodeByName(self._target, "Text")
	self._textResName = ccui.Helper:seekNodeByName(self._target, "Text_title")
    self._imageLine = ccui.Helper:seekNodeByName(self._target, "Image_line")
    self._imageLine:setVisible(false)
end

function CommonPriceInfo:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPriceInfo:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--根据传入参数，创建并，更新UI
function CommonPriceInfo:updateUI(type, value, size)
	type = type or TypeConvertHelper.TYPE_RESOURCE
	local itemParams = TypeConvertHelper.convert(type, value)

	self._itemParams = itemParams
	if itemParams.res_mini then
		self._imageRes:loadTexture(itemParams.res_mini)
	end
	if size then
		self:setCount(size)
	end
	
end

function CommonPriceInfo:showResName(needShow,name)
	needShow = needShow or false

	if needShow then
		name = name or self._itemParams.name.." : "
		self._textResName:setVisible(needShow)
		self._textResName:setString(name)
	end
end

function CommonPriceInfo:setCount(count, max)
	if count ~= nil then
		self._textCount:setString(""..count)
	end
end



function CommonPriceInfo:_onShowResWay(sender)
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(self._itemParams.item_type, self._itemParams.cfg.id)
	PopupItemGuider:openWithAction()
end

function CommonPriceInfo:setCountColorRed(needRed)
	if needRed == nil then
		needRed = false
	end
	if needRed == true then
		self._textCount:setColor(Colors.uiColors.RED)
	else
		self._textCount:setColor(Colors.COLOR_POPUP_DESC_NOTE)
	end
	
end

function CommonPriceInfo:setCountColorBeige()
	self._textCount:setColor(Colors.uiColors.BEIGE)
end


function CommonPriceInfo:setCountUnknown()
	self._textCount:setString("???")
end


function CommonPriceInfo:setTextColor(c3b)
	self._textCount:setColor(c3b)
	self._textResName:setColor(c3b)
end


function CommonPriceInfo:showDiscountLine(show)
     self._imageLine:setVisible(show)
end


return CommonPriceInfo