--
-- Author: Liangxu
-- Date: 2017-05-12 10:35:13
-- 宝物精炼
local ViewBase = require("app.ui.ViewBase")
local TreasureTrainRefineLayer = class("TreasureTrainRefineLayer", ViewBase)
local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TextHelper = require("app.utils.TextHelper")
local EquipMasterHelper = require("app.scene.view.equipTrain.EquipMasterHelper")
local MasterConst = require("app.const.MasterConst")
local ParameterIDConst = require("app.const.ParameterIDConst")
local CSHelper = require("yoka.utils.CSHelper")
local TreasureConst = require("app.const.TreasureConst")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIHelper  = require("yoka.utils.UIHelper")
local UIConst = require("app.const.UIConst")

--根据材料数量，定义材料的位置
local MATERIAL_POS = {
	[1] = {{166, 56}},
	[2] = {{57, 56}, {247, 56}},
}
function TreasureTrainRefineLayer:ctor(parentView)
	self._fileNodeName = nil --宝物名称
	self._textFrom = nil --装备于
	self._pageView = nil --滑动页
	self._textPotential = nil --品级
	self._fileNodeName2 = nil --宝物名称
	self._fileNodeDetailTitle = nil --属性标题
	self._textOldLevel1 = nil --当前等级分子
	self._textOldLevel2 = nil --当前等级分母
	self._textNewLevel = nil --下一等级
	self._fileNodeAttr1 = nil --属性1
	self._fileNodeAttr2 = nil --属性2
	self._fileNodeAttr3 = nil --属性3
	self._fileNodeCostTitle = nil --消耗标题
	self._panelMaterial = nil --材料面板
	self._panelCost = nil --消耗面板
	self._buttonRefine = nil --精炼按钮
	self._fileNodeSliver = nil --花费

	self._canLimit = false 		-- 是否可以界限突破

	self._parentView = parentView

	local resource = {
		file = Path.getCSB("TreasureTrainRefineLayer", "treasure"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonRefine = {
				events = {{event = "touch", method = "_onButtonRefineClicked"}},
			},
		},
	}
	TreasureTrainRefineLayer.super.ctor(self, resource)
end

function TreasureTrainRefineLayer:onCreate()
	self:_initData()
	self:_initView()
end

function TreasureTrainRefineLayer:onEnter()
	self._signalTreasureRefine = G_SignalManager:add(SignalConst.EVENT_TREASURE_REFINE_SUCCESS, handler(self, self._onRefineSuccess))
end

function TreasureTrainRefineLayer:onExit()
	self._signalTreasureRefine:remove()
	self._signalTreasureRefine = nil
end

function TreasureTrainRefineLayer:updateInfo()
	self._parentView:setArrowBtnVisible(true)
	self:_updateData()
	self:updatePageView()
	self:_updateView()
	self._parentView:updateArrowBtn()
end

function TreasureTrainRefineLayer:_initData()
	self._isLimit = false --是否达到上限
	self._isLimitTop = false -- 是否界限到最高级
	self._isGlobalLimit = false --是否达到开放等级上限
	self._isBtnEnable = false -- 按钮是否可用

	self._unitData = nil --宝物数据
	self._sameCardNum = 0 --同名卡数量
	self._curAttrData = {} --当前属性
	self._nextAttrData = {} --下级属性

	self._newMasterLevel = 0 --新强化大师等级
	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2)
end

function TreasureTrainRefineLayer:_initView()
	self._fileNodeName:setFontSize(20)
	self._fileNodeName2:setFontSize(22)
	self._fileNodeName2:showTextBg(false)
	self._buttonRefine:setString(Lang.get("treasure_refine_btn"))
	self._fileNodeDetailTitle:setFontSize(24)
	self._fileNodeDetailTitle:setTitle(Lang.get("treasure_refine_detail_title"))
	self._fileNodeCostTitle:setFontSize(24)
	self._fileNodeCostTitle:setTitle(Lang.get("treasure_refine_cost_title"))
	self:_initPageView()
end

