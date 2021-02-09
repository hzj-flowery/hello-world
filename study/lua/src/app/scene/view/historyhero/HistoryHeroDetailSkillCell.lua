
-- Author: conley
-- Date:2018-11-23 17:07:58
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local HistoryHeroDetailSkillCell = class("HistoryHeroDetailSkillCell", ListViewCellBase)
local HeroSkillActiveConfig = require("app.config.hero_skill_active")


function HistoryHeroDetailSkillCell:ctor(index, skillId, breakthrough)
	self._index = index
	self._skillId = skillId
	self._breakthrough = breakthrough

	self._imageBg 		 = nil
	self._imageSkillBg   = nil
	self._imageSkillIcon = nil
	self._panelBg 		 = nil
	self._label 		 = nil

	local resource = {
		file = Path.getCSB("HistoryHeroDetailSkillCell", "historyhero"),

	}
	HistoryHeroDetailSkillCell.super.ctor(self, resource)
end

function HistoryHeroDetailSkillCell:onCreate()
	-- body
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
		local desHeight = self._label:getContentSize().height + 30
		height = math.max(contentSize.height, desHeight)--上下各扩展5像素
		self._label:setPosition(cc.p(120, height - 15))
	end
	
	local size = cc.size(contentSize.width, height) 
	self:setContentSize(size)
	self._imageSkillBg:setPosition(cc.p(17, height - 1))
	self._imageBg:setContentSize(cc.size(contentSize.width, height - 2))
end


return HistoryHeroDetailSkillCell