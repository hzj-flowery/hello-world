--
-- Author: Liangxu
-- Date: 2018-8-29
-- 战马升星
local ViewBase = require("app.ui.ViewBase")
local HorseTrainUpStarLayer = class("HorseTrainUpStarLayer", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TextHelper = require("app.utils.TextHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")
local CSHelper = require("yoka.utils.CSHelper")
local AttributeConst = require("app.const.AttributeConst")
local DataConst = require("app.const.DataConst")
local HorseConst = require("app.const.HorseConst")
local AudioConst = require("app.const.AudioConst")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIHelper  = require("yoka.utils.UIHelper")
local UIConst = require("app.const.UIConst")
local HorseDetailEquipNode = require("app.scene.view.horseDetail.HorseDetailEquipNode")

--根据材料数量，定义材料的位置
local MATERIAL_POS = {
	[1] = {{166, 50}},
}

local RECORD_ATTR_LIST = {	
    AttributeConst.ATK,AttributeConst.HP,AttributeConst.PD,
    AttributeConst.MD,AttributeConst.NO_CRIT,AttributeConst.HIT,
}
function HorseTrainUpStarLayer:ctor(parentView)
	self._textName = nil --名称
	self._textOldLevel = nil --当前等级
	self._textNewLevel = nil --下一等级
	self._fileNodeAttr1 = nil --属性1
	self._fileNodeAttr2 = nil --属性2
	self._fileNodeAttr3 = nil --属性3
	self._fileNodeAttr4 = nil --属性4
	self._fileNodeAttr5 = nil --属性5
	self._fileNodeAttr6 = nil --属性6
	self._buttonUpStar = nil --进阶按钮
    self._fileNodeSliver = nil --花费
    self._nodeEquip = nil   --装备节点

    self._lastAttr = {}     --记录上一次的属性
    self._difAttr = {}      --记录属性差
    self._canUpdateAttr = true  --能否更新属性值

	self._parentView = parentView

	local resource = {
		file = Path.getCSB("HorseTrainUpStarLayer", "horse"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonUpStar = {
				events = {{event = "touch", method = "_onButtonUpStarClicked"}},
			},
		},
	}
	HorseTrainUpStarLayer.super.ctor(self, resource)
end

function HorseTrainUpStarLayer:onCreate()
	self:_initData()
	self:_initView()
end

function HorseTrainUpStarLayer:onEnter()
    logWarn("HorseTrainUpStarLayer:onEnter")
    self._signalHorseStarUpSuccess = G_SignalManager:add(SignalConst.EVENT_HORSE_STARUP_SUCCESS, handler(self, self._onHorseStarUpSuccess))
    self._singleHorseEquipAddSuccess = G_SignalManager:add(SignalConst.EVENT_HORSE_EQUIP_ADD_SUCCESS,handler(self,self._horseEquipAddSuccess))

    self:_updatePageItem()
	self:_updateData()
	self:_updateView()
end

function HorseTrainUpStarLayer:onExit()
	self._signalHorseStarUpSuccess:remove()
    self._signalHorseStarUpSuccess = nil
    
    self._singleHorseEquipAddSuccess:remove()
    self._singleHorseEquipAddSuccess = nil

    self:_saveLastAttr()
end

function HorseTrainUpStarLayer:initInfo()
	self:_initData()
	self:_initView()
	self:_updatePageItem()
	self:_updateData()
	self:_updateView()
	local selectedPos = self._parentView:getSelectedPos()
	self._pageView:setCurrentPageIndex(selectedPos - 1)
end

function HorseTrainUpStarLayer:_initData()
	self._isLimit = false --是否达到上限
	self._isGlobalLimit = false --是否达到开放等级上限

	self._unitData = nil --数据
	self._maxStar = HorseConst.HORSE_STAR_MAX --可达到的最大等级
	self._enoughMoney = true 	--是否够银币
	self._curAttrData = {} --当前属性
	self._nextAttrData = {} --下级属性
	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst.FUNC_HORSE_TRAIN)
end

