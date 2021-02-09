--
-- Author: Liangxu
-- Date: 2017-03-17 17:57:20
-- 武将突破
local ViewBase = require("app.ui.ViewBase")
local HeroTrainBreakLayer = class("HeroTrainBreakLayer", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AttributeConst = require("app.const.AttributeConst")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local CSHelper = require("yoka.utils.CSHelper")
local AudioConst = require("app.const.AudioConst")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local UIHelper = require("yoka.utils.UIHelper")

--根据材料数量，定义材料的位置
local MATERIAL_POS = {
	[1] = {{166, 56}},
	[2] = {{57, 56}, {247, 56}},
}

function HeroTrainBreakLayer:ctor(parentView)
	self._parentView = parentView
	local resource = {
		file = Path.getCSB("HeroTrainBreakLayer", "hero"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonBreak = {
				events = {{event = "touch", method = "_onButtonBreakClicked"}},
			},
		},
	}
	self:setName("HeroTrainBreakLayer")
	HeroTrainBreakLayer.super.ctor(self, resource)
end

function HeroTrainBreakLayer:onCreate()
	self:_initData()
	self:_initView()
end

function HeroTrainBreakLayer:onEnter()
	self._signalHeroRankUp = G_SignalManager:add(SignalConst.EVENT_HERO_RANKUP, handler(self, self._heroRankUpSuccess))

	self:_updatePageItem()
	self:_updateInfo()
end

function HeroTrainBreakLayer:onExit()
	self._signalHeroRankUp:remove()
	self._signalHeroRankUp = nil
end

function HeroTrainBreakLayer:initInfo()
	self._parentView:setArrowBtnVisible(true)
	self:_updatePageItem()
	self:_updateInfo()
	local selectedPos = self._parentView:getSelectedPos()
	self._pageView:setCurrentPageIndex(selectedPos - 1)
end

function HeroTrainBreakLayer:_initData()
	self._isReachLimit = false -- 是否达到上限
	self._conditionLevel = false
end

function HeroTrainBreakLayer:_initView()
	self._materialIcons = {}
	self._buttonBreak:setString(Lang.get("hero_break_btn_break"))
	self._fileNodeDetailTitle:setFontSize(24)
	self._fileNodeCostTitle:setFontSize(24)
	self._fileNodeDetailTitle:setTitle(Lang.get("hero_break_detail_title"))
	self._fileNodeCostTitle:setTitle(Lang.get("hero_break_cost_title"))
	self._newNamePosX = self._fileNodeNameNew:getPositionX()
	-- self._fileNodeHeroName2:setFontSize(22)

	self:_initPageView()
end

function HeroTrainBreakLayer:_createPageItem()
	local widget = ccui.Widget:create()
	widget:setSwallowTouches(false)
	widget:setContentSize(self._pageViewSize.width, self._pageViewSize.height)

	return widget
end

function HeroTrainBreakLayer:_updatePageItem()
	local allHeroIds = self._parentView:getAllHeroIds()
	local index = self._parentView:getSelectedPos()
	for i = index-1, index+1 do
		if i >= 1 and i <= #allHeroIds then
			if self._pageItems[i] == nil then
				local widget = self:_createPageItem()
		        self._pageView:addPage(widget)
		        self._pageItems[i] = {widget = widget}
			end
			if self._pageItems[i].avatar1 == nil and self._pageItems[i].avatar2 == nil then
				local avatar1 = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
				local avatar2 = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
				avatar1:setScale(1.0)
				avatar2:setScale(1.2)
				avatar1:setPosition(self:_getPositionWithIndex(1))
				avatar2:setPosition(self:_getPositionWithIndex(2))
				self._pageItems[i].widget:addChild(avatar1)
				self._pageItems[i].widget:addChild(avatar2)
				self._pageItems[i].avatar1 = avatar1
				self._pageItems[i].avatar2 = avatar2
			end
			local heroId = allHeroIds[i]
			local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData)
			local limitLevel = avatarLimitLevel or unitData:getLimit_level()
			local limitRedLevel = arLimitLevel or unitData:getLimit_rtg()
			self._pageItems[i].avatar1:updateUI(heroBaseId, nil, nil, limitLevel, nil, nil, limitRedLevel)
			self._pageItems[i].avatar2:updateUI(heroBaseId, nil, nil, limitLevel, nil, nil, limitRedLevel)
		end
	end
end

function HeroTrainBreakLayer:_getPositionWithIndex(index)
	local imageStage = self["_imageStage"..index]
	local targetPosX = imageStage:getPositionX()
	local targetPosY = imageStage:getPositionY() + (imageStage:getContentSize().height / 4)
	local pos = UIHelper.convertSpaceFromNodeToNode(self._nodeShow, self._pageView, cc.p(targetPosX, targetPosY))
	return pos
