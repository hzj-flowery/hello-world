-- Author: zhanglinsen
-- Date:2018-06-29 13:49:50
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local TransformConst = require("app.const.TransformConst")
local DataConst = require("app.const.DataConst")
local ParameterIDConst = require("app.const.ParameterIDConst")
local AudioConst = require("app.const.AudioConst")
local TreasureDataHelper = require("app.utils.data.TreasureDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local InstrumentDataHelper = require("app.utils.data.InstrumentDataHelper")
local PopupChooseTreasureHelper = require("app.ui.PopupChooseTreasureHelper")
local PopupChooseTreasure = require("app.ui.PopupChooseTreasure")
local PopupCheckTreasureTransform = require("app.scene.view.transform.treasure.PopupCheckTreasureTransform")
local TreasureTransformNode = require("app.scene.view.transform.treasure.TreasureTransformNode")
local PopupTransformResult = require("app.scene.view.transform.treasure.PopupTransformResult")
local TreasureTransformView = class("TreasureTransformView", ViewBase)


function TreasureTransformView:ctor()

	--csb bind var name
	self._buttonTransform = nil  --CommonButtonHighLight
	self._imageArrow = nil  --ImageView
	self._nodeCost = nil  --CommonResourceInfo
	self._nodeSrcItem = nil  --
	self._nodeTarItem = nil  --
	self._nodeTopTip = nil  --SingleNode
	self._panelDesign = nil  --Panel

	local resource = {
		file = Path.getCSB("TreasureTransformView", "transform/treasure"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonTransform = {
				events = {{event = "touch", method = "_onButtonTransformClicked"}}
			},
		},
	}
	TreasureTransformView.super.ctor(self, resource)
end

function TreasureTransformView:onCreate()
	self:_initData()
	self:_initView()
end

function TreasureTransformView:onEnter()
	self._signalTransform = G_SignalManager:add(SignalConst.EVENT_TREASURE_TRANSFORM_SUCCESS, handler(self, self._transformSuccess))
	self:_updateData()
	self:_updateView()
end

function TreasureTransformView:onExit()
	self._signalTransform:remove()
	self._signalTransform = nil
end

function TreasureTransformView:_initData()
	self._srcIds = {}
	self._tarBaseId = 0
	self._resultData = nil
end

function TreasureTransformView:_initView()
	self:_initTips()
	self._buttonTransform:setString(Lang.get("transform_btn_transform"))
	self._srcItem = TreasureTransformNode.new(self._nodeSrcItem, TransformConst.TRANSFORM_NODE_TYPE_SRC, handler(self, self._onClickSrcItem))
	self._tarItem = TreasureTransformNode.new(self._nodeTarItem, TransformConst.TRANSFORM_NODE_TYPE_TAR, handler(self, self._onClickTarItem))
end

function TreasureTransformView:_initTips()
	local content = Lang.get("treasure_transform_tips",{name = Lang.get("transform_tab_icon_2")})
	local label = ccui.RichText:createWithContent(content)
	label:setAnchorPoint(cc.p(0.5, 0.5))
	self._nodeTopTip:addChild(label)
end

function TreasureTransformView:_updateData()
	
end

function TreasureTransformView:_updateView()
	self:_updateSrcItemNode()
	self:_updateTarItemNode()
	self:_updateTipsInfo()
end

function TreasureTransformView:_onButtonTransformClicked()
	if self:_checkTransformCondition() == false then
		return
	end

	local title = Lang.get("transform_alert_title")
	local content = Lang.get("transform_alert_content",{name = Lang.get("transform_tab_icon_2")})
	local popup = require("app.ui.PopupSystemAlert").new(title, content, handler(self, self._doTransform))
	popup:setCheckBoxVisible(false)
	popup:openWithAction()
end

function TreasureTransformView:_checkTransformCondition()
	if #self._srcIds == 0 then
		G_Prompt:showTip(Lang.get("transform_condition_tip4",{name = Lang.get("transform_tab_icon_2")}))
		return false
	end

	if self._tarBaseId == 0 then
		G_Prompt:showTip(Lang.get("transform_condition_tip5",{name = Lang.get("transform_tab_icon_2")}))
		return false
	end

	local ownCount = G_UserData:getItems():getItemNum(DataConst.ITEM_TRANSFORM)
	local needCount = self:_getNeedItemCount()
	if ownCount < needCount then
		local popup = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
		popup:updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_TRANSFORM)
		popup:openWithAction()
		return false
	end

	return true
end

function TreasureTransformView:_doTransform()
	self:_setResultData()
	local srcIds = self._srcIds
	local toId = self._tarBaseId
	local withInstrument = false
	G_UserData:getTreasure():c2sTreasureTransform(srcIds, toId, withInstrument)
	self:_setButtonEnable(false)
end

function TreasureTransformView:_setResultData()
	local data = {}
	local firstItemId = self._srcIds[1]
	local itemData = G_UserData:getTreasure():getTreasureDataWithId(firstItemId)
	local level = itemData:getLevel()
	local refine = itemData:getRefine_level()
	local num = #self._srcIds

	data.srcItemBaseId = itemData:getBase_id()
	data.tarItemBaseId = self._tarBaseId
	data.value = {}
	table.insert(data.value, level)
	table.insert(data.value, refine)
	table.insert(data.value, num)

	self._resultData = data
end

function TreasureTransformView:_getSrcItemBaseIds()
	local temp = {}
	for i, itemId in ipairs(self._srcIds) do
		local itemData = G_UserData:getTreasure():getTreasureDataWithId(itemId)
		local baseId = itemData:getBase_id()
		-- temp[i] = baseId
		table.insert(temp,baseId)
	end
	local result = table.unique(temp, true)
	return result
