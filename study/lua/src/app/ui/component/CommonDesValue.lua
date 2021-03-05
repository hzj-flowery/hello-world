--
-- Author: Liangxu
-- Date: 2017-07-10 20:32:34
-- 通用文字描述控件，格式为，描述：数值
local CommonDesValue = class("CommonDesValue")

local SPACE_WIDTH = 0 --描述和数值之间的间隔宽度

local EXPORTED_METHODS = {
    "updateUI",
    "setDesColor",
    "setValueColor",
    "setMaxColor",
    "setMaxValue",
    "setFontSize",
    "setValueToRichText"
}

function CommonDesValue:ctor()
    self._target = nil
end

function CommonDesValue:_init()
    self._textDes = ccui.Helper:seekNodeByName(self._target, "TextDes")
    self._textValue = ccui.Helper:seekNodeByName(self._target, "TextValue")
    self._textMax = ccui.Helper:seekNodeByName(self._target, "TextMax")
end

function CommonDesValue:bind(target)
    self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonDesValue:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonDesValue:updateUI(des, value, max, space)
    local dis = space or SPACE_WIDTH

    self._textDes:setString(des)
    self._textValue:setString(value)
    local sizeDes = self._textDes:getContentSize()
    local posValue = sizeDes.width + dis
    self._textValue:setPositionX(posValue)
    local sizeValue = self._textValue:getContentSize()
    local posMax = posValue + sizeValue.width
    self._textMax:setPositionX(posMax)

    if max then
        self._textMax:setString("/" .. max)
        self._textMax:setVisible(true)
    else
        self._textMax:setVisible(false)
    end
end

function CommonDesValue:setDesColor(color)
    if color == nil then
        return
    end
    self._textDes:setColor(color)
end

function CommonDesValue:setValueColor(color)
    if color == nil then
        return
    end
    self._textValue:setColor(color)
end

function CommonDesValue:setMaxColor(color)
    if color == nil then
        return
    end
    self._textMax:setColor(color)
end

function CommonDesValue:setMaxValue(txt)
    self._textMax:setString(txt)
end

function CommonDesValue:setValueToRichText(value, width)
    if self._textRichValue then
        self._textRichValue:removeFromParent()
        self._textRichValue = nil
    end
    local color = self._textValue:getColor()
    local colorValue = Colors.colorToNumber(color)
    local richText =
        Lang.get(
        "lang_des_value",
        {
            value = value,
            color = colorValue
        }
    )
    local x, y = self._textValue:getPositionX(), self._textValue:getPositionY()
    self._textRichValue = ccui.RichText:createWithContent(richText)
    self._textRichValue:ignoreContentAdaptWithSize(false)
    self._textRichValue:setContentSize(cc.size(width, 0))
    self._textRichValue:formatText()
    self._textRichValue:setAnchorPoint(cc.p(0, 1))
    self._target:addChild(self._textRichValue)
    self._textRichValue:setPosition(x, y + 10)
    self._textValue:setVisible(false)
    return self._textRichValue:getVirtualRendererSize().height
end

function CommonDesValue:setFontSize(fontSize)
    self._textDes:setFontSize(fontSize)
    self._textValue:setFontSize(fontSize)
    self._textMax:setFontSize(fontSize)
end

return CommonDesValue
