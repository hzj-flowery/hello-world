--
-- Author: Liangxu
-- Date: 2017-9-19 14:01:30
-- 神兵回收单件
local RecoveryInstrumentNode = class("RecoveryInstrumentNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RecoveryHelper = require("app.scene.view.recovery.RecoveryHelper")

function RecoveryInstrumentNode:ctor(target, index, onClickAdd, onClickDelete)
	self._target = target
	self._index = index
	self._onClickAdd = onClickAdd
	self._onClickDelete = onClickDelete

	self._fileNodeInstrument = ccui.Helper:seekNodeByName(self._target, "FileNodeInstrument")
	cc.bind(self._fileNodeInstrument, "CommonInstrumentAvatar")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
	self._buttonAdd:addClickEventListenerEx(handler(self, self._onButtonAddClicked))
	self._buttonClose = ccui.Helper:seekNodeByName(self._target, "ButtonClose")
	self._buttonClose:addClickEventListenerEx(handler(self, self._onButtonCloseClicked))

	self._initScale = self._fileNodeInstrument:getScale()
end

function RecoveryInstrumentNode:_initUI()
	self._fileNodeInstrument:setVisible(false)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
end

function RecoveryInstrumentNode:updateInfo(instrumentId, limitLevel)
	self:_initUI()
	if instrumentId then
		self._fileNodeInstrument:setVisible(true)
		self._textName:setVisible(true)
		self._buttonClose:setVisible(true)

		self._fileNodeInstrument:updateUI(instrumentId, limitLevel)
		local instrumentParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, instrumentId, nil, nil, limitLevel)
		self._textName:setString(instrumentParam.name)
		self._textName:setColor(instrumentParam.icon_color)
		self._textName:enableOutline(instrumentParam.icon_color_outline, 2)
	else
		self._buttonAdd:setVisible(true)
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playBlinkEffect2(self._buttonAdd)
	end
end

function RecoveryInstrumentNode:_onButtonAddClicked()
	if self._onClickAdd then
		self._onClickAdd()
	end
end

function RecoveryInstrumentNode:_onButtonCloseClicked()
	self:updateInfo(nil)
	if self._onClickDelete then
		self._onClickDelete(self._index)
	end
end

function RecoveryInstrumentNode:reset()
	self._fileNodeInstrument:setPosition(cc.p(62.5, 105))
	self._fileNodeInstrument:setScale(self._initScale)
end

function RecoveryInstrumentNode:playFlyEffect(tarNode, callback)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
	local worldPos = tarNode:convertToWorldSpace(cc.p(0,0))
	local tarPos = self._target:convertToNodeSpace(worldPos)
	RecoveryHelper.playSingleNodeFly(self._fileNodeInstrument, tarPos, callback)
end

return RecoveryInstrumentNode