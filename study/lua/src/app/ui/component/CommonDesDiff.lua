--
-- Author: Liangxu
-- Date: 2018-1-8 16:32:47
-- 通用对比描述控件，格式为，描述：数值1，数值2
local CommonDesDiff = class("CommonDesDiff")

local EXPORTED_METHODS = {
    "updateUI",
    "setDesColor",
    "setValueColor1",
    "setValueColor2",
    "setFontSize",
    "setSpace1",
    "setSpace2",
}

function CommonDesDiff:ctor()
	self._target = nil
	self._fontSize = 20
	self._desColor = Colors.BRIGHT_BG_TWO
	self._valueColor1 = Colors.DARK_BG_ONE
	self._valueColor2 = Colors.DARK_BG_ONE
	self._space1 = 40
	self._space2 = 210
end

function CommonDesDiff:_init()
	self._textDes = ccui.Helper:seekNodeByName(self._target, "TextDes")
	self._textValue1 = ccui.Helper:seekNodeByName(self._target, "TextValue1")
	self._textValue2 = ccui.Helper:seekNodeByName(self._target, "TextValue2")
end

function CommonDesDiff:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonDesDiff:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonDesDiff:updateUI(des, value1, value2)
	self._textDes:setFontSize(self._fontSize)
	self._textValue1:setFontSize(self._fontSize)
	self._textValue2:setFontSize(self._fontSize)

	self._textDes:setColor(self._desColor)
	self._textValue1:setColor(self._valueColor1)
	self._textValue2:setColor(self._valueColor2)
	
	self._textValue1:setPositionX(self._space1)
    self._textValue2:setPositionX(self._space2)

    self._textDes:setString(des)
	self._textValue1:setString(value1)
	self._textValue2:setString(value2)
end

function CommonDesDiff:setDesColor(color)
	self._desColor = color
end

function CommonDesDiff:setValueColor1(color)
	self._valueColor1 = color
end

function CommonDesDiff:setValueColor2(color)
	self._valueColor2 = color
end

function CommonDesDiff:setFontSize(fontSize)
	self._fontSize = fontSize
end

function CommonDesDiff:setSpace1(width)
	self._space1 = width
end

function CommonDesDiff:setSpace2(width)
	self._space2 = width
end

return CommonDesDiff