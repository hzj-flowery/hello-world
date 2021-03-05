--
-- Author: Liangxu
-- Date: 2017-03-23 17:14:30
-- 武将缘分Cell中的标头
local HeroKarmaCellTitle = class("HeroKarmaCellTitle")

function HeroKarmaCellTitle:ctor(target, callback)
	self._target = target
	self._callback = callback

	self._textDes = nil
	self._buttonActive = nil

	self:_init()
end

function HeroKarmaCellTitle:_init()
	self._textDes = ccui.Helper:seekNodeByName(self._target, "TextDes")
	self._buttonActive = ccui.Helper:seekNodeByName(self._target, "ButtonActive")
	cc.bind(self._buttonActive, "CommonButtonLevel2Highlight")
	self._buttonActive:setString(Lang.get("hero_karma_btn_active"))
	self._buttonActive:addClickEventListenerEx(handler(self, self._onClickButton))
	self._imageActivated = ccui.Helper:seekNodeByName(self._target, "ImageActivated")
end

function HeroKarmaCellTitle:setDes(des, isActivated, isCanActivate, attrId)
	self._textDes:setString(des)

	if isActivated then
		self._imageActivated:setVisible(true)
		self._buttonActive:setVisible(false)
	else
		self._imageActivated:setVisible(false)
		self._buttonActive:setVisible(true)
		self._buttonActive:setEnabled(isCanActivate)
	end
end

function HeroKarmaCellTitle:_onClickButton()
	if self._callback then
		self._callback()
	end
end

return HeroKarmaCellTitle