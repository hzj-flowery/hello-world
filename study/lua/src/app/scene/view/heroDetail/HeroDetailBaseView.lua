--
-- Author: Liangxu
-- Date: 2017-02-28 15:09:42
-- 武将详情
local ViewBase = require("app.ui.ViewBase")
local HeroDetailBaseView = class("HeroDetailBaseView", ViewBase)
local HeroDetailAttrModule = require("app.scene.view.heroDetail.HeroDetailAttrModule")
local HeroDetailJointModule = require("app.scene.view.heroDetail.HeroDetailJointModule")
local HeroDetailSkillModule = require("app.scene.view.heroDetail.HeroDetailSkillModule")
local HeroDetailWeaponModule = require("app.scene.view.heroDetail.HeroDetailWeaponModule")
local HeroDetailTalentModule = require("app.scene.view.heroDetail.HeroDetailTalentModule")
local HeroDetailKarmaModule = require("app.scene.view.heroDetail.HeroDetailKarmaModule")
local HeroDetailYokeModule = require("app.scene.view.heroDetail.HeroDetailYokeModule")
local HeroDetailAwakeModule = require("app.scene.view.heroDetail.HeroDetailAwakeModule")
local HeroDetailBriefModule = require("app.scene.view.heroDetail.HeroDetailBriefModule")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local HeroTrainHelper = require("app.scene.view.heroTrain.HeroTrainHelper")

function HeroDetailBaseView:ctor(heroId, heroBaseId, rangeType, parentView)
	if heroId then
		self._heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	else
		local data = {baseId = heroBaseId}
		self._heroUnitData = G_UserData:getHero():createTempHeroUnitData(data)
	end
	self._rangeType = rangeType
	self._parentView = parentView

	local resource = {
		file = Path.getCSB("HeroDetailBaseView", "hero"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {}
	}

	HeroDetailBaseView.super.ctor(self, resource)
end

function HeroDetailBaseView:onCreate()
	self:_updateInfo()
end

function HeroDetailBaseView:onEnter()
	self._signalHeroKarmaActive =
		G_SignalManager:add(SignalConst.EVENT_HERO_KARMA_ACTIVE_SUCCESS, handler(self, self._heroKarmaActiveSuccess))
end

function HeroDetailBaseView:onExit()
	self._signalHeroKarmaActive:remove()
	self._signalHeroKarmaActive = nil
end

function HeroDetailBaseView:buildAttrModule()
	--基础属性
	local heroUnitData = self._heroUnitData
	self._attrModule = HeroDetailAttrModule.new(heroUnitData, self._rangeType)
	self._listView:pushBackCustomItem(self._attrModule)
end

function HeroDetailBaseView:buildJointModule()
	--合击
	local heroUnitData = self._heroUnitData
	local heroBaseId = heroUnitData:getBase_id()
	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)

	if heroParam.cfg.skill_3_type ~= 0 then --有合击关系
		self._jointModule = HeroDetailJointModule.new(heroUnitData)
		self._listView:pushBackCustomItem(self._jointModule)
	end
end

function HeroDetailBaseView:buildSkillModule()
	--技能
	local heroUnitData = self._heroUnitData
	local skillIds = {}
	local showSkillIds = AvatarDataHelper.getShowSkillIdsByCheck(heroUnitData)
	for i = 1, 3 do
		local skillId = showSkillIds[i]
		if skillId > 0 then
			table.insert(skillIds, skillId)
		end
	end

	if #skillIds > 0 then
		local skillModule = HeroDetailSkillModule.new(skillIds)
		self._listView:pushBackCustomItem(skillModule)
	end
end

--神兵
function HeroDetailBaseView:buildWeaponModule()
	local baseId = self._heroUnitData:getConfig().instrument_id
	if baseId > 0 then
		self._weaponModule = HeroDetailWeaponModule.new(self._heroUnitData)
		self._listView:pushBackCustomItem(self._weaponModule)
	end
end

