local CommonSkillIcon = class("CommonSkillIcon")
--技能类型对应文字资源
local SKILL_TEXT_RES = {
	[1] = "img_skill_signet01", --普攻
	[2] = "img_skill_signet02", --技能
	[3] = "img_skill_signet03", --合击
	[4] = "img_skill_signet02", --被动
}

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonSkillIcon:ctor()
	self._target = nil
	
end

function CommonSkillIcon:_init()
	self._imageSkillBg = ccui.Helper:seekNodeByName(self._target, "ImageSkillBg")
	self._imageSkillIcon = ccui.Helper:seekNodeByName(self._target, "ImageSkillIcon")
	self._imageSkillText = ccui.Helper:seekNodeByName(self._target, "ImageSkillText")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addTouchEventListener(handler(self, self._onTouchCallBack))
end

function CommonSkillIcon:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonSkillIcon:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonSkillIcon:updateUI(skillId, canClick, baseId, starLevel)
	self._skillId = skillId
	self._canClick = canClick
	self._baseId = baseId
	self._starLevel = starLevel

	if skillId == 0 then
		self._imageSkillBg:loadTexture(Path.getUICommon("img_skill_board01b"))
		self._imageSkillIcon:setVisible(false)
		self._imageSkillText:setVisible(false)
	else
		self._imageSkillBg:loadTexture(Path.getUICommon("img_skill_board01"))
		local config = require("app.config.hero_skill_active").get(skillId)
		assert(config, string.format("hero_skill_active config can not find id = %d", skillId))
		
		local skillIconRes = config.skill_icon
		local textRes = SKILL_TEXT_RES[config.skill_type]
		assert(textRes, string.format("hero_skill_active config skill_type is wrong, skill_type = %d", config.skill_type))

		self._imageSkillIcon:loadTexture(Path.getCommonIcon("skill", skillIconRes))
		self._imageSkillText:loadTexture(Path.getTextSignet(textRes))
		self._imageSkillIcon:setVisible(true)
		self._imageSkillText:setVisible(true)
	end
end

function CommonSkillIcon:_onTouchCallBack(sender,state)
	if self._canClick and self._skillId > 0 then
		if state == ccui.TouchEventType.ended then
			local popup = require("app.ui.PopupSkillDes").new(self._imageSkillBg, self._skillId, self._baseId, self._starLevel)
			popup:open()
		end
	end
end

return CommonSkillIcon