end

function HeroTrainBreakLayer:_initPageView()
	self._pageItems = {}
	self._pageView:setItemsMargin(60) --加大间隙，防止有武器太大，越界穿帮
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

function HeroTrainBreakLayer:_onPageViewEvent(sender,event)
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
			self:_updateInfo()
			self._parentView:updateTabIcons()
		end
	end
end

function HeroTrainBreakLayer:_updateInfo()
	self._heroId = G_UserData:getHero():getCurHeroId()
	self._heroUnitData = G_UserData:getHero():getUnitDataWithId(self._heroId)
	local rankMax = self._heroUnitData:getConfig().rank_max
	self._rankLevel = self._heroUnitData:getRank_lv()
	self._isReachLimit = self._rankLevel >= rankMax --是否抵达上限

	self:setButtonEnable(true)
	self:_updateShow()
	self:_updateAttr()
	self:_updateCost()
end

function HeroTrainBreakLayer:_updateShow()
	local index = self._parentView:getSelectedPos()
	self._fileNodeHeroOld = self._pageItems[index].avatar1
	self._fileNodeHeroNew = self._pageItems[index].avatar2

	local heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(self._heroUnitData)
	local rankLevel = self._isReachLimit and self._rankLevel or self._rankLevel+1
	local limitLevel = avatarLimitLevel or self._heroUnitData:getLimit_level()
	local limitRedLevel = arLimitLevel or self._heroUnitData:getLimit_rtg()
	self._fileNodeNameOld:setName(self._heroUnitData:getBase_id(), self._rankLevel, self._heroUnitData:getLimit_level(),
		nil, self._heroUnitData:getLimit_rtg())
	self._fileNodeNameNew:setName(self._heroUnitData:getBase_id(), rankLevel, self._heroUnitData:getLimit_level(),
		nil, self._heroUnitData:getLimit_rtg())
	self._fileNodeHeroName2:setName(self._heroUnitData:getBase_id(), self._rankLevel, self._heroUnitData:getLimit_level(),
		nil, self._heroUnitData:getLimit_rtg())
	self._fileNodeHeroNew:updateUI(heroBaseId, nil, nil, limitLevel, nil, nil, limitRedLevel)

	self._fileNodeNameOld:setVisible(not self._isReachLimit)
	self._fileNodeHeroOld:setVisible(not self._isReachLimit)
	self._imageBreakArrow:setVisible(not self._isReachLimit)
	self._imageTalentBg:setVisible(not self._isReachLimit)
	self._iconArrow:setVisible(not self._isReachLimit)

	self._nodeTalentDesPos:removeAllChildren()
	local label = nil
	if self._isReachLimit then
		label = cc.Label:createWithTTF(Lang.get("hero_break_txt_all_unlock"), Path.getCommonFont(), 20)
		label:setMaxLineWidth(334)
		label:setAnchorPoint(cc.p(0.5, 1))
        self._fileNodeNameNew:setPositionX(self._iconArrow:getPositionX())
	else 
        self._fileNodeNameNew:setPositionX(self._newNamePosX)
		self._fileNodeHeroNew:setPosition(self:_getPositionWithIndex(2))
		self._fileNodeHeroOld:updateUI(heroBaseId, nil, nil, limitLevel, nil, nil, limitRedLevel)
		local limitLevel = self._heroUnitData:getLimit_level()
		local limitRedLevel = self._heroUnitData:getLimit_rtg()
		if self._heroUnitData:isLeader() then
			limitLevel = self._heroUnitData:getLeaderLimitLevel()
			limitRedLevel = self._heroUnitData:getLeaderLimitRedLevel()
		end
		local heroRankConfig = UserDataHelper.getHeroRankConfig(heroBaseId, rankLevel, limitLevel, limitRedLevel)
		if heroRankConfig then
			local talentName = heroRankConfig.talent_name
			local talentDes = heroRankConfig.talent_description
			self._textTalentName:setString(talentName)
			local breakDes = Lang.get("hero_break_txt_break_des", {rank = rankLevel})
			local talentInfo = Lang.get("hero_break_txt_talent_des", {
				name = talentName,
				des = talentDes,
				breakDes = breakDes,
			})

			label = ccui.RichText:createWithContent(talentInfo)
			label:setAnchorPoint(cc.p(0.5, 1))
			label:ignoreContentAdaptWithSize(false)
			label:setContentSize(cc.size(334,0))
			label:formatText()
			self._imageTalentBg:setVisible(true)
		else
			self._imageTalentBg:setVisible(false)
		end
	end
	if label then
		self._nodeTalentDesPos:addChild(label)
	end
