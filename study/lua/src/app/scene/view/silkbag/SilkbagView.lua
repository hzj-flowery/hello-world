--
-- Author: Liangxu
-- Date: 2018-3-1 17:07:09
-- 锦囊界面
local ViewBase = require("app.ui.ViewBase")
local SilkbagView = class("SilkbagView", ViewBase)
local SilkbagListCell = require("app.scene.view.silkbag.SilkbagListCell")
local TeamViewHelper = require("app.scene.view.team.TeamViewHelper")
local SilkbagDataHelper = require("app.utils.data.SilkbagDataHelper")
local TeamHeroIcon = require("app.scene.view.team.TeamHeroIcon")
local TeamHeroBustIcon = require("app.scene.view.team.TeamHeroBustIcon")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local SilkbagIcon = require("app.scene.view.silkbag.SilkbagIcon")
local PopupSilkbagDetail = require("app.scene.view.silkbag.PopupSilkbagDetail")
local TextHelper = require("app.utils.TextHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local UIConst = require("app.const.UIConst")
local SilkbagConst = require("app.const.SilkbagConst")
local TabScrollView = require("app.utils.TabScrollView")

function SilkbagView:ctor(pos)
	self._pos = pos
	local resource = {
		file = Path.getCSB("SilkbagView", "silkbag"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		},
	}
	self:setName("SilkbagView")
	SilkbagView.super.ctor(self, resource)
end

function SilkbagView:onCreate()
	self:_initData()
	self:_initView()
end

function SilkbagView:_initData()
	local pos = self._pos or 1
	G_UserData:getTeam():setCurPos(pos)
	self._selectTabIndex = 1
	self._allWearedSilkbagIds = {}
	self._curSilkbagIndex = 1
	self._silkbagIds = {}
	self._recordAttr = nil
	self._heroUnitData = nil
	self._enterEffects = {} --存储入场动画
end

function SilkbagView:_initView()
	self._topbarBase:setImageTitle("txt_sys_com_silkbag")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self:_initHeroIcons()
	self:_initSilkbagIcons()
	self:_initListView()
	self._nodeHeroIcon:setCallBack(handler(self, self._onButtonDetailClicked))
end

function SilkbagView:_initHeroIcons()
	local function createIcon(icon)
		local iconBg = ccui.Widget:create()
		local iconBgSize = cc.size(100, 127)
		iconBg:setContentSize(iconBgSize)
		icon:setPosition(cc.p(iconBgSize.width/2, iconBgSize.height/2))
		iconBg:addChild(icon)
		return iconBg
	end

	self._listViewLineup:setScrollBarEnabled(false)
	self._iconBgs = {}
	self._heroIcons = {}
	local iconsData = SilkbagDataHelper.getHeroIconsData()
	for i, data in ipairs(iconsData) do
		local icon = TeamHeroBustIcon.new(i, handler(self, self._onHeroIconClicked))
		local iconBg = createIcon(icon)
		self._listViewLineup:pushBackCustomItem(iconBg)
		table.insert(self._iconBgs, iconBg)
		table.insert(self._heroIcons, icon)
	end
end

function SilkbagView:_initSilkbagIcons()
	for i = 1, SilkbagConst.SLOT_MAX do
		self["_silkbagIcon"..i] = SilkbagIcon.new(i, handler(self, self._onClickSilkbagIcon))
		self._silkbagPanel:addChild(self["_silkbagIcon"..i])
	end
end

function SilkbagView:_initListView()
	local scrollViewParam = {
		template = SilkbagListCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam, self._selectTabIndex)

	local tabNameList = {}
	table.insert(tabNameList, Lang.get("silkbag_list_tab_name1"))
	table.insert(tabNameList, Lang.get("silkbag_list_tab_name2"))

	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		textList = tabNameList,
	}

	self._nodeTabRoot:recreateTabs(param)
end

function SilkbagView:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateData()
	self:_updateList()
end

