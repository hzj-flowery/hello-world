--
-- Author: Liangxu
-- Date: 2018-12-27
-- 宝物界限突破
local ViewBase = require("app.ui.ViewBase")
local TreasureTrainLimitLayer = class("TreasureTrainLimitLayer", ViewBase)
local TreasureConst = require("app.const.TreasureConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TreasureLimitCostNode = require("app.scene.view.treasureTrain.TreasureLimitCostNode")
local TreasureDataHelper = require("app.utils.data.TreasureDataHelper")
local TextHelper = require("app.utils.TextHelper")
local TreasureLimitCostPanel = require("app.scene.view.treasureTrain.TreasureLimitCostPanel")
local UIHelper = require("yoka.utils.UIHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIConst = require("app.const.UIConst")
local DataConst = require("app.const.DataConst")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local PopupTreasureLimitDetail = require("app.scene.view.treasureTrain.PopupTreasureLimitDetail")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")

local ZORDER_COMMON = 0
local ZORDER_MID = 1
local ZORDER_MOVE = 2

function TreasureTrainLimitLayer:ctor(parentView)
	self._parentView = parentView

	local resource = {
		file = Path.getCSB("TreasureTrainLimitLayer", "treasure"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonBreak = {
				events = {{event = "touch", method = "_onButtonBreak"}},
			},
			_buttonDetail = {
				events = {{event = "touch", method = "_onButtonDetail"}}
			}
		},
	}
	TreasureTrainLimitLayer.super.ctor(self, resource)
end

function TreasureTrainLimitLayer:onCreate()
	self:_initData()
	self:_initView()
end

function TreasureTrainLimitLayer:onEnter()
	self._signalTreasureLimitLvPutRes = G_SignalManager:add(SignalConst.EVENT_TREASURE_LIMIT_LV_PUT_RES, handler(self, self._onTreasureLimitLvPutRes))
	self._signalTreasureLimitSuccess = G_SignalManager:add(SignalConst.EVENT_TREASURE_LIMIT_SUCCESS, handler(self, self._onTreasureLimitSuccess))

	self:_updateData()
	self:_updateView()
end

function TreasureTrainLimitLayer:onExit()
	self._signalTreasureLimitLvPutRes:remove()
	self._signalTreasureLimitLvPutRes = nil
	self._signalTreasureLimitSuccess:remove()
	self._signalTreasureLimitSuccess = nil
end

function TreasureTrainLimitLayer:updateInfo()
	self._parentView:setArrowBtnVisible(false)
	self:_updateData()
	self:_updateView()
	self:_playFire(true)
end

function TreasureTrainLimitLayer:_initData()
	self._costMaterials = {} --记录消耗的材料
	self._materialMaxSize = { --每种材料最大值
		[TreasureConst.TREASURE_LIMIT_COST_KEY_1] = 0,
		[TreasureConst.TREASURE_LIMIT_COST_KEY_2] = 0,
		[TreasureConst.TREASURE_LIMIT_COST_KEY_3] = 0,
		[TreasureConst.TREASURE_LIMIT_COST_KEY_4] = 0,
	}
	self._silverCost = 0

	self._materialFakeCount = nil --材料假个数
	self._materialFakeCostCount = nil --材料假的消耗个数
	self._materialFakeCurSize = 0

	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4)
end

function TreasureTrainLimitLayer:_initView()
	self._popupPanel = nil

	self._imgBg = ccui.Helper:seekNodeByName(self, "Image_181")
	self._textNameTop = ccui.Helper:seekNodeByName(self, "_textNameTop")

	self._buttonHelp:updateUI(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4)
	self._buttonBreak:setString(Lang.get("treasure_limit_break_btn"))
	self._nodeTreasure:setLocalZOrder(ZORDER_MID)
	self._nodeTreasure:showShadow(false)
	for key = TreasureConst.TREASURE_LIMIT_COST_KEY_1, TreasureConst.TREASURE_LIMIT_COST_KEY_4 do
		self["_cost"..key] = TreasureLimitCostNode.new(self["_costNode"..key], key, handler(self, self._onClickCostAdd))
	end
	self._nodeSilver:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD)
	self._nodeSilver:setTextColorToDTypeColor()
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeBgMoving, "moving_tujie_huohua", nil, nil, false)
end

