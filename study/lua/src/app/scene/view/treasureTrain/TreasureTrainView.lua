--
-- Author: Liangxu
-- Date: 2017-05-10 14:43:21
-- 宝物培养界面
local ViewBase = require("app.ui.ViewBase")
local TreasureTrainView = class("TreasureTrainView", ViewBase)
local TreasureConst = require("app.const.TreasureConst")
local TreasureTrainStrengthenLayer = require("app.scene.view.treasureTrain.TreasureTrainStrengthenLayer")
local TreasureTrainRefineLayer = require("app.scene.view.treasureTrain.TreasureTrainRefineLayer")
local TreasureTrainJadeLayer = require("app.scene.view.treasureTrain.TreasureTrainJadeLayer")
local TreasureTrainLimitLayer = require("app.scene.view.treasureTrain.TreasureTrainLimitLayer")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")
local ListCellTabIcon = require("app.scene.view.recovery.ListCellTabIcon")

TreasureTrainView.JADE_ARROW_X_OFFSET = 220
TreasureTrainView.JADE_ARROW_X_SCALE = 195

function TreasureTrainView:ctor(treasureId, trainType, rangeType, isJumpWhenBack)
	G_UserData:getTreasure():setCurTreasureId(treasureId)
	self._selectTabIndex = trainType or TreasureConst.TREASURE_TRAIN_STRENGTHEN
	self._rangeType = rangeType or TreasureConst.TREASURE_RANGE_TYPE_1
	self._isJumpWhenBack = isJumpWhenBack --当点返回时，是否要跳过上一个场景
	self._allTreasureIds = {}

	local resource = {
		file = Path.getCSB("TreasureTrainView", "treasure"),
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
	TreasureTrainView.super.ctor(self, resource)
end

function TreasureTrainView:onCreate()
	self._subLayers = {} --存储子layer
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_baowu")
	if self._isJumpWhenBack then
		self._topbarBase:setCallBackOnBack(handler(self, self._setCallback))
	end
	self._leftArrowPosX = self._buttonLeft:getPositionX()
	self._rightArrowPosX = self._buttonRight:getPositionX()
	self._imgLeftMask = ccui.Helper:seekNodeByName(self, "Image_5")
	self._imgLeftMask:setVisible(false)
	
	self:_initTab()
end

function TreasureTrainView:onEnter()
	self._signalTreasureRefine = G_SignalManager:add(SignalConst.EVENT_TREASURE_REFINE_SUCCESS, handler(self, self._onRefineSuccess))
	self._signalEquipTrainChangeView =
	G_SignalManager:add(SignalConst.EVENT_TREASURE_TRAIN_CHANGE_VIEW, handler(self, self._onEventChangeView))

	self:_updateTreasureIds()
	self:_calCurSelectedPos()
	self:updateArrowBtn()

	self:updateTabIcons()
	self:_updateView()

	--抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function TreasureTrainView:_onEventChangeView(id, index)
    self:onClickTabIcon(index)
end

function TreasureTrainView:onExit()
	self._signalTreasureRefine:remove()
	self._signalTreasureRefine = nil
	self._signalEquipTrainChangeView:remove()
	self._signalEquipTrainChangeView = nil
end

function TreasureTrainView:_updateTreasureIds()
	local treasureId = G_UserData:getTreasure():getCurTreasureId()
	if self._rangeType == TreasureConst.TREASURE_RANGE_TYPE_1 then
		self._allTreasureIds = G_UserData:getTreasure():getRangeDataBySort()
	elseif self._rangeType == TreasureConst.TREASURE_RANGE_TYPE_2 then
		local unit = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
		local pos = unit:getPos()
		if pos then
			self._allTreasureIds = G_UserData:getBattleResource():getTreasureIdsWithPos(pos)
		end
	end
	self._treasureCount = #self._allTreasureIds
end

function TreasureTrainView:_calCurSelectedPos()
	local treasureId = G_UserData:getTreasure():getCurTreasureId()
	self._selectedPos = 1
	for i, id in ipairs(self._allTreasureIds) do
		if id == treasureId then
			self._selectedPos = i
		end
	end
end

function TreasureTrainView:_initTab()
	-- for i = 1, 4 do
	-- 	local txt = Lang.get("treasure_train_tab_icon_"..i)
	-- 	local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_TREASURE_TRAIN_TYPE"..i])
	-- 	self["_nodeTabIcon"..i]:updateUI(txt, isOpen, i)
	-- 	self["_nodeTabIcon"..i]:setCallback(handler(self, self.onClickTabIcon))
	-- end
	self:_updateTrainTab()
end

function TreasureTrainView:onClickTabIcon(index)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:updateTabIcons()
	self:_updateView()
end

function TreasureTrainView:updateTabIcons()
	self:_doLayoutTabIcons()
	self:_updateRedPoint()
end

function TreasureTrainView:_updateView()
	local layer = self._subLayers[self._selectTabIndex]
	if layer == nil then
		if self._selectTabIndex == TreasureConst.TREASURE_TRAIN_STRENGTHEN then
			layer = TreasureTrainStrengthenLayer.new(self)
		elseif self._selectTabIndex == TreasureConst.TREASURE_TRAIN_REFINE then
			layer = TreasureTrainRefineLayer.new(self)
		elseif self._selectTabIndex == TreasureConst.TREASURE_TRAIN_JADE then
			layer = TreasureTrainJadeLayer.new(self)
		elseif self._selectTabIndex == TreasureConst.TREASURE_TRAIN_LIMIT then
			layer = TreasureTrainLimitLayer.new(self)
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
	self:updateArrowBtn()
end

function TreasureTrainView:_setCallback()
	G_UserData:getTeamCache():setShowTreasureTrainFlag(true)
	G_SceneManager:popSceneByTimes(2) --pop2次，返回阵容界面
end

function TreasureTrainView:checkRedPoint(index)
	local treasureId = G_UserData:getTreasure():getCurTreasureId()
	local unitData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
	local reach = RedPointHelper.isModuleSubReach(FunctionConst["FUNC_TREASURE_TRAIN_TYPE"..index], "slotRP", unitData)
	-- local reach = RedPointHelper.isModuleReach(FunctionConst["FUNC_TREASURE_TRAIN_TYPE"..index], unitData)
	if self["_nodeTabIcon"..index] then
		self["_nodeTabIcon"..index]:showRedPoint(reach)
	end
end

function TreasureTrainView:_updateRedPoint()
	for i = 1, TreasureConst.TREASURE_TRAIN_MAX_TAB do
		self:checkRedPoint(i)
	end
end

function TreasureTrainView:updateArrowBtn()
	local isShow = self._selectedPos > 1
    local isShow2 = self._selectedPos < self._treasureCount
    if self._selectTabIndex == TreasureConst.TREASURE_TRAIN_LIMIT then
        isShow = false
        isShow2 = false
    end
    self._buttonLeft:setVisible(isShow)
    self._buttonRight:setVisible(isShow2)

	if self._selectTabIndex == TreasureConst.TREASURE_TRAIN_JADE then
        self._buttonLeft:setPositionX(
            self._leftArrowPosX + TreasureTrainView.JADE_ARROW_X_OFFSET - TreasureTrainView.JADE_ARROW_X_SCALE
        )
        self._buttonRight:setPositionX(
            self._rightArrowPosX + TreasureTrainView.JADE_ARROW_X_OFFSET + TreasureTrainView.JADE_ARROW_X_SCALE
        )
    else
        self._buttonLeft:setPositionX(self._leftArrowPosX)
        self._buttonRight:setPositionX(self._rightArrowPosX)
    end
end

function TreasureTrainView:setArrowBtnVisible(visible)
	self._buttonLeft:setVisible(visible)
	self._buttonRight:setVisible(visible)
end

function TreasureTrainView:_updateTrainTab()
    local tabData = TreasureTrainHelper.getShowTreasureTrainTab()
    if #tabData <= 0 then
        return
    end

    self._scrollViewTab:removeAllChildren()
    for index = 1, TreasureConst.TREASURE_TRAIN_MAX_TAB do
        self["_nodeTabIcon" .. index] = nil
    end
    for index = 1, #tabData do
        self["_nodeTabIcon" .. index] = ListCellTabIcon.new(handler(self, self.onClickTabIcon))
        self["_nodeTabIcon" .. index]:setTxtListPrex("treasure_train_tab_icon_")
        self["_nodeTabIcon" .. index]:setFuncionConstPrex("FUNC_TREASURE_TRAIN_TYPE")
        self["_nodeTabIcon" .. index]:updateUI(index, tabData[index], #tabData)
        self._scrollViewTab:pushBackCustomItem(self["_nodeTabIcon" .. index])
    end
end

function TreasureTrainView:_onButtonLeftClicked()
	if self._selectedPos <= 1 then
		return
	end

	self._selectedPos = self._selectedPos - 1
	local curTreasureId = self._allTreasureIds[self._selectedPos]
	G_UserData:getTreasure():setCurTreasureId(curTreasureId)
	self:_updateTrainTab()
	self:updateArrowBtn()
	self:_updateView()
	self:updateTabIcons()
end

function TreasureTrainView:_onButtonRightClicked()
	if self._selectedPos >= self._treasureCount then
		return
	end

	self._selectedPos = self._selectedPos + 1
	local curTreasureId = self._allTreasureIds[self._selectedPos]
	G_UserData:getTreasure():setCurTreasureId(curTreasureId)
	self:_updateTrainTab()
	self:updateArrowBtn()
	self:_updateView()
	self:updateTabIcons()
end

function TreasureTrainView:getAllTreasureIds()
	return self._allTreasureIds
end

function TreasureTrainView:getTreasureCount()
	return self._treasureCount
end

function TreasureTrainView:setSelectedPos(pos)
	self._selectedPos = pos
end

function TreasureTrainView:getSelectedPos()
	return self._selectedPos
end

function TreasureTrainView:setArrowBtnEnable(enable)
	self._buttonLeft:setEnabled(enable)
	self._buttonRight:setEnabled(enable)
end

function TreasureTrainView:_onRefineSuccess()
	--全范围的情况，精炼如果消耗同名卡，要重新更新列表
	if self._rangeType == TreasureConst.TREASURE_RANGE_TYPE_1 then 
		self:_updateTreasureIds()
		self:_calCurSelectedPos()
		self:updateArrowBtn()
		local layer = self._subLayers[self._selectTabIndex]
		if layer then
			layer:updatePageView()
		end
	end
end

function TreasureTrainView:getRangeType()
	return self._rangeType
end

function TreasureTrainView:_doLayoutTabIcons()
	local tabData = TreasureTrainHelper.getShowTreasureTrainTab()
    local flag = false
    for i = 1, #tabData do
        self["_nodeTabIcon" .. i]:setSelected(tabData[i] == self._selectTabIndex)
        flag = flag or tabData[i] == self._selectTabIndex
    end
    if not flag then
        self._selectTabIndex = tabData[1]
        self._nodeTabIcon1:setSelected(true)
        self:_updateView()
    end
end

return TreasureTrainView