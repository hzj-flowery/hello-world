--
-- Author: Liangxu
-- Date: 2017-04-24 17:26:24
-- 属性显示，名字：值
local CommonAttr = class("CommonAttr")
local TextHelper = require("app.utils.TextHelper")

local SPACE_WIDTH = 0 --描述和数值之间的间隔宽度

local EXPORTED_METHODS = {
    "updateView",
    "setFontSize",
    "setNameColor",
    "setValueColor",
    "alignmentCenter",
	"updateValue",
}

function CommonAttr:ctor()
	self._target = nil
	
end

function CommonAttr:_init()
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._textValue = ccui.Helper:seekNodeByName(self._target, "TextValue")
end

function CommonAttr:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonAttr:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end





function CommonAttr:updateValue(attrId, value, space, nameLen)
if not attrId or attrId == 0 or not value then
		self._target:setVisible(false)
		return
	end
	local dis = space or SPACE_WIDTH

	local attrName, attrValue = TextHelper.getAttrBasicPlusText(attrId, value)
	if nameLen then
		attrName = TextHelper.expandTextByLen(attrName, nameLen)
	end
	self._textName:setString(attrName.."：")
	self._textValue:setString(attrValue)

	local sizeName = self._textName:getContentSize()
	local posValue = sizeName.width + dis
	self._textValue:setPositionX(posValue)
	
	self._target:setVisible(true)
end


function CommonAttr:updateView(attrId, value, space, nameLen)
	if not attrId or attrId == 0 or not value then
		self._target:setVisible(false)
		return
	end
	local dis = space or SPACE_WIDTH

	local attrName, attrValue = TextHelper.getAttrBasicText(attrId, value)
	if nameLen then
		attrName = TextHelper.expandTextByLen(attrName, nameLen)
	end
	self._textName:setString(attrName.."：")
	self._textValue:setString(attrValue)

	local sizeName = self._textName:getContentSize()
	local posValue = sizeName.width + dis
	self._textValue:setPositionX(posValue)
	
	self._target:setVisible(true)
end

function CommonAttr:setFontSize(fontSize)
	self._textName:setFontSize(fontSize)
	self._textValue:setFontSize(fontSize)
end

function CommonAttr:setNameColor(color)
	self._textName:setColor(color)
end

function CommonAttr:setValueColor(color)
	self._textValue:setColor(color)
end

function CommonAttr:alignmentCenter()
	local size1 = self._textName:getContentSize()
	local size2 = self._textValue:getContentSize()
	local width = self._textValue:getPositionX() + size2.width
	local posNameX = 0 - size1.width--width / 2
	-- local posValueX = posNameX + size1.width
	self._textName:setPositionX(posNameX)
	self._textValue:setPositionX(0)
end

return CommonAttr