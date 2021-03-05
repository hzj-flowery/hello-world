--
-- Author: Liangxu
-- Date: 2018-8-3 11:28:42
-- 武将界限突破

local ViewBase = require("app.ui.ViewBase")
local HeroTrainLimitLayer = class("HeroTrainLimitLayer", ViewBase)
local HeroLimitCostNode = require("app.scene.view.heroTrain.HeroLimitCostNode")
local HeroConst = require("app.const.HeroConst")
local HeroLimitCostPanel = require("app.scene.view.heroTrain.HeroLimitCostPanel")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")
local PopupLimitDetail = require("app.scene.view.heroTrain.PopupLimitDetail")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local TextHelper = require("app.utils.TextHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIConst = require("app.const.UIConst")
local DataConst = require("app.const.DataConst")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local FunctionConst	= require("app.const.FunctionConst")
local SchedulerHelper = require("app.utils.SchedulerHelper")

local ZORDER_COMMON = 0
local ZORDER_MID = 1
local ZORDER_MOVE = 2

local LIMIT_UI_TYPE_4 = 1 	-- 4个小球
local LIMIT_UI_TYPE_6 = 2 	-- 6个小球

local TYPE_6_OFFSET = cc.p(34, 46)

function HeroTrainLimitLayer:ctor(parentView)
	self._parentView = parentView
	local resource = {
		file = Path.getCSB("HeroTrainLimitLayer", "hero"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonBreak = {
				events = {{event = "touch", method = "_onButtonBreak"}}
			},
			_buttonDetail = {
				events = {{event = "touch", method = "_onButtonDetail"}}
			}
		},
	}
	
	HeroTrainLimitLayer.super.ctor(self, resource)
end

function HeroTrainLimitLayer:onCreate()
	self:_initData()
	self:_initView()
end

function HeroTrainLimitLayer:onEnter()
	self._signalHeroLimitLvPutRes = G_SignalManager:add(SignalConst.EVENT_HERO_LIMIT_LV_PUT_RES, handler(self, self._onHeroLimitLvPutRes))
	self._signalHeroLimitLvUpSuccess = G_SignalManager:add(SignalConst.EVENT_HERO_LIMIT_LV_UP_SUCCESS, handler(self, self._onHeroLimitLvUpSuccess))
end

function HeroTrainLimitLayer:onExit()
	self._signalHeroLimitLvPutRes:remove()
	self._signalHeroLimitLvPutRes = nil
	self._signalHeroLimitLvUpSuccess:remove()
	self._signalHeroLimitLvUpSuccess = nil
	self:_stopPlayAttackEffect()
end

function HeroTrainLimitLayer:initInfo()
	self._parentView:setArrowBtnVisible(false)
	self:_updateData()
	self:_updateView()
	self:_playFire(true)
end

-- 专门的函数初始化数据，onCreate中
function HeroTrainLimitLayer:_initData()
	self._costMaterials = {} --记录消耗的材料
	self._materialMaxSize = { --每种材料最大值
		[HeroConst.HERO_LIMIT_COST_KEY_1] = 0,
		[HeroConst.HERO_LIMIT_COST_KEY_2] = 0,
		[HeroConst.HERO_LIMIT_COST_KEY_3] = 0,
		[HeroConst.HERO_LIMIT_COST_KEY_4] = 0,
		[HeroConst.HERO_LIMIT_COST_KEY_5] = 0,
		[HeroConst.HERO_LIMIT_COST_KEY_6] = 0,
	}
	self._silverCost = 0

	self._materialFakeCount = nil --材料假个数
	self._materialFakeCostCount = nil --材料假的消耗个数
	self._materialFakeCurSize = 0

	self._limitUIType = LIMIT_UI_TYPE_4
	self._limitDataType = HeroConst.HERO_LIMIT_TYPE_RED
	
	self._consumeHero = {} 		-- 消耗武将胚子的记录

	-- 记录属性
	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst.FUNC_HERO_TRAIN_TYPE4)
