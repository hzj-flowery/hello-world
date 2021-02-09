
-- Author: liangxu
-- Date:2017-10-18 16:26:18
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local HeroTrainAwakeLayer = class("HeroTrainAwakeLayer", ViewBase)
local CSHelper = require("yoka.utils.CSHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TeamGemstoneIcon = require("app.scene.view.team.TeamGemstoneIcon")
local TextHelper = require("app.utils.TextHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local GemstoneConst = require("app.const.GemstoneConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HeroTrainHelper = require("app.scene.view.heroTrain.HeroTrainHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIHelper  = require("yoka.utils.UIHelper")
local AudioConst = require("app.const.AudioConst")
local UIConst = require("app.const.UIConst")
local PopupAwakePreview = require("app.scene.view.heroTrain.PopupAwakePreview")

--根据材料数量，定义材料的位置
local MATERIAL_POS = {
	[1] = {{166, 56}},
	[2] = {{57, 56}, {247, 56}},
}

function HeroTrainAwakeLayer:ctor(parentView)
	self._fileNodeStar = nil  --CommonStar
	self._textLevel = nil  --Text
	self._fileNodeGemstone4 = nil  --
	self._textCost = nil  --Text
	self._fileNodeGemstone1 = nil  --
	self._pageView = nil  --PageView
	self._fileNodeCost = nil  --CommonResourceInfo
	self._fileNodeDetailTitle = nil  --CommonDetailTitle
	self._fileNodeCountry = nil  --CommonHeroCountry
	self._fileNodeHeroName2 = nil  --CommonHeroName
	self._fileNodeGemstone3 = nil  --
	self._fileNodeGemstone2 = nil  --
	self._textOldLevel = nil  --Text
	self._textDesc = nil  --Text
	self._fileNodeDetailTitle2 = nil  --CommonDetailTitle
	self._fileNodeHeroName = nil  --CommonHeroName
	self._textNewLevel = nil  --Text
	self._buttonAwake = nil  --CommonButtonHighLight
	self._panelCost = nil  --Panel
	self._fileNodeAttr2 = nil  --CommonAttrDiff
	self._fileNodeAttr3 = nil  --CommonAttrDiff
	self._fileNodeAttr1 = nil  --CommonAttrDiff
	self._fileNodeAttr4 = nil  --CommonAttrDiff

	self._parentView = parentView

	local resource = {
		file = Path.getCSB("HeroTrainAwakeLayer", "hero"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonAwake = {
				events = {{event = "touch", method = "_onButtonAwake"}}
			},
			_buttonPreview = {
				events = {{event = "touch", method = "_onButtonPreview"}}
			},
			_buttonOneKey = {
				events = {{event = "touch", method = "_onButtonOneKey"}}
			},
		},
	}
	HeroTrainAwakeLayer.super.ctor(self, resource)
end

function HeroTrainAwakeLayer:onCreate()
	self:_initData()
	self:_initView()
end

function HeroTrainAwakeLayer:onEnter()
	self._signalHeroAwake = G_SignalManager:add(SignalConst.EVENT_HERO_AWAKE_SUCCESS, handler(self, self._heroAwakeSuccess))
	self._signalHeroEquipAwake = G_SignalManager:add(SignalConst.EVENT_HERO_EQUIP_AWAKE_SUCCESS, handler(self, self._heroEquipAwakeSuccess))
	self._signalMerageItemMsg = G_SignalManager:add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(self, self._onSyntheticFragments))

	self._signalFastExecute = G_SignalManager:add(SignalConst.EVENT_FAST_EXECUTE_STAGE, handler(self, self._onEventFastExecuteStage))
end

function HeroTrainAwakeLayer:onExit()
	self._signalHeroAwake:remove()
	self._signalHeroAwake = nil
	self._signalHeroEquipAwake:remove()
	self._signalHeroEquipAwake = nil
	self._signalMerageItemMsg:remove()
	self._signalMerageItemMsg = nil

	self._signalFastExecute:remove()
	self._signalFastExecute = nil
end

function HeroTrainAwakeLayer:initInfo()
	self._parentView:setArrowBtnVisible(true)
	self:_updatePageItem()
	self:_updateData()
	self:_updateView()
	local selectedPos = self._parentView:getSelectedPos()
	self._pageView:setCurrentPageIndex(selectedPos - 1)

	local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HERO_AWAKE_ONEKEY)
	self._buttonOneKey:setVisible(isOpen)
end

function HeroTrainAwakeLayer:_initData()
	self._isLimit = false --是否到顶级
	self._curAttrInfo = {}
	self._nextAttrInfo = {}
	self._sameCardNum = 0 --同名卡数量
	self._materialInfo = {}
	self._costInfo = {}
	self._isAllEquip = false --是否都装备了
	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst.FUNC_HERO_TRAIN_TYPE3)
	self._lastAwakeLevel = 0 --记录觉醒等级