function TreasureTrainRefineLayer:_updateData()
	local curTreasureId = G_UserData:getTreasure():getCurTreasureId()
	self._unitData = G_UserData:getTreasure():getTreasureDataWithId(curTreasureId)
	self._isGlobalLimit = false
	self._maxLevel = self._unitData:getMaxRefineLevel()

	if self._unitData:isCanLimitBreak()
		and require("app.utils.logic.FunctionCheck").funcIsShow(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4)
		and self._unitData:getLimit_cost() < TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL then
		self._canLimit = true
	else
		self._canLimit = false
	end

	self._isLimitTop = self._unitData:getLimit_cost() >= TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL
	
	local level = self._unitData:getRefine_level()
	self._isLimit = level >= self._maxLevel --是否已达上限

	self:_updateAttrData()

	if not self._isGlobalLimit or (not self._isLimitTop and self._canLimit) then
		self._isBtnEnable = true
	else
		self._isBtnEnable = false
	end
end

function TreasureTrainRefineLayer:_updateAttrData()
	self._curAttrData = UserDataHelper.getTreasureRefineAttr(self._unitData)
	self._nextAttrData = UserDataHelper.getTreasureRefineAttr(self._unitData, 1)
	if self._nextAttrData == nil then
		self._nextAttrData = {}
		self._isGlobalLimit = true
	end
	self._recordAttr:updateData(self._curAttrData)
	G_UserData:getAttr():recordPower()
end

function TreasureTrainRefineLayer:_createPageItem(i)
	local allTreasureIds = self._parentView:getAllTreasureIds()
	local treasureId = allTreasureIds[i]
	local unitData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
	local baseId = unitData:getBase_id()

	local widget = ccui.Widget:create()
	widget:setSwallowTouches(false)
	widget:setContentSize(self._pageViewSize.width, self._pageViewSize.height)
	local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonTreasureAvatar", "common"))
	avatar:showShadow(false)
	avatar:updateUI(baseId)
	local size = widget:getContentSize()
	avatar:setPosition(cc.p(size.width*0.54, size.height / 2))
	widget:addChild(avatar)

	return widget, avatar
end

function TreasureTrainRefineLayer:_initPageView()
	self._pageItems = {}
	self._pageView:setSwallowTouches(false)
	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self,self._onPageViewEvent))
	self._pageViewSize = self._pageView:getContentSize()
	
    self:updatePageView()
end

function TreasureTrainRefineLayer:updatePageView()
	self._smovingZB = nil
	self._pageView:removeAllPages()
	for i, item in ipairs(self._pageItems) do
		item.widget = nil
		item.avatar = nil
	end
	self._pageItems = {}
	local treasureCount = self._parentView:getTreasureCount()
    for i = 1, treasureCount do
    	local widget, avatar = self:_createPageItem(i)
        self._pageView:addPage(widget)
        self._pageItems[i] = {widget = widget, avatar = avatar}
    end

	local selectedPos = self._parentView:getSelectedPos()
    self._pageView:setCurrentPageIndex(selectedPos - 1)
end

function TreasureTrainRefineLayer:_onPageViewEvent(sender,event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		local selectedPos = self._parentView:getSelectedPos()
		if targetPos ~= selectedPos then
			self._parentView:setSelectedPos(targetPos)
			local allTreasureIds = self._parentView:getAllTreasureIds()
			local curTreasureId = allTreasureIds[targetPos]
			G_UserData:getTreasure():setCurTreasureId(curTreasureId)
			self._parentView:updateArrowBtn()
			self:_updateData()
			self:_updateView()
			self._parentView:updateTabIcons()
		end
	end
end

function TreasureTrainRefineLayer:_updateView()
	self:_updateBaseInfo()
	self:_updateLevel()
	self:_updateAttr()
	self:_updateMaterial()
	self:_updateCost()
end

function TreasureTrainRefineLayer:_updateBaseInfo()
	local baseId = self._unitData:getBase_id()
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, baseId)
	local rLevel = self._unitData:getRefine_level()
	self._fileNodeName:setName(baseId, rLevel)
	self._fileNodeName2:setName(baseId, rLevel)
	local heroUnitData = UserDataHelper.getHeroDataWithTreasureId(self._unitData:getId())

	if heroUnitData == nil then
		self._textFrom:setVisible(false)
	else
		local baseId = heroUnitData:getBase_id()
		local limitLevel = heroUnitData:getLimit_level()
		local limitRedLevel = heroUnitData:getLimit_rtg()
		self._textFrom:setVisible(true)
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, nil, nil, limitLevel, limitRedLevel)
		self._textFrom:setString(Lang.get("treasure_detail_from", {name = heroParam.name}))
	end

	self._textPotential:setString(Lang.get("treasure_detail_txt_potential", {value = param.potential}))
	self._textPotential:setColor(param.icon_color)
	self._textPotential:enableOutline(param.icon_color_outline, 2)
