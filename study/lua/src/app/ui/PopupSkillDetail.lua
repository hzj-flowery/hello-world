-- Author: hedili
-- Date: 2018-01-24 15:09:42
-- 技能详情
local PopupBase = require("app.ui.PopupBase")
local PopupSkillDetail = class("PopupSkillDetail", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupSkillDetailCell = require("app.ui.PopupSkillDetailCell")

function PopupSkillDetail:ctor(skillDescList)
	self._skillDescList = skillDescList or {}
	self._listView = nil
	local resource = {
		file = Path.getCSB("PopupSkillDetail", "common"),
		binding = {

		}
	}

	PopupSkillDetail.super.ctor(self, resource)
end

function PopupSkillDetail:onCreate()
	self._listView:removeAllChildren()
	self._commonBK:setTitle(Lang.get("common_skill_detail"))
	self._commonBK:addCloseEventListener(handler(self, self.close))
	
	for i, skillValue in ipairs(self._skillDescList) do
		local skillCell = PopupSkillDetailCell.new()
		skillCell:updateUI(skillValue.title, skillValue.skillId,skillValue.pendingStr)
		self._listView:pushBackCustomItem(skillCell)
	end
end

function PopupSkillDetail:onEnter()

end

function PopupSkillDetail:onExit()

end


return PopupSkillDetail