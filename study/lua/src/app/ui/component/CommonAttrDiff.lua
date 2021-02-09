--
-- Author: Liangxu
-- Date: 2017-04-17 20:43:47
-- 属性差值
local CommonAttrDiff = class("CommonAttrDiff")
local TextHelper = require("app.utils.TextHelper")

local EXPORTED_METHODS = {
    "updateInfo",
    "setNameColor",
    "setCurValueColor",
    "setNextValueColor",
    "setAddValueColor",
    "showArrow",
    "showDiffValue",
	"updateValue",
}

function CommonAttrDiff:ctor()
	self._target = nil
	
end

function CommonAttrDiff:_init()
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._textCurValue = ccui.Helper:seekNodeByName(self._target, "TextCurValue")
	self._textNextValue = ccui.Helper:seekNodeByName(self._target, "TextNextValue")
	self._imageUpArrow = ccui.Helper:seekNodeByName(self._target, "ImageUpArrow")
	self._textAddValue = ccui.Helper:seekNodeByName(self._target, "TextAddValue")
end

function CommonAttrDiff:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonAttrDiff:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonAttrDiff:updateValue(attrId, curValue, nextValue, nameLen)
	if attrId == nil or curValue == nil then
		return
	end
	
	local name, value1 = TextHelper.getAttrBasicPlusText(attrId, curValue)
	if nameLen then
		name = TextHelper.expandTextByLen(name, nameLen)
	end
	self._textName:setString(name.."：")
	self._textCurValue:setString(value1)

	if nextValue == nil then --达到上限
		self._textNextValue:setString(Lang.get("equipment_strengthen_max_level"))
		self._textNextValue:setColor(Colors.BRIGHT_BG_GREEN)
		self._imageUpArrow:setVisible(false)
		self._textAddValue:setString("")
		return
	end
	
	local _, value2 = TextHelper.getAttrBasicPlusText(attrId, nextValue)
	local _, value3 = TextHelper.getAttrBasicPlusText(attrId, nextValue - curValue)
	self._textNextValue:setString(value2)
	self._textNextValue:setColor(Colors.BRIGHT_BG_ONE)
	self._imageUpArrow:setVisible(true)
	self._textAddValue:setString(value3)
end

function CommonAttrDiff:updateInfo(attrId, curValue, nextValue, nameLen)
	if attrId == nil or curValue == nil then
		return
	end
	
	local name, value1 = TextHelper.getAttrBasicText(attrId, curValue)
	if nameLen then
		name = TextHelper.expandTextByLen(name, nameLen)
	end
	self._textName:setString(name.."：")
	self._textCurValue:setString(value1)

	if nextValue == nil then --达到上限
		self._textNextValue:setString(Lang.get("equipment_strengthen_max_level"))
		self._textNextValue:setColor(Colors.BRIGHT_BG_GREEN)
		self._imageUpArrow:setVisible(false)
		self._textAddValue:setString("")
		return
	end
	
	local _, value2 = TextHelper.getAttrBasicText(attrId, nextValue)
	local _, value3 = TextHelper.getAttrBasicText(attrId, nextValue - curValue)
	self._textNextValue:setString(value2)
	self._textNextValue:setColor(Colors.BRIGHT_BG_ONE)
	self._imageUpArrow:setVisible(true)
	self._textAddValue:setString(value3)
end

function CommonAttrDiff:setNameColor(color)
	if color == nil then
        return
    end
	self._textName:setColor(color)
end

function CommonAttrDiff:setCurValueColor(color)
	if color == nil then
        return
    end
	self._textCurValue:setColor(color)
end

function CommonAttrDiff:setNextValueColor(color)
	if color == nil then
        return
    end
	self._textNextValue:setColor(color)
end

function CommonAttrDiff:setAddValueColor(color)
	if color == nil then
		return
	end
	self._textAddValue:setColor(color)
end

function CommonAttrDiff:showArrow(visible)
	self._imageUpArrow:setVisible(visible)
end

function CommonAttrDiff:showDiffValue(visible)
	self._textAddValue:setVisible(visible)
end

return CommonAttrDiff