end

--等级
function TreasureTrainRefineLayer:_updateLevel()
	local level = self._unitData:getRefine_level()

	self._textOldLevel1:setString(level)
	self._textOldLevel2:setString("/"..self._maxLevel)
	local posX = self._textOldLevel1:getPositionX()
	local posY = self._textOldLevel1:getPositionY()
	local size1 = self._textOldLevel1:getContentSize()
	self._textOldLevel2:setPosition(cc.p(posX + size1.width, posY))

	local newDes = Lang.get("equipment_refine_level2", {level = level + 1, maxLevel = self._maxLevel})
	if self._isGlobalLimit then
		newDes = Lang.get("equipment_refine_max_level")
	end
	self._textNewLevel:setString(newDes)
end

--属性
function TreasureTrainRefineLayer:_updateAttr()
	local curDesInfo = TextHelper.getAttrInfoBySort(self._curAttrData)
	local nextDesInfo = TextHelper.getAttrInfoBySort(self._nextAttrData)
	for i = 1, 3 do
		local curInfo = curDesInfo[i]
		local nextInfo = nextDesInfo[i] or {}
		if curInfo then
			self["_fileNodeAttr"..i]:updateInfo(curInfo.id, curInfo.value, nextInfo.value, 4)
			self["_fileNodeAttr"..i]:setVisible(true)
		else
			self["_fileNodeAttr"..i]:setVisible(false)
		end
	end
end

--材料
function TreasureTrainRefineLayer:_updateMaterial()
	self._sameCardNum = 0
	self._fileNodeCostTitle:setVisible(not self._isGlobalLimit)
	self._panelMaterial:removeAllChildren()
	self._materialIcons = {}
	self._materialInfo = {}
	
	if self._isGlobalLimit then
		local sp
		if self._canLimit then
			sp = cc.Sprite:create(Path.getTextTeam("img_team_treasure_refine"))
		else
			sp = cc.Sprite:create(Path.getText("txt_train_breakthroughtop"))
		end
		local size = self._panelMaterial:getContentSize()
		sp:setPosition(cc.p(size.width/2, size.height/2))
		self._panelMaterial:addChild(sp)
		return
	end

	self._materialInfo = UserDataHelper.getTreasureRefineMaterial(self._unitData)
	local len = #self._materialInfo
	for i, info in ipairs(self._materialInfo) do
		local node = CSHelper.loadResourceNode(Path.getCSB("CommonCostNode", "common"))
		node:updateView(info)
		local pos = cc.p(MATERIAL_POS[len][i][1], MATERIAL_POS[len][i][2])
		node:setPosition(pos)
		self._panelMaterial:addChild(node)
		table.insert(self._materialIcons, node)

		if info.type == TypeConvertHelper.TYPE_TREASURE then
			self._sameCardNum = self._sameCardNum + node:getNeedCount()
		end
	end
end

--花费
function TreasureTrainRefineLayer:_updateCost()
	if self._isGlobalLimit then
		self._fileNodeSliver:setVisible(false)
		if not self._isLimitTop then
			self._buttonRefine:setString(Lang.get("treasure_limit_break_btn"))
			self._buttonRefine:setEnabled(self._canLimit)
		else
			self._buttonRefine:setString(Lang.get("treasure_refine_btn"))
			self._buttonRefine:setEnabled(false)
		end
	else
		self._buttonRefine:setString(Lang.get("treasure_refine_btn"))
		self._fileNodeSliver:setVisible(true)
		self._buttonRefine:setEnabled(true)
		self._moneyInfo = UserDataHelper.getTreasureRefineMoney(self._unitData)
		self._fileNodeSliver:updateUI(self._moneyInfo.type, self._moneyInfo.value, self._moneyInfo.size)
		self._fileNodeSliver:setTextColor(Colors.BRIGHT_BG_TWO)
	end
end