function HorseTrainUpStarLayer:_initView()
	self._smovingZB = nil
	self._fileNodeName:setFontSize(20)
	self._fileNodeName2:setFontSize(22)
	self._buttonUpStar:setString(Lang.get("horse_btn_advance"))
	self._fileNodeDetailTitle:setFontSize(24)
	self._fileNodeDetailTitle:setTitle(Lang.get("horse_advance_detail_title"))
	self._fileNodeCostTitle:setFontSize(24)
	self._fileNodeCostTitle:setTitle(Lang.get("horse_advance_cost_title"))
	self:_initPageView()
end

function HorseTrainUpStarLayer:_updateData()
	local curHorseId = G_UserData:getHorse():getCurHorseId()
	self._unitData = G_UserData:getHorse():getUnitDataWithId(curHorseId)
	local baseId = self._unitData:getBase_id()
	local info = HorseDataHelper.getHorseConfig(baseId)
	self._isGlobalLimit = false
	self:_updateAttrData()
end

function HorseTrainUpStarLayer:_updateAttrData()
	self._curAttrData = HorseDataHelper.getHorseAttrInfo(self._unitData)
	self._nextAttrData = HorseDataHelper.getHorseAttrInfo(self._unitData, 1)
	if self._nextAttrData == nil then
		self._nextAttrData = {}
		self._isGlobalLimit = true
	end
	self._recordAttr:updateData(self._curAttrData)
	G_UserData:getAttr():recordPower()
end

function HorseTrainUpStarLayer:_createPageItem()
	local widget = ccui.Widget:create()
	widget:setSwallowTouches(false)
	widget:setContentSize(self._pageViewSize.width, self._pageViewSize.height)

	return widget
end

function HorseTrainUpStarLayer:_updatePageItem()
	local allHorseIds = self._parentView:getAllHorseIds()
	local index = self._parentView:getSelectedPos()
	for i = index-1, index+1 do
		if i >= 1 and i <= #allHorseIds then
			if self._pageItems[i] == nil then
				local widget = self:_createPageItem()
		        self._pageView:addPage(widget)
		        self._pageItems[i] = {widget = widget}
			end
			if self._pageItems[i].avatar == nil then
				local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHorseAvatar", "common"))
				avatar:setPosition(cc.p(self._pageViewSize.width*0.57, 200))
				self._pageItems[i].widget:addChild(avatar)
				self._pageItems[i].avatar = avatar
			end
			local horseId = allHorseIds[i]
			local unitData = G_UserData:getHorse():getUnitDataWithId(horseId)
			local baseId = unitData:getBase_id()
			self._pageItems[i].avatar:updateUI(baseId)
		end
	end
end

function HorseTrainUpStarLayer:_initPageView()
	self._pageItems = {}
	self._pageView:setSwallowTouches(false)
	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self,self._onPageViewEvent))
	self._pageViewSize = self._pageView:getContentSize()

    self._pageView:removeAllPages()
	local horseCount = self._parentView:getHorseCount()
    for i = 1, horseCount do
    	local widget = self:_createPageItem()
        self._pageView:addPage(widget)
        self._pageItems[i] = {widget = widget}
    end
    local selectedPos = self._parentView:getSelectedPos()
    self._pageView:setCurrentPageIndex(selectedPos - 1)
    
    self:_initEquipItem()
end

function HorseTrainUpStarLayer:_initEquipItem()
    if self._horseEquipItem then
        self._horseEquipItem:removeFromParent()
    end
    self._horseEquipItem = HorseDetailEquipNode.new(self._nodeEquip)
    self._nodeEquip:addChild(self._horseEquipItem)
end

function HorseTrainUpStarLayer:updatePageView()
	self._smovingZB = nil
	self:_initPageView()
	self:_updatePageItem()
end

