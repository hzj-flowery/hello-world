--
-- Author: JerryHe
-- Date: 2019-01-24
-- 战马装备回收单件
-- 
local RecoveryHorseEquipNode = class("RecoveryHorseEquipNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RecoveryHelper = require("app.scene.view.recovery.RecoveryHelper")

function RecoveryHorseEquipNode:ctor(target, index, onClickAdd, onClickDelete)
	self._target = target
	self._index = index
	self._onClickAdd = onClickAdd
	self._onClickDelete = onClickDelete

	self._fileNodeEquip = ccui.Helper:seekNodeByName(self._target, "FileNodeEquip")
	cc.bind(self._fileNodeEquip, "CommonHorseEquipAvatar")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
	self._buttonAdd:addClickEventListenerEx(handler(self, self._onButtonAddClicked))
	self._buttonClose = ccui.Helper:seekNodeByName(self._target, "ButtonClose")
	self._buttonClose:addClickEventListenerEx(handler(self, self._onButtonCloseClicked))

	self._initScale = self._fileNodeEquip:getScale()
end

function RecoveryHorseEquipNode:_initUI()
	self._fileNodeEquip:setVisible(false)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
end

function RecoveryHorseEquipNode:updateInfo(equipId)
	self:_initUI()
	if equipId then
		self._fileNodeEquip:setVisible(true)
		self._textName:setVisible(true)
		self._buttonClose:setVisible(true)

		self._fileNodeEquip:updateUI(equipId)
        local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE_EQUIP, equipId)

		self._textName:setString(equipParam.name)
		self._textName:setColor(equipParam.icon_color)
		self._textName:enableOutline(equipParam.icon_color_outline, 2)
	else
		self._buttonAdd:setVisible(true)
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playBlinkEffect2(self._buttonAdd)
	end
end

function RecoveryHorseEquipNode:_onButtonAddClicked()
	if self._onClickAdd then
		self._onClickAdd()
	end
end

function RecoveryHorseEquipNode:_onButtonCloseClicked()
	self:updateInfo(nil)
	if self._onClickDelete then
		self._onClickDelete(self._index)
	end
end

function RecoveryHorseEquipNode:reset()
	self._fileNodeEquip:setPosition(cc.p(62.5, 105))
	self._fileNodeEquip:setScale(self._initScale)
end

function RecoveryHorseEquipNode:playFlyEffect(tarNode, callback)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
	local worldPos = tarNode:convertToWorldSpace(cc.p(0,0))
	local tarPos = self._target:convertToNodeSpace(worldPos)
	RecoveryHelper.playSingleNodeFly(self._fileNodeEquip, tarPos, callback)
end

return RecoveryHorseEquipNode