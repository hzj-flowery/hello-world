--
-- Author: Liangxu
-- Date: 2017-05-03 16:22:00
--
local RebornEquipNode = class("RebornEquipNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function RebornEquipNode:ctor(target, onClickAdd, onClickDelete)
	self._target = target
	self._onClickAdd = onClickAdd
	self._onClickDelete = onClickDelete

	self._fileNodeEquip = ccui.Helper:seekNodeByName(self._target, "FileNodeEquip")
	cc.bind(self._fileNodeEquip, "CommonEquipAvatar")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
	self._buttonAdd:addClickEventListenerEx(handler(self, self._onButtonAddClicked))
	self._buttonClose = ccui.Helper:seekNodeByName(self._target, "ButtonClose")
	self._buttonClose:addClickEventListenerEx(handler(self, self._onButtonCloseClicked))
end

function RebornEquipNode:_initUI()
	self._fileNodeEquip:setVisible(false)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
end

function RebornEquipNode:updateInfo(equipId)
	self:_initUI()
	if equipId then
		self._fileNodeEquip:setVisible(true)
		self._textName:setVisible(true)
		self._buttonClose:setVisible(true)

		self._fileNodeEquip:updateUI(equipId)
		local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipId)
		self._textName:setString(equipParam.name)
		self._textName:setColor(equipParam.icon_color)
		self._textName:enableOutline(equipParam.icon_color_outline, 2)
	else
		self._buttonAdd:setVisible(true)
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playBlinkEffect2(self._buttonAdd)
	end
end

function RebornEquipNode:_onButtonAddClicked()
	if self._onClickAdd then
		self._onClickAdd()
	end
end

function RebornEquipNode:_onButtonCloseClicked()
	self:updateInfo(nil)
	if self._onClickDelete then
		self._onClickDelete()
	end
end

return RebornEquipNode