function SilkbagView:onEnter()
	self._signalSilkbagEquip = G_SignalManager:add(SignalConst.EVENT_SILKBAG_EQUIP_SUCCESS, handler(self, self._silkbagEquipSuccess))

	local emptyIndex = self:_getEmptyIndex()
	self._curSilkbagIndex = emptyIndex or 1
	self._nodeTabRoot:setTabIndex(self._selectTabIndex)
	self:_updateData()
	self:_updateHeroIcons()
	self:_updateSilkbagIconsPos()
	self:_updateView()
	self:_playEnterEffect()
	self:_startRotatePlate()
end

function SilkbagView:onExit()
	self._signalSilkbagEquip:remove()
	self._signalSilkbagEquip = nil
	self:_stopRotatePlate()
end

function SilkbagView:_startRotatePlate()
	self._imagePlateButtom:runAction(cc.RepeatForever:create(cc.RotateBy:create(60, 360)))
	self._imagePlateFront:runAction(cc.RepeatForever:create(cc.RotateBy:create(60, -360)))
end

function SilkbagView:_stopRotatePlate()
	self._imagePlateButtom:stopAllActions()
	self._imagePlateFront:stopAllActions()
end

function SilkbagView:_updateData()
	local curPos = G_UserData:getTeam():getCurPos()
	self._allWearedSilkbagIds = self:_getAllWearedIds(curPos)

	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst["FUNC_SILKBAG_SLOT"..curPos])
	local heroId = G_UserData:getTeam():getHeroIdWithPos(curPos)
	local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
	self._heroUnitData = unitData
	local param = {
        heroUnitData = unitData,
    }
	local curAttr = UserDataHelper.getTotalAttr(param)
	self._recordAttr:updateData(curAttr)
	G_UserData:getAttr():recordPower()

	local heroBaseId = unitData:getAvatarToHeroBaseId()
	local heroRank = unitData:getRank_lv()
	local isInstrumentMaxLevel = G_UserData:getInstrument():isInstrumentLevelMaxWithPos(curPos)
	local isWeard = not (self._selectTabIndex == 1)
	local heroLimit = unitData:getLeaderLimitLevel()
	local heroRedLimit = unitData:getLeaderLimitRedLevel()
	self._silkbagIds = G_UserData:getSilkbag():getListBySort(heroBaseId, heroRank,
		isInstrumentMaxLevel, curPos, isWeard, heroLimit, heroRedLimit)
end

function SilkbagView:_getAllWearedIds(curPos)
	local silkbagIds = {}
	for i = 1, SilkbagConst.SLOT_MAX do
		local silkbagId = G_UserData:getSilkbagOnTeam():getIdWithPosAndIndex(curPos, i)
		if silkbagId > 0 then
			table.insert(silkbagIds, silkbagId)
		end
	end
	return silkbagIds
end

function SilkbagView:_updateView()
	self:_updateHeroIconsSelectedState()
	self:_updateSilkbagViews()
end

function SilkbagView:_updateHeroIcons()
	local iconsData = SilkbagDataHelper.getHeroIconsData()
	for i, data in ipairs(iconsData) do
		local icon = self._heroIcons[i]
		icon:updateIcon(data.type, data.value, data.funcId, data.limitLevel, data.limitRedLevel)
	end
end

function SilkbagView:_updateSilkbagViews()
	self:_updateHeroIconRedPoint()
	self:_updateBaseInfo()
	self:_updateSilkbagIcons()
	self:_updateSilkbagIconRedPoint()
	self:_updateList()
end

function SilkbagView:_updateHeroIconRedPoint()
	for i, icon in ipairs(self._heroIcons) do
		local redValue = RedPointHelper.isModuleReach(FunctionConst.FUNC_SILKBAG, i)
		icon:showRedPoint(redValue)
	end
end

