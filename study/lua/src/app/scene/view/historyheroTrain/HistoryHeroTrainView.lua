--[[
   Description: 历代名将养成
   Company: yoka
   Author: chenzhongjie
   Date: 2019-07-11 17:49:12
   LastEditors: chenzhongjie
   LastEditTime: 2019-08-01 14:37:33
]]

local ViewBase = require("app.ui.ViewBase")
local HistoryHeroTrainView = class("HistoryHeroTrainView", ViewBase)
local HistoryHeroConst = require("app.const.HistoryHeroConst")
local HistoryHeroAttrLayer = require("app.scene.view.historyhero.HistoryHeroAttrLayer")
local HistoryHeroTrainAwakeLayer = require("app.scene.view.historyhero.HistoryHeroTrainAwakeLayer")
local HistoryHeroListItemCell = require("app.scene.view.historyheroTrain.HistoryHeroListItemCell")
local HistoryHeroAvatarItemCell = require("app.scene.view.historyhero.HistoryHeroAvatarItemCell")
local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local UIHelper  = require("yoka.utils.UIHelper")
local UIConst = require("app.const.UIConst")
local CSHelper = require("yoka.utils.CSHelper")
local HistoryHeroAvatar = require("app.scene.view.historyheroTrain.HistoryHeroAvatar")
local TeamHeroBustIcon = require("app.scene.view.team.TeamHeroBustIcon")
local TeamViewHelper = require("app.scene.view.team.TeamViewHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TeamConst = require("app.const.TeamConst")
local AudioConst = require("app.const.AudioConst")


function HistoryHeroTrainView:ctor(pos)
	self:_initMember(pos)

	local resource = {
		file = Path.getCSB("HistoryHeroTrainView", "historyhero"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnAddHero = {
				events = {{event = "touch", method = "_onButtonAdd"}}
			},
			_buttonReplace = {
				events = {{event = "touch", method = "_onButtonReplace"}}
			},
		},
	}
	HistoryHeroTrainView.super.ctor(self, resource)
end

function HistoryHeroTrainView:_initMember(pos)
	self._pos = pos
	self._textRightLantern 			= nil
	self._nodeAvatar	   			= nil
	self._awakenLayer	   			= nil
	self._btnAddHero       			= nil
	self._labelAttr1	   			= nil
	self._labelAttr2	   			= nil
	self._labelAttr3	   			= nil
	self._labelAttr4	   			= nil
	self._curTabIndex	   			= 1 		-- 当前Tab
	self._heroList		   			= {}		-- 名将列表
	self._squadIndex	   			= 1			-- 选中坑位
	self._curAvatarIndex   			= 0			-- 当前Avatar-Idx
	self._nodeAttr		   			= nil		-- 属性节点
	self._attrBg		   			= nil		-- 属性背景
	self._skillDesc        			= nil		-- 技能描述
	self._attrDiff		   			=  {}

	self._curHistoryHeroUnitData 	= nil 		-- 当前选中的武将
	self._lastTotalPower 			= 0 		--记录总战力
	self._diffPower 				= 0 		--战力差值
	self._isDoOnformation			= false 	--记录是否上阵名将
end

function HistoryHeroTrainView:onCreate()
	self:_initBaseView()
	self:_initBtn()
	self:_initAwakenLayer()
	self:_createAnimation()
end

function HistoryHeroTrainView:onEnter()
	self._starFormationUpdate  = G_SignalManager:add(SignalConst.EVENT_HISTORY_HERO_FORMATIONUPDATE, handler(self, self._onStarFormationUpdate)) -- 名将阵容变化

	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_HISTORY_HERO)
	self._topbarBase:setImageTitle("txt_sys_com_historical02")
	self._topbarBase:setCallBackOnBack(handler(self, self._setCallback))

	self:_refreshData()
	self:updateUI()
	self:_recordTotalPower()
	
	G_AudioManager:playSoundWithId(AudioConst.SOUND_BGM_HISTORY_HERO_TRAIN)
end

function HistoryHeroTrainView:onExit()
	if self._starFormationUpdate then
		self._starFormationUpdate:remove()
		self._starFormationUpdate = nil
	end
end

function HistoryHeroTrainView:updateUI(bAnimate)
	self:_updateAwakenLayer()
	self:_updateAttr(bAnimate)
	self:_updateAvatarView()
	self:_updateBtn()
