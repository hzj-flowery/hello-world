--
-- Author: Liangxu
-- Date: 2017-03-30 11:14:10
-- 武将羁绊模块
local ViewBase = require("app.ui.ViewBase")
local TeamYokeNode = class("TeamYokeNode", ViewBase)
local TeamPartnerIcon = require("app.scene.view.team.TeamPartnerIcon")
local TeamYokeAvatarNode = require("app.scene.view.team.TeamYokeAvatarNode")
local UserDataHelper = require("app.utils.UserDataHelper")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TeamYokeDynamicModule = require("app.scene.view.team.TeamYokeDynamicModule")
local RedPointHelper = require("app.data.RedPointHelper")
local UIConst = require("app.const.UIConst")

function TeamYokeNode:ctor(parentView)
	self._parentView = parentView

	local resource = {
		file = Path.getCSB("TeamYokeNode", "team"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonPlus = {
				events = {{event = "touch", method = "_onButtonPlus"}}
			},
			_buttonReturn = {
				events = {{event = "touch", method = "_onButtonReturn"}}
			},
		},
	}

	TeamYokeNode.super.ctor(self, resource)
end

function TeamYokeNode:onCreate()
	self._panelIndex = 1 --1总览，2详情
	self._heroDatas = {}

	for i = 1, 8 do
		self["_partner"..i] = TeamPartnerIcon.new(self["_fileNodePartner"..i], i) --援军位
	end

	for i = 1, 5 do
		self["_avatar"..i] = TeamYokeAvatarNode.new(self["_fileNodeAvatar"..i]) --武将展示
	end

	self._buttonPlus:setString(Lang.get("hero_yoke_btn_plus"))
	self._buttonReturn:setString(Lang.get("hero_yoke_btn_return"))
end

function TeamYokeNode:onEnter()
	self._signalChangeHeroSecondFormation = G_SignalManager:add(SignalConst.EVENT_CHANGE_HERO_SECOND_FORMATION, handler(self, self._changeHeroSecondFormation))
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
end

function TeamYokeNode:onExit()
	self._signalChangeHeroSecondFormation:remove()
	self._signalChangeHeroSecondFormation = nil
	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil
end

function TeamYokeNode:updatePartnerIcon(secondHeroDatas)
	local partnerInfo = UserDataHelper.getPartnersInfo(secondHeroDatas)
	for i = 1, 8 do
		local info = partnerInfo[i]
		self["_partner"..i]:updateView(info)
	end
end

function TeamYokeNode:_updateTotalCount()
	local count = UserDataHelper.getActivatedYokeTotalCount(self._heroDatas)
	local desContent = Lang.get("hero_yoke_activated_total_count", {
		count = count,
	})

	local richText = ccui.RichText:createWithContent(desContent)
	richText:setAnchorPoint(cc.p(0.5, 0.5))
	local size = self._panelTotalCountBg:getContentSize()
	richText:setPosition(cc.p(size.width / 2, size.height / 2))
	self._panelTotalCountBg:removeAllChildren()
	self._panelTotalCountBg:addChild(richText)
end

function TeamYokeNode:_updateListView()
	self._listView:removeAllItems()

	local allInfo = UserDataHelper.getYokeDetailInfo(self._heroDatas)
	for i, info in ipairs(allInfo) do
		local title = self:_createDetailTitle(info.heroBaseId)
		self._listView:pushBackCustomItem(title)

		local module = TeamYokeDynamicModule.new()
		module:updateView(info.yokeInfo)
		self._listView:pushBackCustomItem(module)
	end
end

function TeamYokeNode:_createDetailTitle(heroBaseId)
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailNewTitleWithBg", "common"))
	title:setFontName(Path.getCommonFont())
	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)
	title:setTitle(heroParam.name)
	title:setTitleColor(heroParam.icon_color)
	if heroParam.icon_color_outline_show then
		title:setTitleOutLine(heroParam.icon_color_outline)
	end
	title:setFontSize(22)
	local widget = ccui.Widget:create()
	local titleSize = cc.size(562, 36)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, titleSize.height / 2)
	widget:addChild(title)

	return widget
