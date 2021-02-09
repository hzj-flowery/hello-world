--
-- Author: Liangxu
-- Date: 2017-9-18 13:59:16
-- 神兵培养界面
local ViewBase = require("app.ui.ViewBase")
local InstrumentTrainView = class("InstrumentTrainView", ViewBase)
local InstrumentConst = require("app.const.InstrumentConst")
local InstrumentTrainAdvanceLayer = require("app.scene.view.instrumentTrain.InstrumentTrainAdvanceLayer")
local InstrumentTrainLimitLayer = require("app.scene.view.instrumentTrain.InstrumentTrainLimitLayer")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local RedPointHelper = require("app.data.RedPointHelper")

function InstrumentTrainView:ctor(InstrumentId, trainType, rangeType, isJumpWhenBack)
	G_UserData:getInstrument():setCurInstrumentId(InstrumentId)
	self._selectTabIndex = trainType or InstrumentConst.INSTRUMENT_TRAIN_ADVANCE
	self._rangeType = rangeType or InstrumentConst.INSTRUMENT_RANGE_TYPE_1
	self._isJumpWhenBack = isJumpWhenBack --当点返回时，是否要跳过上一个场景
	self._allInstrumentIds = {}

	local resource = {
		file = Path.getCSB("InstrumentTrainView", "instrument"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonLeft = {
				events = {{event = "touch", method = "_onButtonLeftClicked"}}
			},
			_buttonRight = {
				events = {{event = "touch", method = "_onButtonRightClicked"}}
			},
		},
	}
	InstrumentTrainView.super.ctor(self, resource)
end

function InstrumentTrainView:onCreate()
	self._subLayers = {} --存储子layer
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_shenbing")
	if self._isJumpWhenBack then
		self._topbarBase:setCallBackOnBack(handler(self, self._setCallback))
	end
	self:_initTab()
end

function InstrumentTrainView:onEnter()
	self._signalInstrumentLevelup = G_SignalManager:add(SignalConst.EVENT_INSTRUMENT_LEVELUP_SUCCESS, handler(self, self._onLevelupSuccess))

	self:_updateInstrumentIds()
	self:_calCurSelectedPos()
	self:updateArrowBtn()

	self:updateTabIcons()
	self:_updateView()
end

function InstrumentTrainView:onExit()
	self._signalInstrumentLevelup:remove()
	self._signalInstrumentLevelup = nil
end

function InstrumentTrainView:_initTab()
	for i = 1, 2 do
		local txt = Lang.get("instrument_train_tab_icon_"..i)
		local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_TREASURE_TRAIN_TYPE"..i])
		self["_nodeTabIcon"..i]:updateUI(txt, isOpen, i)
		self["_nodeTabIcon"..i]:setCallback(handler(self, self.onClickTabIcon))
	end
end

function InstrumentTrainView:onClickTabIcon(index)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:updateTabIcons()
	self:_updateView()
end

function InstrumentTrainView:_updateTabIconSelectedState()
	for i = 1, 2 do
		self["_nodeTabIcon"..i]:setSelected(i == self._selectTabIndex)
	end
end

function InstrumentTrainView:updateTabIcons()
	self:_doLayoutTabIcons()
	self:_updateTabIconSelectedState()
	self:_updateRedPoint()
end

function InstrumentTrainView:_updateInstrumentIds()
	local instrumentId = G_UserData:getInstrument():getCurInstrumentId()
	if self._rangeType == InstrumentConst.INSTRUMENT_RANGE_TYPE_1 then
		self._allInstrumentIds = G_UserData:getInstrument():getRangeDataBySort()
	elseif self._rangeType == InstrumentConst.INSTRUMENT_RANGE_TYPE_2 then
		local unit = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
		local pos = unit:getPos()
		if pos then
			self._allInstrumentIds = G_UserData:getBattleResource():getInstrumentIdsWithPos(pos)
		end
	end

	self._instrumentCount = #self._allInstrumentIds
end

function InstrumentTrainView:_calCurSelectedPos()
	self._selectedPos = 1
	local instrumentId = G_UserData:getInstrument():getCurInstrumentId()
	for i, id in ipairs(self._allInstrumentIds) do
		if id == instrumentId then
			self._selectedPos = i
		end
	end
end

function InstrumentTrainView:_updateView()
	local layer = self._subLayers[self._selectTabIndex]
	if layer == nil then
		if self._selectTabIndex == InstrumentConst.INSTRUMENT_TRAIN_ADVANCE then
			layer = InstrumentTrainAdvanceLayer.new(self)
		elseif self._selectTabIndex == InstrumentConst.INSTRUMENT_TRAIN_LIMIT then
			layer = InstrumentTrainLimitLayer.new(self)
		end

		if layer then
			self._panelContent:addChild(layer)
			self._subLayers[self._selectTabIndex] = layer
		end
	end
	for k, subLayer in pairs(self._subLayers) do
		subLayer:setVisible(false)
	end
	layer:setVisible(true)
	layer:updateInfo()
