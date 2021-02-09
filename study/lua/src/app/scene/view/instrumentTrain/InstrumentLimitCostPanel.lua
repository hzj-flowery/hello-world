--
-- Author: Liangxu
-- Date: 2018-8-7
-- 武将界限消耗面板

local PopupBase = require("app.ui.PopupBase")
local InstrumentLimitCostPanel = class("InstrumentLimitCostPanel", PopupBase)
local CSHelper = require("yoka.utils.CSHelper")
local DataConst = require("app.const.DataConst")
local InstrumentDataHelper = require("app.utils.data.InstrumentDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AudioConst = require("app.const.AudioConst")

function InstrumentLimitCostPanel:ctor(costKey, onClick, onStep, onStart, onStop, templateId, limitLevel, fromNode)
	self._costKey = costKey
	self._onClick = onClick
	self._onStep = onStep
	self._onStart = onStart
	self._onStop = onStop
	self._templateId = templateId
	self._limitLevel = limitLevel
	self._fromNode = fromNode

	local resource = {
		file = Path.getCSB("HeroLimitCostPanel", "hero"),
		binding = {}
	}

	InstrumentLimitCostPanel.super.ctor(self, resource, false, true)
end

function InstrumentLimitCostPanel:onCreate()
	self:_initData()
	self:_initView()
end

function InstrumentLimitCostPanel:_initData()
	self._items = {}
	self._itemIds = {}
end

function InstrumentLimitCostPanel:_initView()
	local info = InstrumentDataHelper.getInstrumentRankConfig(self._templateId, self._limitLevel)
	local item = CSHelper.loadResourceNode(Path.getCSB("CommonMaterialIcon", "common"))
	local itemId = info["value_" .. self._costKey]
	item:setScale(0.8)
	item:updateUI(itemId, handler(self, self._onClickIcon), handler(self, self._onStepClickIcon))
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId)
	item:setName(param.name)
	item:setCostCountEveryTime(info["consume_" .. self._costKey])
	item:setStartCallback(handler(self, self._onStartCallback))
	item:setStopCallback(handler(self, self._onStopCallback))
	item:setIsShift(true)
	item:setPosition(cc.p(170, 53))
	self._imageBg:addChild(item)
	table.insert(self._items, item)
	table.insert(self._itemIds, itemId)

	self._panelTouch:setContentSize(G_ResolutionManager:getDesignCCSize())
	self._panelTouch:addClickEventListener(handler(self, self._onClickPanel)) --避免0.5秒间隔
end

function InstrumentLimitCostPanel:onEnter()
	self._signalInstrumentLimitLvPutRes =
		G_SignalManager:add(SignalConst.EVENT_INSTRUMENT_LIMIT_LV_PUT_RES, handler(self, self._onInstrumentLimitLvPutRes))
	--确定位置
	local nodePos = self._fromNode:convertToWorldSpaceAR(cc.p(0, 0))
	local dstPos = self:convertToNodeSpace(cc.p(nodePos.x, nodePos.y))
	self._imageBg:setPosition(dstPos)
end

function InstrumentLimitCostPanel:onExit()
	self._signalInstrumentLimitLvPutRes:remove()
	self._signalInstrumentLimitLvPutRes = nil
end

function InstrumentLimitCostPanel:updateUI()
	for i, item in ipairs(self._items) do
		item:updateCount()
	end
end

function InstrumentLimitCostPanel:_onClickIcon(materials)
	if self._onClick then
		G_AudioManager:playSoundWithId(AudioConst.SOUND_LIMIT_TIANCHONG)
		self._onClick(self._costKey, materials)
	end
end

function InstrumentLimitCostPanel:_onStepClickIcon(itemId, itemValue, costCountEveryTime)
	if self._onStep then
		G_AudioManager:playSoundWithId(AudioConst.SOUND_LIMIT_TIANCHONG)
		local continue, realCostCount, isDo = self._onStep(self._costKey, itemId, itemValue, costCountEveryTime)
		return continue, realCostCount, isDo
	end
end

function InstrumentLimitCostPanel:_onStartCallback(itemId, count)
	if self._onStart then
		self._onStart(self._costKey, itemId, count)
	end
end

function InstrumentLimitCostPanel:_onStopCallback()
	if self._onStop then
		self._onStop()
	end
end

function InstrumentLimitCostPanel:_onClickPanel()
	self:close()
end

function InstrumentLimitCostPanel:_onInstrumentLimitLvPutRes(eventName, costKey)
	if self.updateUI then
		self:updateUI()
	end
end

function InstrumentLimitCostPanel:findNodeWithItemId(itemId)
	for i, id in ipairs(self._itemIds) do
		if id == itemId then
			return self._items[i]
		end
	end
	return nil
end

function InstrumentLimitCostPanel:getCostKey()
	return self._costKey
end

return InstrumentLimitCostPanel