function HorseTrainUpStarLayer:_onPageViewEvent(sender,event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		local selectedPos = self._parentView:getSelectedPos()
		if targetPos ~= selectedPos then
			self._parentView:setSelectedPos(targetPos)
			local allHorseIds = self._parentView:getAllHorseIds()
			local curHorseId = allHorseIds[targetPos]
			G_UserData:getHorse():setCurHorseId(curHorseId)
            self._parentView:updateArrowBtn()
            self:_updatePageItem()
			self:_updateData()
			self:_updateView()
			self:_initEquipItem()
		end
	end
end

function HorseTrainUpStarLayer:_updateView()
	self:_updateBaseInfo()
	self:_updateLevel()
	self:_updateAttr()
	self:_updateMaterial()
	self:_updateCost()
end

function HorseTrainUpStarLayer:_updateBaseInfo()
	local baseId = self._unitData:getBase_id()
	local curStar = self._unitData:getStar()
	local nextStar = curStar + 1

	self._fileNodeName:setName(baseId, curStar)
	local nameStar = nextStar > HorseConst.HORSE_STAR_MAX and curStar or nextStar
	self._fileNodeName2:setName(baseId, nameStar)
	local heroUnitData = HorseDataHelper.getHeroDataWithHorseId(self._unitData:getId())

	if heroUnitData == nil then
		self._textFrom:setVisible(false)
	else
		local baseId = heroUnitData:getBase_id()
		local limitLevel = heroUnitData:getLimit_level()
		local limitRedLevel = heroUnitData:getLimit_rtg()
		self._textFrom:setVisible(true)
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, nil, nil, limitLevel, limitRedLevel)
		self._textFrom:setString(Lang.get("horse_detail_from", {name = heroParam.name}))
	end
	self._nodeStar:setCount(self._unitData:getStar(), HorseConst.HORSE_STAR_MAX)

	--天赋描述
	self._nodeTalentDesPos:removeAllChildren()
	local talentInfo = nil
	if nextStar <= HorseConst.HORSE_STAR_MAX then
		local configInfo = HorseDataHelper.getHorseStarConfig(baseId, nextStar)
		local advanceDes = Lang.get("horse_detail_skill_unlock_des", {star = nextStar})
		talentInfo = Lang.get("horse_advance_txt_skill_des", {
			des = configInfo.skill,
			advanceDes = advanceDes,
		})
	end
	if talentInfo then
		local richText = ccui.RichText:createWithContent(talentInfo)
		richText:setAnchorPoint(cc.p(0.5, 0.5))
		richText:ignoreContentAdaptWithSize(false)
		richText:setContentSize(cc.size(500,0))
		richText:formatText()
		self._nodeTalentDesPos:addChild(richText)
	end
end

--等级
function HorseTrainUpStarLayer:_updateLevel()
	local star = self._unitData:getStar()
	local maxStar = self._maxStar
	self._isLimit = star >= maxStar --是否已达上限

	self._textOldLevel1:setString(star)
	self._textOldLevel2:setString("/"..maxStar)
	local posX = self._textOldLevel1:getPositionX()
	local posY = self._textOldLevel1:getPositionY()
	local size1 = self._textOldLevel1:getContentSize()
	self._textOldLevel2:setPosition(cc.p(posX + size1.width, posY))

	local newDes = Lang.get("horse_star_level", {star = star + 1, maxStar = maxStar})
	if self._isGlobalLimit then
		newDes = Lang.get("horse_star_max_level")
	end
	self._textNewLevel:setString(newDes)
end

--属性
function HorseTrainUpStarLayer:_updateAttr()
    if not self._canUpdateAttr then
        return
    end
	local desInfo = TextHelper.getAttrInfoBySort(self._curAttrData)
	for i = 1, 6 do
		local info = desInfo[i]
		if info then
			local key = info.id
			local curValue = self._curAttrData[key]
			local nextValue = self._nextAttrData[key]
			self["_fileNodeAttr"..i]:updateInfo(key, curValue, nextValue, 4)
			self["_fileNodeAttr"..i]:setVisible(true)
		else
			self["_fileNodeAttr"..i]:setVisible(false)
		end
	end
end

--材料
function HorseTrainUpStarLayer:_updateMaterial()
	self._fileNodeCostTitle:setVisible(not self._isGlobalLimit)
	self._materialIcons = {}
	self._panelMaterial:removeAllChildren()
	if self._isGlobalLimit then
		local sp = cc.Sprite:create(Path.getText("txt_train_breakthroughtop"))
		local size = self._panelMaterial:getContentSize()
		sp:setPosition(cc.p(size.width/2, size.height/2))
		self._panelMaterial:addChild(sp)
		return
	end

	self._materialInfo = HorseDataHelper.getHorseUpStarMaterial(self._unitData)
	local len = #self._materialInfo
	for i, info in ipairs(self._materialInfo) do
		local node = CSHelper.loadResourceNode(Path.getCSB("CommonCostNode", "common"))
		node:updateView(info, self._unitData:getId())
		local pos = cc.p(MATERIAL_POS[len][i][1], MATERIAL_POS[len][i][2])
		node:setPosition(pos)
		self._panelMaterial:addChild(node)

		table.insert(self._materialIcons, node)
	end
