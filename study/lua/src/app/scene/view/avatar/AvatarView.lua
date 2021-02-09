--
-- Author: Liangxu
-- Date: 2017-12-25 14:23:21
-- 变身卡
local ViewBase = require("app.ui.ViewBase")
local AvatarView = class("AvatarView", ViewBase)
local AvatarIcon = require("app.scene.view.avatar.AvatarIcon")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local AvatarDetailBaseAttrModule = require("app.scene.view.avatar.AvatarDetailBaseAttrModule")
local AvatarDetailAttrModule = require("app.scene.view.avatar.AvatarDetailAttrModule")
local AvatarDetailSkillModule = require("app.scene.view.avatar.AvatarDetailSkillModule")
local AvatarDetailTalentModule = require("app.scene.view.avatar.AvatarDetailTalentModule")
local AvatarDetailInstrumentFeatureModule = require("app.scene.view.avatar.AvatarDetailInstrumentFeatureModule")
local AvatarDetailCombinationModule = require("app.scene.view.avatar.AvatarDetailCombinationModule")
local AvatarDetailBriefModule = require("app.scene.view.avatar.AvatarDetailBriefModule")
local CSHelper = require("yoka.utils.CSHelper")
local FunctionConst = require("app.const.FunctionConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HeroDetailSkillModule = require("app.scene.view.heroDetail.HeroDetailSkillModule")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local HeroDetailTalentModule = require("app.scene.view.heroDetail.HeroDetailTalentModule")
local HeroDetailWeaponModule = require("app.scene.view.heroDetail.HeroDetailWeaponModule")
local HeroDetailBriefModule = require("app.scene.view.heroDetail.HeroDetailBriefModule")
local UIConst = require("app.const.UIConst")

function AvatarView:ctor(avatarId, isFormTeamView)
	local curAvatarId = avatarId or 0
	G_UserData:getAvatar():setCurAvatarId(curAvatarId)
	self._isFormTeamView = isFormTeamView or false --是否从阵容界面进来，关系到是否设置飘字标记

	local resource = {
		file = Path.getCSB("AvatarView", "avatar"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonGet = {
				events = {{event = "touch", method = "_onButtonGetClicked"}}
			},
			_buttonWear = {
				events = {{event = "touch", method = "_onButtonWearClicked"}}
			},
		}
	}
	
	AvatarView.super.ctor(self, resource)
end

function AvatarView:onCreate()
	self:_initData()
	self:_initView()
end

function AvatarView:onEnter()
	self._signalAvatarEquip = G_SignalManager:add(SignalConst.EVENT_AVATAR_EQUIP_SUCCESS, handler(self, self._avatarEquipSuccess))
	self:_calCurIndex()
	self:_updateData()
	self:_initIcons()
	self:_updateView()
	self:_locationIcon()
end

function AvatarView:onExit()
	self._signalAvatarEquip:remove()
	self._signalAvatarEquip = nil
end

function AvatarView:_initData()
	self._curIndex = 1
	self._curData = nil
end

function AvatarView:_calCurIndex()
	self._allAvatarIds = AvatarDataHelper.getAllAvatarIds()
	local curAvatarId = G_UserData:getAvatar():getCurAvatarId()
	if curAvatarId > 0 then --有指定的
		for i, id in ipairs(self._allAvatarIds) do
			if id == curAvatarId then
				self._curIndex = i
				break
			end
		end
	elseif G_UserData:getBase():isEquipAvatar() then --装备了变身卡
		local avatarBaseId = G_UserData:getBase():getAvatar_base_id()
		for i, id in ipairs(self._allAvatarIds) do
			if id == avatarBaseId then
				self._curIndex = i
				break
			end
		end
	end
end

function AvatarView:_initView()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_bianshenka")
	self._buttonGet:setString(Lang.get("avatar_btn_get"))
	self._buttonWear:setString(Lang.get("avatar_btn_wear"))
	self._buttonBook:updateUI(FunctionConst.FUNC_HAND_BOOK)
	self._buttonBook:addClickEventListenerEx(handler(self, self._onButtonBookClicked))

	local roleId = G_UserData:getTeam():getHeroIdWithPos(1)
	local unitData = G_UserData:getHero():getUnitDataWithId(roleId)
	local roleBaseId = unitData:getBase_id()
	local rank = unitData:getRank_lv()
	self._fileNodeName:setName(roleBaseId, rank)
	self._fileNodeAvatar:setScale(1.4)
end

function AvatarView:_initIcons()
	self._allIcons = {}
	self._allItems = {}
	self._listViewIcon:removeAllChildren()
	for i, avatarId in ipairs(self._allAvatarIds) do
		local icon = AvatarIcon.new(i, handler(self, self._onClickAvatarIcon))
		table.insert(self._allIcons, icon)

		local widget = ccui.Widget:create()
		local lastIconSize = cc.size(icon:getContentSize().width, icon:getContentSize().height+30)
		local iconSize = i == #self._allAvatarIds and lastIconSize or icon:getContentSize() --最后一个要大一些
		local offset = i == #self._allAvatarIds and 0 or 15
		widget:setContentSize(iconSize)
		icon:setPosition(cc.p(iconSize.width/2, iconSize.height/2-offset))
		widget:addChild(icon)
		self._listViewIcon:pushBackCustomItem(widget)
		table.insert(self._allItems, widget)
	end
end

function AvatarView:_reorderIcons()
	self._listViewIcon:doLayout()

	local curItem = self._allItems[self._curIndex]
	curItem:setLocalZOrder(10000)
	for i = self._curIndex-1, 1, -1 do
		local item = self._allItems[i]
		local zorder = 1000 - (#self._allItems - i)
		item:setLocalZOrder(zorder)
	end
	for i = self._curIndex+1, #self._allItems do
		local item = self._allItems[i]
		local zorder = 1000 - i
		item:setLocalZOrder(zorder)
	end
end

function AvatarView:_updateData()
	local avatarId = self._allAvatarIds[self._curIndex]
	local unitData = G_UserData:getAvatar():getUnitDataWithBaseId(avatarId)
	if unitData then
		self._curData = unitData
	else
		local data = {base_id = avatarId}
		self._curData = G_UserData:getAvatar():createTempAvatarUnitData(data)
	end
	G_UserData:getAttr():recordPower()
end

function AvatarView:_updateView()
	self:_updateAvatarIcon()
	self:_updateName()
	self:_updateShow()
	self:_updateWearState()
	self:_updateListView()

	local reach = AvatarDataHelper.isCanActiveBook()
	self._buttonBook:showRedPoint(reach)
end

function AvatarView:_locationIcon()
	local tempHeight = self._listViewIcon:getContentSize().height / 2
	local iconHeight = self._allIcons[1]:getContentSize().height
	local topHeight = (self._curIndex - 0.5) * iconHeight
	local bottomHeight = (#self._allIcons - self._curIndex + 0.5) * iconHeight
	if topHeight < tempHeight then
		self._listViewIcon:jumpToTop()
	elseif bottomHeight < tempHeight then
		self._listViewIcon:jumpToBottom()
	else
		self._listViewIcon:jumpToItem(self._curIndex - 1, cc.p(0, 0.5), cc.p(0, 0.5))
	end
end

function AvatarView:_updateAvatarIcon()
	for i, icon in ipairs(self._allIcons) do
		local avatarId = self._allAvatarIds[i]
		icon:updateUI(avatarId)
		icon:setSelected(i == self._curIndex)
	end
	self:_reorderIcons()
end

function AvatarView:_updateName()
	local baseId = self._curData:getBase_id()
	local param = nil
	local rank = nil
	if baseId == 0 then
		local roleId = G_UserData:getTeam():getHeroIdWithPos(1)
		local unitData = G_UserData:getHero():getUnitDataWithId(roleId)
		param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, unitData:getBase_id())
        rank = unitData:getRank_lv()
        
        self._fileNodeName:setVisible(true)
        self._textAvatarName:setVisible(false)
	else
        param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_AVATAR, baseId)

        self._textAvatarName:setString(param.name)
        self._textAvatarName:setColor(Colors.COLOR_QUALITY[param.color])
        self._textAvatarName:setVisible(true)
        self._fileNodeName:setVisible(false)
	end
	self._fileNodeName2:setName(baseId, rank)
    -- self._textName:setString(param.name)
    -- self._imageName:setVisible(baseId > 0)
end

function AvatarView:_updateShow()
	local avatarId = self._curData:getBase_id()
	local info = AvatarDataHelper.getAvatarConfig(avatarId)
	local heroBaseId = info.hero_id
	if avatarId == 0 then
		heroBaseId = G_UserData:getHero():getRoleBaseId()
	end

    self._fileNodeAvatar:updateUI(avatarId)
    self._fileNodeAvatar:resetImageTalk()
    local limitLevel = 0
    if info.limit == 1 then
    	limitLevel = require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
    end
    local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, nil, nil, limitLevel)
	local actionName = param.res_cfg.show_action
	self._fileNodeAvatar:playAnimationOnce(actionName, function()
		self._fileNodeAvatar:setBubble(info.talk)
	end)
    
	G_HeroVoiceManager:playVoiceWithHeroId(heroBaseId)