end

function HistoryHeroTrainView:_initBaseView()
	self:_initNoDataUI()
	self:_initStarListView()
end

--初始纵向列表
function HistoryHeroTrainView:_initStarListView()
	local function createIcon(icon, isHeroBust)
		local iconBg = ccui.Widget:create()
		local iconBgSize = cc.size(114, 108)
		if isHeroBust then
			iconBgSize = cc.size(100, 127)
		end
		iconBg:setContentSize(iconBgSize)
		icon:setPosition(cc.p(iconBgSize.width / 2, iconBgSize.height / 2))
		iconBg:addChild(icon)
		return iconBg
	end

	self._leftIcons = {}
	self._heroIcons = {}
	self._listViewLineup:setScrollBarEnabled(false)

	local heroIds = G_UserData:getTeam():getHeroIds()
	for i = 1, #heroIds do
		if i <= 6 then --前6个是武将Icon
			if heroIds[i] > 0 then
				local icon = TeamHeroBustIcon.new(i, handler(self, self._onLeftIconClicked))
				local iconBg = createIcon(icon, true)
				self._listViewLineup:pushBackCustomItem(iconBg)
				-- table.insert(self._iconBgs, iconBg)
				table.insert(self._leftIcons, icon)
				table.insert(self._heroIcons, icon)
			end
		end
	end

	self._listViewLineup:setBounceEnabled(#heroIds <= 4)
	self:_updateHeroIcons()
	self:_updateLeftIconsSelectedState()
end

--初始加号按钮
function HistoryHeroTrainView:_initNoDataUI()
	local UIActionHelper = require("app.utils.UIActionHelper")
	UIActionHelper.playBlinkEffect(self._btnAddHero, nil, {scale1=1.2, scale2=1.4})
	self._btnAddHero:setVisible(false)
end

--初始按钮
function HistoryHeroTrainView:_initBtn()
	self._buttonReplace:setString(Lang.get("historyhero_replace"))
end

----------------------------------------------------------
--刷新立绘
function HistoryHeroTrainView:_updateAvatarView()
	local curIndex = self._pos
	if self._heroList == nil or rawget(self._heroList, curIndex) == nil then
		self._nodeAvatar:removeAllChildren()
		self._btnAddHero:setVisible(true)

		local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, "space")
		self:_showBtnAddRedPoint(reach)
		return
	end

	if not self._heroList[curIndex] then
		return
	end

	self._btnAddHero:setVisible(false)
	local avatar = HistoryHeroAvatar.new()
	avatar:updateUI(self._heroList[curIndex]:getConfig(), false)
	self._nodeAvatar:removeAllChildren()
	self._nodeAvatar:addChild(avatar)
	avatar:setTouchCallback(handler(self, self._onAvatarClicked))
end

--刷新按钮
function HistoryHeroTrainView:_updateBtn()
	local curIndex = self._pos
	if self._heroList[curIndex] then
		self._buttonReplace:setVisible(true)
		self._nodeAttr:setVisible(true)
	else
		self._buttonReplace:setVisible(false)
		self._nodeAttr:setVisible(false)
	end
	if self._heroList[curIndex] then
		local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, "strongerThanMe", self._heroList[curIndex])
		self._buttonReplace:showRedPoint(reach)
	else
		self._buttonReplace:showRedPoint(false)
	end
end

----------------------------觉醒、突破layer------------------------------
function HistoryHeroTrainView:_initAwakenLayer()
	self._awakenLayer = HistoryHeroTrainAwakeLayer.new()
	self._awakenLayer:setStatusChangeCallback(handler(self, self._onHeroStatusChageCallback))
	self._nodeLayer:addChild(self._awakenLayer)
end

--刷新觉醒、突破layer
function HistoryHeroTrainView:_updateAwakenLayer()
	local curIndex = (self._pos)
	self._awakenLayer:updateUI(self._heroList[curIndex], self._isDoOnformation)
	if self._heroList == nil or table.nums(self._heroList) <= 0 then
		self._awakenLayer:setWeaponVisible(false)
	end
end

-- 装备/觉醒 回调，刷新左侧列表
function HistoryHeroTrainView:_onHeroStatusChageCallback(unitData, bAttrChanged, bUnload)
	self:_refreshData()
	-- self:updateUI()

	if bAttrChanged then
		self:_updateAttrDiff(unitData)
		self:_playPrompt(unitData, bUnload)
		self:_playPowerPromt()
	end
	self:_recordTotalPower()