end

function TeamYokeNode:_updateAvatar()
	local infos = UserDataHelper.getYokeOverviewInfo(self._heroDatas)
	for i = 1, 5 do
		local info = infos[i]
		if info then
			self["_avatar"..i]:setVisible(true)
			self["_avatar"..i]:updateView(info.baseId, info.activatedCount, info.totalCount, info.limitLevel, info.limitRedLevel)
		else
			self["_avatar"..i]:setVisible(false)
		end
	end
end

function TeamYokeNode:_onButtonPlus()
	self._panelIndex = 2
	self:updatePanel()
end

function TeamYokeNode:_onButtonReturn()
	self._panelIndex = 1
	self:updatePanel()
end

function TeamYokeNode:updatePanel(heroDatas)
	if heroDatas then
		self._heroDatas = heroDatas
	end
	
	if self._panelIndex == 1 then
		self._panelOverview:setVisible(true)
		self._panelDetail:setVisible(false)

		self:_updateTotalCount()
		self:_updateAvatar()
	else
		self._panelOverview:setVisible(false)
		self._panelDetail:setVisible(true)
		self:_updateListView()
	end
end

function TeamYokeNode:_showRedPoint(visible)
	local secondHeroDatas = G_UserData:getTeam():getHeroDataInReinforcements()
	local partnerInfo = UserDataHelper.getPartnersInfo(secondHeroDatas)
	for i = 1, 8 do
		local info = partnerInfo[i]
		if not info.lock and info.heroData == nil then
			self["_partner"..i]:showRedPoint(visible)
			return
		end
	end
end

function TeamYokeNode:_onEventRedPointUpdate(eventName, funcId)
	self:checkReinforcementPosRP(funcId)
end

function TeamYokeNode:checkReinforcementPosRP(funcId)
	if funcId and funcId == FunctionConst.FUNC_TEAM then
		local reach = RedPointHelper.isModuleSubReach(funcId, "reinforcementPosRP")
		self:_showRedPoint(reach)
	end
end

function TeamYokeNode:_changeHeroSecondFormation(eventName, heroId, oldHeroId)
	local secondHeroDatas = G_UserData:getTeam():getHeroDataInReinforcements()
	local heroDatas = G_UserData:getTeam():getHeroDataInBattle()
	self:updatePartnerIcon(secondHeroDatas)
	self:updatePanel(heroDatas)
	G_UserData:getAttr():recordPower()
	self:_playChangeSecondHeroSummary(heroId, oldHeroId)
end

--播放更换援军飘字
function TeamYokeNode:_playChangeSecondHeroSummary(heroId, oldHeroId)
	local summary = {}

	--援军上阵、更换成功
	local successStr = Lang.get("summary_second_hero_inbattle")
	if oldHeroId and oldHeroId > 0 then
		successStr = Lang.get("summary_second_hero_change")
	end
	local param1 = {
		content = successStr,
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_YOKE},
	} 
	table.insert(summary, param1)

	--羁绊激活
	if heroId and heroId > 0 then
		local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
		local heroBaseId = heroUnitData:getBase_id()
		local count, info = UserDataHelper.getWillActivateYokeCount(heroBaseId, nil, true, true)
		if info then
			for i, one in ipairs(info) do
				local heroParam = one.heroParam
				local content = Lang.get("summary_yoke_active", {
					heroName = heroParam.name,
					colorHero = Colors.colorToNumber(heroParam.icon_color),
					outlineHero = Colors.colorToNumber(heroParam.icon_color_outline),
					yokeName = one.yokeName,
				})
				local param = {
					content = content,
					startPosition = {x = UIConst.SUMMARY_OFFSET_X_YOKE},
				} 
				table.insert(summary, param)
			end
		end
	end

	G_Prompt:showSummary(summary)
	G_Prompt:playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_YOKE, -5)
end

return TeamYokeNode