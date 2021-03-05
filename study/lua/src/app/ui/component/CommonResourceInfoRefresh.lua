-- Author: conley
local CommonResourceInfoRefresh = class("CommonResourceInfoRefresh")

local EXPORTED_METHODS = {
   "alignToRight",
   "alignToRightForRandomShop",
}

function CommonResourceInfoRefresh:ctor()
end

function CommonResourceInfoRefresh:_init()
	self._imageRes = ccui.Helper:seekNodeByName(self._target, "Image")
	self._textCount =  ccui.Helper:seekNodeByName(self._target, "Text")
    self._textResName = ccui.Helper:seekNodeByName(self._target, "Text_ResName")

    cc.bind(self._target, "CommonResourceInfoCost")
end

function CommonResourceInfoRefresh:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonResourceInfoRefresh:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonResourceInfoRefresh:alignToRight(imgOffset,nameOffset)
	local countX = self._textCount:getPositionX()
    local textSize = self._textCount:getContentSize()
    local imgSize = self._imageRes:getContentSize()
    imgSize.width = imgSize.width * self._imageRes:getScaleX()
    self._imageRes:setPositionX(countX - textSize.width + imgOffset)
    self._textResName:setPositionX(countX - textSize.width +  imgOffset - imgSize.width + nameOffset)
end

function CommonResourceInfoRefresh:alignToRightForRandomShop()
    self:alignToRight(-6.3,-7.1)
end


return CommonResourceInfoRefresh