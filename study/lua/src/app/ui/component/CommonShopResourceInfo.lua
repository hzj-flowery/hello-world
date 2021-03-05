--
-- Author: hedl
-- Date: 2017-02-27 18:02:15
-- 商店资源通用信息

local CommonShopResourceInfo = class("CommonShopResourceInfo")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


local EXPORTED_METHODS = {
    "setCount",
    "updateUI",
	"addClickEventListenerEx"
}

function CommonShopResourceInfo:ctor()

end

function CommonShopResourceInfo:_init()
	self._imageRes = ccui.Helper:seekNodeByName(self._target, "Image")
	self._textCount =  ccui.Helper:seekNodeByName(self._target, "Text")
	self._btnAdd = ccui.Helper:seekNodeByName(self._target,"Button_add")
	self._imageBk = ccui.Helper:seekNodeByName(self._target,"Image_bk")
end

function CommonShopResourceInfo:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonShopResourceInfo:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--根据传入参数，创建并，更新UI
function CommonShopResourceInfo:updateUI(type, value, size)
	type = type or TypeConvertHelper.TYPE_RESOURCE
	local itemParams = TypeConvertHelper.convert(type, value)
	if itemParams.res_mini then
		self._imageRes:loadTexture(itemParams.res_mini)
	end
	if size then
		self:setCount(size)
	end
end

function CommonShopResourceInfo:setCount(count)
	if checknumber(count) then
		self._textCount:setString(""..count)
	end
end

function CommonShopResourceInfo:addClickEventListenerEx(callback)
	self._btnAdd:addClickEventListenerEx(callback, true, nil, 0)
	self._imageBk:addClickEventListenerEx(callback, true, nil, 0)
end
return CommonShopResourceInfo