--
-- Author: Liangxu
-- Date: 2017-9-13 15:49:15
-- 查看玩家羁绊模块
local ViewBase = require("app.ui.ViewBase")
local UserYokeNode = class("UserYokeNode", ViewBase)
local TeamPartnerIcon = require("app.scene.view.team.TeamPartnerIcon")
local TeamYokeAvatarNode = require("app.scene.view.team.TeamYokeAvatarNode")
local UserDataHelper = require("app.utils.UserDataHelper")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TeamYokeDynamicModule = require("app.scene.view.team.TeamYokeDynamicModule")

function UserYokeNode:ctor(parentView)
	self._parentView = parentView
	local resource = {
		file = Path.getCSB("TeamYokeNode", "team"),
		binding = {
			_buttonPlus = {
				events = {{event = "touch", method = "_onButtonPlus"}}
			},
			_buttonReturn = {
				events = {{event = "touch", method = "_onButtonReturn"}}
			},
		},
	}

	UserYokeNode.super.ctor(self, resource)
end

function UserYokeNode:onCreate()
	self._panelIndex = 1 --1总览，2详情
	self:setScale(0.84)
	self._panelBase:setPositionY(375)
	self._panelOverview:setPositionY(220)
	self._panelBg:setVisible(false)
	self._imageBg:setVisible(false)
	for i = 1, 8 do
		self["_partner"..i] = TeamPartnerIcon.new(self["_fileNodePartner"..i], i) --援军位
	end

	for i = 1, 5 do
		self["_avatar"..i] = TeamYokeAvatarNode.new(self["_fileNodeAvatar"..i]) --武将展示
	end

	self._buttonPlus:setString(Lang.get("hero_yoke_btn_plus"))
	self._buttonReturn:setString(Lang.get("hero_yoke_btn_return"))
end

function UserYokeNode:onEnter()
	
end

function UserYokeNode:onExit()
	
end

function UserYokeNode:updateView(detailData)
	self._detailData = detailData
	local secondHeroDatas = detailData:getHeroDataInReinforcements()
	local heroDatas = detailData:getHeroDataInBattle()
	local partnerInfo = UserDataHelper.getPartnersInfoByUserDetail(secondHeroDatas, detailData)
	for i = 1, 8 do
		local info = partnerInfo[i]
		self["_partner"..i]:onlyShow(info)
	end

	self:_updateTotalCount(heroDatas)
	self:_updateAvatar(heroDatas)
	self:_updateListView(heroDatas)
end

function UserYokeNode:_updateTotalCount(heroDatas)
	local count = UserDataHelper.getActivatedYokeTotalCount(heroDatas)
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

function UserYokeNode:_updateListView(heroDatas)
	self._listView:removeAllItems()

	local allInfo = UserDataHelper.getYokeDetailInfo(heroDatas)
	for i, info in ipairs(allInfo) do
		local title = self:_createDetailTitle(info.heroBaseId, i)
		self._listView:pushBackCustomItem(title)

		local module = TeamYokeDynamicModule.new()
		module:onlyShow(info.yokeInfo)
		self._listView:pushBackCustomItem(module)
	end
end

function UserYokeNode:_createDetailTitle(heroBaseId, index)
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	local name = ""
	local color = 0
	local colorOutline = nil
	if index == 1 then
		name = self._detailData:getName()
		local officeLevel = self._detailData:getOfficeLevel()
		color = Colors.getOfficialColor(officeLevel)
		colorOutline = Colors.getOfficialColorOutlineEx(officeLevel)
	else
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)
		name = heroParam.name
		color = heroParam.icon_color
		if heroParam.icon_color_outline_show then
			colorOutline = heroParam.icon_color_outline
		end
	end
	
	title:setTitle(name)
	title:setTitleColor(color)
	if colorOutline then
		title:setTitleOutLine(colorOutline)
	end
	title:setFontSize(22)
	local widget = ccui.Widget:create()
	local titleSize = cc.size(562, 36)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, titleSize.height / 2)
	widget:addChild(title)

	return widget
end

function UserYokeNode:_updateAvatar(heroDatas)
	local infos = UserDataHelper.getYokeOverviewInfo(heroDatas)
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

function UserYokeNode:_onButtonPlus()
	self._panelIndex = 2
	self:updatePanel()
end

function UserYokeNode:_onButtonReturn()
	self._panelIndex = 1
	self:updatePanel()
end

function UserYokeNode:updatePanel()
	if self._panelIndex == 1 then
		self._panelOverview:setVisible(true)
		self._panelDetail:setVisible(false)
	else
		self._panelOverview:setVisible(false)
		self._panelDetail:setVisible(true)
	end
end

return UserYokeNode