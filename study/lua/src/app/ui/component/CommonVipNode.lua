
local CommonVipNode = class("CommonVipNode")

local EXPORTED_METHODS = {
    "setString",
    "alignCenter",
}

function CommonVipNode:ctor()
	self._target = nil
end

function CommonVipNode:_init()
	self._imageVip = ccui.Helper:seekNodeByName(self._target, "Image_vip")
	self._textVip1 = ccui.Helper:seekNodeByName(self._target, "Text_vip_1")
    self._textVip2 = ccui.Helper:seekNodeByName(self._target, "Text_vip_2")
    
end

function CommonVipNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonVipNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonVipNode:setString(vip)
    local num = tonumber(vip)
    if num < 10 then
        self._textVip1:setVisible(true)
        self._textVip2:setVisible(false)
        self._textVip1:setString(tostring(num))
    else
        self._textVip1:setVisible(true)
        self._textVip2:setVisible(true)  
        self._textVip1:setString( tostring(math.floor( num / 10) )) 
        self._textVip2:setString(tostring(num % 10))
    end
  
    
end

function CommonVipNode:alignCenter()

end

return CommonVipNode