end

function AvatarView:_updateWearState()
	self._buttonGet:setVisible(false)
	self._buttonWear:setVisible(false)
	self._imageWear:setVisible(false)

	local baseId = self._curData:getBase_id()
	if baseId == 0 then
		local isEquiped = not G_UserData:getBase():isEquipAvatar() -- 没装备表示装备了自己
		if isEquiped then
			self._imageWear:setVisible(true)
		else
			self._buttonWear:setVisible(true)
		end
	else
		local isHave = G_UserData:getAvatar():isHaveWithBaseId(baseId)
		if isHave then
			local isEquiped = self._curData:isEquiped()
			if isEquiped then
				self._imageWear:setVisible(true)
			else
				self._buttonWear:setVisible(true)
				local redValue = AvatarDataHelper.isBetterThanCurEquiped(self._curData)
				self._buttonWear:showRedPoint(redValue)
			end
		else
			self._buttonGet:setVisible(true)
		end
	end
end

function AvatarView:_updateListView()
	self._listView:removeAllChildren()
	if self._curData:getBase_id() == 0 then
		self:_updateListSpecial()
	else
		self:_updateListCommon()
	end
	
	self._listView:doLayout()
end

function AvatarView:_updateListSpecial()
	local skillIds = {}
	local roleId = G_UserData:getTeam():getHeroIdWithPos(1)
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(roleId)
	local rankLevel = heroUnitData:getRank_lv()
	local limitLevel = heroUnitData:getLimit_level()
	local heroRankConfig = HeroDataHelper.getHeroRankConfig(heroUnitData:getBase_id(), rankLevel, limitLevel)
	for i = 1, 3 do
		local skillId = heroRankConfig["rank_skill_"..i]
		if skillId ~= 0 then
			table.insert(skillIds, skillId)
		end
	end
	if #skillIds > 0 then
		local skillModule = HeroDetailSkillModule.new(skillIds)
		self._listView:pushBackCustomItem(skillModule)
	end

	--天赋
	if heroUnitData:isCanBreak() then
		local talentModule = HeroDetailTalentModule.new(heroUnitData, true)
		self._listView:pushBackCustomItem(talentModule)
	end

	--神兵
	local baseId = heroUnitData:getConfig().instrument_id
	if baseId > 0 then
		local weaponModule = HeroDetailWeaponModule.new(heroUnitData)
		self._listView:pushBackCustomItem(weaponModule)
	end

	--简介
	local briefModule = HeroDetailBriefModule.new(heroUnitData)
	self._listView:pushBackCustomItem(briefModule)