end

function HeroTrainLimitLayer:_initOrgPos()
	local list = {self._nodeHero, self._nodeGogok, self._textName, self._nodeBgMoving, self._nodePopup, self._imageTitle,
		self._buttonBreak, self._nodeSilver, self._nodeHetiMoving, self._nodeFire, self._nodeGoldLock}
	self._moveNodeList = list
	for _,node in ipairs(list) do
		node._orgPos = cc.p(node:getPosition())
	end
end

function HeroTrainLimitLayer:_initView()
	self._imgBg = ccui.Helper:seekNodeByName(self, "Image_181")
	self._nodeCon = ccui.Helper:seekNodeByName(self, "Node_1")
	self._popupPanel = nil
	self._buttonHelp:updateUI(FunctionConst.FUNC_HERO_TRAIN_TYPE4)
	self._buttonBreak:setString(Lang.get("hero_limit_break_btn"))
	self._nodeHero:setScale(1.4)
	self._nodeHero:setLocalZOrder(ZORDER_MID)
	self._imgNameBg = ccui.Helper:seekNodeByName(self, "Image1")
	self._imgNameBg:setVisible(false)
	self:_initOrgPos()

	for key = HeroConst.HERO_LIMIT_COST_KEY_1, HeroConst.HERO_LIMIT_COST_KEY_4 do
		self["_cost"..key] = HeroLimitCostNode.new(self["_costNode"..key], key, handler(self, self._onClickCostAdd), 1)
	end
	for key = HeroConst.HERO_LIMIT_COST_KEY_1, HeroConst.HERO_LIMIT_COST_KEY_6 do
		self["_cost2_"..key] = HeroLimitCostNode.new(self["_costNode2_"..key], key, handler(self, self._onClickCostAdd), 2)
	end
	self._nodeGoldLock:setVisible(false)
	self._costNode1_con:setVisible(true)
	self._costNode2_con:setVisible(false)
	self._nodeSilver:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD)
	self._nodeSilver:setTextColorToDTypeColor()
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeBgMoving, "moving_tujie_huohua", nil, nil, false)
	self:_playAttackEffect()
end

function HeroTrainLimitLayer:_updateData()
	self._heroId = G_UserData:getHero():getCurHeroId()
	self._heroUnitData = G_UserData:getHero():getUnitDataWithId(self._heroId)
	
	self._limitDataType = HeroDataHelper.getLimitDataType(self._heroUnitData)
	if self._limitDataType==HeroConst.HERO_LIMIT_TYPE_RED then
		self._buttonHelp:updateUI(FunctionConst.FUNC_HERO_TRAIN_TYPE4)
	else
		self._buttonHelp:updateUI(FunctionConst.FUNC_HERO_TRAIN_TYPE4_RED)
	end

	local lv, type = self:getLimitLvAndType()
	local info = HeroDataHelper.getHeroLimitCostConfig(lv, type)
	local configKey = HeroDataHelper.getLimitCostConfigKey(5)
	if info[configKey.size] and info[configKey.size]>0 then
		self._limitUIType = LIMIT_UI_TYPE_6
	else
		self._limitUIType = LIMIT_UI_TYPE_4
	end

	for i = HeroConst.HERO_LIMIT_COST_KEY_1, HeroConst.HERO_LIMIT_COST_KEY_6 do
		self._materialMaxSize[i] = info[HeroDataHelper.getLimitCostConfigKey(i).size]
	end
	self._silverCost = info.break_size

	local curAttrData = HeroDataHelper.getLimitAttr(self._heroUnitData)
	self._recordAttr:updateData(curAttrData)
	G_UserData:getAttr():recordPower()
end

function HeroTrainLimitLayer:_updateView()
	self:_updateBaseInfo()
	self:_updateAllCost()
	self:_updateBtnAndSilverState()
end