end

----------------------------------------------------------
--刷新属性
function HistoryHeroTrainView:_updateAttr(bAnimate)
	local curIndex = (self._pos)
	local heroUnitData = self._heroList[curIndex]
	if not heroUnitData then
		heroUnitData = 	self:_createFakeData()
	end
	local limitLevel = heroUnitData:getBreak_through()
	local heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(heroUnitData:getConfig().id, limitLevel)

	--属性描述
	self._labelFormation:setString("")
	if bAnimate then
		self._labelAttr1:updateTxtValue(heroStepInfo.atk)
		self._labelAttr2:updateTxtValue(heroStepInfo.hp)
		self._labelAttr3:updateTxtValue(heroStepInfo.pdef)
		self._labelAttr4:updateTxtValue(heroStepInfo.mdef)
	else
		self._labelAttr1:setString(heroStepInfo.atk)
		self._labelAttr2:setString(heroStepInfo.hp)
		self._labelAttr3:setString(heroStepInfo.pdef)
		self._labelAttr4:setString(heroStepInfo.mdef)
	end

	local widthDiff = self._labelFormation:getContentSize().width - 70
	self._attrBg:setContentSize(cc.size(581.00 + widthDiff, 32))
	local position = {80, 208, 336, 464}--原始位置
	for i = 1, 4 do
		self["_node" .. i]:setPositionX(position[i] + widthDiff)
	end
	
	--技能描述
	local HeroSkillActiveConfig = require("app.config.hero_skill_active")
	local skillConfig = HeroSkillActiveConfig.get(heroStepInfo.skill_id)
	local skillDes = "["..skillConfig.name.."]"..skillConfig.description
	if self._skillDesc == nil then
		self._skillDesc = cc.Label:createWithTTF("", Path.getCommonFont(), 20)
		self._skillDesc:setAlignment(cc.TEXT_ALIGNMENT_CENTER)
		self._skillDesc:setColor(Colors.NUMBER_WHITE)
		self._skillDesc:setWidth(520)
		self._skillDesc:setAnchorPoint(cc.p(0.5, 1))
		self._skillDesc:setPosition(self._nodeDes:getPosition())
		self._nodeAttr:addChild(self._skillDesc)
	end
	self._skillDesc:setString(skillDes)

	self:_recordAttr(heroUnitData)
end

-------------------------------------------------------------------------
--------------------------------回调-------------------------------------
-------------------------------------------------------------------------
function HistoryHeroTrainView:_onButtonClick(sender)
	local funcId =  sender:getTag()
	if funcId > 0 then
		local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	    WayFuncDataHelper.gotoModuleByFuncId(funcId)
	end
end

--加号按钮
function HistoryHeroTrainView:_onButtonAdd(sender)
	self:_recordTotalPower()
	local function okCallback(id)
		self._isDoOnformation = true
		G_UserData:getHistoryHero():c2sStarEquip(id, self._pos - 1)
	end

	local notInFormationList = G_UserData:getHistoryHero():getNotInFormationList()
	if #notInFormationList == 0 then
		--未上阵列表为空
		local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
		PopupItemGuider:updateUI(TypeConvertHelper.TYPE_HISTORY_HERO, HistoryHeroConst.DEFAULT_HISTORY_HERO_ID)
		PopupItemGuider:openWithAction()
	else
		--选择
		local PopupChooseHistoricalItemView = require("app.scene.view.historyhero.PopupChooseHistoricalItemView").new(
															HistoryHeroConst.TAB_TYPE_HERO, nil, okCallback)
		PopupChooseHistoricalItemView:open()
	end
end

--替换按钮
function HistoryHeroTrainView:_onButtonReplace(sender)
	self:_recordTotalPower()
	local function okCallback(id)
		G_UserData:getHistoryHero():c2sStarEquip(id, self._pos - 1)
	end

	local curHeroUnitData = self._heroList[self._pos]
	local PopupChooseHistoricalItemView = require("app.scene.view.historyhero.PopupChooseHistoricalItemView").new(
													HistoryHeroConst.TAB_TYPE_HERO, curHeroUnitData, okCallback)
	PopupChooseHistoricalItemView:open()
end