end

function HeroTrainAwakeLayer:_initView()
	self._fileNodeDetailTitle:setFontSize(24)
	self._fileNodeDetailTitle2:setFontSize(24)
	self._fileNodeDetailTitle:setTitle(Lang.get("hero_awake_detail_title"))
	self._fileNodeDetailTitle2:setTitle(Lang.get("hero_awake_material_title"))
	self._buttonAwake:setString(Lang.get("hero_awake_btn"))
	self._buttonOneKey:setString(Lang.get("hero_awake_onekey_btn"))

	self._gemstoneIcons = {}
	for i = 1, 4 do
		local icon = TeamGemstoneIcon.new(self["_fileNodeGemstone"..i], i, handler(self, self._onGemstoneCallback))
		self._gemstoneIcons[i] = icon
	end

	self._materialIcons = {}

	self:_initPageView()
end

function HeroTrainAwakeLayer:_initPageView()
	self._pageItems = {}
	self._pageView:setSwallowTouches(false)
	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self,self._onPageViewEvent))
    self._pageViewSize = self._pageView:getContentSize()

	self._pageView:removeAllPages()
	local heroCount = self._parentView:getHeroCount()
    for i = 1, heroCount do
    	local widget = self:_createPageItem()
        self._pageView:addPage(widget)
        self._pageItems[i] = {widget = widget}
    end
    local selectedPos = self._parentView:getSelectedPos()
    self._pageView:setCurrentPageIndex(selectedPos - 1)
end

function HeroTrainAwakeLayer:_createPageItem()
	local widget = ccui.Widget:create()
	widget:setSwallowTouches(false)
	widget:setContentSize(self._pageViewSize.width, self._pageViewSize.height)

	return widget
end

function HeroTrainAwakeLayer:_updatePageItem()
	local allHeroIds = self._parentView:getAllHeroIds()
	local index = self._parentView:getSelectedPos()
	for i = index-1, index+1 do
		if i >= 1 and i <= #allHeroIds then
			if self._pageItems[i] == nil then
				local widget = self:_createPageItem()
		        self._pageView:addPage(widget)
		        self._pageItems[i] = {widget = widget}
			end
			if self._pageItems[i].avatar == nil then
				local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
				avatar:setScale(1.4)
				avatar:setPosition(cc.p(self._pageViewSize.width*0.57, 192))
				self._pageItems[i].widget:addChild(avatar)
				self._pageItems[i].avatar = avatar
			end
			local heroId = allHeroIds[i]
			local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData)
			local limitLevel = avatarLimitLevel or unitData:getLimit_level()
			local limitRedLevel = arLimitLevel or unitData:getLimit_rtg()
			self._pageItems[i].avatar:updateUI(heroBaseId, nil, nil, limitLevel, nil, nil, limitRedLevel)
		end
	end
end

