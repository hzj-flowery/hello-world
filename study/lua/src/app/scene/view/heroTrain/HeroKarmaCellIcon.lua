--
-- Author: Liangxu
-- Date: 2017-03-23 17:18:28
-- 武将缘分Cell中的Icon
local HeroKarmaCellIcon = class("HeroKarmaCellIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper  = require("yoka.utils.UIHelper")

function HeroKarmaCellIcon:ctor(target)
	self._target = target
	self:_init()
end

function HeroKarmaCellIcon:_init()
	self._fileNodeIcon = ccui.Helper:seekNodeByName(self._target, "FileNodeIcon")
	cc.bind(self._fileNodeIcon, "CommonHeroIcon")
	self._fileNodeIcon:setCallBack(handler(self, self._onClickIcon))
	self._fileNodeIcon:setTouchEnabled(true)

	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
end

function HeroKarmaCellIcon:updateIcon(heroBaseId, isDark)
	self._heroBaseId = heroBaseId
	self._isDark = isDark
	self._fileNodeIcon:updateUI(heroBaseId)
	self._fileNodeIcon:setIconMask(isDark)

	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)
	self._textName:setString(heroParam.name)
	self._textName:setColor(heroParam.icon_color)
	UIHelper.updateTextOutline(self._textName, heroParam)
end

function HeroKarmaCellIcon:_onClickIcon()
	local itemParam = self._fileNodeIcon:getItemParams()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
    PopupItemGuider:updateUI(TypeConvertHelper.TYPE_HERO, itemParam.cfg.id)
    PopupItemGuider:openWithAction()
end

return HeroKarmaCellIcon