function TreasureTrainLimitLayer:_updateData()
	local treasureId = G_UserData:getTreasure():getCurTreasureId()
	self._treasureUnitData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)

	local limitLevel = self._treasureUnitData:getLimit_cost()
	local info = TreasureDataHelper.getLimitCostConfig(limitLevel)
	for i = TreasureConst.TREASURE_LIMIT_COST_KEY_1, TreasureConst.TREASURE_LIMIT_COST_KEY_4 do
		if i == TreasureConst.TREASURE_LIMIT_COST_KEY_1 then
			self._materialMaxSize[i] = info.exp
		else
			self._materialMaxSize[i] = info["size_"..i]
		end
	end
	self._silverCost = info.break_size

	local curAttrData = TreasureDataHelper.getTreasureAttrInfo(self._treasureUnitData)
	self._recordAttr:updateData(curAttrData)
	G_UserData:getAttr():recordPower()
end

function TreasureTrainLimitLayer:_updateView()
	self:_updateBaseInfo()
	self:_updateAllCost()
	self:_updateBtnAndSilverState()
end

function TreasureTrainLimitLayer:_updateBaseInfo()
	local limitUpId = self._treasureUnitData:getConfig().limit_up_id
	local name = self._treasureUnitData:getConfig().name
	local color = self._treasureUnitData:getConfig().color
	local showNext = limitUpId > 0 and not self._treasureUnitData:isLimitShowTop()
	if showNext then
		name = TreasureDataHelper.getTreasureConfig(limitUpId).name
		color = TreasureDataHelper.getTreasureConfig(limitUpId).color
	end
	local baseId = self._treasureUnitData:getBase_id()
	local limitLevel = self._treasureUnitData:getLimit_cost()
	local nameStr = Lang.get("treasure_limit_name", {name = name})

	local changeBg = limitLevel==TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL
		or (limitLevel==TreasureConst.TREASURE_LIMIT_RED_LEVEL and not self._treasureUnitData:isLimitShowTop())

	local bgres, imgres
	if changeBg then
		bgres = Path.getLimitImgBg("img_bg_limit02")
		imgres = Path.getTextLimit("txt_limit_06h")
	else
		bgres = Path.getLimitImgBg("img_limit_bg01")
		imgres = Path.getTextLimit("txt_limit_06c")
	end
	if bgres then
		self._imgBg:loadTexture(bgres)
	end
	if imgres then
		self._imageTitle:loadTexture(imgres)
	end

	local showTop = limitLevel==TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL
		or (limitLevel==TreasureConst.TREASURE_LIMIT_RED_LEVEL and self._treasureUnitData:isLimitShowTop())
	self._textNameTop:setVisible(showTop)
	
	local txtColor =  Colors.getColor(color)
	local txtColorOutline = Colors.getColorOutline(color)
	self._textName:setString(nameStr)
	self._textName:setColor(txtColor)
	self._textNameTop:setString(nameStr)
	self._textNameTop:setColor(txtColor)
	if color==7 then
		self._textName:enableOutline(txtColorOutline,2)
		self._textNameTop:enableOutline(txtColorOutline,2)
	else
		self._textName:disableEffect(cc.LabelEffect.OUTLINE)
		self._textNameTop:disableEffect(cc.LabelEffect.OUTLINE)
	end

	self._textLevel1:setString(self._treasureUnitData:getAddStrLevelByNextLimit())
	self._textLevel2:setString(self._treasureUnitData:getAddRefineLevelByNextLimit())
	-- self._nodeTreasure:updateUI(baseId)
	if showNext then
		self._nodeTreasure:updateUI(limitUpId)
	else
		self._nodeTreasure:updateUI(baseId)
	end
	if self._treasureUnitData:isLimitShowTop() then
		self._imageTitle:setVisible(false)
	else
		self._imageTitle:setVisible(true)
	end