--点击左侧Icon
function HistoryHeroTrainView:_onLeftIconClicked(pos)
	local iconData = TeamViewHelper.getHeroAndPetIconData()
	local info = iconData[pos]
	if info.type == TypeConvertHelper.TYPE_HERO then
		local state = G_UserData:getTeam():getStateWithPos(pos)
		if state == TeamConst.STATE_HERO then
			-- local curPos = G_UserData:getTeam():getCurPos()
			-- if pos == curPos then
			-- 	return
			-- end
			self._pos = pos
			self:_updateLeftIconsSelectedState()
			self:updateUI(false)
		elseif state == TeamConst.STATE_OPEN then
		elseif state == TeamConst.STATE_LOCK then
			G_Prompt:showTip(Lang.get("team_not_unlock_tip"))
		end
	end
end

-- --装备
-- function HistoryHeroTrainView:_onButtonEquip()
-- 	local PopupChooseHistoryHeroEquip = require("app.scene.view.historyherolist.PopupChooseHistoryHeroEquip")
--     local popup = PopupChooseHistoryHeroEquip.new(self)
--     -- popup:setTitle(Lang.get("horse_equip_wear_title"))                
--     -- popup:updateUI(PopupChooseHorseEquipHelper.FROM_TYPE2, callBack, totalList, nil, noWearList, equipPos)
--     popup:openWithAction()
-- end



-- 阵容变化
function HistoryHeroTrainView:_onStarFormationUpdate(id, message)
	self:_refreshData()
	self:updateUI()
	--总战力
	self:_playPowerPromt()
	self:_recordTotalPower()
	self._isDoOnformation = false
end

--返回按钮
function HistoryHeroTrainView:_setCallback()
	G_UserData:getTeamCache():setShowHistoryHeroFlag(true)
	G_SceneManager:popScene()
end

--立绘点击
function HistoryHeroTrainView:_onAvatarClicked()
	local heroData = self._heroList[self._pos]
	local isHave = true
	local list = {}
	table.insert(list, {cfg = heroData:getConfig(), isHave = isHave})
	local PopupHeroDetail = require("app.scene.view.historyhero.PopupHistoryHeroDetail").new(
		TypeConvertHelper.TYPE_HISTORY_HERO, nil, list, false, 1, heroData:getConfig().id)
	PopupHeroDetail:openWithAction()
end
-------------------------------------------------------------------------
--------------------------------阵容相关----------------------------------
-------------------------------------------------------------------------
--更新武将列表中Icon的选中状态
function HistoryHeroTrainView:_updateLeftIconsSelectedState()
	local curPos = self._pos
	for i, icon in ipairs(self._leftIcons) do
		if i == self._pos then
			icon:setSelected(true)
		else
			icon:setSelected(false)
		end
	end
	if curPos >= 1 and curPos <= 4 then
		self._listViewLineup:jumpToTop()
	elseif curPos >= 5 and curPos <= 7 then
		self._listViewLineup:jumpToBottom()
	end
end

--更新武将Icon列表
function HistoryHeroTrainView:_updateHeroIcons()
	local iconData = TeamViewHelper.getHeroIconData()
	for i = 1, #self._heroIcons do		
		local icon = self._heroIcons[i]
		local data = iconData[i]
		icon:updateIcon(data.type, data.value, data.funcId, data.limitLevel, data.limitRedLevel)
	end
end

-------------------------------------------------------------------------
--------------------------------方法-------------------------------------
-------------------------------------------------------------------------
--获取装备的武将名字
function HistoryHeroTrainView:_getEquipedHeroName(pos)
	if pos then
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local curHeroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		local curHeroData = G_UserData:getHero():getUnitDataWithId(curHeroId)
		local baseId = curHeroData:getBase_id()
		if pos == 1 then
			return Lang.get("main_role")
		else
			local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO,
				curHeroData:getBase_id(), nil, nil, curHeroData:getLimit_level(), curHeroData:getLimit_rtg())
			return heroParam.name
		end
	end
	return ""
end

--获取装备的武将参数
function HistoryHeroTrainView:_getEquipedHeroParam(pos)
	if pos then
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local curHeroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		local curHeroData = G_UserData:getHero():getUnitDataWithId(curHeroId)
		local baseId = curHeroData:getBase_id()
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO,
			curHeroData:getBase_id(), nil, nil, curHeroData:getLimit_level(), curHeroData:getLimit_rtg())
		return heroParam
	end
end


