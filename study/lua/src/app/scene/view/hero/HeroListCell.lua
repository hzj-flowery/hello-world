--
-- Author: Liangxu
-- Date: 2017-02-21 13:50:59
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HeroListCell = class("HeroListCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

local TOPIMAGERES = {
	"img_iconsign_shangzhen", --上阵
	"img_iconsign_yuanjun", --援军位
	"img_iconsign_jiban" --羁绊
}

function HeroListCell:ctor()
	local resource = {
		file = Path.getCSB("HeroListCell", "hero"),
		binding = {
			_buttonStrengthen1 = {
				events = {{event = "touch", method = "_onButtonStrengthenClicked1"}}
			},
			_buttonStrengthen2 = {
				events = {{event = "touch", method = "_onButtonStrengthenClicked2"}}
			}
		}
	}
	HeroListCell.super.ctor(self, resource)
end

function HeroListCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._buttonStrengthen1:setString(Lang.get("hero_btn_strengthen"))
	self._buttonStrengthen2:setString(Lang.get("hero_btn_strengthen"))
end

function HeroListCell:update(heroId1, heroId2)
	local function updateCell(index, heroId)
		if heroId then
			if type(heroId) ~= "number" then
				return
			end
			self["_item" .. index]:setVisible(true)
			local data = G_UserData:getHero():getUnitDataWithId(heroId)
			local heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitRedLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(data)
			local limitLevel = avatarLimitLevel or data:getLimit_level()
			local limitRedLevel = arLimitRedLevel or data:getLimit_rtg()
			self["_item" .. index]:updateUI(TypeConvertHelper.TYPE_HERO, heroBaseId)
			self["_item" .. index]:getCommonIcon():getIconTemplate():updateUI(heroBaseId, nil, limitLevel, limitRedLevel)
			self["_item" .. index]:setCallBack(handler(self, self["_onClickIcon" .. index]))
			self:_showTopImage(index, data)

			local params = self["_item" .. index]:getCommonIcon():getItemParams()
			local rank = data:getRank_lv()
			local heroName = params.name
			if rank > 0 then
				if params.color == 7 and limitLevel == 0 and params.type ~= 1 then -- 金将
					heroName = heroName .. " " .. Lang.get("goldenhero_train_text") .. rank
				else
					heroName = heroName .. "+" .. rank
				end
			end
			local name = heroName
			local awakeStar, awakeLevel = UserDataHelper.convertAwakeLevel(data:getAwaken_level())

			if not data:isPureGoldHero() and params.color==7 then
				self["_item" .. index]:setName(name, params.icon_color, params)
			else
				self["_item" .. index]:setName(name, params.icon_color)
			end
			self["_item" .. index]:setTouchEnabled(true)
			if data:isPureGoldHero() then
				self["_nodeLevel" .. index]:updateUI(Lang.get("goldenhero_train_des"), rank, rank)
				self["_nodeLevel" .. index]:setMaxValue("")
			else
				self["_nodeLevel" .. index]:updateUI(
					Lang.get("hero_list_cell_level_des"),
					Lang.get("hero_txt_level", {level = data:getLevel()})
				)
			end
			self["_nodeAwake" .. index]:updateUI(
				Lang.get("hero_list_cell_awake_des"),
				Lang.get("hero_awake_star_level", {star = awakeStar, level = awakeLevel})
			)
			local isAwakeOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE3)
			local isGold = require("app.scene.view.heroGoldTrain.HeroGoldHelper").isPureHeroGold(data)
			self["_nodeAwake" .. index]:setVisible(isAwakeOpen and not isGold)
			self["_buttonStrengthen" .. index]:setVisible(data:isCanTrain())
		else
			self["_item" .. index]:setVisible(false)
		end
	end

	updateCell(1, heroId1)
	updateCell(2, heroId2)
end

function HeroListCell:_showTopImage(index, data)
	local imageTop = self["_imageTop" .. index]
	local isInBattle = data:isInBattle()
	local isInReinforcements = data:isInReinforcements()
	if isInBattle then
		imageTop:loadTexture(Path.getTextSignet(TOPIMAGERES[1]))
		imageTop:setVisible(true)
	elseif isInReinforcements then
		imageTop:loadTexture(Path.getTextSignet(TOPIMAGERES[2]))
		imageTop:setVisible(true)
	else
		local yokeCount = UserDataHelper.getWillActivateYokeCount(data:getBase_id(), nil, true)
		if yokeCount > 0 then
			imageTop:loadTexture(Path.getTextSignet(TOPIMAGERES[3]))
			imageTop:setVisible(true)
		else
			imageTop:setVisible(false)
		end
	end
end

function HeroListCell:_onButtonStrengthenClicked1()
	self:dispatchCustomCallback(1)
end

function HeroListCell:_onButtonStrengthenClicked2()
	self:dispatchCustomCallback(2)
end

function HeroListCell:_onClickIcon1(sender, itemParams)
	if itemParams.cfg.type == 3 then
		local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
		PopupItemGuider:updateUI(TypeConvertHelper.TYPE_HERO, itemParams.cfg.id)
		PopupItemGuider:openWithAction()
	else
		self:dispatchCustomCallback(1)
	end
end

function HeroListCell:_onClickIcon2(sender, itemParams)
	if itemParams.cfg.type == 3 then
		local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
		PopupItemGuider:updateUI(TypeConvertHelper.TYPE_HERO, itemParams.cfg.id)
		PopupItemGuider:openWithAction()
	else
		self:dispatchCustomCallback(2)
	end
end

return HeroListCell
