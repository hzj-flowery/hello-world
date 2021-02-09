--
-- Author: Liangxu
-- Date: 2017-03-29 16:03:18
-- 武将小伙伴Icon

local TeamPartnerIcon = class("TeamPartnerIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupChooseHero = require("app.ui.PopupChooseHero")
local PopupChooseHeroHelper = require("app.ui.PopupChooseHeroHelper")

function TeamPartnerIcon:ctor(target, index)
	self._target = target
	self._index = index
	self:_init()
end

function TeamPartnerIcon:_init()
	self._imageLock = ccui.Helper:seekNodeByName(self._target, "ImageLock")
	self._spriteAdd = ccui.Helper:seekNodeByName(self._target, "SpriteAdd")
	self._fileNodeHero = ccui.Helper:seekNodeByName(self._target, "FileNodeHero")
	cc.bind(self._fileNodeHero, "CommonHeroIcon")
	self._imageRedPoint = ccui.Helper:seekNodeByName(self._target, "ImageRedPoint")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
end

function TeamPartnerIcon:updateView(info)
	self._lock = info.lock
	self._heroData = info.heroData
	self._level = info.level
	self._comment = info.comment

	self._imageLock:setVisible(false)
	self._spriteAdd:setVisible(false)
	self._fileNodeHero:setVisible(false)
	self._textName:setVisible(false)
	self._imageRedPoint:setVisible(false)

	if not self._lock then 
		if self._heroData then
			self._fileNodeHero:setVisible(true)
			self._textName:setVisible(true)
			local baseId = self._heroData:getBase_id()
			local limitLevel = self._heroData:getLimit_level()
			local limitRedLevel = self._heroData:getLimit_rtg()
			local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, nil, nil, limitLevel, limitRedLevel)
			self._fileNodeHero:updateUI(baseId, nil, limitLevel, limitRedLevel)
			self._textName:setString(heroParam.name)
			self._textName:setColor(heroParam.icon_color)
			self._textName:enableOutline(heroParam.icon_color_outline)
		else
			self._spriteAdd:setVisible(true)
			local UIActionHelper = require("app.utils.UIActionHelper")
			UIActionHelper.playBlinkEffect(self._spriteAdd)
		end
	else
		self._imageLock:setVisible(true)
		self._textName:setVisible(true)
		self._textName:setString(Lang.get("hero_yoke_unlock", {level = self._level}))
		self._textName:setColor(Colors.uiColors.BEIGE)
	end
end

function TeamPartnerIcon:_onPanelTouch()
	if not self._lock then
		local fromType = PopupChooseHeroHelper.FROM_TYPE3
		if self._heroData then
			fromType = PopupChooseHeroHelper.FROM_TYPE4
		end
		local isEmpty = PopupChooseHeroHelper.checkIsEmpty(fromType, {self._index})
		if isEmpty then
			G_Prompt:showTip(Lang.get("hero_popup_list_empty_tip"..fromType))
		else
			local popup = PopupChooseHero.new()
			local callBack = handler(self, self._changePartnerCallBack)
			popup:setTitle(Lang.get("hero_yoke_choose_hero"))
			popup:updateUI(fromType, callBack, self._index)
			popup:openWithAction()
		end
	else
		G_Prompt:showTip(self._comment)
	end
end

function TeamPartnerIcon:_changePartnerCallBack(heroId, param)
	local pos = unpack(param)
	if self._heroData and heroId == self._heroData:getId() then --是所选的武将，下阵
		G_UserData:getTeam():c2sChangeHeroSecondFormaion(pos, nil)
	else
		G_UserData:getTeam():c2sChangeHeroSecondFormaion(pos, heroId)
	end
end

function TeamPartnerIcon:showRedPoint(visible)
	self._imageRedPoint:setVisible(visible)
end

function TeamPartnerIcon:onlyShow(info)
	local lock = info.lock
	local heroData = info.heroData

	self._imageLock:setVisible(false)
	self._spriteAdd:setVisible(false)
	self._fileNodeHero:setVisible(false)
	self._textName:setVisible(false)
	self._imageRedPoint:setVisible(false)
	self._panelTouch:setEnabled(false)

	if not lock then 
		if heroData then
			self._fileNodeHero:setVisible(true)
			self._textName:setVisible(true)
			local baseId = heroData:getBase_id()
			local limitLevel = heroData:getLimit_level()
			local limitRedLevel = heroData:getLimit_rtg()
			local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, nil, nil, limitLevel, limitRedLevel)
			self._fileNodeHero:updateUI(baseId, nil, limitLevel, limitRedLevel)
			self._textName:setString(heroParam.name)
			self._textName:setColor(heroParam.icon_color)
			self._textName:enableOutline(heroParam.icon_color_outline)
		else
			self._imageLock:setVisible(true)
		end
	else
		self._imageLock:setVisible(true)
	end
end

return TeamPartnerIcon