--
-- Author: Liangxu
-- Date: 2017-07-20 16:00:02
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HeroDetailSkillCell = class("HeroDetailSkillCell", ListViewCellBase)
local HeroSkillActiveConfig = require("app.config.hero_skill_active")

function HeroDetailSkillCell:ctor(skillId)
	self._skillId = skillId
	self._label = nil --技能描述文本

	local resource = {
		file = Path.getCSB("HeroDetailSkillCell", "hero"),
		binding = {

		},
	}
	HeroDetailSkillCell.super.ctor(self, resource)
end

function HeroDetailSkillCell:onCreate()
	local contentSize = self._panelBg:getContentSize()
	local height = contentSize.height

	local config = HeroSkillActiveConfig.get(self._skillId)
	if config then
		local skillIconRes = config.skill_icon
		local skillDes = "["..config.name.."]"..config.description
		self._imageSkillIcon:loadTexture(Path.getCommonIcon("skill", skillIconRes))
		if self._label == nil then
			self._label = cc.Label:createWithTTF("", Path.getCommonFont(), 20)
			self._label:setColor(Colors.BRIGHT_BG_TWO)
			self._label:setWidth(260)
			self._label:setAnchorPoint(cc.p(0, 1))
			self._panelBg:addChild(self._label)
		end
		self._label:setString(skillDes)
		local desHeight = self._label:getContentSize().height + 15
		height = math.max(contentSize.height, desHeight)--上下各扩展5像素
		self._label:setPosition(cc.p(120, height - 5))
	else
		logError(string.format("hero_skill_active config can not find id = %d", self._skillId))
	end
	
	local size = cc.size(contentSize.width, height) 
	self:setContentSize(size)
	self._imageSkillBg:setPosition(cc.p(17, height - 1))
	self._imageBg:setContentSize(cc.size(contentSize.width, height - 2))
end

return HeroDetailSkillCell