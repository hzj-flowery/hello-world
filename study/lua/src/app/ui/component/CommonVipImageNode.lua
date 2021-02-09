
local CommonVipImageNode = class("CommonVipImageNode")

local EXPORTED_METHODS = {
    "setVip",
    "alignCenter",
    "loadVipImg",
}

function CommonVipImageNode:ctor()
	self._target = nil
end

function CommonVipImageNode:_init()
	self._imageVip = ccui.Helper:seekNodeByName(self._target, "Image_vip")
	self._imageNum = ccui.Helper:seekNodeByName(self._target, "Image_num")

    self._imageVip:ignoreContentAdaptWithSize(false)
    self._imageNum:ignoreContentAdaptWithSize(false)
end

function CommonVipImageNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonVipImageNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonVipImageNode:setVip(vip)
    local num = tonumber(vip)
    self._imageNum:loadTexture(Path.getVipNum(num))
end

function CommonVipImageNode:loadVipImg(path)
    self._imageNum:loadTexture(path)
end

function CommonVipImageNode:alignCenter()

end

return CommonVipImageNode