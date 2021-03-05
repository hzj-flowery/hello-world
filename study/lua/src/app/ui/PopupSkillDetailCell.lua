--选择奖励界面， 选择奖励物品单元
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupSkillDetailCell = class("PopupSkillDetailCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local Path = require("app.utils.Path")

function PopupSkillDetailCell:ctor()
	local resource = {
		file = Path.getCSB("PopupSkillDetailCell", "common"),
	}
	PopupSkillDetailCell.super.ctor(self, resource, true)
end


--
function PopupSkillDetailCell:onCreate()
	-- button
	local contentSize = self._resourceNode:getContentSize()
	self:setContentSize(contentSize)
end


function PopupSkillDetailCell:updateUI(title, skillId, pendingStr)
	pendingStr= pendingStr or ""
	local HeroSkillActiveConfig = require("app.config.hero_skill_active")
	local config = HeroSkillActiveConfig.get(skillId)
	self._nodeTitle:setTitle(title)

	local skillDes = "["..config.name.."]"..config.description..pendingStr
	self._textDesc:setString("")

	if self._label == nil then
		self._label = cc.Label:createWithTTF("", Path.getCommonFont(), 20)
		self._label:setColor(Colors.BRIGHT_BG_TWO)
		self._label:setWidth(466)
		self._label:setAnchorPoint(cc.p(0, 0))
		self._resourceNode:addChild(self._label)
	end
	self._label:setString(skillDes)
	-- local height = self._label:getContentSize().height
	local desHeight = self._label:getContentSize().height + 60
	self._label:setPosition(cc.p(55, 10))

	local size = cc.size(self._imageBg:getContentSize().width, desHeight)
	self._imageBg:setContentSize(size)

	self._nodeTitle:setPositionY(desHeight - 25)

	self:setContentSize(size)
end



function PopupSkillDetailCell:onEnter()
    
end

function PopupSkillDetailCell:onExit()
    
end

return PopupSkillDetailCell