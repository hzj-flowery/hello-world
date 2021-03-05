local UIHelper  = require("yoka.utils.UIHelper")

local CommonIconBase = import(".CommonIconBase")

local CommonDefaultIcon = class("CommonDefaultIcon",CommonIconBase)

local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")



function CommonDefaultIcon:ctor()
	CommonDefaultIcon.super.ctor(self)
	self._type = TypeConvertHelper.TYPE_RESOURCE
end

function CommonDefaultIcon:_init()
	CommonDefaultIcon.super._init(self)
end


--根据传入参数，创建并，更新UI
function CommonDefaultIcon:updateUI(value, size)

end

function CommonDefaultIcon:getItemParams( ... )
	local itemParams = {}
	itemParams.name = Lang.get("default_icon")
	itemParams.icon_color = 2
	itemParams.icon_color_outline = 2
	return itemParams

end


return CommonDefaultIcon
