-- 
-- Author: Liangxu
-- Date: 2018-12-27
-- 宝物界限消耗面板

local PopupBase = require("app.ui.PopupBase")
local TreasureLimitCostPanel = class("TreasureLimitCostPanel", PopupBase)
local CSHelper = require("yoka.utils.CSHelper")
local DataConst = require("app.const.DataConst")
local TreasureDataHelper = require("app.utils.data.TreasureDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TreasureConst = require("app.const.TreasureConst")
local AudioConst = require("app.const.AudioConst")

function TreasureLimitCostPanel:ctor(costKey, onClick, onStep, onStart, onStop, limitLevel, fromNode)
	self._costKey = costKey
	self._onClick = onClick
	self._onStep = onStep
	self._onStart = onStart
	self._onStop = onStop
	self._limitLevel = limitLevel
	self._fromNode = fromNode

	local resource = {
		file = Path.getCSB("HeroLimitCostPanel", "hero"),
		binding = {
			
		}
	}

	TreasureLimitCostPanel.super.ctor(self, resource, false, true)
end

function TreasureLimitCostPanel:onCreate()
	self:_initData()
	self:_initView()
end

function TreasureLimitCostPanel:_initData()
	self._items = {}
	self._itemIds = {}
end

function TreasureLimitCostPanel:_initView()
	local info = TreasureDataHelper.getLimitCostConfig(self._limitLevel)
	if self._costKey == TreasureConst.TREASURE_LIMIT_COST_KEY_1 then
		local tbPos = {
			[1] = {46, 148},
			[2] = {110, 56},
			[3] = {225, 56},
			[4] = {290, 148},
		}
		for i = 1, 4 do
			local item = CSHelper.loadResourceNode(Path.getCSB("CommonMaterialIcon", "common"))
			local itemId = DataConst["ITEM_TREASURE_LEVELUP_MATERIAL_"..i]
			item:setScale(0.8)
			item:updateUI(itemId, handler(self, self._onClickIcon), handler(self, self._onStepClickIcon))
			local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId)
			item:setName(param.name)
			item:setCostCountEveryTime(info["consume_"..self._costKey])
			item:setStartCallback(handler(self, self._onStartCallback))
			item:setStopCallback(handler(self, self._onStopCallback))
			item:setIsShift(true)
			item:setPosition(cc.p(tbPos[i][1], tbPos[i][2]))
			self._imageBg:addChild(item)
			table.insert(self._items, item)
			table.insert(self._itemIds, itemId)
		end
	else
		local item = CSHelper.loadResourceNode(Path.getCSB("CommonMaterialIcon", "common"))
		local itemId = info["value_"..self._costKey]
		item:setScale(0.8)
		item:updateUI(itemId, handler(self, self._onClickIcon), handler(self, self._onStepClickIcon))
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId)
		item:setName(param.name)
		item:setCostCountEveryTime(info["consume_"..self._costKey])
		item:setStartCallback(handler(self, self._onStartCallback))
		item:setStopCallback(handler(self, self._onStopCallback))
		item:setIsShift(true)
		item:setPosition(cc.p(170, 53))
		self._imageBg:addChild(item)
		table.insert(self._items, item)
		table.insert(self._itemIds, itemId)
	end

	self._panelTouch:setContentSize(G_ResolutionManager:getDesignCCSize())
	self._panelTouch:addClickEventListener(handler(self, self._onClickPanel)) --避免0.5秒间隔
end

function TreasureLimitCostPanel:onEnter()
	self._signalTreasureLimitLvPutRes = G_SignalManager:add(SignalConst.EVENT_TREASURE_LIMIT_LV_PUT_RES, handler(self, self._onTreasureLimitLvPutRes))
	--确定位置
	local nodePos = self._fromNode:convertToWorldSpaceAR(cc.p(0,0))
	local dstPos = self:convertToNodeSpace(cc.p(nodePos.x, nodePos.y))
	self._imageBg:setPosition(dstPos)
end

function TreasureLimitCostPanel:onExit()
	self._signalTreasureLimitLvPutRes:remove()
	self._signalTreasureLimitLvPutRes = nil
end

function TreasureLimitCostPanel:updateUI()
	for i, item in ipairs(self._items) do
		item:updateCount()
	end
end

function TreasureLimitCostPanel:_onClickIcon(materials)
	if self._onClick then
		G_AudioManager:playSoundWithId(AudioConst.SOUND_LIMIT_TIANCHONG)
		self._onClick(self._costKey, materials)
	end
end

function TreasureLimitCostPanel:_onStepClickIcon(itemId, itemValue, costCountEveryTime)
	if self._onStep then
		G_AudioManager:playSoundWithId(AudioConst.SOUND_LIMIT_TIANCHONG)
		local continue, realCostCount, isDo = self._onStep(self._costKey, itemId, itemValue, costCountEveryTime)
		return continue, realCostCount, isDo
	end
end

function TreasureLimitCostPanel:_onStartCallback(itemId, count)
	if self._onStart then
		self._onStart(self._costKey, itemId, count)
	end
end

function TreasureLimitCostPanel:_onStopCallback()
	if self._onStop then
		self._onStop()
	end
end

function TreasureLimitCostPanel:_onClickPanel()
	self:close()
end

function TreasureLimitCostPanel:_onTreasureLimitLvPutRes(eventName, idx)
	if self.updateUI then
		self:updateUI()
	end
end

function TreasureLimitCostPanel:findNodeWithItemId(itemId)
	for i, id in ipairs(self._itemIds) do
		if id == itemId then
			return self._items[i]
		end
	end
	return nil
end

function TreasureLimitCostPanel:getCostKey()
	return self._costKey
end

return TreasureLimitCostPanel