function SilkbagView:_updateBaseInfo()
	local showId, isEquipAvatar, avatarLimitLevel, arLimitLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(self._heroUnitData)
	local limitLevel = avatarLimitLevel or self._heroUnitData:getLimit_level()
	local limitRedLevel = arLimitLevel or self._heroUnitData:getLimit_rtg()

	self._nodeHeroIcon:updateUI(showId, nil, limitLevel, limitRedLevel)

	local param = {heroUnitData = self._heroUnitData}
	local attrInfo = UserDataHelper.getHeroPowerAttr(param)
	local power = AttrDataHelper.getPower(attrInfo)
	self._fileNodePower:updateUI(power)
	local width = self._fileNodePower:getWidth()
	local posX = (0 - width) / 2
	self._fileNodePower:setPositionX(posX)
end

function SilkbagView:_updateSilkbagIconsPos()
	local count2Pos = {
		[1] = {cc.p(196, 390)},
		[2] = {cc.p(196, 390), cc.p(31, 105)},
		[3] = {cc.p(196, 390), cc.p(31, 105), cc.p(361, 105)},
		[4] = {cc.p(62, 334), cc.p(331, 334), cc.p(62, 66), cc.p(331, 66)},
		[5] = {cc.p(196, 390), cc.p(15, 259), cc.p(377, 259), cc.p(84, 46), cc.p(308, 46)},
		[6] = {cc.p(196, 390), cc.p(31, 295), cc.p(361, 295), cc.p(31, 105), cc.p(361, 105), cc.p(196, 10)},
		[7] = {cc.p(196, 390), cc.p(47, 318), cc.p(344, 318), cc.p(11, 157), cc.p(381, 157), cc.p(113, 28), cc.p(278, 28)},
		[8] = {cc.p(196, 390), cc.p(62, 333), cc.p(331, 333), cc.p(6, 199), cc.p(386, 199), cc.p(62, 65), cc.p(330, 65), cc.p(196, 10)},
		[9] = {cc.p(196, 390), cc.p(72, 344), cc.p(318, 344), cc.p(8, 232), cc.p(384, 232), cc.p(30, 103), cc.p(361, 103), cc.p(131, 21), cc.p(261, 21)},
		[10] = {cc.p(138, 380), cc.p(255, 380), cc.p(43, 309), cc.p(350, 309), cc.p(6, 198), cc.p(386, 198), cc.p(42, 87), cc.p(350, 87), cc.p(136, 18), cc.p(253, 18)},
	}

	local count = SilkbagConst.SLOT_MAX
	for i = 1, SilkbagConst.SLOT_MAX do
		local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_SILKBAG_SLOT"..i])
		if not isOpen then
			count = i
			break --碰到第一个未解锁的，就结束
		end
	end

	self._showSilkbagIcons = {}
	for i = 1, SilkbagConst.SLOT_MAX do
		if i <= count then
			self["_silkbagIcon"..i]:setVisible(true)
			self["_silkbagIcon"..i]:setPosition(count2Pos[count][i])
			table.insert(self._showSilkbagIcons, self["_silkbagIcon"..i])
		else
			self["_silkbagIcon"..i]:setVisible(false)
		end
	end
end

function SilkbagView:_updateSilkbagIcons()
	local curPos = G_UserData:getTeam():getCurPos()
	for i = 1, SilkbagConst.SLOT_MAX do
		self["_silkbagIcon"..i]:updateIcon(curPos)
		self["_silkbagIcon"..i]:setSelected(i == self._curSilkbagIndex)
	end
end

function SilkbagView:_updateSilkbagIconRedPoint()
	local curPos = G_UserData:getTeam():getCurPos()
	for i = 1, SilkbagConst.SLOT_MAX do
		local param = {pos = curPos, slot = i}
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SILKBAG, "slotRP", param)
		self["_silkbagIcon"..i]:showRedPoint(redValue)
	end
end

function SilkbagView:_onClickSilkbagIcon(index)
	if index == self._curSilkbagIndex then
		return
	end
	self._curSilkbagIndex = index
	for i = 1, SilkbagConst.SLOT_MAX do
		self["_silkbagIcon"..i]:setSelected(i == self._curSilkbagIndex)
	end
