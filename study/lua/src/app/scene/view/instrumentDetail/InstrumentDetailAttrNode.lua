--
-- Author: Liangxu
-- Date: 2017-9-16 14:13:03
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local InstrumentDetailAttrNode = class("InstrumentDetailAttrNode", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local InstrumentTrainHelper = require("app.scene.view.instrumentTrain.InstrumentTrainHelper")
local AttributeConst = require("app.const.AttributeConst")
local InstrumentConst = require("app.const.InstrumentConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function InstrumentDetailAttrNode:ctor(instrumentData, rangeType)
	self._instrumentData = instrumentData
	self._rangeType = rangeType

	local resource = {
		file = Path.getCSB("InstrumentDetailAttrNode", "instrument"),
		binding = {
			_buttonAdvance = {
				events = {{event = "touch", method = "_onButtonAdvanceClicked"}}
			},
			_buttonLimit = {
				events = {{event = "touch", method = "_onButtonLimitClicked"}}
			},
		},
	}
	InstrumentDetailAttrNode.super.ctor(self, resource)
end

function InstrumentDetailAttrNode:onCreate()
	local contentSize = self._panelBg:getContentSize()
	self:setContentSize(contentSize)
	self._nodeTitle:setFontSize(24)
	self._nodeTitle:setTitle(Lang.get("instrument_detail_title_attr"))
	self._buttonAdvance:setString(Lang.get("instrument_btn_advance"))
	self._buttonLimit:setString(Lang.get("instrument_btn_limit"))

	local des = Lang.get("instrument_detail_advance_level")
	local value = self._instrumentData:getLevel()
	local max = self._instrumentData:getAdvanceMaxLevel()
	local color = value < max and Colors.BRIGHT_BG_ONE or Colors.BRIGHT_BG_GREEN
	self._nodeLevel:setFontSize(20)
	self._nodeLevel:updateUI(des, value, max)
	self._nodeLevel:setValueColor(color)
	self._nodeLevel:setMaxColor(color)

	self:_updateAttrDes()

	local isUser = self._instrumentData:isUser()
	self._buttonAdvance:setVisible(isUser)

	local isCanLimit = self._instrumentData:isCanLimitBreak()
	local isShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2)
	-- self._buttonLimit:setVisible(isUser and isCanLimit and isShow)
	self:_showLimitBtnProc()
	if isUser then
		local RedPointHelper = require("app.data.RedPointHelper")
		local reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1, "slotRP", self._instrumentData)
		self._buttonAdvance:showRedPoint(reach1)
		local reach2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2, "slotRP", self._instrumentData)
		self._buttonLimit:showRedPoint(reach2)
	end
end

function InstrumentDetailAttrNode:_updateAttrDes()
	local attrInfo = UserDataHelper.getInstrumentAttrInfo(self._instrumentData)
	local desInfo = TextHelper.getAttrInfoBySort(attrInfo)
	for i = 1, 4 do
		local info = desInfo[i]
		if info then
			self["_nodeAttr"..i]:updateView(info.id, info.value, nil, 4)
			self["_nodeAttr"..i]:setVisible(true)
		else
			self["_nodeAttr"..i]:setVisible(false)
		end
	end
end

function InstrumentDetailAttrNode:_onButtonAdvanceClicked()
	local isOpen, des = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1)
	if not isOpen then
		G_Prompt:showTip(des)
		return
	end

	local instrumentId = self._instrumentData:getId()
	G_SceneManager:showScene("instrumentTrain", instrumentId, InstrumentConst.INSTRUMENT_TRAIN_ADVANCE, self._rangeType, true)
end

function InstrumentDetailAttrNode:_onButtonLimitClicked()
	-- FUNC_INSTRUMENT_TRAIN_TYPE2_RED
	local isOpen, des = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2)
	if not isOpen then
		G_Prompt:showTip(des)
		return
	end

	local instrumentId = self._instrumentData:getId()
	G_SceneManager:showScene("instrumentTrain", instrumentId, InstrumentConst.INSTRUMENT_TRAIN_LIMIT, self._rangeType, true)
end

function InstrumentDetailAttrNode:_showLimitBtnProc()
	local isUser = self._instrumentData:isUser()
	local isCanLimit = self._instrumentData:isCanLimitBreak()
	local isShow = self._instrumentData:getLimitFuncShow()
	self._buttonLimit:setVisible(isUser and isCanLimit and isShow)
end

return InstrumentDetailAttrNode