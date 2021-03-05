-- Author: Conley
-- 英雄属性
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

local CommonHeroProperty = class("CommonHeroProperty")

local MODULE_KEY = {
	"_jointModule",
	"_skillModule",
	"_talentModule",
	"_weaponModule",
	"_karmaModule",
	"_yokeModule",
	"_awakeModule",
	"_briefModule",
}

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonHeroProperty:ctor()
	self._target = nil
end

function CommonHeroProperty:_init()
	self._heroName2 = ccui.Helper:seekNodeByName(self._target, "Name2")
    self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
    self._listView:setScrollBarEnabled(false)
    cc.bind(self._target, "CommonDetailWindow")
	
    if cc.isRegister("CommonHeroName") then
		cc.bind(self._heroName2, "CommonHeroName")
	end
end

function CommonHeroProperty:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHeroProperty:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonHeroProperty:buildAttrModule()
	--基础属性
	local heroUnitData = self._heroUnitData
	self._attrModule = HeroDetailAttrModule.new(heroUnitData, self._rangeType)
	self._listView:pushBackCustomItem(self._attrModule)


end

--合击
function CommonHeroProperty:buildJointModule()
	local heroUnitData = self._heroUnitData
	local heroBaseId = heroUnitData:getBase_id()
	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)

	if heroParam.cfg.skill_3_type ~= 0 then --有合击关系
		self._jointModule = HeroDetailJointModule.new(heroUnitData, true)
		self._listView:pushBackCustomItem(self._jointModule)
	end
end

function CommonHeroProperty:buildSkillModule()
	--技能
	local heroUnitData = self._heroUnitData

	local skillIds = {}
	local limitLevel = self._heroUnitData:getLimit_level()
	local limitRedLevel = self._heroUnitData:getLimit_rtg()
	local heroRankConfig = UserDataHelper.getHeroRankConfig(heroUnitData:getBase_id(), 0, limitLevel, limitRedLevel)
	for i = 1, 3 do
		local skillId = heroRankConfig["rank_skill_"..i]
		if skillId ~= 0 then
			table.insert(skillIds, skillId)
		end
	end
    if heroRankConfig["rank_skill_2"] == 0 and heroRankConfig["rank1_skill_2"] == 0 then
        table.insert(skillIds, heroRankConfig["rank_passive_1"])
    end

	if #skillIds > 0 then
		self._skillModule = HeroDetailSkillModule.new(skillIds)
		self._listView:pushBackCustomItem(self._skillModule)
	end
end

--天赋
function CommonHeroProperty:buildTalentModule()
	local heroUnitData = self._heroUnitData
	if heroUnitData:isCanBreak() then
		self._talentModule = HeroDetailTalentModule.new(heroUnitData, nil, self._limitLevel, nil, nil, self._limitRedLevel)
		self._listView:pushBackCustomItem(self._talentModule)
	end
end

--神兵
function CommonHeroProperty:buildWeaponModule()
	local baseId = self._heroUnitData:getConfig().instrument_id
	if baseId > 0 then
		self._weaponModule = HeroDetailWeaponModule.new(self._heroUnitData)
		self._listView:pushBackCustomItem(self._weaponModule)
	end
end

function CommonHeroProperty:buildKarmaModule()
	local heroUnitData = self._heroUnitData
	
	local isRedOrGold = (self._limitLevel and self._limitLevel > 0) or heroUnitData:getConfig().color >= 6
		or (self._limitRedLevel and self._limitRedLevel>0)
	self._karmaModule = HeroDetailKarmaModule.new(heroUnitData, nil, isRedOrGold)--武将图鉴里设置，isRedOrGold为true则无视名将册cond1 cond2字段。————周振甲
	self._listView:pushBackCustomItem(self._karmaModule)
end

function CommonHeroProperty:buildYokeModule()
	local heroUnitData = self._heroUnitData
	local heroYoke = UserDataHelper.getHeroYokeInfo(heroUnitData)
	if heroYoke then
		self._yokeModule = HeroDetailYokeModule.new(heroYoke)
		self._listView:pushBackCustomItem(self._yokeModule)
	end
end

function CommonHeroProperty:buildAwakeModule()
	local heroUnitData = self._heroUnitData
	if heroUnitData:isCanAwake() then
		self._awakeModule = HeroDetailAwakeModule.new(heroUnitData)
		self._listView:pushBackCustomItem(self._awakeModule)
	end
end


function CommonHeroProperty:buildBriefModule()
	local heroUnitData = self._heroUnitData
	self._briefModule = HeroDetailBriefModule.new(heroUnitData)
	self._listView:pushBackCustomItem(self._briefModule)
end

function CommonHeroProperty:_resetModules()
	self._modules = {}
	for i, key in ipairs(MODULE_KEY) do
		self[key] = nil
	end
end

function CommonHeroProperty:_updateListView()
    --详情List开始
	self._listView:removeAllChildren()
	self:_resetModules()

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

	--觉醒天赋
	if not self._heroUnitData:isPureGoldHero() then
		self:buildAwakeModule()
	end

	--简介
	self:buildBriefModule()
end


function CommonHeroProperty:updateUI(heroId, heroBaseId, rangeType, limitLevel, limitRedLevel)
	local rank = 0
	if heroId then
		self._heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
		rank = self._heroUnitData:getRank_lv()
	else
		local data = {baseId = heroBaseId}
		self._heroUnitData = G_UserData:getHero():createTempHeroUnitData(data)
	end
	self._rangeType = rangeType
	self._limitLevel = limitLevel
	self._limitRedLevel = limitRedLevel

	local moduleKey = self:_getModuleKey()
    self:_updateListView()
    local index, isInBottom = self:_getLocationIndex(moduleKey)
    if isInBottom then
    	self._listView:jumpToBottom()
    else
    	self._listView:jumpToItem(index, cc.p(0, 1), cc.p(0, 1))
    end
  
	self._heroName2:setName(self._heroUnitData:getBase_id(), rank, limitLevel, nil, limitRedLevel)
end

function CommonHeroProperty:_getModuleKey()
	local offset = self._listView:getInnerContainerPosition()
	local posY = offset.y
	local targetHeight = 0 - posY + self._listView:getContentSize().height / 2

	local modules = {}
	for i, key in ipairs(MODULE_KEY) do
		if self[key] then
			table.insert(modules, key)
		end
	end

	local height = 0
	local index = 1
	for i = #modules, 1, -1 do
		local key = modules[i]
		height = height + self[key]:getContentSize().height
		if height > targetHeight then
			index = i
			break
		end
	end
	local moduleKey = modules[index]
	return moduleKey
end

function CommonHeroProperty:_getLocationIndex(moduleKey)
	local index = 0
	local isInBottom = false --要定位的模块是否在底部s
	local modules = {}
	for i, key in ipairs(MODULE_KEY) do
		if self[key] then
			table.insert(modules, key) --存储显示的模块
		end
	end
	for i, key in ipairs(modules) do
		if key == moduleKey then
			index = math.max(0, i - 1) --保证是正数
			break
		end
	end

	--计算位置
	local height = 0
	for i = #modules, index+1, -1 do
		local key = modules[i]
		height = height + self[key]:getContentSize().height
	end
	if height < self._listView:getContentSize().height then
		isInBottom = true
	end

	return index, isInBottom
end

return CommonHeroProperty