end

function SilkbagView:_updateList()
	local count = #self._silkbagIds
    self._tabListView:updateListView(self._selectTabIndex, count)
	if count == 0 then
    	self._imageWaterFlow:setVisible(true)
	else
    	self._imageWaterFlow:setVisible(false)
	end
end

function SilkbagView:_onItemUpdate(item, index)
	local index = index + 1
	local silkbagId = self._silkbagIds[index]
	if silkbagId then
		local heroBaseId = self._heroUnitData:getAvatarToHeroBaseId()
		local heroRank = self._heroUnitData:getRank_lv()
		local curPos = G_UserData:getTeam():getCurPos()
		local isInstrumentMaxLevel = G_UserData:getInstrument():isInstrumentLevelMaxWithPos(curPos)
		local heroLimit = self._heroUnitData:getLeaderLimitLevel()
		local heroRedLimit = self._heroUnitData:getLeaderLimitRedLevel()
		item:update(silkbagId, heroBaseId, heroRank, isInstrumentMaxLevel, curPos, heroLimit, heroRedLimit)
	end
end

function SilkbagView:_onItemSelected(item, index)
	
end

function SilkbagView:_onItemTouch(index, t)
    local index = index + t
    local silkbagId = self._silkbagIds[index]
    local curPos = G_UserData:getTeam():getCurPos()
    local unitData = G_UserData:getSilkbag():getUnitDataWithId(silkbagId)
    local isCanWear = unitData:isCanWearWithPos(curPos)
    if not isCanWear then
    	G_Prompt:showTip(Lang.get("silkbag_only_equip_tip"))
    	return
    end
    G_UserData:getSilkbag():c2sEquipSilkbag(curPos, self._curSilkbagIndex, silkbagId) --穿戴/替换
end

function SilkbagView:_onHeroIconClicked(pos)
	local curPos = G_UserData:getTeam():getCurPos()
	if pos == curPos then
		return
	end
	G_UserData:getTeam():setCurPos(pos)
	local emptyIndex = self:_getEmptyIndex()
	self._curSilkbagIndex = emptyIndex or 1 --选中空位
	self:_updateData()
	self:_updateView()
end

function SilkbagView:_updateHeroIconsSelectedState()
	local curPos = G_UserData:getTeam():getCurPos()
	for i, icon in ipairs(self._heroIcons) do
		if i == curPos then
			icon:setSelected(true)
		else
			icon:setSelected(false)
		end
	end
	if curPos >= 1 and curPos <= 4 then
		self._listViewLineup:jumpToTop()
	elseif curPos >= 5 and curPos <= 6 then
		self._listViewLineup:jumpToBottom()
	end
end

function SilkbagView:_getEmptyIndex()
	local curPos = G_UserData:getTeam():getCurPos()
	for i = 1, SilkbagConst.SLOT_MAX do
		local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_SILKBAG_SLOT"..i])
		if isOpen then
			local silkbagId = G_UserData:getSilkbagOnTeam():getIdWithPosAndIndex(curPos, i)
			if silkbagId == 0 then --空位
				return i
			end
		end
	end
	return nil
end

function SilkbagView:_onButtonDetailClicked()
	local silkbagIds = self._allWearedSilkbagIds
	if #silkbagIds == 0 then
		G_Prompt:showTip(Lang.get("silkbag_no_detail_tip"))
		return
	end
	local curPos = G_UserData:getTeam():getCurPos()
	local popup = PopupSilkbagDetail.new()
	popup:updateUI(silkbagIds, curPos)
	popup:openWithAction()
end

function SilkbagView:_silkbagEquipSuccess(eventName, pos, index, silkbagId)
	if silkbagId > 0 then --如果是穿戴操作，找下一个空位
		local emptyIndex = self:_getEmptyIndex()
		if emptyIndex then
			self._curSilkbagIndex = emptyIndex
		end
	end
	
	self:_updateData()
	self:_updateSilkbagViews()
	self:_playEffect(index, silkbagId)
	self:_playPrompt(silkbagId)