function HeroTrainLimitLayer:_fitUI()
	if self._limitDataType==HeroConst.HERO_LIMIT_TYPE_RED then
		if self._sceneId then
			self:clearScene()
			self._sceneId = nil
			self._imgBg:setVisible(true)
			for _,node in ipairs(self._moveNodeList) do
				node:setPosition(node._orgPos)
			end
		end
		if self._limitDataType==HeroConst.HERO_LIMIT_TYPE_RED and self._heroUnitData:getLimit_level()>=HeroConst.HERO_LIMIT_RED_MAX_LEVEL then
			self._textName:setPositionX(-25)
		end
		if self._attackEffect then
			self._attackEffect:setVisible(false)
		end
	end
	if self._limitDataType==HeroConst.HERO_LIMIT_TYPE_GOLD then
		if not self._sceneId then
			self:updateSceneId(2011)
			self._sceneId = 2011
			self._imgBg:setVisible(false)
			for _,node in ipairs(self._moveNodeList) do
				node:setPositionX(node._orgPos.x+TYPE_6_OFFSET.x)
			end
			self._nodeHero:setPositionY(self._nodeHero._orgPos.y-TYPE_6_OFFSET.y)
		end
		if self._limitDataType==HeroConst.HERO_LIMIT_TYPE_GOLD and self._heroUnitData:getLimit_rtg()>=HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL then
			self._textName:setPositionX(-25+TYPE_6_OFFSET.x)
		end
		if self._attackEffect then
			self._attackEffect:setVisible(true)
		end
	end
end

function HeroTrainLimitLayer:_playAttackEffect()
	local function eventFunction(event)
		if event == "finish" then
			self._attackEffect = nil
			local interval = 6
			self._attackEffScheduler = SchedulerHelper.newScheduleOnce(function()
				self:_playAttackEffect()
			end, interval)
		end
	end
	self._attackEffect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeCon, "moving_hongshengjinchangjing", nil, eventFunction, true)
	self._attackEffect:setVisible(self._limitDataType==HeroConst.HERO_LIMIT_TYPE_GOLD)
	self._attackEffect:setLocalZOrder(-1)
end

function HeroTrainLimitLayer:_stopPlayAttackEffect()
	if self._attackEffScheduler then
		SchedulerHelper.cancelSchedule(self._attackEffScheduler)
		self._attackEffScheduler = nil
	end
end

function HeroTrainLimitLayer:_updateBaseInfo()
	self:_fitUI()
	local name = self._heroUnitData:getConfig().name
	local baseId = self._heroUnitData:getBase_id()
	local limitLevel = self._heroUnitData:getLimit_level()
	local limitRedLevel = self._heroUnitData:getLimit_rtg()
	local nameStr = Lang.get("hero_limit_name", {name = name})
	-- _nodeGoldLock _imgLockTip txt_limit_05b.png

	logDebug("self._limitUIType==" .. self._limitUIType)
	self._costNode1_con:setVisible(self._limitUIType==LIMIT_UI_TYPE_4)
	self._costNode2_con:setVisible(self._limitUIType==LIMIT_UI_TYPE_6)

	local isTop = true
	local lv = 0
	if self._limitDataType==HeroConst.HERO_LIMIT_TYPE_RED then
		self._nodeGogok:resetSize(3)
		self._imageTitle:loadTexture(Path.getTextLimit("txt_limit_06"))
		local txtColor =  Colors.getColor(6)
		self._textName:setColor(txtColor)
		self._textName:disableEffect(cc.LabelEffect.OUTLINE)
		self._imgLockTip:loadTexture(Path.getTextLimit("txt_limit_05"))
		isTop = (limitLevel>=HeroConst.HERO_LIMIT_RED_MAX_LEVEL)
		lv = limitLevel
	else
		self._nodeGogok:resetSize(4)
		self._imageTitle:loadTexture(Path.getTextLimit("txt_limit_06i"))
		local txtColor =  Colors.getColor(7)
		local txtColorOutline = Colors.getColorOutline(7)
		self._textName:setColor(txtColor)
		self._textName:enableOutline(txtColorOutline,2)
		self._imgLockTip:loadTexture(Path.getTextLimit("txt_limit_05b"))
		isTop = (limitRedLevel>=HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL)
		lv = limitRedLevel
	end
	-- self._costNode1_con:setVisible(false)
	-- self._costNode2_con:setVisible(false)

	self._textName:setString(nameStr)
	self._nodeGogok:setCount(lv)
	-- 一直放界限突破之后的形象
	if self._limitDataType==HeroConst.HERO_LIMIT_TYPE_RED then
		self._nodeHero:updateUI(baseId, nil, nil, 3, nil, nil)
	else
		self._nodeHero:updateUI(baseId, nil, nil, 3, nil, nil, 4)
	end
	if isTop then
		self._imageTitle:setVisible(false)
		self._nodeGoldLock:setVisible(false)
	else
		self._imageTitle:setVisible(true)
		-- self._nodeGoldLock:setVisible(true)
	end
