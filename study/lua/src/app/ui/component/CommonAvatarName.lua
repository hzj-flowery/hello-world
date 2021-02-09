--
-- Author: Liangxu
-- Date: 2018-1-3 15:43:58
-- 变身卡名字
local CommonAvatarName = class("CommonAvatarName")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIHelper  = require("yoka.utils.UIHelper")

local EXPORTED_METHODS = {
	"setName",
	"enableOutline",
	"setFontSize",
}

function CommonAvatarName:ctor()
	self._target = nil
	self._textName = nil
	self._enableOutline = true
end

function CommonAvatarName:_init()
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")

end

function CommonAvatarName:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonAvatarName:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonAvatarName:setName(baseId, rankLevel)
	if baseId == nil then
		self._target:setVisible(false)
		return
	end
	local param = nil
	if baseId == 0 then
		local roleId = G_UserData:getHero():getRoleBaseId()
		param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, roleId)
	else
		param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_AVATAR, baseId)
	end

	local name = param.name
	if rankLevel and rankLevel > 0 then
		name = name.."+"..rankLevel
	end
	self._textName:setString(name)
	self._textName:setColor(param.icon_color)
	UIHelper.updateTextOutline(self._textName, param)
	-- if self._enableOutline then
	-- 	self._textName:enableOutline(param.icon_color_outline, 2)
	-- end
	
	self._target:setVisible(true)
end

function CommonAvatarName:enableOutline(enable)
	self._enableOutline = enable
end

function CommonAvatarName:setFontSize(size)
	self._textName:setFontSize(size)
end

return CommonAvatarName