end

function HeroTrainBreakLayer:_updateAttr()
	self._textOldLevel:setString(Lang.get("hero_break_txt_break_title", {level = self._rankLevel}))
	local strRankLevel = self._isReachLimit == true and Lang.get("hero_break_txt_reach_limit") or Lang.get("hero_break_txt_break_title", {level = self._rankLevel + 1})
	self._textNewLevel:setString(strRankLevel)

	local curBreakAttr = UserDataHelper.getBreakAttr(self._heroUnitData)
	local nextBreakAttr = UserDataHelper.getBreakAttr(self._heroUnitData, 1) or {}
	self._fileNodeAttr1:updateInfo(AttributeConst.ATK, curBreakAttr[AttributeConst.ATK], nextBreakAttr[AttributeConst.ATK], 4)
	self._fileNodeAttr2:updateInfo(AttributeConst.HP, curBreakAttr[AttributeConst.HP], nextBreakAttr[AttributeConst.HP], 4)
	self._fileNodeAttr3:updateInfo(AttributeConst.PD, curBreakAttr[AttributeConst.PD], nextBreakAttr[AttributeConst.PD], 4)
	self._fileNodeAttr4:updateInfo(AttributeConst.MD, curBreakAttr[AttributeConst.MD], nextBreakAttr[AttributeConst.MD], 4)
end

function HeroTrainBreakLayer:_updateCost()
	self._costCardNum = 0
	self._fileNodeCostTitle:setVisible(not self._isReachLimit)
	self._panelCost:removeAllChildren()
	self._nodeNeedLevelPos:removeAllChildren()
	self._nodeResource:setVisible(false)
	self._buttonBreak:setEnabled(not self._isReachLimit)
	if self._isReachLimit then --达到顶级了
		local sp = cc.Sprite:create(Path.getText("txt_train_breakthroughtop"))
		local size = self._panelCost:getContentSize()
		sp:setPosition(cc.p(size.width/2, size.height/2))
		self._panelCost:addChild(sp)
		return
	end

	--材料
	self._materialIcons = {}
	self._materialInfo = {}
	self._resourceInfo = {}
	local allMaterialInfo = UserDataHelper.getHeroBreakMaterials(self._heroUnitData)
	for i, info in ipairs(allMaterialInfo) do
		if info.type ~= TypeConvertHelper.TYPE_RESOURCE then --排除银币
			table.insert(self._materialInfo, info)
		else
			table.insert(self._resourceInfo, info)
		end
	end
	local len = #self._materialInfo
	for i, info in ipairs(self._materialInfo) do
		local node = CSHelper.loadResourceNode(Path.getCSB("CommonCostNode", "common"))
		node:updateView(info)
		local pos = cc.p(MATERIAL_POS[len][i][1], MATERIAL_POS[len][i][2])
		node:setPosition(pos)
		self._panelCost:addChild(node)
		table.insert(self._materialIcons, node)
		if info.type == TypeConvertHelper.TYPE_HERO then
			self._costCardNum = self._costCardNum + node:getNeedCount()
		end
	end

	--银币
	local resource = self._resourceInfo[1]
	if resource then
		self._nodeResource:updateUI(resource.type, resource.value, resource.size)
		self._nodeResource:setTextColor(Colors.BRIGHT_BG_TWO)
		self._nodeResource:setVisible(true)
	else
		self._nodeResource:setVisible(false)
	end

	--需要等级
	local myLevel = self._heroUnitData:getLevel()
	local needLevel = UserDataHelper.getHeroBreakLimitLevel(self._heroUnitData)
	local colorNeed = myLevel < needLevel and Colors.colorToNumber(Colors.BRIGHT_BG_RED) or Colors.colorToNumber(Colors.BRIGHT_BG_GREEN)
	local needLevelInfo = Lang.get("hero_break_txt_need_level", {
		value1 = myLevel,
		color = colorNeed,
		value2 = needLevel,
	})
	local richTextNeedLevel = ccui.RichText:createWithContent(needLevelInfo)
	richTextNeedLevel:setAnchorPoint(cc.p(0, 0))
	self._nodeNeedLevelPos:addChild(richTextNeedLevel)
	self._conditionLevel = myLevel >= needLevel
end

function HeroTrainBreakLayer:setButtonEnable(enable)
	self._buttonBreak:setEnabled(enable)
	self._pageView:setEnabled(enable)
	if self._parentView and self._parentView.setArrowBtnEnable then
		self._parentView:setArrowBtnEnable(enable)
	end