end

function AvatarView:_updateListCommon()
	self:_buildBaseAttrModule()
	self:_buildSkillModule()
	self:_buildTalentModule()
	self:_buildInstrumentFeatureModule()
	self:_buildCombinationModule()
	self:_buildBriefModule()
end

function AvatarView:_buildBaseAttrModule()
	local moduleItem = AvatarDetailBaseAttrModule.new()
	moduleItem:updateUI(self._curData)
	self._listView:pushBackCustomItem(moduleItem)
end

function AvatarView:_buildSkillModule()
	local moduleItem = AvatarDetailSkillModule.new()
	moduleItem:updateUI(self._curData)
	self._listView:pushBackCustomItem(moduleItem)
end

function AvatarView:_buildTalentModule()
	local moduleItem = AvatarDetailTalentModule.new()
	moduleItem:updateUI(self._curData)
	self._listView:pushBackCustomItem(moduleItem)
end

function AvatarView:_buildInstrumentFeatureModule()
	local moduleItem = AvatarDetailInstrumentFeatureModule.new()
	moduleItem:updateUI(self._curData)
	self._listView:pushBackCustomItem(moduleItem)
end

function AvatarView:_buildCombinationModule()
	local strShowId = self._curData:getConfig().show_id
	local showIds = {}
	if strShowId ~= "" and strShowId ~= "0" then
		showIds = string.split(strShowId, "|")
	end
	for i, showId in ipairs(showIds) do
		local moduleItem = AvatarDetailCombinationModule.new()
		moduleItem:setTitle(i)
		moduleItem:updateUI(tonumber(showId))
		self._listView:pushBackCustomItem(moduleItem)
	end
end

function AvatarView:_buildBriefModule()
	local moduleItem = AvatarDetailBriefModule.new()
	moduleItem:updateUI(self._curData)
	self._listView:pushBackCustomItem(moduleItem)
end

function AvatarView:_onClickAvatarIcon(index)
	if index == self._curIndex then
		return
	end
	self._curIndex = index
	self:_updateData()
	self:_updateView()
end

function AvatarView:_onButtonBookClicked()
	G_SceneManager:showScene("avatarBook")
end

function AvatarView:_onButtonGetClicked()
	local popup = require("app.ui.PopupItemGuider").new()
	popup:updateUI(TypeConvertHelper.TYPE_AVATAR, self._curData:getBase_id())
	popup:openWithAction()
end

function AvatarView:_onButtonWearClicked()
	G_UserData:getAvatar():c2sEquipAvatar(self._curData:getId())
end

function AvatarView:_avatarEquipSuccess(eventName, avatarId)
	if self._isFormTeamView then
		G_UserData:getTeamCache():setShowAvatarEquipFlag(true)
	end
	
	self:_updateData()
	self:_updateAvatarIcon()
	self:_updateWearState()
	self:_updateListView()
	self:_playPrompt(avatarId)
end

function AvatarView:_playPrompt(avatarId)
	local summary = {}
	local param = {
		content = Lang.get("summary_avatar_add_success"),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_AVATAR},
	} 
	table.insert(summary, param)

	G_Prompt:showSummary(summary)

	G_Prompt:playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_AVATAR)
end

return AvatarView