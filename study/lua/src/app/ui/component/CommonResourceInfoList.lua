
-- Author: conley

local CommonResourceInfoList = class("CommonResourceInfoListList")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
    "setCount",
    "updateUI",
	"setTextColorToRed",
	"setGray",
	"resetFromGray",
	"setTextColorToATypeColor",
	"setTextColorToBTypeColor",
	"setTextColorToDTypeColor",
	"setCountColorToBtnLevel1Bright",
	"setCountColorToWhite",
	"setFontSize",
}

function CommonResourceInfoList:ctor()

end

function CommonResourceInfoList:_init()
	self._imageRes = ccui.Helper:seekNodeByName(self._target, "Image")
	self._textCount =  ccui.Helper:seekNodeByName(self._target, "Text")
end

function CommonResourceInfoList:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonResourceInfoList:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--根据传入参数，创建并，更新UI
function CommonResourceInfoList:updateUI(type, value, size)
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


function CommonResourceInfoList:setCount(count)
	if count ~= nil then
		self._textCount:setString(""..count)
	end
end

function CommonResourceInfoList:setTextColorToRed()
	self._textCount:setColor(Colors.DARK_BG_RED)
end

function CommonResourceInfoList:setGray()
	local ShaderHelper = require("app.utils.ShaderHelper")
	ShaderHelper.filterNode(self._imageRes, "gray")
	self._textCount:setColor(Colors.BUTTON_ONE_DISABLE)
end

function CommonResourceInfoList:resetFromGray()
	local ShaderHelper = require("app.utils.ShaderHelper")
	ShaderHelper.filterNode(self._imageRes, "", true)
	self:setTextColorToATypeColor()
end

function CommonResourceInfoList:setTextColorToATypeColor()
	self._textCount:setColor(Colors.BRIGHT_BG_ONE)
end

function CommonResourceInfoList:setTextColorToBTypeColor()
	self._textCount:setColor(Colors.LIST_TEXT)
end

function CommonResourceInfoList:setTextColorToDTypeColor()
	self._textCount:setColor(Colors.BRIGHT_BG_ONE)
end

function CommonResourceInfoList:setCountColorToBtnLevel1Bright()
	self._textCount:setColor(Colors.BUTTON_ONE_NOTE)
	-- self._textCount:enableOutline(Colors.BUTTON_ONE_NOTE_OUTLINE, 2)
end

function CommonResourceInfoList:setCountColorToWhite()
	self._textCount:setColor(Colors.CLASS_WHITE)
end

function CommonResourceInfoList:setFontSize(fontSize)
	self._textCount:setFontSize(fontSize)
end

return CommonResourceInfoList
