--
-- Author: Liangxu
-- Date: 2017-05-03 16:19:57
--
local RebornHeroNode = class("RebornHeroNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function RebornHeroNode:ctor(target, onClickAdd, onClickDelete)
	self._target = target
	self._onClickAdd = onClickAdd
	self._onClickDelete = onClickDelete
	
	self._fileNodeHero = ccui.Helper:seekNodeByName(self._target, "FileNodeHero")
	cc.bind(self._fileNodeHero, "CommonHeroAvatar")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
	self._buttonAdd:addClickEventListenerEx(handler(self, self._onButtonAddClicked))
	self._buttonClose = ccui.Helper:seekNodeByName(self._target, "ButtonClose")
	self._buttonClose:addClickEventListenerEx(handler(self, self._onButtonCloseClicked))
end

function RebornHeroNode:_initUI()
	self._fileNodeHero:setVisible(false)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
end

function RebornHeroNode:updateInfo(heroId, limitLevel, limitRedLevel)
	self:_initUI()
	if heroId then
		self._fileNodeHero:setVisible(true)
		self._textName:setVisible(true)
		self._buttonClose:setVisible(true)

		self._fileNodeHero:updateUI(heroId, nil, nil, limitLevel, nil, nil, limitRedLevel)
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId, nil, nil, limitLevel, limitRedLevel)
		self._textName:setString(heroParam.name)
		self._textName:setColor(heroParam.icon_color)
		self._textName:enableOutline(heroParam.icon_color_outline, 2)
	else
		self._buttonAdd:setVisible(true)
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playBlinkEffect2(self._buttonAdd)
	end
end

function RebornHeroNode:_onButtonAddClicked()
	if self._onClickAdd then
		self._onClickAdd()
	end
end

function RebornHeroNode:_onButtonCloseClicked()
	self:updateInfo(nil)
	if self._onClickDelete then
		self._onClickDelete()
	end
end

return RebornHeroNode