end

--花费
function HorseTrainUpStarLayer:_updateCost()
	if self._isGlobalLimit then
		self._fileNodeSliver:setVisible(false)
		self._buttonUpStar:setEnabled(false)
		return 
	end
	
	local moneyInfo = HorseDataHelper.getHorseUpStarMoney(self._unitData)
	self._fileNodeSliver:updateUI(moneyInfo.type, moneyInfo.value, moneyInfo.size)
	self._fileNodeSliver:setTextColor(Colors.BRIGHT_BG_TWO)
	self._fileNodeSliver:setVisible(true)
	self._enoughMoney = LogicCheckHelper.enoughMoney(moneyInfo.size)
	self._buttonUpStar:setEnabled(true)
end

function HorseTrainUpStarLayer:_setButtonEnable(enable)
	self._buttonUpStar:setEnabled(enable and not self._isGlobalLimit)
	self._pageView:setEnabled(enable)
	if self._parentView and self._parentView.setArrowBtnEnable then
		self._parentView:setArrowBtnEnable(enable)
	end
end

function HorseTrainUpStarLayer:_checkMaterial()
	for i, icon in ipairs(self._materialIcons) do
		if not icon:isReachCondition() then
			local info = self._materialInfo[i]
			local param = TypeConvertHelper.convert(info.type, info.value)
			G_Prompt:showTip(Lang.get("horse_advance_condition_no_enough", {name = param.name}))
			return false
		end
	end

	return true
end

function HorseTrainUpStarLayer:_checkOtherCondition()
	if not self._enoughMoney then
		G_Prompt:showTip(Lang.get("horse_advance_condition_no_money"))
		return false		
	end
	if self._unitData:getStar() >= self._maxStar then
		G_Prompt:showTip(Lang.get("horse_advance_level_limit_tip"))
		return false
	end
	
	return true
end

function HorseTrainUpStarLayer:_doAdvance()
	local horseId = self._unitData:getId()
	G_UserData:getHorse():c2sWarHorseUpgrade(horseId)
	self:_setButtonEnable(false)
end

function HorseTrainUpStarLayer:_onButtonUpStarClicked()
	local reach = self:_checkMaterial()
	if reach == false then
		return
	end
	if self:_checkOtherCondition() == false then
		return
	end

	self:_doAdvance()
end

function HorseTrainUpStarLayer:_onHorseStarUpSuccess()
	self:_playEffect()

	self:_updateData()
	self:_updateBaseInfo()
	self:_updateMaterial()
	self:_updateCost()
end

--播放特效
function HorseTrainUpStarLayer:_playEffect()
	local count2Index = {
		[1] = {1},
		[2] = {2, 3},
	}
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "play" then
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
			    G_EffectGfxMgr:applySingleGfx(sp, "smoving_shenbingjinjie_lizi"..index, finishCallback, nil, nil)
    		end

    		if self._smovingZB and self._parentView:getRangeType() ~= HorseConst.HORSE_RANGE_TYPE_1 then
    			self._smovingZB:reset()
    		end
    		local selectedPos = self._parentView:getSelectedPos()
    		local avatar = self._pageItems[selectedPos].avatar
    		self._smovingZB = G_EffectGfxMgr:applySingleGfx(avatar, "smoving_shenbingjinjie_zhuangbei", nil, nil, nil)
    	elseif event == "next" then
    		self:_setButtonEnable(true)
    	elseif event == "finish" then
    		self:_playPrompt()
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_shenbingjinjie", effectFunction, eventFunction , false)
	local offsetX = require("app.const.UIConst").EFFECT_OFFSET_X
    effect:setPosition(cc.p(G_ResolutionManager:getDesignWidth()*0.5+offsetX, G_ResolutionManager:getDesignHeight()*0.5))
    G_AudioManager:playSoundWithId(AudioConst.SOUND_INSTRUMENT_ADVANCE) --播音效
end

