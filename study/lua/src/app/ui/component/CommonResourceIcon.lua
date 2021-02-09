--
-- Author: hedl
-- Date: 2017-02-22 18:02:15
-- 通用资源icon
local UIHelper  = require("yoka.utils.UIHelper")

local CommonIconBase = import(".CommonIconBase")

local CommonResourceIcon = class("CommonResourceIcon",CommonIconBase)

local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")



function CommonResourceIcon:ctor()
	CommonResourceIcon.super.ctor(self)
	self._type = TypeConvertHelper.TYPE_RESOURCE
end

function CommonResourceIcon:_init()
	CommonResourceIcon.super._init(self)
end

--[[
function CommonResourceIcon:bind(target)
	CommonResourceIcon.super.bind(self, target)
	--根据EXPORTED_METHODS， 从ComponentIconHelper中动态查找需要绑定的函数
	--主要HeroIcon， ItemIcon 等不同类型的Icon有不少函数是重复的，因此加入动态绑定函数功能
	for i, value in ipairs(EXPORTED_METHODS) do
		local bindFunction = ComponentIconHelper["bind_"..value]
		if bindFunction and type(bindFunction) == "function" then
			bindFunction(self)
		end
	end
	cc.setmethods(target, self, EXPORTED_METHODS)
end
]]

--根据传入参数，创建并，更新UI
function CommonResourceIcon:updateUI(value, size)

    local itemParams = CommonResourceIcon.super.updateUI(self, value, size)
	if itemParams.size ~= nil then
		self:setCount(itemParams.size)
	end

end


function CommonResourceIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(sender, self._itemParams)
			else
				local PopupItemInfo = require("app.ui.PopupItemInfo").new()
				PopupItemInfo:updateUI(self._type , self._itemParams.cfg.id)
	    		PopupItemInfo:openWithAction()
			end
		end
	end
end


return CommonResourceIcon