function HistoryHeroTrainView:_createFakeData()
	local HistoryHeroUnit = require("app.data.HistoryHeroUnit")
	local unit = HistoryHeroUnit.new()
	unit:createFakeUnit(HistoryHeroConst.DEFAULT_HISTORY_HERO_ID)
	return unit
end

function HistoryHeroTrainView:_createAnimation()
	G_EffectGfxMgr:applySingleGfx(self._panelLeft, "smoving_lidaimingjiangui_left", nil, nil, nil)
	G_EffectGfxMgr:applySingleGfx(self._nodeCenter, "smoving_lidaimingjiangui_lihui", nil, nil, nil)
	G_EffectGfxMgr:applySingleGfx(self._nodeLayer, "smoving_lidaimingjiangui_right", nil, nil, nil)
	G_EffectGfxMgr:applySingleGfx(self._nodeAttr, "smoving_lidaimingjiangui_weizi", nil, nil, nil)
	self._nodeEffect:removeAllChildren()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
		if effect == "effect_lidaimingjiangui_beijingtihuan" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiangui_beijingtihuan")
            subEffect:play()
            return subEffect
		else
			return cc.Node:create()
		end
    end
    local function eventFunction(event)
		if event == "finish" then
			--背景换掉
			self._effectShow:pause()
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_lidaimingjiang_bgruchang", effectFunction, eventFunction , false )
	self._effectShow = effect
end

function HistoryHeroTrainView:_updateRedPoint()
	local bcannotChange, state = self:_isCanChange()
	self["_imageChangeRP"]:setVisible(bcannotChange)
	self["_imageUnloadRP"]:setVisible(not bcannotChange and state ~= HistoryHeroConst.TYPE_EQUIP_0)
end


function HistoryHeroTrainView:_refreshData()
	self._heroList = G_UserData:getHistoryHero():getOnFormationList()
end

--激活技能飘字
function HistoryHeroTrainView:_playPrompt(heroUnitData, bUnload)
	local summary = {}

	local content = Lang.get("historyhero_awaken_success")
	if heroUnitData:getBreak_through() == 3 then
		content = Lang.get("historyhero_break_success")
	end
	if bUnload then
		content = Lang.get("historyhero_unload_success")
	end
	local param = {
			content = content,
			anchorPoint = cc.p(0.5, 0.5),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_HISTORYHERO}
		}
	table.insert(summary, param)

	local limitLevel = heroUnitData:getBreak_through()
	local heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(heroUnitData:getConfig().id, limitLevel)
	local HeroSkillActiveConfig = require("app.config.hero_skill_active")
	local skillConfig = HeroSkillActiveConfig.get(heroStepInfo.skill_id)
	local skill = "["..skillConfig.name.."]"..skillConfig.description
	local skillName = skillConfig.name
	local color =  Colors.colorToNumber(Colors.getColor(2))
	local outlineColor = Colors.colorToNumber(Colors.getColorOutline(2))
	local param = {
		content = Lang.get("historyhero_all_skill", {skill = skillName, color = color, outlineColor = outlineColor}),
		anchorPoint = cc.p(0.5, 0.5),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_HISTORYHERO },
		dstPosition = UIHelper.convertSpaceFromNodeToNode(self._nodeDes, self),
		finishCallback = function()
			if self._heroList[self._pos] and heroUnitData:getId() == self._heroList[self._pos]:getId() then
				self._skillDesc:doScaleAnimation()
				self._skillDesc:setString(skill)
			end
		end,
	}
	table.insert(summary, param)

	local summary = self:_playAttrPrompt(heroUnitData, summary)
	
	G_Prompt:showSummary(summary)
end