end

function SilkbagView:_playEffect(index, silkbagId)
	if silkbagId == 0 then
		return
	end
	local color2EffectName = {
		[4] = "effect_jinnang_zisejihuo",
		[5] = "effect_jinnang_chengsejihuo",
		[6] = "effect_jinnang_hongsejihuo",
		[7] = "effect_jinnang_hongsejihuo",
	}
	local unitData = G_UserData:getSilkbag():getUnitDataWithId(silkbagId)
	local baseId = unitData:getBase_id()
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, baseId)
	local effectName = color2EffectName[param.color]
	self["_silkbagIcon"..index]:playEffect(effectName)
end

function SilkbagView:_playPrompt(silkbagId)
	local summary = {}
	local param = {
		content = silkbagId == 0 and Lang.get("summary_silkbag_unload_success") or Lang.get("summary_silkbag_add_success"),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_SILKBAG},
	} 
	table.insert(summary, param)

	self:_addBaseAttrPromptSummary(summary)
	G_Prompt:showSummary(summary)

	G_Prompt:playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_SILKBAG)
end

function SilkbagView:_addBaseAttrPromptSummary(summary)
	local attrIds = self._recordAttr:getAllAttrIdsBySort()
	for i, attrId in ipairs(attrIds) do
		local diffValue = self._recordAttr:getDiffValue(attrId)
		if diffValue ~= 0 then
			local param = {
				content = AttrDataHelper.getPromptContent(attrId, diffValue),
				anchorPoint = cc.p(0, 0.5),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_SILKBAG+UIConst.SUMMARY_OFFSET_X_ATTR},
			}
			table.insert(summary, param)
		end
	end
	return summary
end

function SilkbagView:_playEnterEffect()
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "ren" then
    		self:_playTopAndDownEnter()
			self:_playHeroEnter()
		elseif event == "left_right" then
			self:_playLeftHeroIconEnter()
			self:_playRightPanelEnter()
		elseif event == "xiangqing" then
			self:_playDetailEnter()
		elseif event == "left_right_icon" then
			self:_playSilkbagIconEnter()
		elseif event == "finish" then
			self:_onEnterEffectFinish()
        end
    end

    self:_resetEffectNode()
    self:_hideAllEffectNode()
    if self._enterMoving then
    	self._enterMoving:runAction(cc.RemoveSelf:create())
    	self._enterMoving = nil
    end
	self._enterMoving = G_EffectGfxMgr:createPlayMovingGfx(self._nodeTotalEffect, "moving_jinnang_ui", effectFunction, eventFunction , false)
end

function SilkbagView:_resetEffectNode()
	for i, effect in ipairs(self._enterEffects) do
		effect:reset()
	end
	self._enterEffects = {}
end

--隐藏所有入场相关控件
function SilkbagView:_hideAllEffectNode()
	self._topbarBase:setVisible(false)
	self._nodeHero:setVisible(false)
	self._nodeDetailEffect:setVisible(false)
	self:_hideLeftHeroIcon()
	self._panelBasic:setVisible(false)
	self:_hideSilkbagIcon()
end

function SilkbagView:_hideLeftHeroIcon()
	for i, iconBg in ipairs(self._iconBgs) do
		iconBg:setVisible(false)
	end
end

function SilkbagView:_hideSilkbagIcon()
	for i, icon in ipairs(self._showSilkbagIcons) do
		icon:setVisible(false)
	end
end

function SilkbagView:_playTopAndDownEnter()
	self._topbarBase:setVisible(true)
	local enterEffectTop = G_EffectGfxMgr:applySingleGfx(self._topbarBase, "smoving_shangdian_top", nil, nil, nil)
	table.insert(self._enterEffects, enterEffectTop)
end

function SilkbagView:_playHeroEnter()
	self._nodeHero:setVisible(true)
	local enterEffectHero = G_EffectGfxMgr:applySingleGfx(self._nodeHero, "smoving_shangdian_alpha", nil, nil, nil)
	table.insert(self._enterEffects, enterEffectHero)
