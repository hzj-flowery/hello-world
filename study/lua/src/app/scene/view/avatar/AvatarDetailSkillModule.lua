--
-- Author: Liangxu
-- Date: 2018-1-4 14:12:15
-- 变身卡详情 技能模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local AvatarDetailSkillModule = class("AvatarDetailSkillModule", ListViewCellBase)
local AvatarDetailSkillCell = require("app.scene.view.avatar.AvatarDetailSkillCell")
local CSHelper = require("yoka.utils.CSHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

function AvatarDetailSkillModule:ctor()
	local resource = {
		file = Path.getCSB("HeroDetailDynamicModule", "hero"),
		binding = {
			
		},
	}
	
	AvatarDetailSkillModule.super.ctor(self, resource)
end

function AvatarDetailSkillModule:onCreate()
	
end

function AvatarDetailSkillModule:updateUI(data)
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local skillInfo = AvatarDataHelper.getSkillInfo(data)
	for i, info in ipairs(skillInfo) do
		local cell = AvatarDetailSkillCell.new(info)
		self._listView:pushBackCustomItem(cell)
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function AvatarDetailSkillModule:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("avatar_detail_skill_title"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 41)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, titleSize.height / 2)
	widget:addChild(title)

	return widget
end

return AvatarDetailSkillModule