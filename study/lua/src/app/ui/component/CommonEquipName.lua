--
-- Author: Liangxu
-- Date: 2017-04-06 17:14:02
--
local CommonEquipName = class("CommonEquipName")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper  = require("yoka.utils.UIHelper")

local EXPORTED_METHODS = {
	"setName",
	"setFontSize",
	"setNameWidth"
}

function CommonEquipName:ctor()
	self._target = nil
	self._textName = nil
end

function CommonEquipName:_init()
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
end

function CommonEquipName:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonEquipName:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonEquipName:setName(equipId, rank)
	local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipId)

	local equipName = equipParam.name
	if rank and rank > 0 then
		equipName = equipName .. "+" .. rank
	end

	self._textName:setString(equipName)
	self._textName:setColor(equipParam.icon_color)
	self._textName:setFontSize(20)
	UIHelper.updateTextOutline(self._textName, equipParam)
end

function CommonEquipName:setFontSize(size)
	self._textName:setFontSize(size)
end

function CommonEquipName:setNameWidth(width)
	local size = self._textName:getContentSize()
	self._textName:setContentSize(width, size.height)
end

return CommonEquipName
