--
-- Author: Liangxu
-- Date: 2018-1-5 14:07:33

local ListViewCellBase = require("app.ui.ListViewCellBase")
local AvatarDetailSkillCell = class("AvatarDetailSkillCell", ListViewCellBase)
local HeroSkillActiveConfig = require("app.config.hero_skill_active")

function AvatarDetailSkillCell:ctor(data)
	self._data = data
	self._label = nil --技能描述文本

	local resource = {
		file = Path.getCSB("HeroDetailSkillCell", "hero"),
		binding = {

		},
	}
	AvatarDetailSkillCell.super.ctor(self, resource)
end

function AvatarDetailSkillCell:onCreate()
	local contentSize = self._panelBg:getContentSize()
	local height = contentSize.height

	local skillId = self._data.id
	local unlock = self._data.unlock
	local isActiveJoint = self._data.isActiveJoint
	local isShowJointTip = unlock and not isActiveJoint --是否显示合击提示
	local config = HeroSkillActiveConfig.get(skillId)
	if config then
		local skillIconRes = config.skill_icon
		local unlockDes = isShowJointTip and Lang.get("avatar_detail_skill_unlock", {level = unlock}) or ""
		local skillDes = "["..config.name.."] "..config.description
		self._imageSkillIcon:loadTexture(Path.getCommonIcon("skill", skillIconRes))
		if self._label == nil then
			self._label = ccui.RichText:create()
			self._label:setAnchorPoint(cc.p(0, 1))
			self._label:ignoreContentAdaptWithSize(false)
			self._label:setContentSize(cc.size(262, 0))
			self._panelBg:addChild(self._label)
		end
		local content = Lang.get("avatar_detail_skill_des", {des = skillDes, unlock = unlockDes})
		self._label:setRichTextWithJson(content)
		self._label:formatText()
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

return AvatarDetailSkillCell