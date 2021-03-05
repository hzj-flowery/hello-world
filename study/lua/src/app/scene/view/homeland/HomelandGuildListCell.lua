
-- Author: hedili
-- Date:2018-05-08 14:00:07
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local HomelandGuildListCell = class("HomelandGuildListCell", ListViewCellBase)
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")

function HomelandGuildListCell:ctor()

	--csb bind var name
	self._commonBtn = nil  --CommonButtonSwitchLevel2
	self._commonIcon = nil  --CommonHeroIcon
	self._textGuildName = nil  --Text
	self._textPlayerName = nil  --Text
	self._commonBtnSelf = nil

	local resource = {
		file = Path.getCSB("HomelandGuildListCell", "homeland"),
		binding = {
			_commonBtn = {
				events = {{event = "touch", method = "_onClickInvite"}}
			},
			_commonBtnSelf = {
				events = {{event = "touch", method = "_onClickInvite"}}
			}
		},
	}
	HomelandGuildListCell.super.ctor(self, resource)
end

function HomelandGuildListCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	--self._commonBtn:setString(Lang.get("homeland_invite_btn"))

end

function HomelandGuildListCell:updateUI(index, data, friendId)
	-- body
	if data == nil then
		return
	end
	
	local isVisible = ( (index % 2) == 0 )
	self._imageBk:setVisible(isVisible)

	local playerInfo = data:getPlayer_info()
	local heroName = data:getName()
	local official = data:getOfficer_level()

	local level = data:getLevel()
	--local power = TextHelper.getAmountText1(data:getPower())

	local myGuildName = ""
	local myGuild= G_UserData:getGuild():getMyGuild()
	if myGuild then
		myGuildName = myGuild:getName()
	end

	local treeLevel =  data:getHome_tree_level()
	if treeLevel == nil or treeLevel == 0 then
		treeLevel = 1
	end
	local cfgData = HomelandHelp.getMainTreeCfg({treeLevel = treeLevel})
	dump(cfgData)
	self._userData = data
	self._textPlayerName:setString(heroName)
	self._textPlayerName:setColor(Colors.getOfficialColor(official))

	local treeName = cfgData.name..Lang.get("homeland_main_tree_level"..treeLevel)
	
	self._textTreeName:setString(treeName)
	self._textTreeName:setColor(Colors.getHomelandColor(treeLevel))
	self._textTreeName:enableOutline(Colors.getHomelandOutline(treeLevel), 1)

	local officialInfo = G_UserData:getBase():getOfficialInfo(official)
	self._commonIcon:updateIcon(playerInfo, nil, data:getHead_frame_id())
	
	self._commonBtnSelf:setVisible(false)
	self._commonBtn:setVisible(false)

	if data:getUid() ~= G_UserData:getBase():getId() then
		self._commonBtn:setVisible(true)
	else
		--显示返回按钮
		if friendId ~= G_UserData:getBase():getId() then
			self._commonBtnSelf:setVisible(true)
		end
	end
end
-- Describle：
function HomelandGuildListCell:_onClickInvite(sender)
	-- body
	self:dispatchCustomCallback(self._userData:getUid())
end


return HomelandGuildListCell