function TreasureTrainRefineLayer:_setButtonEnable(enable)
	self._buttonRefine:setEnabled(enable)
end

function TreasureTrainRefineLayer:_setChangePageEnable(enable)
	self._pageView:setEnabled(enable)
	if self._parentView and self._parentView.setArrowBtnEnable then
		self._parentView:setArrowBtnEnable(enable)
	end
end

function TreasureTrainRefineLayer:_onButtonRefineClicked()
	if self._isGlobalLimit and not self._isLimitTop then
		if self._canLimit then
			self._parentView:onClickTabIcon(TreasureConst.TREASURE_TRAIN_LIMIT)
		end
		return
	elseif self._isLimit then
		G_Prompt:showTip(Lang.get("treasure_refine_level_limit_tip"))
		return
	end

	for i, icon in ipairs(self._materialIcons) do
		local isReachCondition = icon:isReachCondition()
		if not isReachCondition then
			local info = self._materialInfo[i]
			local param = TypeConvertHelper.convert(info.type, info.value)
			G_Prompt:showTip(Lang.get("treasure_refine_condition_no_enough", {name = param.name}))
			return
		end
	end

	local enoughMoney = LogicCheckHelper.enoughMoney(self._moneyInfo.size)
	if not enoughMoney then
		local param = TypeConvertHelper.convert(self._moneyInfo.type, self._moneyInfo.value)
		G_Prompt:showTip(Lang.get("treasure_refine_condition_no_enough", {name = param.name}))
		return
	end

	self:_saveBeforeMasterInfo()

	local treasureId = self._unitData:getId()
	local materials = {}
	local sameCards = G_UserData:getTreasure():getSameCardsWithBaseId(self._unitData:getSameCardId())
	local count = 0
	for k, card in pairs(sameCards) do
		if count >= self._sameCardNum then
			break
		end
		table.insert(materials, card:getId())
		count = count + 1
	end
	
	G_UserData:getTreasure():c2sRefineTreasure(treasureId, materials)
	self:_setButtonEnable(false)
	self:_setChangePageEnable(false)
end

function TreasureTrainRefineLayer:_onRefineSuccess()
	self:_updateData()
	self:_playEffect()
	
	if self._parentView and self._parentView.checkRedPoint then
		self._parentView:checkRedPoint(TreasureConst.TREASURE_TRAIN_REFINE)
	end
end

function TreasureTrainRefineLayer:_playEffect()
	local count2Index = {
		[1] = {1},
		[2] = {2, 3},
	}

	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "start" then
		    for i, info in ipairs(self._materialInfo) do
    			local param = TypeConvertHelper.convert(info.type, info.value)
				local color = param.cfg.color
				local sp = display.newSprite(Path.getBackgroundEffect("img_photosphere"..color))
				local emitter = cc.ParticleSystemQuad:create("particle/particle_touch.plist")
				if emitter then
					emitter:setPosition(cc.p(sp:getContentSize().width / 2, sp:getContentSize().height / 2))
			        sp:addChild(emitter)
			        emitter:resetSystem()
			    end
			    
			    local worldPos = self._materialIcons[i]:convertToWorldSpace(cc.p(0, 0))
				local pos = self:convertToNodeSpace(worldPos)
			    sp:setPosition(pos)
			    self:addChild(sp)
			    local index = count2Index[#self._materialInfo][i]
			    local function finishCallback()
			    	sp:runAction(cc.RemoveSelf:create())
			    end
			    G_EffectGfxMgr:applySingleGfx(sp, "smoving_baowujinglian_lizi"..index, finishCallback, nil, nil)
    		end

    		if self._smovingZB and self._parentView:getRangeType() ~= TreasureConst.TREASURE_RANGE_TYPE_1 then
    			self._smovingZB:reset()
    		end
    		local selectedPos = self._parentView:getSelectedPos()
    		local avatar = self._pageItems[selectedPos].avatar
    		self._smovingZB = G_EffectGfxMgr:applySingleGfx(avatar, "smoving_baowujinglian_zhuangbei", nil, nil, nil)
		elseif event == "next" then
			self:_updateBaseInfo()
			self:_updateMaterial()
			self:_updateCost()
			self:_setButtonEnable(self._isBtnEnable)
			self:_setChangePageEnable(true)

			self._newMasterLevel = self:_checkIsReachNewMasterLevel()
			if not self._newMasterLevel then
				self:_playPrompt()
			end
		elseif event == "finish" then
			self:_onEffectFinish()
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_baowujinglian", effectFunction, eventFunction , false)
	local offsetX = require("app.const.UIConst").EFFECT_OFFSET_X
    effect:setPosition(cc.p(G_ResolutionManager:getDesignWidth()*0.5+offsetX, G_ResolutionManager:getDesignHeight()*0.5))
end

function TreasureTrainRefineLayer:_onEffectFinish()
	
end

--保存强化前的强化大师信息
function TreasureTrainRefineLayer:_saveBeforeMasterInfo()
	local pos = self._unitData:getPos()
	self._beforeMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_4)
