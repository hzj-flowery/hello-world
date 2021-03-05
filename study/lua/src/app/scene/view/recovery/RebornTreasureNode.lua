--
-- Author: Liangxu
-- Date: 2017-05-16 16:05:31
--
local RebornTreasureNode = class("RebornTreasureNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function RebornTreasureNode:ctor(target, onClickAdd, onClickDelete)
	self._target = target
	self._onClickAdd = onClickAdd
	self._onClickDelete = onClickDelete

	self._fileNodeTreasure = ccui.Helper:seekNodeByName(self._target, "FileNodeTreasure")
	cc.bind(self._fileNodeTreasure, "CommonTreasureAvatar")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
	self._buttonAdd:addClickEventListenerEx(handler(self, self._onButtonAddClicked))
	self._buttonClose = ccui.Helper:seekNodeByName(self._target, "ButtonClose")
	self._buttonClose:addClickEventListenerEx(handler(self, self._onButtonCloseClicked))
end

function RebornTreasureNode:_initUI()
	self._fileNodeTreasure:setVisible(false)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
end

function RebornTreasureNode:updateInfo(treasureId)
	self:_initUI()
	if treasureId then
		self._fileNodeTreasure:setVisible(true)
		self._textName:setVisible(true)
		self._buttonClose:setVisible(true)

		self._fileNodeTreasure:updateUI(treasureId)
		local treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureId)
		self._textName:setString(treasureParam.name)
		self._textName:setColor(treasureParam.icon_color)
		self._textName:enableOutline(treasureParam.icon_color_outline, 2)
	else
		self._buttonAdd:setVisible(true)
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playBlinkEffect2(self._buttonAdd)
	end
end

function RebornTreasureNode:_onButtonAddClicked()
	if self._onClickAdd then
		self._onClickAdd()
	end
end

function RebornTreasureNode:_onButtonCloseClicked()
	self:updateInfo(nil)
	if self._onClickDelete then
		self._onClickDelete()
	end
end

return RebornTreasureNode