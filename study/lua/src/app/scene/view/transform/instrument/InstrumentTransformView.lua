
local ViewBase = require("app.ui.ViewBase")
local InstrumentTransformView = class("InstrumentTransformView", ViewBase)
local TransformConst = require("app.const.TransformConst")
local DataConst = require("app.const.DataConst")
local ParameterIDConst = require("app.const.ParameterIDConst")
local AudioConst = require("app.const.AudioConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local InstrumentDataHelper = require("app.utils.data.InstrumentDataHelper")
local PopupChooseInstrumentHelper = require("app.ui.PopupChooseInstrumentHelper")
local PopupChooseInstrument2 = require("app.ui.PopupChooseInstrument2")
local PopupCheckInstrumentTransform = require("app.scene.view.transform.instrument.PopupCheckInstrumentTransform")
local InstrumentTransformNode = require("app.scene.view.transform.instrument.InstrumentTransformNode")
local PopupInstrumentTransformResult = require("app.scene.view.transform.instrument.PopupInstrumentTransformResult")
local UserDataHelper = require("app.utils.UserDataHelper")

function InstrumentTransformView:ctor()

	--csb bind var name
	self._buttonTransform = nil  --CommonButtonHighLight
	self._imageArrow = nil  --ImageView
	self._nodeCost = nil  --CommonResourceInfo
	self._nodeSrcItem = nil  --
	self._nodeTarItem = nil  --
	self._nodeTopTip = nil  --SingleNode
	self._panelDesign = nil  --Panel

	local resource = {
		file = Path.getCSB("InstrumentTransformView", "transform/instrument"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonTransform = {
				events = {{event = "touch", method = "_onButtonTransformClicked"}}
			},
		},
	}
	InstrumentTransformView.super.ctor(self, resource)
end

function InstrumentTransformView:onCreate()
	self:_initData()
	self:_initView()
end

function InstrumentTransformView:onEnter()
	self._signalTransform = G_SignalManager:add(SignalConst.EVENT_INSTRUMENT_TRANSFORM_SUCCESS, handler(self, self._transformSuccess))
	self:_updateData()
	self:_updateView()
end

function InstrumentTransformView:onExit()
	self._signalTransform:remove()
	self._signalTransform = nil
end

function InstrumentTransformView:_initData()
	self._srcIds = {}
	self._tarBaseId = 0
	self._tarLimitLevel = 0
	self._resultData = nil
end

function InstrumentTransformView:_initView()
	self:_initTips()
	self._buttonTransform:setString(Lang.get("transform_btn_transform"))
	self._srcItem = InstrumentTransformNode.new(self._nodeSrcItem, TransformConst.TRANSFORM_NODE_TYPE_SRC, handler(self, self._onClickSrcItem))
	self._tarItem = InstrumentTransformNode.new(self._nodeTarItem, TransformConst.TRANSFORM_NODE_TYPE_TAR, handler(self, self._onClickTarItem))
end

function InstrumentTransformView:_initTips()
	local content = Lang.get("instrument_transform_tips",{name = Lang.get("transform_tab_icon_3")})
	local label = ccui.RichText:createWithContent(content)
	label:setAnchorPoint(cc.p(0.5, 0.5))
	self._nodeTopTip:addChild(label)
end

function InstrumentTransformView:_updateData()
	
end

function InstrumentTransformView:_updateView()
	self:_updateSrcItemNode()
	self:_updateTarItemNode()
	self:_updateTipsInfo()
end

function InstrumentTransformView:_onButtonTransformClicked()
	if self:_checkTransformCondition() == false then
		return
	end

	local title = Lang.get("transform_alert_title")
	local content = Lang.get("transform_alert_content",{name = Lang.get("transform_tab_icon_3")})
	local popup = require("app.ui.PopupSystemAlert").new(title, content, handler(self, self._doTransform))
	popup:setCheckBoxVisible(false)
	popup:openWithAction()
end

function InstrumentTransformView:_checkTransformCondition()
	if #self._srcIds == 0 then
		G_Prompt:showTip(Lang.get("transform_condition_tip4",{name = Lang.get("transform_tab_icon_3")}))
		return false
	end

	if self._tarBaseId == 0 then
		G_Prompt:showTip(Lang.get("transform_condition_tip5",{name = Lang.get("transform_tab_icon_3")}))
		return false
	end

	local costType, costValue, costSize = self:_getCostParam()
	local ownCount = UserDataHelper.getNumByTypeAndValue(costType, costValue)
	local needCount = self:_getNeedItemCount()
	if ownCount < needCount then
		local popup = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
		popup:updateUI(costType, costValue)
		popup:openWithAction()
		return false
	end

	return true
end

function InstrumentTransformView:_doTransform()
	self:_setResultData()
	local srcIds = self._srcIds
	local toId = self._tarBaseId
	G_UserData:getInstrument():c2sInstrumentTransform(srcIds, toId)
	self:_setButtonEnable(false)
end

function InstrumentTransformView:_setResultData()
	local data = {}
	local firstItemId = self._srcIds[1]
	local itemData = G_UserData:getInstrument():getInstrumentDataWithId(firstItemId)
	local level = itemData:getLevel()
	local num = #self._srcIds

	data.srcItemBaseId = itemData:getBase_id()
	data.tarItemBaseId = self._tarBaseId
	data.tarLimitLevel = self._tarLimitLevel
	data.value = {}
	table.insert(data.value, level)
	table.insert(data.value, num)

	self._resultData = data
end

function InstrumentTransformView:_getSrcItemBaseIds()
	local temp = {}
	for i, itemId in ipairs(self._srcIds) do
		local itemData = G_UserData:getInstrument():getInstrumentDataWithId(itemId)
		local baseId = itemData:getBase_id()
		table.insert(temp,baseId)
	end
	local result = table.unique(temp, true)
	return result
end

function InstrumentTransformView:_getTarItemTempData()
	local tempData = {}
	local firstItemId = self._srcIds[1]
	if firstItemId then
		local itemData = G_UserData:getInstrument():getInstrumentDataWithId(firstItemId)
		tempData.level = itemData:getLevel()
		tempData.limit_level = itemData:getLimit_level()
		tempData.isDidLimit = itemData:isDidLimit()
		tempData.color = itemData:getConfig().color
	end
	return tempData
end

function InstrumentTransformView:_onClickSrcItem()
	local popup = PopupCheckInstrumentTransform.new(self, handler(self, self._onChooseSrcItem))
	popup:setSelectedItemIds(self._srcIds)
	popup:openWithAction()
end

function InstrumentTransformView:_onClickTarItem()
	local popup = PopupChooseInstrument2.new()
	popup:setTitle(Lang.get("transform_choose_list_title2",{name = Lang.get("transform_tab_icon_3")}))
	local filterIds = self:_getSrcItemBaseIds()
	local tempData = self:_getTarItemTempData()

	popup:updateUI(PopupChooseInstrumentHelper.FROM_TYPE4, handler(self, self._onChooseTarItem), filterIds, tempData)
	popup:openWithAction()
end

function InstrumentTransformView:_onChooseSrcItem(itemIds)
	self._srcIds = clone(itemIds)
	self:_updateSrcItemNode()
	self._tarBaseId = 0
	self:_updateTarItemNode()
	self:_updateTipsInfo()
end

function InstrumentTransformView:_onChooseTarItem(itemId, param, itemData)
	self._tarBaseId = itemData:getBase_id()
	self._tarLimitLevel = itemData:getLimit_level()
	self:_updateTarItemNode()
	self:_updateTipsInfo()
end

function InstrumentTransformView:_updateSrcItemNode()
	local firstItemId = self._srcIds[1]
	local baseId = 0
	local limitLevel = 0
	local itemCount = #self._srcIds
	if firstItemId then
		local itemData = G_UserData:getInstrument():getInstrumentDataWithId(firstItemId)
		baseId = itemData:getBase_id()
		limitLevel = itemData:getLimit_level()
	end	
	self._srcItem:setItemCount(itemCount)
	self._srcItem:setItemId(baseId, limitLevel)
	self._srcItem:updateUI()
end

function InstrumentTransformView:_updateTarItemNode()
	local lock = #self._srcIds == 0 and true or false
	self._imageArrow:setVisible(not lock)
	self._tarItem:setLock(lock)
	self._tarItem:setItemId(self._tarBaseId, self._tarLimitLevel)
	self._tarItem:updateUI()
end

function InstrumentTransformView:_updateTipsInfo()
	local show = #self._srcIds > 0 and self._tarBaseId > 0
	self._nodeCost:setVisible(show)
	local costType, costValue, costSize = self:_getCostParam()
	self._nodeCost:updateUI(costType, costValue)
	local count = UserDataHelper.getNumByTypeAndValue(costType, costValue)
	local max = self:_getNeedItemCount()
	local enough = count >= max
	self._nodeCost:setCount(max)
	self._nodeCost:showImageAdd(false)
	self._nodeCost:setTextColorToDTypeColor(enough)
end

--是否选的是红神兵
function InstrumentTransformView:_isChooseRedInstrument()
	local firstItemId = self._srcIds[1]
	if firstItemId then
		local itemData = G_UserData:getInstrument():getInstrumentDataWithId(firstItemId)
		local color = itemData:getConfig().color
		if color == 6 then
			return true
		end
	end
	return false
end

--是否选的是金神兵
function InstrumentTransformView:_isChooseGoldInstrument()
	local firstItemId = self._srcIds[1]
	if firstItemId then
		local itemData = G_UserData:getInstrument():getInstrumentDataWithId(firstItemId)
		local color = itemData:getConfig().color
		if color == 7 then
			return true
		end
	end
	return false
end

function InstrumentTransformView:_getCostParam()
	local costType = TypeConvertHelper.TYPE_ITEM
	local costValue = DataConst.ITEM_TRANSFORM
	local costSize = 1
	if self:_isChooseGoldInstrument() then
		costValue = DataConst.ITEM_TRANSFORM_GOLD
	elseif self:_isChooseRedInstrument() then
		costValue = DataConst.ITEM_TRANSFORM_RED
	end

	return costType, costValue, costSize
end

function InstrumentTransformView:_getNeedItemCount()
	local totalCost = {}
	local count = 0 
	for i, itemId in ipairs(self._srcIds) do
		local unitData = G_UserData:getInstrument():getInstrumentDataWithId(itemId)
		local cost1 = InstrumentDataHelper.getInstrumentAdvanceAllCost(unitData)
		RecoveryDataHelper.formatRecoveryCost(totalCost, TypeConvertHelper.TYPE_INSTRUMENT, unitData:getBase_id(), 1)
		RecoveryDataHelper.mergeRecoveryCost(totalCost, cost1)
	end

	for type, unit in pairs(totalCost) do
		if type == TypeConvertHelper.TYPE_INSTRUMENT then
			for value, size in pairs(unit) do
				count = count + size
			end
		end
	end
	local temp = tonumber(require("app.config.parameter").get(ParameterIDConst.DISPLACE_WEAPON_RED).content)
	if self:_isChooseGoldInstrument() then
		temp = tonumber(require("app.config.parameter").get(ParameterIDConst.DISPLACE_WEAPON_GOLD).content)
	end
	count = math.ceil(count/temp)

	return count
end

function InstrumentTransformView:_setButtonEnable(enable)
	self._buttonTransform:setEnabled(enable)
	self._srcItem:setEnabled(enable)
	self._tarItem:setEnabled(enable)
end

function InstrumentTransformView:_transformSuccess()
	self:_playEffect()
end

function InstrumentTransformView:_playEffect()
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
    		local popup = PopupInstrumentTransformResult.new(self, self._resultData)
			popup:open()
			
			self:_setButtonEnable(true)
			self:_initData()
			self:_updateView()
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_zhihuan", effectFunction, eventFunction , false)
    effect:setPosition(cc.p(G_ResolutionManager:getDesignWidth()*0.5, G_ResolutionManager:getDesignHeight()*0.5))
end


return InstrumentTransformView