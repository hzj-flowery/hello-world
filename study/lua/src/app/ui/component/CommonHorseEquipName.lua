--
-- Author: JerryHe
-- Date: 2019-01-29
--
local CommonHorseEquipName = class("CommonHorseEquipName")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
	"setName",
	"setFontSize",
}

function CommonHorseEquipName:ctor()
	self._target = nil
	self._textName = nil
end

function CommonHorseEquipName:_init()
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
end

function CommonHorseEquipName:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHorseEquipName:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHorseEquipName:setName(equipId, rank)
	local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE_EQUIP, equipId)

	local equipName = equipParam.name

	self._textName:setString(equipName)
	self._textName:setColor(equipParam.icon_color)
	-- self._textName:enableOutline(equipParam.icon_color_outline, 2)
end

function CommonHorseEquipName:setFontSize(size)
	self._textName:setFontSize(size)
end


return CommonHorseEquipName