function HeroTrainAwakeLayer:_onPageViewEvent(sender, event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		local selectedPos = self._parentView:getSelectedPos()
		if targetPos ~= selectedPos then
			self._parentView:setSelectedPos(targetPos)
			local allHeroIds = self._parentView:getAllHeroIds()
			local curHeroId = allHeroIds[targetPos]
			G_UserData:getHero():setCurHeroId(curHeroId)
			self._parentView:updateArrowBtn()
			self:_updatePageItem()
			self:_updateData()
			self:_updateView()
			self._parentView:updateTabIcons()
		end
	end
end

function HeroTrainAwakeLayer:_updateData()
	self._heroId = G_UserData:getHero():getCurHeroId()
	self._heroUnitData = G_UserData:getHero():getUnitDataWithId(self._heroId)
	local awakeLevel = self._heroUnitData:getAwaken_level()
	local nextAwakeLevel = awakeLevel + 1
	local maxLevel = self._heroUnitData:getConfig().awaken_max
	self._isLimit = nextAwakeLevel > maxLevel
	self._curAttrInfo = UserDataHelper.getAwakeAttr(self._heroUnitData)
	self._nextAttrInfo = {}
	if self._isLimit == false then
		self._nextAttrInfo = UserDataHelper.getAwakeAttr(self._heroUnitData, 1)
	end
	self._recordAttr:updateData(self._curAttrInfo)
	G_UserData:getAttr():recordPower()
end

function HeroTrainAwakeLayer:_recordAwakeLevel()
	local awakeLevel = self._heroUnitData:getAwaken_level()
	self._lastAwakeLevel = awakeLevel
end

--扫荡信息
function HeroTrainAwakeLayer:_onEventFastExecuteStage(eventName, results)
	self:_updateGemstone()
end

function HeroTrainAwakeLayer:_updateView()
	self:setButtonEnable(true)
	self:_updateShow()
	self:_updateGemstone()
	self:_updateLevel()
	self:_updateAttr()
	self:_updateMaterical()
end

--刷新武将展示
function HeroTrainAwakeLayer:_updateShow()
	local heroBaseId = self._heroUnitData:getBase_id()
	local rankLevel = self._heroUnitData:getRank_lv()
	local awakeLevel = self._heroUnitData:getAwaken_level()
	local limitLevel = self._heroUnitData:getLimit_level()
	local limitRedLevel = self._heroUnitData:getLimit_rtg()
	local star, level = UserDataHelper.convertAwakeLevel(awakeLevel) --已达到的星级
	local awakenCost = self._heroUnitData:getConfig().awaken_cost
	local maxLevel = self._heroUnitData:getConfig().awaken_max

	local strLevel = ""
	local strDes = ""
	local enoughLevel, nextNeedLevel = HeroTrainHelper.checkAwakeIsEnoughLevel(self._heroUnitData)
	if enoughLevel then
		local nextAwakeLevel, attrInfo, des = UserDataHelper.findNextAwakeLevel(awakeLevel, awakenCost, maxLevel)
		if nextAwakeLevel then
			local nextStar, nextLevel = UserDataHelper.convertAwakeLevel(nextAwakeLevel) --下一个有天赋的星级
			strLevel = Lang.get("hero_awake_star_level_des", {star = nextStar, level = nextLevel})
			strDes = des
		else
			strLevel = Lang.get("hero_awake_star_level_max_des", {star = star, level = level})
			strDes = Lang.get("hero_awake_talent_max_des")
		end
	else
		strDes = Lang.get("hero_awake_next_need_level", {level = nextNeedLevel})
	end

	self._fileNodeCountry:updateUI(heroBaseId)
	self._fileNodeHeroName:setName(heroBaseId, rankLevel, limitLevel, nil, limitRedLevel)
	self._fileNodeHeroName2:setName(heroBaseId, rankLevel, limitLevel, nil, limitRedLevel)
	self._fileNodeStar:setStarOrMoon(star)
	self._fileNodeStarCopy:setStarOrMoon(star)
	self._textLevel:setString(strLevel)
	self._textDesc:setString(strDes)
end

--刷新宝石
function HeroTrainAwakeLayer:_updateGemstone()
	local info = UserDataHelper.getHeroAwakeEquipState(self._heroUnitData)
	self._isAllEquip = true
	for i = 1, 4 do
		local baseId = info[i].needId
		local state = info[i].state
		local icon = self._gemstoneIcons[i]
		icon:updateIcon(state, baseId)
		self._isAllEquip = self._isAllEquip and state == GemstoneConst.EQUIP_STATE_2
		if state == GemstoneConst.EQUIP_STATE_1 or state == GemstoneConst.EQUIP_STATE_3 then
			icon:showRedPoint(true)
		else
			icon:showRedPoint(false)
		end
	end

	self._buttonAwake:setEnabled(self._isAllEquip and not self._isLimit)
	local show = UserDataHelper.isCanHeroAwake(self._heroUnitData)
	self._buttonAwake:showRedPoint(show)
	self._buttonPreview:setVisible(not self._isLimit)
end

--刷新等级
function HeroTrainAwakeLayer:_updateLevel()
	local awakeLevel = self._heroUnitData:getAwaken_level()
	local star, level = UserDataHelper.convertAwakeLevel(awakeLevel)
	self._textOldLevel:setString(Lang.get("hero_awake_star_level", {star = star, level = level}))
	local nextAwakeLevel = awakeLevel + 1
	if self._isLimit then
		self._textNewLevel:setString(Lang.get("hero_awake_star_level_max"))
	else
		local nextStar, nextLevel = UserDataHelper.convertAwakeLevel(nextAwakeLevel)
		self._textNewLevel:setString(Lang.get("hero_awake_star_level", {star = nextStar, level = nextLevel}))
	end
end

--刷新属性
function HeroTrainAwakeLayer:_updateAttr()
	local curDesInfo = TextHelper.getAttrInfoBySort(self._curAttrInfo)
	local nextDesInfo = TextHelper.getAttrInfoBySort(self._nextAttrInfo)
	for i = 1, 4 do
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

--刷新材料
function HeroTrainAwakeLayer:_updateMaterical()
	self._sameCardNum = 0
	self._fileNodeDetailTitle2:setVisible(not self._isLimit)
	self._fileNodeCost:setVisible(not self._isLimit)
	self._buttonAwake:setEnabled(self._isAllEquip and not self._isLimit)
	self._textCost:setVisible(self._isLimit)
	self._panelCost:removeAllChildren()
	if self._isLimit then
		local sp = cc.Sprite:create(Path.getText("txt_train_breakthroughtop"))
		local size = self._panelCost:getContentSize()
		sp:setPosition(cc.p(size.width/2, size.height/2))
		self._panelCost:addChild(sp)
		self._textCost:setString(Lang.get("hero_awake_cost_limit_des"))
		return
	end

	self._materialIcons = {}
	self._materialInfo = UserDataHelper.getHeroAwakeMaterials(self._heroUnitData)
	local len = #self._materialInfo
	for i, info in ipairs(self._materialInfo) do
		local node = CSHelper.loadResourceNode(Path.getCSB("CommonCostNode", "common"))
		node:updateView(info)
		local pos = cc.p(MATERIAL_POS[len][i][1], MATERIAL_POS[len][i][2])
		node:setPosition(pos)
		self._panelCost:addChild(node)
		table.insert(self._materialIcons, node)
		if info.type == TypeConvertHelper.TYPE_HERO then
			self._sameCardNum = self._sameCardNum + node:getNeedCount()
		end
	end

	self._costInfo = UserDataHelper.getHeroAwakeCost(self._heroUnitData)
	if self._costInfo then
		self._fileNodeCost:updateUI(self._costInfo.type, self._costInfo.value, self._costInfo.size)
		self._fileNodeCost:setTextColor(Colors.BRIGHT_BG_TWO)
	end
end

function HeroTrainAwakeLayer:_onButtonAwake()
	--检查等级
	local enoughLevel, limitLevel = HeroTrainHelper.checkAwakeIsEnoughLevel(self._heroUnitData)
	if not enoughLevel then
		G_Prompt:showTip(Lang.get("hero_awake_level_not_enough"))
		return
	end

	--检查材料
	for i, icon in ipairs(self._materialIcons) do
		local isReachCondition = icon:isReachCondition()
		if not isReachCondition then
			local info = self._materialInfo[i]
			local popup = require("app.ui.PopupItemGuider").new()
			popup:updateUI(info.type, info.value)
			popup:openWithAction()
			return
		end
	end

	--检查花费
	local isOk = LogicCheckHelper.enoughMoney(self._costInfo.size)
	if not isOk then
		local popup = require("app.ui.PopupItemGuider").new()
		popup:updateUI(self._costInfo.type, self._costInfo.value)
		popup:openWithAction()
		return
	end

	--去觉醒
	local heroId = self._heroUnitData:getId()
	local costHeros = {}
	local sameCards = G_UserData:getHero():getSameCardCountWithBaseId(self._heroUnitData:getBase_id())
	local count = 0
	for k, card in pairs(sameCards) do
		if count >= self._sameCardNum then
			break
		end
		table.insert(costHeros, card:getId())
		count = count + 1
	end
	self:_recordAwakeLevel()
	G_UserData:getHero():c2sHeroAwaken(heroId, costHeros)
	self:setButtonEnable(false)
end

--宝石回调
function HeroTrainAwakeLayer:_onGemstoneCallback(slot, isSynthetic)
	local tempSlot = {slot}
	local slot, composeInfo = self:_getSlotAndCompose()

	if isSynthetic == true and #composeInfo == 0 then
		-- 如果满足条件，则是合成觉醒宝石后的回调，这里不发装备消息，会在_onSyntheticFragments里发，避免发两次
		return
	end

	G_UserData:getHero():c2sHeroEquipAwaken(self._heroUnitData:getId(), tempSlot)
end

function HeroTrainAwakeLayer:setButtonEnable(enable)
	self._buttonAwake:setEnabled(enable and self._isAllEquip and not self._isLimit)
	self._pageView:setEnabled(enable)
	if self._parentView and self._parentView.setArrowBtnEnable then
		self._parentView:setArrowBtnEnable(enable)
	end
end

function HeroTrainAwakeLayer:_heroAwakeSuccess()
	self:_updateData()
	self:_checkAndPlayEffect()
end

function HeroTrainAwakeLayer:_heroEquipAwakeSuccess(eventName, slot)
	self:_updateData()
	self:_updateGemstone()
	for i, index in ipairs(slot) do
		local icon = self._gemstoneIcons[index]
		if icon then
			icon:playEffect()
		end
	end
	
	self:_playPromptEquipGemstone()
	if self._parentView and self._parentView.checkRedPoint then
		self._parentView:checkRedPoint(3)
	end
end

function HeroTrainAwakeLayer:_onSyntheticFragments()
	self:_updateData()
	self:_updateGemstone()

	local slot, composeInfo = self:_getSlotAndCompose()
	if #composeInfo == 0 then --都合成完了再一键装备
		self:_doOneKey(slot)
	end
end

--飘字部分-------------------------------------------
--觉醒成功飘字
function HeroTrainAwakeLayer:_playPrompt()
    local summary = {}

	local content1 = Lang.get("summary_hero_awake_success")
	local param1 = {
		content = content1,
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
	} 
	table.insert(summary, param1)
	

	--属性飘字
	self:_addBaseAttrPromptSummary(summary)

    G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN)
