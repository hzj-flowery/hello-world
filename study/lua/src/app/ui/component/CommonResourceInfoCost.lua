-- Author: conley
local CommonResourceInfoCost = class("CommonResourceInfoCost")

local EXPORTED_METHODS = {
   "showResName",
}

function CommonResourceInfoCost:ctor()
end

function CommonResourceInfoCost:_init()
    self._textResName = ccui.Helper:seekNodeByName(self._target, "Text_ResName")

    cc.bind(self._target, "CommonResourceInfoList")
end

function CommonResourceInfoCost:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonResourceInfoCost:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonResourceInfoCost:showResName(show,name)
    if show then
        self._textResName:setVisible(true)
        self._textResName:setString(name)
    else
        self._textResName:setVisible(false)    
    end
end

return CommonResourceInfoCost