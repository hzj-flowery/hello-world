
-- Author: zhanglinsen
-- Date:2018-09-19 11:27:49
-- Describle：
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GroupsFixViewCell = class("GroupsFixViewCell", ListViewCellBase)
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local GroupsConst = require("app.const.GroupsConst")

function GroupsFixViewCell:ctor()
	local resource = {
		file = Path.getCSB("GroupsFixViewCell", "groups"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "_onBtnOk"}}
			},
		},
	}
	GroupsFixViewCell.super.ctor(self, resource)
end

function GroupsFixViewCell:onCreate()
	self._memberData = nil

	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._btnOk:setString(Lang.get("groups_apply"))
end

--更新队伍数据
function GroupsFixViewCell:updateUI(memberData)
	self._memberData = memberData
	
	local maxLv = memberData:getMax_level()
	local minLv = memberData:getMin_level()

	local leaderData = memberData:getUserData(memberData:getTeam_leader())
	self._leaderName:setString(Lang.get("groups_leader_content",{name = memberData:getLeaderName()}))
	self._leaderName:setColor(Colors.getOfficialColor(leaderData:getOffice_level()))
	require("yoka.utils.UIHelper").updateTextOfficialOutline(self._leaderName, leaderData:getOffice_level())
	-- local targetId = memberData:getTeam_target()
	-- local configInfo = GroupsDataHelper.getTeamTargetConfig(targetId)
	self._targetName:setString(Lang.get("qin_title"))
	self._levelLimit:setString(Lang.get("groups_level_limit_content",{min = minLv, max = maxLv}))

	self:_updateList()

	local strState = ""
	if memberData:isIs_scene() then
		local name = GroupsDataHelper.getTeamTargetConfig(memberData:getTeam_target()).name
		strState = Lang.get("groups_in_active_tip")
	end
	self._textState:setString(strState)
	
	local isEndApply = memberData:isEndApply()
	self._btnImg:setVisible(not isEndApply)
	self._btnOk:setVisible(isEndApply)
end

function GroupsFixViewCell:_updateList()
	local memberData = self._memberData
	if memberData then
		for i = 1, GroupsConst.MAX_PLAYER_SIZE do
			local icon = self["_icon"..i]
			local userData = memberData:getUserDataWithLocation(i)
			if userData then
				icon:updateUI(userData:getCovertId(), nil, userData:getLimitLevel())
				icon:showHeroUnknow(false)
				-- icon:setLevel(userData:getLevel())
				local frameNode = self["_commonHeadFrame"..i]
				
				frameNode:updateUI(userData:getHead_frame_id(),icon:getScale())
				frameNode:setLevel(userData:getLevel())
			else
				icon:showHeroUnknow(true)
			end

			dump(userData)
			-- if userData then 
				-- local frameNode = self["_commonHeadFrame"..i]
				-- frameNode:updateUI(userData:getHead_frame_id(),icon:getScale())
		end
	end
end

function GroupsFixViewCell:_onBtnOk()
	local memberData = self._memberData
	local maxLv = memberData:getMax_level()
	local minLv = memberData:getMin_level()
    local gameUserLevel = G_UserData:getBase():getLevel()
	if gameUserLevel > maxLv or gameUserLevel < minLv then
		G_Prompt:showTip(Lang.get("groups_level_not_requirement_tip"))
		return
	end
	self:dispatchCustomCallback(1)
end

return GroupsFixViewCell