--飘字
function HorseTrainUpStarLayer:_playPrompt()
	local summary = {}

	local param = {
		content = Lang.get("summary_horse_upstar_success"),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
	} 
	table.insert(summary, param)

    local content1 = Lang.get("summary_horse_upstar_level", {value = 1})
	local param1 = {
		content = content1,
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
		dstPosition = self:_convertToWorldSpace(self._textOldLevel1),
		finishCallback = function()
			if self._textOldLevel1 and self._updateLevel then
				self._textOldLevel1:updateTxtValue(self._unitData:getStar())
				self:_updateLevel()
			end
			if self._onPromptFinish then
				self:_onPromptFinish()
			end
		end
	} 
	table.insert(summary, param1)
    
    self:_executeSummaryPrompt(summary)
end

--加入基础属性飘字内容
function HorseTrainUpStarLayer:_addBaseAttrPromptSummary(summary,difAttr)
	local attr = self._recordAttr:getAttr()
	local desInfo = TextHelper.getAttrInfoBySort(attr)
	for i, info in ipairs(desInfo) do
		local attrId = info.id
        local diffValue = nil
        if difAttr then
            diffValue = difAttr[attrId]
        else
            diffValue = self._recordAttr:getDiffValue(attrId)
        end
		if diffValue ~= 0 then
			local param = {
				content = AttrDataHelper.getPromptContent(attrId, diffValue),
				anchorPoint = cc.p(0, 0.5),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN+UIConst.SUMMARY_OFFSET_X_ATTR},
				dstPosition = self["_fileNodeAttr"..i] and UIHelper.convertSpaceFromNodeToNode(self["_fileNodeAttr"..i], self) or nil,
				finishCallback = function()
					if self["_fileNodeAttr"..i] then
						local _, curValue = TextHelper.getAttrBasicText(attrId, self._curAttrData[attrId])
						self["_fileNodeAttr"..i]:getSubNodeByName("TextCurValue"):updateTxtValue(curValue)
						self["_fileNodeAttr"..i]:updateInfo(attrId, self._curAttrData[attrId], self._nextAttrData[attrId], 4)
					end
				end,
			}
			table.insert(summary, param)
		end
	end

	return summary
end

--飘字结束回调
function HorseTrainUpStarLayer:_onPromptFinish()
	
end

function HorseTrainUpStarLayer:_convertToWorldSpace(node)
	local worldPos = node:convertToWorldSpace(cc.p(0,0))
	return self:convertToNodeSpace(worldPos)
end

-- 新增刷新战马装备的逻辑
function HorseTrainUpStarLayer:_horseEquipAddSuccess(event,equipPos)
    self._horseEquipItem:updateHorseEquip(equipPos)

    self:_updateData()

    if not self._unitData:isInBattle() then
        -- 没有上阵的战马不播放战力差值动画
        self:_updateAttr()
        return
    end
    --属性飘字
    local summary = {}
    self:_executeSummaryPrompt(summary)
end

function HorseTrainUpStarLayer:updateHorseEquipDifPrompt()
    logWarn("HorseTrainUpStarLayer:updateHorseEquipDifPrompt")
    if not self._unitData:isInBattle() then
        -- 没有上阵的战马不播放战力差值动画
        return
    end

    self._canUpdateAttr = false
    self:_updateData()
    self:_makeAttrDif()

    local actions = {}
    actions[1] = cc.DelayTime:create(0.2)
    actions[2] = cc.CallFunc:create(function()
        --属性飘字

        self._canUpdateAttr = true

        local summary = {}
        self:_executeSummaryPrompt(summary,self._difAttr)
    end)
    
    self:runAction(cc.Sequence:create(actions))
end

function HorseTrainUpStarLayer:_executeSummaryPrompt(summary,difAttr)
    self:_addBaseAttrPromptSummary(summary,difAttr)
    G_Prompt:showSummary(summary)
    G_Prompt:playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN)
end

function HorseTrainUpStarLayer:_saveLastAttr()
    self._lastAttr = clone(self._recordAttr:getAttr())
end

function HorseTrainUpStarLayer:_makeAttrDif()
    self._difAttr = {}
    local curAttr = self._recordAttr:getAttr()
    for k, v in pairs(self._lastAttr) do
        local curValue = curAttr[k]
        local dif = curValue - v
        self._difAttr[k] = dif
    end
end

return HorseTrainUpStarLayer