end

function InstrumentTrainView:_setCallback()
	G_UserData:getTeamCache():setShowInstrumentTrainFlag(true)
	G_SceneManager:popSceneByTimes(2) --pop2次，返回阵容界面
end

function InstrumentTrainView:checkRedPoint(index)
	local instrumentId = G_UserData:getInstrument():getCurInstrumentId()
	local unitData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
	local reach = RedPointHelper.isModuleReach(FunctionConst["FUNC_INSTRUMENT_TRAIN_TYPE"..index], unitData)
	self["_nodeTabIcon"..index]:showRedPoint(reach)
end

function InstrumentTrainView:_updateRedPoint()
	for i = 1, 2 do
		self:checkRedPoint(i)
	end
end

function InstrumentTrainView:updateArrowBtn()
	self._buttonLeft:setVisible(self._selectedPos > 1)
	self._buttonRight:setVisible(self._selectedPos < self._instrumentCount)
end

function InstrumentTrainView:setArrowBtnVisible(visible)
	self._buttonLeft:setVisible(self._selectedPos > 1 and visible)
	self._buttonRight:setVisible(self._selectedPos < self._instrumentCount and visible)
end

function InstrumentTrainView:_onButtonLeftClicked()
	if self._selectedPos <= 1 then
		return
	end

	self._selectedPos = self._selectedPos - 1
	local curInstrumentId = self._allInstrumentIds[self._selectedPos]
	G_UserData:getInstrument():setCurInstrumentId(curInstrumentId)
	self:updateArrowBtn()
	self:_updateView()
	self:updateTabIcons()
end

function InstrumentTrainView:_onButtonRightClicked()
	if self._selectedPos >= self._instrumentCount then
		return
	end

	self._selectedPos = self._selectedPos + 1
	local curInstrumentId = self._allInstrumentIds[self._selectedPos]
	G_UserData:getInstrument():setCurInstrumentId(curInstrumentId)
	self:updateArrowBtn()
	self:_updateView()
	self:updateTabIcons()
end

function InstrumentTrainView:getAllInstrumentIds()
	return self._allInstrumentIds
end

function InstrumentTrainView:getInstrumentCount()
	return self._instrumentCount
end

function InstrumentTrainView:setSelectedPos(pos)
	self._selectedPos = pos
end

function InstrumentTrainView:getSelectedPos()
	return self._selectedPos
end

function InstrumentTrainView:setArrowBtnEnable(enable)
	self._buttonLeft:setEnabled(enable)
	self._buttonRight:setEnabled(enable)
end

function InstrumentTrainView:_onLevelupSuccess()
	--全范围的情况，神兵进阶如果消耗同名卡，要重新更新列表
	if self._rangeType == InstrumentConst.INSTRUMENT_RANGE_TYPE_1 then 
		self:_updateInstrumentIds()
		self:_calCurSelectedPos()
		self:updateArrowBtn()
		local layer = self._subLayers[self._selectTabIndex]
		layer:updatePageView()
	end
end

function InstrumentTrainView:getRangeType()
	return self._rangeType
end

function InstrumentTrainView:_doLayoutTabIcons()
	local dynamicTabs = {} --需要动态排版的
	local showCount = 1
	for i = 1, 2 do
		local txt = Lang.get("instrument_train_tab_icon_"..i)
		local isOpen = LogicCheckHelper.funcIsShow(FunctionConst["FUNC_INSTRUMENT_TRAIN_TYPE"..i])
		local curInstrumentId = G_UserData:getInstrument():getCurInstrumentId()
		local curUnitData = G_UserData:getInstrument():getInstrumentDataWithId(curInstrumentId)
		if i == 2 then
			local canLimit = curUnitData:isCanLimitBreak()
			local isShow = curUnitData:getLimitFuncShow()
			isOpen = isShow and canLimit
			self._nodeTabIcon2:setVisible(isOpen)
			self._imageRope2:setVisible(isOpen)
			if isOpen then
				showCount = showCount + 1
				local funcLevelInfo = require("app.config.function_level").get(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2)
		    	assert(funcLevelInfo, "Invalid function_level can not find funcId "..FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2)
				table.insert(dynamicTabs, {tab = self._nodeTabIcon2, openLevel = funcLevelInfo.level})
			end
		end

		self["_nodeTabIcon"..i]:updateUI(txt, isOpen, i)
	end

	if showCount == 1 then
		self._imageRopeTail:setPositionY(424)
	elseif showCount == 2 then
		self._imageRopeTail:setPositionY(292)
	end
end

return InstrumentTrainView