end

function HeroTrainLimitLayer:_updateAllCost()
	local endIndex = self:getLimitBallNum()
	for key = HeroConst.HERO_LIMIT_COST_KEY_1, endIndex do
		self:_updateSingeCost(key)
	end
	self:_updateSilverCost()
end

function HeroTrainLimitLayer:_updateSingeCost(costKey)
	local costName, costNodeName = self:getCostNodeName()
	local curCount = self._heroUnitData:getLimitCostCountWithKey(costKey, self._limitDataType)
	local lv, type = self:getLimitLvAndType()
	self[costName..costKey]:updateUI(lv, curCount, type)
	if type and type~=0 then
		self[costName..costKey]:enableTextOutline(true)
	else
		self[costName..costKey]:enableTextOutline(false)
	end
	local isShow = HeroDataHelper.isPromptHeroLimitWithCostKey(self._heroUnitData, costKey)
	self[costName..costKey]:showRedPoint(isShow)
	self[costNodeName..costKey]:setLocalZOrder(ZORDER_COMMON)
end

function HeroTrainLimitLayer:_updateSilverCost()
	local strSilver = TextHelper.getAmountText1(self._silverCost)
	self._nodeSilver:setCount(strSilver, nil, true)
end

function HeroTrainLimitLayer:_updateBtnAndSilverState()
	--满级不显示
	if (self._limitDataType==HeroConst.HERO_LIMIT_TYPE_RED and self._heroUnitData:getLimit_level()>=HeroConst.HERO_LIMIT_RED_MAX_LEVEL)
		or (self._limitDataType~=HeroConst.HERO_LIMIT_TYPE_RED and self._heroUnitData:getLimit_rtg()>=HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL) then
		self._buttonBreak:setVisible(false)
		self._nodeSilver:setVisible(false)
		return
	end

	local isAllFull = true
	for key = HeroConst.HERO_LIMIT_COST_KEY_1, HeroConst.HERO_LIMIT_COST_KEY_6 do
		local isFull = self:_checkIsMaterialFull(key)
		isAllFull = isAllFull and isFull
	end
	self._buttonBreak:setVisible(isAllFull)
	self._nodeSilver:setVisible(isAllFull)
end

function HeroTrainLimitLayer:_playFire(isPlay)
	self._nodeFire:removeAllChildren()
	local effectName = isPlay and "effect_tujietiaozi_1" or "effect_tujietiaozi_2"
	local limitLevel = self._heroUnitData:getLimit_level()
	local limitRedLevel = self._heroUnitData:getLimit_rtg()
	local redTop = (self._limitDataType==HeroConst.HERO_LIMIT_TYPE_RED and limitLevel==HeroConst.HERO_LIMIT_RED_MAX_LEVEL)
	local goldTop = (self._limitDataType~=HeroConst.HERO_LIMIT_TYPE_RED and limitRedLevel==HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL)
	-- TODO 区分当前不能红升金的情况
	if redTop or goldTop then
		local effect = EffectGfxNode.new(effectName)
		self._nodeFire:addChild(effect)
		effect:play()
	end
