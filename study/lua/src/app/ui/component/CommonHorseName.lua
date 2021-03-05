--
-- Author: Liangxu
-- Date: 2018-8-27
-- 战马名称
local CommonHorseName = class("CommonHorseName")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")

local EXPORTED_METHODS = {
	"setName",
	"setFontSize",
}

function CommonHorseName:ctor()
	self._target = nil
	self._textName = nil
end

function CommonHorseName:_init()
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
end

function CommonHorseName:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHorseName:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHorseName:setName(horseId, star)
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE, horseId)

	local name = HorseDataHelper.getHorseName(horseId, star)
	self._textName:setString(name)
	self._textName:setColor(param.icon_color)
	-- self._textName:enableOutline(param.icon_color_outline, 2)
end

function CommonHorseName:setFontSize(size)
	self._textName:setFontSize(size)
end

return CommonHorseName