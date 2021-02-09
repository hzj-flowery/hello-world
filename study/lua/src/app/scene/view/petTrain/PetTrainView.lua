--
-- Author: hedili
-- Date: 2018-01-18 15:32:58
-- 神兽培养界面
local ViewBase = require("app.ui.ViewBase")
local PetTrainView = class("PetTrainView", ViewBase)
local PetTrainUpgradeLayer = require("app.scene.view.petTrain.PetTrainUpgradeLayer")
local PetTrainStarLayer = require("app.scene.view.petTrain.PetTrainStarLayer")
local PetTrainLimitLayer = require("app.scene.view.petTrain.PetTrainLimitLayer")
local PetConst = require("app.const.PetConst")
local RedPointHelper = require("app.data.RedPointHelper")
local CSHelper = require("yoka.utils.CSHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

local TAIL_POS_NORMAL = 295
local TAIL_POS_LIMIT = 135

function PetTrainView:ctor(petId, trainType, rangeType, isJumpWhenBack)
	G_UserData:getPet():setCurPetId(petId)
	self._selectTabIndex = trainType or PetConst.PET_TRAIN_UPGRADE
	self._rangeType = rangeType or PetConst.PET_RANGE_TYPE_1
	self._isJumpWhenBack = isJumpWhenBack --当点返回时，是否要跳过上一个场景

	local resource = {
		file = Path.getCSB("PetTrainView", "pet"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonLeft = {
				events = {{event = "touch", method = "_onButtonLeftClicked"}}
			},
			_buttonRight = {
				events = {{event = "touch", method = "_onButtonRightClicked"}}
			}
		}
	}
	PetTrainView.super.ctor(self, resource)
end

function PetTrainView:onCreate()
	self._subLayers = {} --存储子layer
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_shenshou")
	if self._isJumpWhenBack then
		self._topbarBase:setCallBackOnBack(handler(self, self._setCallback))
	end

	self:_initTab()
end

function PetTrainView:onEnter()
	self._signalHeroRankUp =
		G_SignalManager:add(SignalConst.EVENT_PET_STAR_UP_SUCCESS, handler(self, self._petStarUpSuccess))
	self._signalPetLimitUpSuccess =
		G_SignalManager:add(SignalConst.EVENT_PET_LIMITUP_SUCCESS, handler(self, self._petLimitUpSuccess))

	self:_updatePetIds()
	self:_calCurSelectedPos()
	self:updateArrowBtn()

	self:updateTabVisible()
	self:_updateView()
	self:updateRedPoint()
	-- self:_setArrowVisible(self._selectTabIndex ~= PetConst.PET_TRAIN_LIMIT)
	--抛出新手事件
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function PetTrainView:onExit()
	self._signalHeroRankUp:remove()
	self._signalHeroRankUp = nil
	self._signalPetLimitUpSuccess:remove()
	self._signalPetLimitUpSuccess = nil
end

function PetTrainView:_updatePetIds()
	if self._rangeType == PetConst.PET_RANGE_TYPE_1 then
		self._allPetIds = G_UserData:getPet():getRangeDataBySort()
	elseif self._rangeType == PetConst.PET_RANGE_TYPE_2 then
		self._allPetIds = G_UserData:getTeam():getPetIdsInBattle()
	elseif self._rangeType == PetConst.PET_RANGE_TYPE_3 then
		self._allPetIds = G_UserData:getTeam():getPetIdsInHelp()
	end
	self._petCount = #self._allPetIds
end

function PetTrainView:_calCurSelectedPos()
	self._selectedPos = 1
	local heroId = G_UserData:getPet():getCurPetId()
	for i, id in ipairs(self._allPetIds) do
		if id == heroId then
			self._selectedPos = i
		end
	end
end

function PetTrainView:_initTab()
	local curHeroId = G_UserData:getPet():getCurPetId()
	local curPetData = G_UserData:getPet():getUnitDataWithId(curHeroId)
	for i = 1, PetConst.MAX_TRAIN_TAB do
		local txt = Lang.get("pet_train_tab_icon_" .. i)
		local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_PET_TRAIN_TYPE" .. i])
		if i == 2 then
			local canBreak = curPetData:isCanBreak()
			isOpen = isOpen and canBreak
		end
		if i == 3 then
			local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")
			local canShowLimitBtn = PetTrainHelper.canShowLimitBtn(curPetData)
			isOpen = isOpen and canShowLimitBtn
		end

		self["_nodeTabIcon" .. i]:updateUI(txt, isOpen, i)
		self["_nodeTabIcon" .. i]:setCallback(handler(self, self._onClickTabIcon))
	end
end

function PetTrainView:_onClickTabIcon(index)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:updateArrowBtn()
	self:updateTabVisible()
	self:_updateView()
end

function PetTrainView:_updateTabIcons()
	local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")
	local tabSize = PetTrainHelper.getCurTabSize()
	for i = 1, tabSize do
		self["_nodeTabIcon" .. i]:setSelected(i == self._selectTabIndex)
	end
end

function PetTrainView:updateTabVisible()
	local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")
	local tabSize = PetTrainHelper.getCurTabSize()
	self._nodeTabIcon3:setVisible(tabSize == 3)
	self._image3:setVisible(tabSize == 3)
	self._imageTail:setPositionY(tabSize == 3 and TAIL_POS_LIMIT or TAIL_POS_NORMAL)

	local curHeroId = G_UserData:getPet():getCurPetId()
	local curPetData = G_UserData:getPet():getUnitDataWithId(curHeroId)
	for i = 1, tabSize do
		local txt = Lang.get("pet_train_tab_icon_" .. i)
		local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_PET_TRAIN_TYPE" .. i])
		if i == 2 then
			local canBreak = curPetData:isCanBreak()
			isOpen = isOpen and canBreak
		end
		if i == 3 then
			local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")
			local canShowLimitBtn = PetTrainHelper.canShowLimitBtn(curPetData)
			isOpen = isOpen and canShowLimitBtn
		end

		self["_nodeTabIcon" .. i]:updateUI(txt, isOpen, i)
	end
	self:_updateTabIcons()
end

function PetTrainView:_updateView()
	local layer = self._subLayers[self._selectTabIndex]
	if layer == nil then
		if self._selectTabIndex == PetConst.PET_TRAIN_UPGRADE then
			layer = PetTrainUpgradeLayer.new(self)
		elseif self._selectTabIndex == PetConst.PET_TRAIN_STAR then
			layer = PetTrainStarLayer.new(self)
		elseif self._selectTabIndex == PetConst.PET_TRAIN_LIMIT then
			layer = PetTrainLimitLayer.new(self)
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
	layer:initInfo()
end

function PetTrainView:_setCallback()
	G_UserData:getTeamCache():setShowHeroTrainFlag(true)
	G_SceneManager:popSceneByTimes(2) --pop2次，返回阵容界面
end

function PetTrainView:checkRedPoint(index)
	local petId = G_UserData:getPet():getCurPetId()
	local petUnitData = G_UserData:getPet():getUnitDataWithId(petId)
	local reach = RedPointHelper.isModuleReach(FunctionConst["FUNC_PET_TRAIN_TYPE" .. index], petUnitData)
	self["_nodeTabIcon" .. index]:showRedPoint(reach)
end

function PetTrainView:updateRedPoint()
	for i = 1, 3 do
		self:checkRedPoint(i)
	end
end

function PetTrainView:_setArrowVisible(visible)
	self._buttonLeft:setVisible(visible)
	self._buttonRight:setVisible(visible)
end

function PetTrainView:updateArrowBtn()
	self._buttonLeft:setVisible(self._selectedPos > 1)
	self._buttonRight:setVisible(self._selectedPos < self._petCount)
	if self._selectTabIndex == PetConst.PET_TRAIN_LIMIT then
		self:_setArrowVisible(false)
	end
end

function PetTrainView:_onButtonLeftClicked()
	if self._selectedPos <= 1 then
		return
	end

	self._selectedPos = self._selectedPos - 1
	local curHeroId = self._allPetIds[self._selectedPos]
	G_UserData:getPet():setCurPetId(curHeroId)
	self:updateTabVisible()
	self:updateArrowBtn()
	self:_updateView()
	self:updateRedPoint()
end

function PetTrainView:_onButtonRightClicked()
	if self._selectedPos >= self._petCount then
		return
	end

	self._selectedPos = self._selectedPos + 1
	local curHeroId = self._allPetIds[self._selectedPos]
	G_UserData:getPet():setCurPetId(curHeroId)
	self:updateTabVisible()
	self:updateArrowBtn()
	self:_updateView()
	self:updateRedPoint()
end

function PetTrainView:getAllPetIds()
	return self._allPetIds
end

function PetTrainView:getPetCount()
	return self._petCount
end

function PetTrainView:setSelectedPos(pos)
	self._selectedPos = pos
end

function PetTrainView:getSelectedPos()
	return self._selectedPos
end

function PetTrainView:setArrowBtnEnable(enable)
	self._buttonLeft:setEnabled(enable)
	self._buttonRight:setEnabled(enable)
end

function PetTrainView:_petStarUpSuccess()
	--全范围的情况，突破如果消耗同名卡，要重新更新列表
	if self._rangeType == PetConst.PET_RANGE_TYPE_1 then
		self:_updatePetIds()
		self:_calCurSelectedPos()
		self:updateArrowBtn()
		self:updateTabVisible()
		local layer = self._subLayers[self._selectTabIndex]
		if layer then
			if layer.updatePageView then
				layer:updatePageView()
			end
		end
	end
end

--
function PetTrainView:_petLimitUpSuccess()
	self:_updatePetIds()
	self:_calCurSelectedPos()
	self:updateRedPoint()
end

return PetTrainView
