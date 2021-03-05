--
-- Author: Liangxu
-- Date: 2017-04-27 10:59:53
-- 回收界面
local ViewBase = require("app.ui.ViewBase")
local RecoveryView = class("RecoveryView", ViewBase)
local RecoveryConst = require("app.const.RecoveryConst")
local RecoveryHeroLayer = require("app.scene.view.recovery.RecoveryHeroLayer")
local RecoveryPetLayer = require("app.scene.view.recovery.RecoveryPetLayer")
local RebornPetLayer = require("app.scene.view.recovery.RebornPetLayer")
local RecoveryEquipLayer = require("app.scene.view.recovery.RecoveryEquipLayer")
local RebornHeroLayer = require("app.scene.view.recovery.RebornHeroLayer")
local RebornEquipLayer = require("app.scene.view.recovery.RebornEquipLayer")
local RecoveryTreasureLayer = require("app.scene.view.recovery.RecoveryTreasureLayer")
local RebornTreasureLayer = require("app.scene.view.recovery.RebornTreasureLayer")
local RecoveryInstrumentLayer = require("app.scene.view.recovery.RecoveryInstrumentLayer")
local RebornInstrumentLayer = require("app.scene.view.recovery.RebornInstrumentLayer")
local RecoveryHorseEquipLayer = require("app.scene.view.recovery.RecoveryHorseEquipLayer")
local RecoveryHorseLayer = require("app.scene.view.recovery.RecoveryHorseLayer")
local RebornHorseLayer = require("app.scene.view.recovery.RebornHorseLayer")
local RebornHistoryHeroLayer = require("app.scene.view.recovery.RebornHistoryHeroLayer")
local RecoveryShopButton = require("app.scene.view.recovery.RecoveryShopButton")
local ListCellTabIcon = require("app.scene.view.recovery.ListCellTabIcon")
local RecoveryHelper = require("app.scene.view.recovery.RecoveryHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local FunctionConst = require("app.const.FunctionConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")

function RecoveryView:ctor(recoveryType)
	self._selectTabIndex = recoveryType or RecoveryConst.RECOVERY_TYPE_1

	self._panelView = nil --容器控件
	self._buttonShop = nil --商店控件

	local resource = {
		file = Path.getCSB("RecoveryView", "recovery"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		}
	}
	self:setName("RecoveryView")
	RecoveryView.super.ctor(self, resource)
end

function RecoveryView:onCreate()
	self._subLayers = {} --存储子layer
	self._topbarBase:setImageTitle("txt_sys_com_hiishou")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._scrollViewTab:setScrollBarEnabled(false)
	self._shop = RecoveryShopButton.new(self._buttonShop)
	self:_initTab()
end

function RecoveryView:shopBtnClick( ... )
	-- body
	self._shop:_onButtonShopClicked()
end


function RecoveryView:onEnter()
	self._signalHeroRecovery = G_SignalManager:add(SignalConst.EVENT_HERO_RECOVERY_SUCCESS, handler(self, self._onEventSuccess))
	self._signalHeroReborn = G_SignalManager:add(SignalConst.EVENT_HERO_REBORN_SUCCESS, handler(self, self._onEventSuccess))
	self._signalEquipRecovery = G_SignalManager:add(SignalConst.EVENT_EQUIP_RECOVERY_SUCCESS, handler(self, self._onEventSuccess))
	self._signalEquipReborn = G_SignalManager:add(SignalConst.EVENT_EQUIP_REBORN_SUCCESS, handler(self, self._onEventSuccess))
	self._signalTreasureRecovery = G_SignalManager:add(SignalConst.EVENT_TREASURE_RECOVERY_SUCCESS, handler(self, self._onEventSuccess))
	self._signalTreasureReborn = G_SignalManager:add(SignalConst.EVENT_TREASURE_REBORN_SUCCESS, handler(self, self._onEventSuccess))
	self._signalInstrumentRecovery = G_SignalManager:add(SignalConst.EVENT_INSTRUMENT_RECYCLE_SUCCESS, handler(self, self._onEventSuccess))
	self._signalInstrumentReborn = G_SignalManager:add(SignalConst.EVENT_INSTRUMENT_REBORN_SUCCESS, handler(self, self._onEventSuccess))
	self._signalPetRecovery = G_SignalManager:add(SignalConst.EVENT_PET_RECOVERY_SUCCESS, handler(self, self._onEventSuccess))
	self._signalPetReborn = G_SignalManager:add(SignalConst.EVENT_PET_REBORN_SUCCESS, handler(self, self._onEventSuccess))
	self._signalHorseRecovery = G_SignalManager:add(SignalConst.EVENT_HORSE_RECYCLE_SUCCESS, handler(self, self._onEventSuccess))
	self._signalHorseReborn = G_SignalManager:add(SignalConst.EVENT_HORSE_REBORN_SUCCESS, handler(self, self._onEventSuccess))
    self._signalHistoricalHeroReborn = G_SignalManager:add(SignalConst.EVENT_HISTORY_HERO_REBORN_SUCCESS, handler(self, self._onEventSuccess))

    self._signalHorseEquipRecovery = G_SignalManager:add(SignalConst.EVENT_HORSE_EQUIP_RECOVERY_SUCCESS, handler(self, self._onEventSuccess))

	self:_updateTabIcons()
	self:_updateView()
end

function RecoveryView:onExit()
	self._signalHeroRecovery:remove()
	self._signalHeroRecovery = nil
	self._signalHeroReborn:remove()
	self._signalHeroReborn = nil
	self._signalEquipRecovery:remove()
	self._signalEquipRecovery = nil
	self._signalEquipReborn:remove()
	self._signalEquipReborn = nil
	self._signalTreasureRecovery:remove()
	self._signalTreasureRecovery = nil
	self._signalTreasureReborn:remove()
	self._signalTreasureReborn = nil
	self._signalInstrumentRecovery:remove()
	self._signalInstrumentRecovery = nil
	self._signalInstrumentReborn:remove()
	self._signalInstrumentReborn = nil
	self._signalPetRecovery:remove()
	self._signalPetRecovery =nil
	self._signalPetReborn:remove()
	self._signalPetReborn = nil
	self._signalHorseRecovery:remove()
	self._signalHorseRecovery = nil
	self._signalHorseReborn:remove()
	self._signalHorseReborn = nil
	self._signalHistoricalHeroReborn:remove()
    self._signalHistoricalHeroReborn = nil
    self._signalHorseEquipRecovery:remove()
    self._signalHorseEquipRecovery = nil
end

function RecoveryView:_initTab()
	local recoveryData = RecoveryDataHelper.getShowFuncRecovery()
	if #recoveryData <= 0 then
		return
	end

	self._scrollViewTab:removeAllChildren()
	for index = 1, #recoveryData do
		self["_nodeTabIcon"..index] = ListCellTabIcon.new(handler(self, self._onClickTabIcon))
		self["_nodeTabIcon"..index]:updateUI(index, recoveryData[index], #recoveryData)
		self._scrollViewTab:pushBackCustomItem(self["_nodeTabIcon"..index])
	end
end

function RecoveryView:_onClickTabIcon(index)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateTabIcons()
	self:_updateView()
end

function RecoveryView:_updateTabIcons()
	local recoveryData = RecoveryDataHelper.getShowFuncRecovery()
	if #recoveryData <= 0 then
		return
	end

	for index = 1, #recoveryData do
		self["_nodeTabIcon"..index]:setSelected(recoveryData[index] == self._selectTabIndex)
	end
end

function RecoveryView:_updateView()
	local index = self._selectTabIndex
	self:_updateBtnShop()

	local layer = self._subLayers[index]
	if layer == nil then
		if index == RecoveryConst.RECOVERY_TYPE_1 then
			layer = RecoveryHeroLayer.new(RecoveryConst.RECOVERY_SCENE_ID_2)
		elseif index == RecoveryConst.RECOVERY_TYPE_2 then
			layer = RebornHeroLayer.new(RecoveryConst.RECOVERY_SCENE_ID_2)
		elseif index == RecoveryConst.RECOVERY_TYPE_3 then
			layer = RecoveryEquipLayer.new(RecoveryConst.RECOVERY_SCENE_ID_1)
		elseif index == RecoveryConst.RECOVERY_TYPE_4 then
			layer = RebornEquipLayer.new(RecoveryConst.RECOVERY_SCENE_ID_1)
		elseif index == RecoveryConst.RECOVERY_TYPE_5 then
			layer = RecoveryTreasureLayer.new(RecoveryConst.RECOVERY_SCENE_ID_1)
		elseif index == RecoveryConst.RECOVERY_TYPE_6 then
			layer = RebornTreasureLayer.new(RecoveryConst.RECOVERY_SCENE_ID_1)
		elseif index == RecoveryConst.RECOVERY_TYPE_7 then
			layer = RecoveryInstrumentLayer.new(RecoveryConst.RECOVERY_SCENE_ID_1)
		elseif index == RecoveryConst.RECOVERY_TYPE_8 then
			layer = RebornInstrumentLayer.new(RecoveryConst.RECOVERY_SCENE_ID_1)
		elseif index == RecoveryConst.RECOVERY_TYPE_9 then
			layer = RecoveryPetLayer.new(RecoveryConst.RECOVERY_SCENE_ID_2)
		elseif index == RecoveryConst.RECOVERY_TYPE_10 then
			layer = RebornPetLayer.new(RecoveryConst.RECOVERY_SCENE_ID_2)
		elseif index == RecoveryConst.RECOVERY_TYPE_11 then
			layer = RecoveryHorseLayer.new(RecoveryConst.RECOVERY_SCENE_ID_2)
		elseif index == RecoveryConst.RECOVERY_TYPE_12 then
			layer = RebornHorseLayer.new(RecoveryConst.RECOVERY_SCENE_ID_2)
		elseif index == RecoveryConst.RECOVERY_TYPE_13 then
            layer = RebornHistoryHeroLayer.new(RecoveryConst.RECOVERY_SCENE_ID_2)
        elseif index == RecoveryConst.RECOVERY_TYPE_14 then
            layer = RecoveryHorseEquipLayer.new(RecoveryConst.RECOVERY_SCENE_ID_1)
		end
		if layer then
			self._panelView:addChild(layer)
			self._subLayers[index] = layer
		end
	end
	
	for k, subLayer in pairs(self._subLayers) do
		subLayer:setVisible(false)
	end
	layer:setVisible(true)
	layer:initInfo()
	self:_setRedPoint()
	self:_updateRedPoint()
end

function RecoveryView:_updateBtnShop()
	if self._selectTabIndex == RecoveryConst.RECOVERY_TYPE_13 then
		self._buttonShop:setVisible(false)
	else
		self._buttonShop:setVisible(true)
		self._shop:updateView(self._selectTabIndex)
	end
end

function RecoveryView:_onEventSuccess()
	self:_updateBtnShop()
	self:_setRedPoint()
end

function RecoveryView:_setRedPoint()
	if self._selectTabIndex == RecoveryConst.RECOVERY_TYPE_1 then
		local redValue = RedPointHelper.isModuleReach(FunctionConst.FUNC_RECOVERY_TYPE1)
		self._subLayers[self._selectTabIndex]:setRedPoint(redValue)
		self["_nodeTabIcon"..self._selectTabIndex]:showRedPoint(redValue)
	end
end

function RecoveryView:_updateRedPoint()
	if self._selectTabIndex == RecoveryConst.RECOVERY_TYPE_1 then
		self._subLayers[self._selectTabIndex]:updateRedPoint(redValue)
	end
end

return RecoveryView