end

--检查是否达到了新的强化大师等级
function TreasureTrainRefineLayer:_checkIsReachNewMasterLevel()
	local pos = self._unitData:getPos()
	local curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_4)

	local beforeLevel = self._beforeMasterInfo.masterInfo.curMasterLevel
	local curLevel = curMasterInfo.masterInfo.curMasterLevel
	if curLevel > beforeLevel then
		local popup = require("app.scene.view.equipment.PopupMasterLevelup").new(self, self._beforeMasterInfo, curMasterInfo, MasterConst.MASTER_TYPE_4)
		popup:openWithAction()
		return curLevel
	end
	return false
end

function TreasureTrainRefineLayer:onExitPopupMasterLevelup()
	self:_playPrompt()
end

--飘字
function TreasureTrainRefineLayer:_playPrompt()
	local summary = {}

	local param = {
		content = Lang.get("summary_treasure_refine_success"),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
	} 
	table.insert(summary, param)

	if self._newMasterLevel and self._newMasterLevel > 0 then
		local param = {
			content = Lang.get("summary_treasure_refine_master_reach", {level = self._newMasterLevel}),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
		}
		table.insert(summary, param)
	end

    local content1 = Lang.get("summary_treasure_refine_level", {value = 1})
	local param1 = {
		content = content1,
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
		dstPosition = self:_convertToWorldSpace(self._textOldLevel1),
		finishCallback = function()
			if self._textOldLevel1 and self._updateLevel then
				self._textOldLevel1:updateTxtValue(self._unitData:getRefine_level())
				self:_updateLevel()
			end
			if self._onPromptFinish then
				self:_onPromptFinish()
			end
		end
	} 
	table.insert(summary, param1)

	
	
	--属性飘字
	self:_addBaseAttrPromptSummary(summary)

    G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN)
end

--加入基础属性飘字内容
function TreasureTrainRefineLayer:_addBaseAttrPromptSummary(summary)
	local attr = self._recordAttr:getAttr()
	local desInfo = TextHelper.getAttrInfoBySort(attr)
	for i, info in ipairs(desInfo) do
		local attrId = info.id
		local diffValue = self._recordAttr:getDiffValue(attrId)
		if diffValue ~= 0 then
			local param = {
				content = AttrDataHelper.getPromptContent(attrId, diffValue),
				anchorPoint = cc.p(0, 0.5),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN+UIConst.SUMMARY_OFFSET_X_ATTR},
				dstPosition = UIHelper.convertSpaceFromNodeToNode(self["_fileNodeAttr"..i], self),
				finishCallback = function()
					local attrValue = self._curAttrData[attrId]
					if attrValue then
						local _, curValue = TextHelper.getAttrBasicText(attrId, attrValue)
						self["_fileNodeAttr"..i]:getSubNodeByName("TextCurValue"):updateTxtValue(curValue)
						self["_fileNodeAttr"..i]:updateInfo(attrId, attrValue, self._nextAttrData[attrId], 4)
					end
				end,
			}
			table.insert(summary, param)
		end
	end

	return summary
end

--飘字结束回调
function TreasureTrainRefineLayer:_onPromptFinish()
	self:_setButtonEnable(self._isBtnEnable)
	self:_setChangePageEnable(true)
end

function TreasureTrainRefineLayer:_convertToWorldSpace(node)
	local worldPos = node:convertToWorldSpace(cc.p(0,0))
	return self:convertToNodeSpace(worldPos)
end

return TreasureTrainRefineLayer