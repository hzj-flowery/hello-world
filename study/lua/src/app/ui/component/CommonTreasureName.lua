--
-- Author: Liangxu
-- Date: 2017-06-06 14:27:08
-- 宝物名字
local CommonTreasureName = class("CommonTreasureName")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper  = require("yoka.utils.UIHelper")

local EXPORTED_METHODS = {
	"setName",
	"setFontSize",
	"disableOutline",
	"showTextBg"
}

function CommonTreasureName:ctor()
	self._target = nil
	self._textName = nil
	self._textBg = nil
end

function CommonTreasureName:_init()
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._textBg = ccui.Helper:seekNodeByName(self._target,"Image_1")
end

function CommonTreasureName:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTreasureName:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonTreasureName:setName(treasureId, rank, formatName)
	local treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureId)

	local treasureName = treasureParam.name
	if rank and rank > 0 then
		treasureName = treasureName.."+"..rank
	end

	self._textName:setString(treasureName)
	self._textName:setColor(treasureParam.icon_color)
	UIHelper.updateTextOutline(self._textName, treasureParam)
    -- self._textName:enableOutline(treasureParam.icon_color_outline, 2)

    if formatName then
        self:_resetTextAreaSize()
    end
end

function CommonTreasureName:_resetTextAreaSize()
    local renderSize = self._textName:getVirtualRendererSize()
    local fontSize = self._textName:getFontSize()
    local maxWidth = fontSize * 6           --最多显示6个汉字
    local lineHeight = fontSize + 4         --单行高度，字体+ 4

    -- 这里判断时，如果是一行字，高度是字体+4
    -- 单行的宽度是字体个数x大小，但是设置尺寸后，每个字，中间间隔最少1给像素，否则最后一个字，显示不出。
    if renderSize.width > maxWidth or renderSize.height > lineHeight then
        self._textName:setTextAreaSize(cc.size(maxWidth + 3,lineHeight * 2))
        self._textName:setPositionY(-lineHeight/2 - 2)
    else
        self._textName:setTextAreaSize(cc.size(maxWidth + 3,lineHeight))
        self._textName:setPositionY(-2)
    end

    self._textName:ignoreContentAdaptWithSize(false)
end

function CommonTreasureName:setFontSize(size)
	self._textName:setFontSize(size)
end

function CommonTreasureName:disableOutline()
	self._textName:disableEffect(cc.LabelEffect.OUTLINE)
end

function CommonTreasureName:showTextBg(bShow)
	self._textBg:setVisible(bShow)
end


return CommonTreasureName