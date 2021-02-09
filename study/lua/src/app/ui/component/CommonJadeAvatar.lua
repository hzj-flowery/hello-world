--
-- Author: Liangxu
-- Date: 2017-04-13 10:36:09
-- 装备展示控件
local CommonJadeAvatar = class("CommonJadeAvatar")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
	"updateUI",
	"setCallBack",
	"getHeight"
}

function CommonJadeAvatar:ctor()
	self._target = nil
	self._equipId = nil
end

function CommonJadeAvatar:_init()
	self._imageJade = ccui.Helper:seekNodeByName(self._target, "ImageJade")
	self._imageJade:ignoreContentAdaptWithSize(true)
	self._effectDown = ccui.Helper:seekNodeByName(self._target, "EffectDown")
	self._effectUp = ccui.Helper:seekNodeByName(self._target, "EffectUp")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addTouchEventListener(handler(self, self._onTouchCallBack))
	self._panelTouch:setSwallowTouches(false)
end

function CommonJadeAvatar:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonJadeAvatar:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonJadeAvatar:updateUI(jadeSysId, hideEffect)
	local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_JADE_STONE, jadeSysId)
	self._imageJade:loadTexture(equipParam.icon_big)
	self._effectUp:removeAllChildren()
	self._effectDown:removeAllChildren()
	if not hideEffect then
		self:_showAvatarEffect(jadeSysId)
	end
end

function CommonJadeAvatar:setCallBack(callback)
	if self._callback then
		self._callback = nil
	end
	self._callback = callback
end

function CommonJadeAvatar:_showAvatarEffect(jadeSysId)
	local config = require("app.config.jade").get(jadeSysId)
	if config then
		local xxeffects = string.split(config.effect, "|")
		if xxeffects[1] ~= "null" then
			G_EffectGfxMgr:createPlayGfx(self._effectUp, xxeffects[1])
		end
		if xxeffects[2] ~= "null" then
			G_EffectGfxMgr:createPlayGfx(self._effectDown, xxeffects[2])
		end
	end
end

function CommonJadeAvatar:_onTouchCallBack(sender, state)
	-----------防止拖动的时候触发点击
	if (state == ccui.TouchEventType.ended) then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(self._userData)
			end
		end
	end
end

function CommonJadeAvatar:getHeight()
	return self._imageJade:getContentSize().height
end

return CommonJadeAvatar