end

function TreasureTrainLimitLayer:_updateAllCost()
	for key = TreasureConst.TREASURE_LIMIT_COST_KEY_1, TreasureConst.TREASURE_LIMIT_COST_KEY_4 do
		self:_updateSingeCost(key)
	end
	self:_updateSilverCost()
end

function TreasureTrainLimitLayer:_updateSingeCost(costKey)
	local limitLevel = self._treasureUnitData:getLimit_cost()
	local curCount = self._treasureUnitData:getLimitCostCountWithKey(costKey)
	self["_cost"..costKey]:updateUI(limitLevel, curCount, self._treasureUnitData:isLimitShowTop())
	local isShowAll = TreasureDataHelper.isPromptTreasureLimit(self._treasureUnitData)
	local isShow = isShowAll and TreasureDataHelper.isPromptTreasureLimitWithCostKey(self._treasureUnitData, costKey)
	self["_cost"..costKey]:showRedPoint(isShow)
	self["_costNode"..costKey]:setLocalZOrder(ZORDER_COMMON)
end

function TreasureTrainLimitLayer:_updateSilverCost()
	local strSilver = TextHelper.getAmountText1(self._silverCost)
	self._nodeSilver:setCount(strSilver, nil, true)
end

function TreasureTrainLimitLayer:_updateBtnAndSilverState()
	if self._treasureUnitData:getLimit_cost() >= TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL then --满级不显示
		self._buttonBreak:setVisible(false)
		self._nodeSilver:setVisible(false)
		return
	end

	local isAllFull = true
	for key = TreasureConst.TREASURE_LIMIT_COST_KEY_1, TreasureConst.TREASURE_LIMIT_COST_KEY_4 do
		local isFull = self:_checkIsMaterialFull(key)
		isAllFull = isAllFull and isFull
	end
	self._buttonBreak:setVisible(isAllFull)
	self._nodeSilver:setVisible(isAllFull)
end

function TreasureTrainLimitLayer:_playFire(isPlay)
	self._nodeFire:removeAllChildren()
	local effectName = isPlay and "effect_tujietiaozi_1" or "effect_tujietiaozi_2"
	local limitLevel = self._treasureUnitData:getLimit_cost()
	
	if limitLevel >= TreasureConst.TREASURE_LIMIT_RED_LEVEL and self._treasureUnitData:isLimitShowTop() then
		local effect = EffectGfxNode.new(effectName)
		self._nodeFire:addChild(effect)
		effect:play()
	end
end

function TreasureTrainLimitLayer:_onClickCostAdd(costKey)
	if TreasureTrainHelper.isOpen(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4) == false then
		return
	end

	local isReach, needLevel = self:_checkRankLevel()
	if isReach == false then
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, self._treasureUnitData:getBase_id())
		local name = param.name
		local level = needLevel
		G_Prompt:showTip(Lang.get("treasure_limit_level_condition", {name = name, level = level}))
		return
	end
	-- 判断等级是否到了
	local limitLevel = self._treasureUnitData:getLimit_cost()
	local lv = TreasureDataHelper.getLimitOpenLv(limitLevel)
	local gameUserLevel = G_UserData:getBase():getLevel()
	if gameUserLevel<lv then
		G_Prompt:showTip(Lang.get("treasure_limit_level"))
		return
	end

	local limitLevel = self._treasureUnitData:getLimit_cost()
	self:_openPopupPanel(costKey, limitLevel)
end