function HeroDetailBaseView:buildTalentModule()
	--天赋
	local heroUnitData = self._heroUnitData
	if heroUnitData:isCanBreak() then
		self._talentModule = HeroDetailTalentModule.new(heroUnitData)
		self._listView:pushBackCustomItem(self._talentModule)
	end
end

function HeroDetailBaseView:buildKarmaModule()
	local heroUnitData = self._heroUnitData

	self._karmaModule = HeroDetailKarmaModule.new(heroUnitData, self._rangeType)
	self._listView:pushBackCustomItem(self._karmaModule)
end

function HeroDetailBaseView:buildYokeModule()
	local heroUnitData = self._heroUnitData
	local heroYoke = UserDataHelper.getHeroYokeInfo(heroUnitData)
	if heroYoke then
		self._yokeModule = HeroDetailYokeModule.new(heroYoke)
		self._listView:pushBackCustomItem(self._yokeModule)
	end
end

function HeroDetailBaseView:buildDestinyModule()
	--天命
end

--觉醒
function HeroDetailBaseView:buildAwakeModule()
	local heroUnitData = self._heroUnitData
	if heroUnitData:isCanAwake() then
		self._awakeModule = HeroDetailAwakeModule.new(heroUnitData, self._rangeType)
		self._listView:pushBackCustomItem(self._awakeModule)
	end
end

function HeroDetailBaseView:buildBriefModule()
	local heroUnitData = self._heroUnitData
	self._briefModule = HeroDetailBriefModule.new(heroUnitData)
	self._listView:pushBackCustomItem(self._briefModule)
end

function HeroDetailBaseView:_updateInfo()
	local heroUnitData = self._heroUnitData
	local heroBaseId = heroUnitData:getBase_id()

	--名字、品质
	local rank = heroUnitData:getRank_lv()
	local limitLevel = heroUnitData:getLimit_level()
	local limitRedLevel = heroUnitData:getLimit_rtg()
	self._fileNodeHeroName:setName(heroBaseId, rank, limitLevel, nil, limitRedLevel)
	self._fileNodeHeroName2:setName(heroBaseId, rank, limitLevel, true, limitRedLevel)

	--国家
	self._fileNodeCountry:updateUI(heroBaseId)
	--武将定位
	self._fileNodeFeature:setString(heroUnitData:getConfig().feature)

	--觉醒星星
	local canAwake = heroUnitData:isCanAwake()
	local isOpen = HeroTrainHelper.checkIsReachAwakeInitLevel(heroUnitData)
	local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
	local isGold = HeroGoldHelper.isPureHeroGold(heroUnitData)
	local isShow = canAwake and isOpen and not isGold
	self._fileNodeStar:setVisible(isShow)
	if self._parentView then
		self._parentView._fileNodeStar:setVisible(isShow)
	end
	
	if isShow then
		local awakeLevel = heroUnitData:getAwaken_level()
		local star, level = UserDataHelper.convertAwakeLevel(awakeLevel)
		self._fileNodeStar:setStarOrMoon(star)
		if self._parentView then
			self._parentView._fileNodeStar:setStarOrMoon(star)
		end
	end

	self:_updateListView()
end

function HeroDetailBaseView:_updateListView()
	--详情List开始
	self._listView:removeAllChildren()
	--属性
	self:buildAttrModule()
	--合击
	self:buildJointModule()
	--技能
	self:buildSkillModule()
	--天赋
	self:buildTalentModule()
	--神兵
	self:buildWeaponModule()
	--缘分
	self:buildKarmaModule()
	--羁绊
	self:buildYokeModule()
	--天命
	-- self:buildDestinyModule()
	--觉醒天赋
	if not self._heroUnitData:isPureGoldHero() then
		self:buildAwakeModule()
	end
	--简介
	self:buildBriefModule()

	self._listView:doLayout()
end

function HeroDetailBaseView:_heroKarmaActiveSuccess()
	if self._karmaModule then
		self._karmaModule:updateData(self._heroUnitData)
	end
end

return HeroDetailBaseView
