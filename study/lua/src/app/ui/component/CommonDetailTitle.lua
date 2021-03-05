--
-- Author: Liangxu
-- Date: 2017-07-12 13:46:28
-- 通用详情标题控件
local CommonDetailTitle = class("CommonDetailTitle")

local EXPORTED_METHODS = {
    "setTitle",
    "setTitleColor",
    "setTitleOutLine",
    "setFontSize",
    "setFontName",
    "setFontImageBgSize",
    "setTitleAndAdjustBgSize",
    "setImageBaseSize",
    "showTextBg"
}

function CommonDetailTitle:ctor()
	self._target = nil
end

function CommonDetailTitle:_init()
	self._textTitle = ccui.Helper:seekNodeByName(self._target, "TextTitle")
    self._imageBase = ccui.Helper:seekNodeByName(self._target, "ImageBase")
end

function CommonDetailTitle:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonDetailTitle:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonDetailTitle:setTitleAndAdjustBgSize(title)
	self._textTitle:setString(title)
    local size = self._textTitle:getContentSize()
    local imageBaseSize = self._imageBase:getContentSize()
    self._imageBase:setContentSize(cc.size(size.width + 110, imageBaseSize.height))
end

function CommonDetailTitle:setTitle(title)
	self._textTitle:setString(title)
end

function CommonDetailTitle:setTitleColor(color)
	self._textTitle:setColor(color)
end

function CommonDetailTitle:setTitleOutLine(color)
	self._textTitle:enableOutline(color, 2)
end

function CommonDetailTitle:setFontSize(size)
	self._textTitle:setFontSize(size)
end

function CommonDetailTitle:setFontName(fontName)
	self._textTitle:setFontName(fontName)
end

function CommonDetailTitle:setFontImageBgSize(size)
    self._imageBase:setContentSize(size)
end

function CommonDetailTitle:setImageBaseSize(size)
    self._imageBase:setContentSize(size)
end

function CommonDetailTitle:showTextBg(bShow)
    self._imageBase:setVisible(bShow)
end


return CommonDetailTitle