end

--左侧武将Icon依次入场
function SilkbagView:_playLeftHeroIconEnter()
	local nodes = {}
	for i, iconBg in ipairs(self._iconBgs) do
		table.insert(nodes, iconBg)
	end

	local actions = {}
	for i, node in ipairs(nodes) do
		local action1 = cc.CallFunc:create(function()
			node:setVisible(true)
			local enterEffectHeroIcon = G_EffectGfxMgr:applySingleGfx(node, "smoving_zhenrong_left", nil, nil, nil)
			table.insert(self._enterEffects, enterEffectHeroIcon)
		end)
		local action2 = cc.DelayTime:create(0.06)
		table.insert(actions, action1)
		if i ~= #nodes then --不是最后一个
			table.insert(actions, action2)
		end
	end
	
	local action = cc.Sequence:create(unpack(actions))
	self._nodeTotalEffect:runAction(action)
end

function SilkbagView:_playRightPanelEnter()
	self._panelBasic:setVisible(true)
	local enterEffectRight = G_EffectGfxMgr:applySingleGfx(self._panelBasic, "smoving_jinnang_right", nil, nil, nil)
	table.insert(self._enterEffects, enterEffectRight)
end

function SilkbagView:_playDetailEnter()
	self._nodeDetailEffect:setVisible(true)
	local enterEffectDetail = G_EffectGfxMgr:applySingleGfx(self._nodeDetailEffect, "smoving_jinnang_xiangqing", nil, nil, nil)
	table.insert(self._enterEffects, enterEffectDetail)
end

function SilkbagView:_playSilkbagIconEnter()
	local count = #self._showSilkbagIcons
	local leftNodes = {}
	local rightNodes = {}
	local isOdd = count % 2 == 1 --是否奇数
	for i, icon in ipairs(self._showSilkbagIcons) do
		if i == 1 then
			table.insert(leftNodes, icon)
		else
			local indexOdd = i % 2 == 1
			if isOdd then
				if indexOdd then
					table.insert(rightNodes, icon)
				else
					table.insert(leftNodes, icon)
				end
			else
				if indexOdd then
					table.insert(leftNodes, icon)
				else
					table.insert(rightNodes, icon)
				end
			end
		end
	end

	local leftActions = {}
	local actionDelay = cc.DelayTime:create(0.06)
	for i, node in ipairs(leftNodes) do
		local action = cc.CallFunc:create(function()
			node:setVisible(true)
			local enterEffectLeftIcon = G_EffectGfxMgr:applySingleGfx(node, "smoving_jinnang_left_icon", nil, nil, nil)
			table.insert(self._enterEffects, enterEffectLeftIcon)
		end)
		table.insert(leftActions, action)
		if i ~= #leftNodes then --不是最后一个
			table.insert(leftActions, actionDelay)
		end
	end
	local rightActions = {}
	local actionDelay = cc.DelayTime:create(0.06)
	for i, node in ipairs(rightNodes) do
		local action = cc.CallFunc:create(function()
			node:setVisible(true)
			local enterEffectRightIcon = G_EffectGfxMgr:applySingleGfx(node, "smoving_jinnang_right_icon", nil, nil, nil)
			table.insert(self._enterEffects, enterEffectRightIcon)
		end)
		table.insert(rightActions, action)
		if i ~= #rightNodes then --不是最后一个
			table.insert(rightActions, actionDelay)
		end
	end

	if #leftActions > 0 then
		local leftAction = cc.Sequence:create(unpack(leftActions))
		self._nodeTotalEffect:runAction(leftAction)
	end
	if #rightActions > 0 then
		local rightAction = cc.Sequence:create(unpack(rightActions))
		self._nodeTotalEffect:runAction(rightAction)
	end
end

function SilkbagView:_onEnterEffectFinish()
	--抛出新手事件
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

return SilkbagView