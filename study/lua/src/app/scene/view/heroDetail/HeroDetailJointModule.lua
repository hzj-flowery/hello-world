--
-- Author: Liangxu
-- Date: 2017-03-01 19:40:12
-- 武将详情 合击模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HeroDetailJointModule = class("HeroDetailJointModule", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
function HeroDetailJointModule:ctor(heroUnitData, noCanClickIcon)
	self._heroUnitData = heroUnitData
	self._noCanClickIcon = noCanClickIcon

	local resource = {
		file = Path.getCSB("HeroDetailJointModule", "hero"),
		binding = {

		},
	}
	HeroDetailJointModule.super.ctor(self, resource)
end

function HeroDetailJointModule:onCreate()
	local contentSize = self._panelBg:getContentSize()
	self:setContentSize(contentSize)

	self._nodeTitle:setFontSize(24)
	self._nodeTitle:setTitle(Lang.get("hero_detail_title_joint"))
	self._fileNodeIcon1:setTouchEnabled(true)
	self._fileNodeIcon2:setTouchEnabled(true)
	if self._noCanClickIcon then
		self._fileNodeIcon1:setTouchEnabled(false)
		self._fileNodeIcon2:setTouchEnabled(false)
	end
	self:update(self._heroUnitData)
end

function HeroDetailJointModule:update(heroUnitData)
	local heroConfig = heroUnitData:getConfig()
	local jointType = heroConfig.skill_3_type
	local jointHeroId = heroConfig.skill_3_partner
	local heroId1 = jointType == 1 and heroUnitData:getBase_id() or jointHeroId
	local heroId2 = jointType == 1 and jointHeroId or heroUnitData:getBase_id()
	
	self._fileNodeIcon1:updateUI(heroId1)
	self._fileNodeIcon2:updateUI(heroId2)

	local otherIcon = jointType == 1 and self._fileNodeIcon2 or self._fileNodeIcon1
	if self._heroUnitData:isUserHero() and not heroUnitData:isActiveJoint() then
		otherIcon:setIconMask(true)
		self._imageAdd:loadTexture(Path.getTeamUI("img_teamtrain_plussign_1"))
	end

	local param1 = self._fileNodeIcon1:getItemParams()
	local param2 = self._fileNodeIcon2:getItemParams()
	self._textName1:setString(param1.name)
	self._textName1:setColor(param1.icon_color)
	self._textName2:setString(param2.name)
	self._textName2:setColor(param2.icon_color)
	self._textDesc:setString(Lang.get("hero_detail_joint_tip"))
end

return HeroDetailJointModule