end

function HeroTrainLimitLayer:_onClickCostAdd(costKey)
	local isReach, needRank = self:_checkRankLevel()
	if isReach == false then
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, self._heroUnitData:getBase_id())
		local name = param.name
		local rank = needRank
		local lv, type = self:getLimitLvAndType()
		G_Prompt:showTip(Lang.get("hero_limit_level_condition", {name = name, rank = rank, level = lv+1}))
		return
	end

	self:_openPopupPanel(costKey)
end

function HeroTrainLimitLayer:getCostNodeName()
	local costName = ""
	local costNodeName = ""
	if self._limitUIType==LIMIT_UI_TYPE_4 then
		costName = "_cost"
		costNodeName = "_costNode"
	else
		costName = "_cost2_"
		costNodeName = "_costNode2_"
	end
	return costName, costNodeName
end

function HeroTrainLimitLayer:_openPopupPanel(costKey)
	if self._popupPanel ~= nil then
		return
	end

	local _,costNodeName = self:getCostNodeName()
	local lv, type = self:getLimitLvAndType()

	self._popupPanel = HeroLimitCostPanel.new(costKey, 
											handler(self, self._onClickCostPanelItem), 
											handler(self, self._onClickCostPanelStep), 
											handler(self, self._onClickCostPanelStart), 
											handler(self, self._onClickCostPanelStop),
											lv,
											self[costNodeName..costKey],
											{baseId = self._heroUnitData:getBase_id(), limitRed = type}
										)
	self._popupPanelSignal = self._popupPanel.signal:add(handler(self, self._onPopupPanelClose))
	if self._limitDataType~=HeroConst.HERO_LIMIT_TYPE_RED and 
		(costKey==HeroConst.HERO_LIMIT_COST_KEY_3 or costKey==HeroConst.HERO_LIMIT_COST_KEY_4)
		and self._limitUIType==LIMIT_UI_TYPE_6 then
		-- self._popupPanel:turnDown()
	end
	self._nodePopup:addChild(self._popupPanel)
	self._popupPanel:updateUI()
end

function HeroTrainLimitLayer:_onPopupPanelClose(event)
	if event == "close" then
        self._popupPanel = nil
        if self._popupPanelSignal then
	        self._popupPanelSignal:remove()
	        self._popupPanelSignal = nil
	    end
    end
end

function HeroTrainLimitLayer:_onClickCostPanelItem(costKey, materials)
	if self:_checkIsMaterialFull(costKey) == true then
		return
	end
	local uidList = {}
	-- 防止过多消耗
	if costKey==HeroConst.HERO_LIMIT_COST_KEY_1 or costKey==HeroConst.HERO_LIMIT_COST_KEY_2 or costKey==HeroConst.HERO_LIMIT_COST_KEY_6 then
		-- 按照需要的经验消耗道具，防止多余的消耗
		local id = materials[1].id
		local num = materials[1].num
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, id)
		local itemValue = math.max(1, param.cfg.item_value)
		local count = 0
		local cur = 0

		local curCount = self._heroUnitData:getLimitCostCountWithKey(costKey, self._limitDataType)
		local lv, type = self:getLimitLvAndType()
		local info = HeroDataHelper.getHeroLimitCostConfig(lv, type)
		local configKey = HeroDataHelper.getLimitCostConfigKey(costKey)
		local size = info[configKey.size] or 0
		local reminder = size - curCount

		for j=1,num do
			cur = cur + itemValue
			count = count+1
			if cur>=reminder then
				break
			end
		end
		materials[1].num = count
	end
	-- 消耗武将胚子的特殊处理
	if costKey==HeroConst.HERO_LIMIT_COST_KEY_5 then
		local id = materials[1].id
		local num = materials[1].num
		local unitDataList = G_UserData:getHero():getSameCardCountWithBaseId(id)
		self._consumeHero[id] = self._consumeHero[id] or {}
		local count = 0
		for i,v in ipairs(unitDataList) do
			local uid = v:getId()
			if not self._consumeHero[id][uid] then
				self._consumeHero[id][uid] = true
				table.insert(uidList, uid)
				count = count+1
				if count>=num then
					break
				end
			end
		end
	end

	self:_doPutRes(costKey, materials, uidList)