end

function TreasureTransformView:_getTarItemTempData()
	local tempData = {}
	local firstItemId = self._srcIds[1]
	if firstItemId then
		local itemData = G_UserData:getTreasure():getTreasureDataWithId(firstItemId)
		tempData.level = itemData:getLevel()
		tempData.refine_level = itemData:getRefine_level()
		tempData.color = itemData:getConfig().color
	end
	return tempData
end

function TreasureTransformView:_onClickSrcItem()
	local popup = PopupCheckTreasureTransform.new(self, handler(self, self._onChooseSrcItem))
	popup:setSelectedItemIds(self._srcIds)
	popup:openWithAction()
end

function TreasureTransformView:_onClickTarItem()
	local popup = PopupChooseTreasure.new()
	popup:setTitle(Lang.get("transform_choose_list_title2",{name = Lang.get("transform_tab_icon_2")}))
	local filterIds = self:_getSrcItemBaseIds()
	local tempData = self:_getTarItemTempData()

	popup:updateUI(PopupChooseTreasureHelper.FROM_TYPE4, handler(self, self._onChooseTarItem), filterIds, tempData)
	popup:openWithAction()
end

function TreasureTransformView:_onChooseSrcItem(itemIds)
	self._srcIds = clone(itemIds)
	logWarn("--- TreasureTransformView  _onChooseSrcItem:".. #self._srcIds)
	self:_updateSrcItemNode()
	self._tarBaseId = 0
	self:_updateTarItemNode()
	self:_updateTipsInfo()
end

function TreasureTransformView:_onChooseTarItem(itemId, param, itemData)
	self._tarBaseId = itemData:getBase_id()
	self:_updateTarItemNode()
	self:_updateTipsInfo()
end

function TreasureTransformView:_updateSrcItemNode()
	local firstItemId = self._srcIds[1]
	local baseId = 0
	local itemCount = #self._srcIds
	if firstItemId then
		local itemData = G_UserData:getTreasure():getTreasureDataWithId(firstItemId)
		baseId = itemData:getBase_id()
	end	
	logWarn("--- TreasureTransformView  _updateSrcItemNode:".. baseId .. "   " .. itemCount)
	self._srcItem:setItemCount(itemCount)
	self._srcItem:setItemId(baseId)
	self._srcItem:updateUI()
end

function TreasureTransformView:_updateTarItemNode()
	local lock = #self._srcIds == 0 and true or false
	self._imageArrow:setVisible(not lock)
	self._tarItem:setLock(lock)
	self._tarItem:setItemId(self._tarBaseId)
	self._tarItem:updateUI()
end

function TreasureTransformView:_updateTipsInfo()
	local show = #self._srcIds > 0 and self._tarBaseId > 0
	self._nodeCost:setVisible(show)
	self._buttonTransform:setPositionX(0)
	self._nodeCost:setPositionX(0)
	self._nodeCost:updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_TRANSFORM)
	local count = G_UserData:getItems():getItemNum(DataConst.ITEM_TRANSFORM)
	local max = self:_getNeedItemCount()
	local enough = count >= max
	-- self._nodeCost:setCount(count, max)
	self._nodeCost:setCount(max)
	self._nodeCost:showImageAdd(false)
	self._nodeCost:setTextColorToDTypeColor(enough)
end

function TreasureTransformView:_getNeedItemCount()
	local totalCost = {}
	local count = 0 
	for i, itemId in ipairs(self._srcIds) do
		local unitData = G_UserData:getTreasure():getTreasureDataWithId(itemId)
		local cost1 = TreasureDataHelper.getTreasureStrengAllCost(unitData)
		local cost2 = TreasureDataHelper.getTreasureRefineAllCost(unitData)
		RecoveryDataHelper.formatRecoveryCost(totalCost, TypeConvertHelper.TYPE_TREASURE, unitData:getBase_id(), 1)
		RecoveryDataHelper.mergeRecoveryCost(totalCost, cost1)
		RecoveryDataHelper.mergeRecoveryCost(totalCost, cost2)
	end

	for type, unit in pairs(totalCost) do
		if type == TypeConvertHelper.TYPE_TREASURE then
			for value, size in pairs(unit) do
				count = count + size
			end
		end
	end
	local temp = tonumber(require("app.config.parameter").get(ParameterIDConst.DISPLACE_TREASURE_PROPORTION).content)
	count = math.ceil(count/temp)

	return count
end

function TreasureTransformView:_setButtonEnable(enable)
	self._buttonTransform:setEnabled(enable)
	self._srcItem:setEnabled(enable)
	self._tarItem:setEnabled(enable)
end

function TreasureTransformView:_transformSuccess()
	self:_playEffect()
end

function TreasureTransformView:_playEffect()
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "1p" then
    		local action = cc.FadeOut:create(0.3)
    		local itemNode = self._srcItem:getItemNode()
    		itemNode:runAction(action)
    		-- G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_BREAK) --播音效
        elseif event == "2p" then
        	local action = cc.FadeOut:create(0.3)
        	local itemNode = self._tarItem:getItemNode()
    		itemNode:runAction(action)
    	elseif event == "finish" then
    		local popup = PopupTransformResult.new(self, self._resultData)
			popup:open()
			
			self:_setButtonEnable(true)
			self:_initData()
			self:_updateView()
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_zhihuan", effectFunction, eventFunction , false)
    effect:setPosition(cc.p(G_ResolutionManager:getDesignWidth()*0.5, G_ResolutionManager:getDesignHeight()*0.5))
end


return TreasureTransformView