end

--装备宝石成功飘字
function HeroTrainAwakeLayer:_playPromptEquipGemstone()
	local summary = {}

	local content1 = Lang.get("summary_hero_awake_equip_gemstone_success")
	local param1 = {
		content = content1,
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
	} 
	table.insert(summary, param1)
	
	--属性飘字
	self:_addBaseAttrPromptSummary(summary)

    G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN)
end

--加入基础属性飘字内容
function HeroTrainAwakeLayer:_addBaseAttrPromptSummary(summary)
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
					local _, curValue = TextHelper.getAttrBasicText(attrId, self._curAttrInfo[attrId])
					self["_fileNodeAttr"..i]:getSubNodeByName("TextCurValue"):updateTxtValue(curValue)
					self["_fileNodeAttr"..i]:updateInfo(attrId, self._curAttrInfo[attrId], self._nextAttrInfo[attrId], 4)
				end,
			}
			table.insert(summary, param)
		end
	end

	return summary
end

function HeroTrainAwakeLayer:_checkAndPlayEffect()
	local lastLevel = self._lastAwakeLevel
	local curLevel = self._heroUnitData:getAwaken_level()
	local lastStar = UserDataHelper.convertAwakeLevel(lastLevel)
	local curStar = UserDataHelper.convertAwakeLevel(curLevel)
	local isUpStar = curStar > lastStar --是否引起了升星
	self:_playEffect(isUpStar)