end

function HeroTrainLimitLayer:_onClickCostPanelStep(costKey, itemId, itemValue, costCountEveryTime)
	if self._materialFakeCount <= 0 then
		return false
	end

	if self._materialFakeCurSize >= self._materialMaxSize[costKey] then
		G_Prompt:showTip(Lang.get("hero_limit_material_full"))
		return false, nil, true
	end

	local realCostCount = math.min(self._materialFakeCount, costCountEveryTime)
	self._materialFakeCount = self._materialFakeCount - realCostCount
	self._materialFakeCostCount = self._materialFakeCostCount + realCostCount

	local costSizeEveryTime = realCostCount
	if costKey == HeroConst.HERO_LIMIT_COST_KEY_1 then
		costSizeEveryTime = itemValue * realCostCount
	end
	self._materialFakeCurSize = self._materialFakeCurSize + costSizeEveryTime

	if self._popupPanel then
		local emitter = self:_createEmitter(costKey)
		local startNode = self._popupPanel:findNodeWithItemId(itemId)
		local _,costNodeName = self:getCostNodeName()
		local endNode = self[costNodeName..costKey]
		self:_playEmitterEffect(emitter, startNode, endNode, costKey, self._materialFakeCurSize)
		startNode:setCount(self._materialFakeCount)
	end
	return true, realCostCount
end

function HeroTrainLimitLayer:_onClickCostPanelStart(costKey, itemId, count)
	self._materialFakeCount = count
	self._materialFakeCostCount = 0
	self._consumeHero = {}
	self._materialFakeCurSize = self._heroUnitData:getLimitCostCountWithKey(costKey, self._limitDataType)
end

function HeroTrainLimitLayer:_onClickCostPanelStop()
	
end

function HeroTrainLimitLayer:_onButtonDetail()
	local popup = PopupLimitDetail.new(self._heroUnitData)
	popup:openWithAction()
end

function HeroTrainLimitLayer:_onButtonBreak()
	local isOk, func = LogicCheckHelper.enoughMoney(self._silverCost)
	if isOk == false then
		func()
		return
	end

	self:_doLvUp()
end

function HeroTrainLimitLayer:_checkRankLevel()
	local isReach, needRank = HeroDataHelper.isReachLimitRank(self._heroUnitData)
	return isReach, needRank
end

function HeroTrainLimitLayer:_checkIsMaterialFull(costKey)
	local curSize = self._heroUnitData:getLimitCostCountWithKey(costKey, self._limitDataType)
	local maxSize = self._materialMaxSize[costKey]
	if curSize >= maxSize then
		return true
	else
		return false
	end
end

function HeroTrainLimitLayer:_doPutRes(costKey, materials, costHeroIds)
	local heroId = self._heroUnitData:getId()
	local pos = costKey
	local subItems = materials
	-- local costHeroIds = {} 	-- cost_hero_ids
	-- if self._limitUIType==LIMIT_UI_TYPE_6 and (costKey==5 or costKey==6) then
	-- 	for i,v in ipairs(subItems) do
	-- 		table.insert(costHeroIds, v.id)
	-- 	end
	-- end
	local op = 0
	if self._limitDataType~=HeroConst.HERO_LIMIT_TYPE_RED then
		op = 1
	end
	G_UserData:getHero():c2sHeroLimitLvPutRes(heroId, pos, subItems, op, costHeroIds)
	self._costMaterials = materials
end

