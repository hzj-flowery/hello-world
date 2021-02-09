--
-- Author: Liangxu
-- Date: 2017-9-19 14:25:02
--
local RebornInstrumentNode = class("RebornInstrumentNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function RebornInstrumentNode:ctor(target, onClickAdd, onClickDelete)
	self._target = target
	self._onClickAdd = onClickAdd
	self._onClickDelete = onClickDelete

	self._fileNodeInstrument = ccui.Helper:seekNodeByName(self._target, "FileNodeInstrument")
	cc.bind(self._fileNodeInstrument, "CommonInstrumentAvatar")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
	self._buttonAdd:addClickEventListenerEx(handler(self, self._onButtonAddClicked))
	self._buttonClose = ccui.Helper:seekNodeByName(self._target, "ButtonClose")
	self._buttonClose:addClickEventListenerEx(handler(self, self._onButtonCloseClicked))
end

function RebornInstrumentNode:_initUI()
	self._fileNodeInstrument:setVisible(false)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
end

function RebornInstrumentNode:updateInfo(instrumentId, limitLevel)
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

function RebornInstrumentNode:_onButtonAddClicked()
	if self._onClickAdd then
		self._onClickAdd()
	end
end

function RebornInstrumentNode:_onButtonCloseClicked()
	self:updateInfo(nil)
	if self._onClickDelete then
		self._onClickDelete()
	end
end

return RebornInstrumentNode