--属性飘字
function HistoryHeroTrainView:_playAttrPrompt(heroUnitData, summary)
	-- local self._attrDiff = {
	-- 	{name = Lang.get("historyhero_all_atk"), value = 10, newValue=12},
	-- 	{name = Lang.get("historyhero_all_hp"), value = 20, newValue=33},
	-- 	{name = Lang.get("historyhero_all_pdef"), value = 30, newValue=44},
	-- 	{name = Lang.get("historyhero_all_mdef"), value = 40, newValue=55},
	-- }
	for i, item in ipairs(self._attrDiff) do
		if item ~= 0 then
			local diff = item.newValue - item.value
			local color = diff >= 0 and Colors.colorToNumber(Colors.getColor(2)) or Colors.colorToNumber(Colors.getColor(6))
			local outlineColor = diff >= 0 and Colors.colorToNumber(Colors.getColorOutline(2)) or Colors.colorToNumber(Colors.getColorOutline(6))
			local attr = diff >= 0 and (item.name .. "+" .. diff) or (item.name .. diff)
			local param = {
				content = Lang.get("historyhero_all_attr", {attr = attr, color = color, outlineColor = outlineColor}),
				anchorPoint = cc.p(0.5, 0.5),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_HISTORYHERO},
				dstPosition = UIHelper.convertSpaceFromNodeToNode(self["_labelAttr"..i], self),
				finishCallback = function()
					if self._heroList[self._pos] and heroUnitData:getId() == self._heroList[self._pos]:getId() then
						self["_labelAttr"..i]:updateTxtValue(item.newValue)	
					end
				end,
			}
			table.insert(summary, param)
			self._attrDiff[i].value = self._attrDiff[i].newValue
		end
		-- self._attrDiff[i].curValue = item.newValue
	end
	return summary
end

function HistoryHeroTrainView:_recordAttr(heroUnitData)
	local limitLevel = heroUnitData:getBreak_through()
	local heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(heroUnitData:getConfig().id, limitLevel)
	self._attrDiff = 
	{
		{name = Lang.get("historyhero_all_atk"), 	value = heroStepInfo.atk,  newValue = 0, curValue = 0},
		{name = Lang.get("historyhero_all_hp"), 	value = heroStepInfo.hp,   newValue = 0, curValue = 0},
		{name = Lang.get("historyhero_all_pdef"), 	value = heroStepInfo.pdef, newValue = 0, curValue = 0},
		{name = Lang.get("historyhero_all_mdef"), 	value = heroStepInfo.mdef, newValue = 0, curValue = 0},
	}
end

function HistoryHeroTrainView:_updateAttrDiff(heroUnitData)
	local limitLevel = heroUnitData:getBreak_through()
	local heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(heroUnitData:getConfig().id, limitLevel)
	self._attrDiff[1].newValue = heroStepInfo.atk
	self._attrDiff[2].newValue = heroStepInfo.hp
	self._attrDiff[3].newValue = heroStepInfo.pdef 
	self._attrDiff[4].newValue = heroStepInfo.mdef 
end

--记录总战力
function HistoryHeroTrainView:_recordTotalPower()
	local totalPower = G_UserData:getBase():getPower()
	self._diffPower = totalPower - self._lastTotalPower
	self._lastTotalPower = totalPower
end

--[[
--相同历代名将弹框提示
function HistoryHeroTrainView:_sameHistoryHeroAlertProc(heroUnitData, pos)
	--当前名将护佑xx中，是否替换
	local function onCallBackFunc()
		G_UserData:getHistoryHero():c2sStarEquip(heroUnitData:getId(), self._pos - 1)
	end

	local paramCfg = self:_getEquipedHeroParam(pos)

	local richList = {}
	
	local richText1 = ""
	if paramCfg.icon_color_outline_show then
		richText1 = Lang.get("historyhero_same_alert",
		{
			heroName = paramCfg.name,
			itemColor = Colors.colorToNumber(paramCfg.icon_color),
			outlineColor = Colors.colorToNumber(paramCfg.icon_color_outline),
		})
	else
		richText1 = Lang.get("historyhero_same_alert_no_outline",
		{
			heroName = paramCfg.name,
			itemColor = Colors.colorToNumber(paramCfg.icon_color),
		})
	end
	
	table.insert( richList, richText1)
	
	local PopupAlert = require("app.ui.PopupAlert").new(Lang.get("common_title_notice"),"", onCallBackFunc)
    PopupAlert:addRichTextList(richList)
	PopupAlert:openWithAction()
end
]]--

--播放战斗力变化
function HistoryHeroTrainView:_playPowerPromt()
	local totalPower = G_UserData:getBase():getPower()
	local node = CSHelper.loadResourceNode(Path.getCSB("CommonPowerPrompt", "common"))
	node:updateUI(totalPower, totalPower - self._lastTotalPower)
	node:play(0, 0)
end

--播放战斗力变化
function HistoryHeroTrainView:_showBtnAddRedPoint(bShow)
	self._btnAddRedpoint:setVisible(bShow)
end


return HistoryHeroTrainView