end

function HeroTrainAwakeLayer:_onCommonFinishEffect()
	self:_updateShow()
	self:_updateGemstone()
	self:_updateLevel()
	self:_updateMaterical()
	self:_playPrompt()
	if self._parentView and self._parentView.checkRedPoint then
		self._parentView:checkRedPoint(3)
	end
	self:setButtonEnable(true)
end

function HeroTrainAwakeLayer:_clearTextSummary()
	local runningScene = G_SceneManager:getRunningScene()
	runningScene:clearTextSummary()
end

function HeroTrainAwakeLayer:_onUpStarFinishEffect()

	self:_clearTextSummary()

	local popup = require("app.scene.view.heroTrain.PopupAwakeResult").new(self, self._heroId)
	popup:openWithAction()

	self:_updateShow()
	self:_updateGemstone()
	self:_updateLevel()
	self:_updateMaterical()
	if self._parentView and self._parentView.checkRedPoint then
		self._parentView:checkRedPoint(3)
	end
	self:setButtonEnable(true)
end

function HeroTrainAwakeLayer:_playEffect(isUpStar)
	local onFinishCallback = nil

	if isUpStar then
		onFinishCallback = handler(self, self._onUpStarFinishEffect)
	else
		onFinishCallback = handler(self, self._onCommonFinishEffect)
	end

	self:_playCommonEffect(onFinishCallback)
