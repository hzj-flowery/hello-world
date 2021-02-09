
local RebornHistoryHeroNode = class("RebornHistoryHeroNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function RebornHistoryHeroNode:ctor(target, onClickAdd, onClickDelete)
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

function RebornHistoryHeroNode:_initUI()
	self._fileNodeHero:setConvertType(TypeConvertHelper.TYPE_HISTORY_HERO)
	self._fileNodeHero:setVisible(false)

	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
end

function RebornHistoryHeroNode:updateInfo(heroId)
	self:_initUI()
	if heroId then
		self._fileNodeHero:setVisible(true)
		self._textName:setVisible(true)
		self._buttonClose:setVisible(true)

		self._fileNodeHero:updateUI(heroId)
		self._fileNodeHero:setScale(1.6)
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HISTORY_HERO, heroId)
		self._textName:setString(heroParam.name)
		self._textName:setColor(heroParam.icon_color)
		self._textName:enableOutline(heroParam.icon_color_outline, 2)
	else
		self._buttonAdd:setVisible(true)
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playBlinkEffect2(self._buttonAdd)
	end
end

function RebornHistoryHeroNode:_onButtonAddClicked()
	if self._onClickAdd then
		self._onClickAdd()
	end
end

function RebornHistoryHeroNode:_onButtonCloseClicked()
	self:updateInfo(nil)
	if self._onClickDelete then
		self._onClickDelete()
	end
end

return RebornHistoryHeroNode