function TreasureTrainLimitLayer:_openPopupPanel(costKey, limitLevel)
	if self._popupPanel ~= nil then
		return
	end

	self._popupPanel = TreasureLimitCostPanel.new(costKey, 
											handler(self, self._onClickCostPanelItem), 
											handler(self, self._onClickCostPanelStep), 
											handler(self, self._onClickCostPanelStart), 
											handler(self, self._onClickCostPanelStop),
											limitLevel,
											self["_costNode"..costKey])
	self._popupPanelSignal = self._popupPanel.signal:add(handler(self, self._onPopupPanelClose))
	self._nodePopup:addChild(self._popupPanel)
	self._popupPanel:updateUI()
end

function TreasureTrainLimitLayer:_onPopupPanelClose(event)
	if event == "close" then
        self._popupPanel = nil
        if self._popupPanelSignal then
	        self._popupPanelSignal:remove()
	        self._popupPanelSignal = nil
	    end
    end
end

function TreasureTrainLimitLayer:_onClickCostPanelItem(costKey, materials)
	if self:_checkIsMaterialFull(costKey) == true then
		return
	end

	self:_doPutRes(costKey, materials)
end

function TreasureTrainLimitLayer:_onClickCostPanelStep(costKey, itemId, itemValue, costCountEveryTime)
	if self._materialFakeCount <= 0 then
		return false
	end

	if self._materialFakeCurSize >= self._materialMaxSize[costKey] then
		G_Prompt:showTip(Lang.get("treasure_limit_material_full"))
		return false, nil, true
	end

	local realCostCount = math.min(self._materialFakeCount, costCountEveryTime)
	self._materialFakeCount = self._materialFakeCount - realCostCount
	self._materialFakeCostCount = self._materialFakeCostCount + realCostCount

	local costSizeEveryTime = realCostCount
	if costKey == TreasureConst.TREASURE_LIMIT_COST_KEY_1 then
		costSizeEveryTime = itemValue * realCostCount
	end
	self._materialFakeCurSize = self._materialFakeCurSize + costSizeEveryTime

	if self._popupPanel then
		local emitter = self:_createEmitter(costKey)
		local startNode = self._popupPanel:findNodeWithItemId(itemId)
		local endNode = self["_costNode"..costKey]
		self:_playEmitterEffect(emitter, startNode, endNode, costKey, self._materialFakeCurSize)
		startNode:setCount(self._materialFakeCount)
	end
	return true, realCostCount
end

function TreasureTrainLimitLayer:_onClickCostPanelStart(costKey, itemId, count)
	self._materialFakeCount = count
	self._materialFakeCostCount = 0
	self._materialFakeCurSize = self._treasureUnitData:getLimitCostCountWithKey(costKey)
end

function TreasureTrainLimitLayer:_onClickCostPanelStop()
	
end

function TreasureTrainLimitLayer:_onButtonDetail()
	local popup = PopupTreasureLimitDetail.new(self._treasureUnitData)
	popup:openWithAction()
end

function TreasureTrainLimitLayer:_onButtonBreak()
	local isOk, func = LogicCheckHelper.enoughMoney(self._silverCost)
	if isOk == false then
		func()
		return
	end

	self:_doLvUp()
end

function TreasureTrainLimitLayer:_checkRankLevel()
	local curLevel = self._treasureUnitData:getRefine_level()
	local limitLevel = self._treasureUnitData:getLimit_cost()
	local isReach, needLevel = TreasureDataHelper.isReachTreasureLimitRank(limitLevel, curLevel)
	return isReach, needLevel
end

function TreasureTrainLimitLayer:_checkIsMaterialFull(costKey)
	local curSize = self._treasureUnitData:getLimitCostCountWithKey(costKey)
	local maxSize = self._materialMaxSize[costKey]
	if curSize >= maxSize then
		return true
	else
		return false
	end
end

function TreasureTrainLimitLayer:_doPutRes(costKey, materials)
	local treasureId = self._treasureUnitData:getId()
	local idx = costKey
	local subItems = materials[1]
	G_UserData:getTreasure():c2sTreasureLimitCost(treasureId, idx, subItems)
	self._costMaterials = subItems
