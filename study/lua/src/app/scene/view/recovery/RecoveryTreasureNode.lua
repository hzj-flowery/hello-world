--
-- Author: Liangxu
-- Date: 2017-10-14 16:46:17
--
local RecoveryTreasureNode = class("RecoveryTreasureNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RecoveryHelper = require("app.scene.view.recovery.RecoveryHelper")

function RecoveryTreasureNode:ctor(target, index, onClickAdd, onClickDelete)
	self._target = target
	self._index = index
	self._onClickAdd = onClickAdd
	self._onClickDelete = onClickDelete
	
	self._fileNodeTreasure = ccui.Helper:seekNodeByName(self._target, "FileNodeIcon")
	cc.bind(self._fileNodeTreasure, "CommonTreasureAvatar")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
	self._buttonAdd:addClickEventListenerEx(handler(self, self._onButtonAddClicked))
	self._buttonClose = ccui.Helper:seekNodeByName(self._target, "ButtonClose")
	self._buttonClose:addClickEventListenerEx(handler(self, self._onButtonCloseClicked))

	self._initScale = self._fileNodeTreasure:getScale()
end

function RecoveryTreasureNode:_initUI()
	self._fileNodeTreasure:setVisible(false)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
end

function RecoveryTreasureNode:updateInfo(treasureId)
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

function RecoveryTreasureNode:_onButtonAddClicked()
	if self._onClickAdd then
		self._onClickAdd()
	end
end

function RecoveryTreasureNode:_onButtonCloseClicked()
	self:updateInfo(nil)
	if self._onClickDelete then
		self._onClickDelete(self._index)
	end
end

function RecoveryTreasureNode:reset()
	self._fileNodeTreasure:setPosition(cc.p(62.5, 105))
	self._fileNodeTreasure:setScale(self._initScale)
end

function RecoveryTreasureNode:playFlyEffect(tarNode, callback)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
	local worldPos = tarNode:convertToWorldSpace(cc.p(0,0))
	local tarPos = self._target:convertToNodeSpace(worldPos)
	RecoveryHelper.playSingleNodeFly(self._fileNodeTreasure, tarPos, callback)
end

return RecoveryTreasureNode