function HeroTrainLimitLayer:_doLvUp()
	local heroId = self._heroUnitData:getId()
	local op = 0
	if self._limitDataType~=HeroConst.HERO_LIMIT_TYPE_RED then
		op = 1
	end
	G_UserData:getHero():c2sHeroLimitLvUp(heroId, op)
end

function HeroTrainLimitLayer:_onHeroLimitLvPutRes(eventName, costKey)
	self:_updateData()
	if self._parentView and self._parentView.checkRedPoint then
		self._parentView:checkRedPoint(4)
	end

	if self._popupPanel == nil then
		self:_updateSingeCost(costKey)
		self:_updateBtnAndSilverState()
		return
	end
	
	if self._materialFakeCostCount and self._materialFakeCostCount > 0 then --如果假球已经飞过了，就不再播球了，直接播剩下的特效和飘字
		self._materialFakeCostCount = nil
		self:_updateSingeCost(costKey)
	else
		local curCount = self._heroUnitData:getLimitCostCountWithKey(costKey, self._limitDataType)
		for i, material in ipairs(self._costMaterials) do
			local itemId = material.id
			local emitter = self:_createEmitter(costKey)
			local startNode = self._popupPanel:findNodeWithItemId(itemId)
			local _,costNodeName = self:getCostNodeName()
			local endNode = self[costNodeName..costKey]
			self:_playEmitterEffect(emitter, startNode, endNode, costKey, curCount)
		end
	end
	
	self:_updateBtnAndSilverState()
	if self:_checkIsMaterialFull(costKey) == true then
		self._popupPanel:close()
	end
end

function HeroTrainLimitLayer:_onHeroLimitLvUpSuccess()
	self:_updateData()
	local AudioConst = require("app.const.AudioConst")
	G_AudioManager:playSoundWithId(AudioConst.SOUND_LIMIT_TUPO)
	self:_playLvUpEffect()
	if self._parentView and self._parentView.checkRedPoint then
		self._parentView:checkRedPoint(4)
	end
end

--特效部分-----------------------------------------------------------

function HeroTrainLimitLayer:_createEmitter(costKey)
	local names = {
		[HeroConst.HERO_LIMIT_COST_KEY_1] = "tujiegreen",
		[HeroConst.HERO_LIMIT_COST_KEY_2] = "tujieblue",
		[HeroConst.HERO_LIMIT_COST_KEY_3] = "tujiepurple",
		[HeroConst.HERO_LIMIT_COST_KEY_4] = "tujieorange",
		[HeroConst.HERO_LIMIT_COST_KEY_5] = "tujiepurple",
		[HeroConst.HERO_LIMIT_COST_KEY_6] = "tujieorange",
	}
	local emitter = cc.ParticleSystemQuad:create("particle/"..names[costKey]..".plist")
	emitter:resetSystem()
    return emitter
end

--飞球特效
function HeroTrainLimitLayer:_playEmitterEffect(emitter, startNode, endNode, costKey, curCount)
	local function getRandomPos(startPos, endPos)
		local pos11 = cc.p(startPos.x+(endPos.x-startPos.x)*1/2, startPos.y+(endPos.y-startPos.y)*3/4)
    	local pos12 = cc.p(startPos.x+(endPos.x-startPos.x)*1/4, startPos.y+(endPos.y-startPos.y)*1/2)
    	local pos21 = cc.p(startPos.x+(endPos.x-startPos.x)*3/4, startPos.y+(endPos.y-startPos.y)*1/2)
    	local pos22 = cc.p(startPos.x+(endPos.x-startPos.x)*1/2, startPos.y+(endPos.y-startPos.y)*1/4)
    	local tbPos = {
    		[1] = {pos11, pos12},
    		[2] = {pos21, pos22},
    	}

		local index = math.random(1, 2)
		return tbPos[index][1], tbPos[index][2]
	end

    local startPos = UIHelper.convertSpaceFromNodeToNode(startNode, self)
    emitter:setPosition(startPos)
	self:addChild(emitter)
	local costName = self:getCostNodeName()
    local endPos = UIHelper.convertSpaceFromNodeToNode(endNode, self)
    local pointPos1, pointPos2 = getRandomPos(startPos, endPos)
    local bezier = {
	    pointPos1,
	    pointPos2,
	    endPos,
	}
	local action1 = cc.BezierTo:create(0.7, bezier)
	local action2 = cc.EaseSineIn:create(action1)
	emitter:runAction(cc.Sequence:create(
            action2,
            cc.CallFunc:create(function()
				local lv, type = self:getLimitLvAndType()
            	self[costName..costKey]:playRippleMoveEffect(lv, curCount, type)
            end),
            cc.RemoveSelf:create()
        )
	)