end

function TreasureTrainLimitLayer:_doLvUp()
	local treasureId = self._treasureUnitData:getId()
	G_UserData:getTreasure():c2sTreasureLimitCost(treasureId)
	self._buttonBreak:setEnabled(false)
end

function TreasureTrainLimitLayer:_onTreasureLimitLvPutRes(eventName, costKey)
	self:_updateData()
	if self._parentView and self._parentView.checkRedPoint then
		self._parentView:checkRedPoint(TreasureConst.TREASURE_TRAIN_LIMIT)
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
		local curCount = self._treasureUnitData:getLimitCostCountWithKey(costKey)
		local itemId = self._costMaterials.id
		local emitter = self:_createEmitter(costKey)
		local startNode = self._popupPanel:findNodeWithItemId(itemId)
		local endNode = self["_costNode"..costKey]
		self:_playEmitterEffect(emitter, startNode, endNode, costKey, curCount)
	end
	
	self:_updateBtnAndSilverState()
	if self:_checkIsMaterialFull(costKey) == true then
		self._popupPanel:close()
	end
end

function TreasureTrainLimitLayer:_onTreasureLimitSuccess()
	self:_updateData()
	local AudioConst = require("app.const.AudioConst")
	G_AudioManager:playSoundWithId(AudioConst.SOUND_LIMIT_TUPO)
	self:_playLvUpEffect()
	if self._parentView and self._parentView.checkRedPoint then
		self._parentView:checkRedPoint(TreasureConst.TREASURE_TRAIN_LIMIT)
	end
end

--特效部分-----------------------------------------------------------

function TreasureTrainLimitLayer:_createEmitter(costKey)
	local names = {
		[TreasureConst.TREASURE_LIMIT_COST_KEY_1] = "tujiegreen",
		[TreasureConst.TREASURE_LIMIT_COST_KEY_2] = "tujieblue",
		[TreasureConst.TREASURE_LIMIT_COST_KEY_3] = "tujiepurple",
		[TreasureConst.TREASURE_LIMIT_COST_KEY_4] = "tujieorange",
	}
	local emitter = cc.ParticleSystemQuad:create("particle/"..names[costKey]..".plist")
	emitter:resetSystem()
    return emitter
end

--飞球特效
function TreasureTrainLimitLayer:_playEmitterEffect(emitter, startNode, endNode, costKey, curCount)
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
            	local limitLevel = self._treasureUnitData:getLimit_cost()
            	self["_cost"..costKey]:playRippleMoveEffect(limitLevel, curCount)
            end),
            cc.RemoveSelf:create()
        )
	)
end

function TreasureTrainLimitLayer:_playLvUpEffect()
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "faguang" then
    		
        elseif event == "finish" then
        	self._buttonBreak:setEnabled(true)
            self:_updateView()
            self:_playFire(true)
			local delay = cc.DelayTime:create(0.5) --延迟x秒播飘字
		    local sequence = cc.Sequence:create(delay, cc.CallFunc:create(function()
		    	self:_playPrompt()
		    end))
		    self:runAction(sequence)
        end
    end

	G_EffectGfxMgr:createPlayMovingGfx(self._nodeHetiMoving, "moving_tujieheti", effectFunction, eventFunction , true)

	for key = TreasureConst.TREASURE_LIMIT_COST_KEY_1, TreasureConst.TREASURE_LIMIT_COST_KEY_4 do
		self["_costNode"..key]:setLocalZOrder(ZORDER_MOVE)
		self["_cost"..key]:playSMoving()
	end
end

function TreasureTrainLimitLayer:_playPrompt()
    local summary = {}
	local content = Lang.get("summary_treasure_limit_break_success")
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
function TreasureTrainLimitLayer:_addBaseAttrPromptSummary(summary)
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

return TreasureTrainLimitLayer