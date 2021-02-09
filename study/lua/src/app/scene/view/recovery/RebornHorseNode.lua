
--
-- Author: Liangxu
-- Date: 2018-8-29
--
local RebornHorseNode = class("RebornHorseNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")

function RebornHorseNode:ctor(target, onClickAdd, onClickDelete)
	self._target = target
	self._onClickAdd = onClickAdd
	self._onClickDelete = onClickDelete
	
	self._fileNodeHorse = ccui.Helper:seekNodeByName(self._target, "FileNodeHorse")
	cc.bind(self._fileNodeHorse, "CommonHorseAvatar")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
	self._buttonAdd:addClickEventListenerEx(handler(self, self._onButtonAddClicked))
	self._buttonClose = ccui.Helper:seekNodeByName(self._target, "ButtonClose")
	self._buttonClose:addClickEventListenerEx(handler(self, self._onButtonCloseClicked))
end

function RebornHorseNode:_initUI()
	self._fileNodeHorse:setVisible(false)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
end

function RebornHorseNode:updateInfo(horseData)
	self:_initUI()
	if horseData then
		self._fileNodeHorse:setVisible(true)
		self._textName:setVisible(true)
		self._buttonClose:setVisible(true)

		local horseId = horseData:getBase_id()
		local star = horseData:getStar()
		self._fileNodeHorse:updateUI(horseId)
		local horseParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE, horseId)
		local name = HorseDataHelper.getHorseName(horseId, star)
		self._textName:setString(name)
		self._textName:setColor(horseParam.icon_color)
		self._textName:enableOutline(horseParam.icon_color_outline, 2)
	else
		self._buttonAdd:setVisible(true)
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playBlinkEffect2(self._buttonAdd)
	end
end

function RebornHorseNode:_onButtonAddClicked()
	if self._onClickAdd then
		self._onClickAdd()
	end
end

function RebornHorseNode:_onButtonCloseClicked()
	self:updateInfo(nil)
	if self._onClickDelete then
		self._onClickDelete()
	end
end

return RebornHorseNode