end

function HeroTrainLimitLayer:getLimitLvAndType()
	if self._limitDataType==HeroConst.HERO_LIMIT_TYPE_RED then
		return self._heroUnitData:getLimit_level(), self._limitDataType
	else
		return self._heroUnitData:getLimit_rtg(), self._limitDataType
	end
end

function HeroTrainLimitLayer:getLimitBallNum()
	if self._limitUIType==LIMIT_UI_TYPE_4 then
		return HeroConst.HERO_LIMIT_COST_KEY_4
	else
		return HeroConst.HERO_LIMIT_COST_KEY_6
	end
end

function HeroTrainLimitLayer:_playLvUpEffect()
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "faguang" then
    		
        elseif event == "finish" then
            self:_updateView()
            self:_playHeroAnimation()
            self:_playFire(true)
			local delay = cc.DelayTime:create(0.5) --延迟x秒播飘字
		    local sequence = cc.Sequence:create(delay, cc.CallFunc:create(function()
		    	self:_playPrompt()
		    end))
		    self:runAction(sequence)
        end
    end

	G_EffectGfxMgr:createPlayMovingGfx(self._nodeHetiMoving, "moving_tujieheti", effectFunction, eventFunction , true)

	local endIndex = self:getLimitBallNum()
	local costName, costNodeName = self:getCostNodeName()
	for key = HeroConst.HERO_LIMIT_COST_KEY_1, endIndex do
		self[costNodeName..key]:setLocalZOrder(ZORDER_MOVE)
		self[costName..key]:playSMoving()
	end
end

--播放武将动作
function HeroTrainLimitLayer:_playHeroAnimation()
	local heroBaseId = self._heroUnitData:getBase_id()
	local limitLevel = self._heroUnitData:getLimit_level()
	local limitRedLevel = self._heroUnitData:getLimit_rtg()
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, nil, nil, limitLevel, limitRedLevel)
	local actionName = param.res_cfg.show_action
	if actionName ~= "" then
		self._nodeHero:playAnimationOnce(actionName)
	end
	G_HeroVoiceManager:playVoiceWithHeroId(heroBaseId, true)
end

function HeroTrainLimitLayer:_playPrompt()
    local summary = {}
	local content = Lang.get("summary_hero_limit_break_success")
	local param = {
		content = content,
	} 
	table.insert(summary, param)
	
	--属性飘字
	self:_addBaseAttrPromptSummary(summary)

    G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummary()
end

--加入基础属性飘字内容
function HeroTrainLimitLayer:_addBaseAttrPromptSummary(summary)
	local attr = self._recordAttr:getAttr()
	local desInfo = TextHelper.getAttrInfoBySort(attr)
	for i, info in ipairs(desInfo) do
		local attrId = info.id
		local diffValue = self._recordAttr:getDiffValue(attrId)
		if diffValue ~= 0 then
			local param = {
				content = AttrDataHelper.getPromptContent(attrId, diffValue),
				anchorPoint = cc.p(0, 0.5),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_ATTR},
			}
			table.insert(summary, param)
		end
	end

	return summary
end

return HeroTrainLimitLayer
