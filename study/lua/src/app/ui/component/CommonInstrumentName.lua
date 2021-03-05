--
-- Author: Liangxu
-- Date: 2017-9-15 10:57:30
-- 神兵名字
local CommonInstrumentName = class("CommonInstrumentName")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper  = require("yoka.utils.UIHelper")

local EXPORTED_METHODS = {
	"setName",
	"setFontSize",
	"disableOutline",
	"showTextBg"
}

function CommonInstrumentName:ctor()
	self._target = nil
	self._textName = nil
	self._imageBg = nil
end

function CommonInstrumentName:_init()
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
	self._imageBg:setVisible(false)
end

function CommonInstrumentName:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonInstrumentName:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonInstrumentName:setName(instrumentId, rank, limitLevel)
	local instrumentParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, instrumentId, nil, nil, limitLevel)

	local instrumentName = instrumentParam.name
	if rank and rank > 0 then
		instrumentName = instrumentName.."+"..rank
	end

	self._textName:setString(instrumentName)
	self._textName:setColor(instrumentParam.icon_color)
	UIHelper.updateTextOutline(self._textName, instrumentParam)
	-- self._textName:enableOutline(instrumentParam.icon_color_outline, 2)
	self._imageBg:setVisible(true)
end

function CommonInstrumentName:setFontSize(size)
	self._textName:setFontSize(size)
end

function CommonInstrumentName:disableOutline()
	self._textName:disableEffect(cc.LabelEffect.OUTLINE)
end

function CommonInstrumentName:showTextBg(bShow)
	self._imageBg:setVisible(bShow)
end

return CommonInstrumentName