end

function HeroTrainAwakeLayer:_playCommonEffect(callback)

	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "play" then
    		for i = 1, 4 do
    			local icon = self._gemstoneIcons[i]
				local node = icon:getCommonIcon()
				G_EffectGfxMgr:applySingleGfx(node, "smoving_juexing_item_"..i, function()
					node:setVisible(false)
				end, nil, nil)
    		end
        elseif event == "finish" then
			if callback then
				callback()
				
				-- 恢复icon位置
				for i = 1, 4 do
					local icon = self._gemstoneIcons[i]
					local node = icon:getCommonIcon()
					node:setPosition(47, 39)
				end
        	end
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_juexing", effectFunction, eventFunction , false)
    effect:setPosition(cc.p(0-50, 0))
end

function HeroTrainAwakeLayer:_onButtonPreview()
	local popup = PopupAwakePreview.new(self._heroUnitData)
	popup:openWithAction()
end

function HeroTrainAwakeLayer:_getSlotAndCompose()
	local slot = {}
	local composeInfo = {} --可合成的信息
	local info = UserDataHelper.getHeroAwakeEquipState(self._heroUnitData)
	
	for i = 1, 4 do
		local state = info[i].state
		if state == GemstoneConst.EQUIP_STATE_3 then
			table.insert(composeInfo, {slot = i, id = info[i].needId})
		elseif state == GemstoneConst.EQUIP_STATE_1 then
			table.insert(slot, i)
		end
	end
	return slot, composeInfo
end

function HeroTrainAwakeLayer:_onButtonOneKey()
	local slot, composeInfo = self:_getSlotAndCompose()
	if #composeInfo > 0 then --有能合成的先合成
		for i, info in ipairs(composeInfo) do
			local baseId = info.id
			local config = require("app.config.gemstone").get(baseId)
			assert(config, string.format("gemstone config can not find id = %d", baseId))
			local fragmentId = config.fragment_id
			G_UserData:getFragments():c2sSyntheticFragments(fragmentId, 1)
		end
	else
		self:_doOneKey(slot)
	end
end

function HeroTrainAwakeLayer:_doOneKey(slot)
	if #slot == 0 then
		G_Prompt:showTip(Lang.get("hero_awake_gemstone_empty"))
		return
	end
	G_UserData:getHero():c2sHeroEquipAwaken(self._heroUnitData:getId(), slot)
end

return HeroTrainAwakeLayer