end

function HeroTrainBreakLayer:_onButtonBreakClicked()
	if self._isReachLimit then
		G_Prompt:showTip(Lang.get("hero_break_reach_limit_tip"))
		return
	end
	if not self._conditionLevel then
		G_Prompt:showTip(Lang.get("hero_break_condition_no_level"))
		return
	end
	for i, icon in ipairs(self._materialIcons) do
		local isReachCondition = icon:isReachCondition()
		if not isReachCondition then
			local info = self._materialInfo[i]
			local param = TypeConvertHelper.convert(info.type, info.value)
			G_Prompt:showTip(Lang.get("hero_break_condition_no_cost", {name = param.name}))
			return
		end
	end
	for i, info in ipairs(self._resourceInfo) do
		local enough = require("app.utils.LogicCheckHelper").enoughValue(info.type, info.value, info.size)
		if not enough then
			return false
		end
	end
	
	self:_doHeroBreak()
end

function HeroTrainBreakLayer:_doHeroBreak()
	local id = self._heroUnitData:getId()
	local heroIds = {}
	local sameCards = G_UserData:getHero():getSameCardCountWithBaseId(self._heroUnitData:getBase_id())
	local count = 0
	for k, card in pairs(sameCards) do
		if count >= self._costCardNum then
			break
		end
		table.insert(heroIds, card:getId())
		count = count + 1
	end
	G_UserData:getHero():c2sHeroRankUp(id, heroIds)
	self:setButtonEnable(false)
end

function HeroTrainBreakLayer:_heroRankUpSuccess()
	self:_playEffect()
	if self._parentView and self._parentView.checkRedPoint then
		self._parentView:checkRedPoint(2)
		self._parentView:checkRedPoint(4)
	end
end

function HeroTrainBreakLayer:showHeroAvatar()
	self._fileNodeHeroOld:setOpacity(255)
	self._fileNodeHeroNew:setOpacity(255)
end

function HeroTrainBreakLayer:_playEffect()
	local function effectFunction(effect)
        if effect == "effect_wujiangtupo_ningju" then
            local subEffect = EffectGfxNode.new("effect_wujiangtupo_ningju")
            subEffect:play()
            return subEffect
        end

        if effect == "effect_wujiangtupo_feichu" then
        	local subEffect = EffectGfxNode.new("effect_wujiangtupo_feichu")
            subEffect:play()
            return subEffect
        end

    	if effect == "effect_wujiangtupo_xingxing" then
    		local subEffect = EffectGfxNode.new("effect_wujiangtupo_xingxing")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_wujiangtupo_daguang" then
    		local subEffect = EffectGfxNode.new("effect_wujiangtupo_daguang")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_wujiangtupo_xiaoxing" then
    		local subEffect = EffectGfxNode.new("effect_wujiangtupo_xiaoxing")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_wujiangtupo_guangqiu" then
    		local subEffect = EffectGfxNode.new("effect_wujiangtupo_guangqiu")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_wujiangtupo_shuxian" then
    		local subEffect = EffectGfxNode.new("effect_wujiangtupo_shuxian")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_wujiangtupo_xiaosan" then
    		local subEffect = EffectGfxNode.new("effect_wujiangtupo_xiaosan")
            subEffect:play()
            return subEffect
    	end
    		
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "1p" then
    		local action = cc.FadeOut:create(0.3)
    		self._fileNodeHeroOld:runAction(action)
    		G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_BREAK) --播音效
        elseif event == "2p" then
        	local action = cc.FadeOut:create(0.3)
    		self._fileNodeHeroNew:runAction(action)
    	elseif event == "finish" then
    		local popupBreakResult = require("app.scene.view.heroTrain.PopupBreakResult").new(self, self._heroId)
			popupBreakResult:open()
			
			self:setButtonEnable(true)
			self:_updateInfo()
			self:showHeroAvatar()
        end
    end

	if CONFIG_LIMIT_BOOST then
		self:setButtonEnable(true)
		self:_updateInfo()
		self:showHeroAvatar()
	else
		local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_wujiangtupo", effectFunction, eventFunction , false)
		effect:setPosition(cc.p(G_ResolutionManager:getDesignWidth()*0.5, G_ResolutionManager:getDesignHeight()*0.5))
	end
end

--全范围的情况，突破如果消耗同名卡，要重新更新列表
--此处特殊处理，重新建一遍pageView
function HeroTrainBreakLayer:updatePageView()
	self:_initPageView()
	self:_updatePageItem()
	self:_updateShow()
end

return HeroTrainBreakLayer