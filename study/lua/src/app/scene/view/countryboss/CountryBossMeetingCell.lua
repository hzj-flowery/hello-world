
-- Author: nieming
-- Date:2018-05-09 10:39:36
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local CountryBossMeetingCell = class("CountryBossMeetingCell", ListViewCellBase)
local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
local CountryBossConst = require("app.const.CountryBossConst")

function CountryBossMeetingCell:ctor()

	--csb bind var name
	self._btnVote = nil  --CommonButtonSwitchLevel1
	self._canNotVoteLable = nil  --Text
	self._heroName = nil  --Text
	self._imageBg = nil  --ImageView
	self._progress = nil  --LoadingBar
	self._voteNum = nil  --Text

	local resource = {
		file = Path.getCSB("CountryBossMeetingCell", "countryboss"),
		binding = {
			_btnVote = {
				events = {{event = "touch", method = "_onBtnVote"}}
			},
		},
	}
	CountryBossMeetingCell.super.ctor(self, resource)
end

function CountryBossMeetingCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._capInsetsRect = self._imageBg:getCapInsets()
	self._btnVote:setString(Lang.get("country_boss_meeting_btn_vote"))
end

function CountryBossMeetingCell:updateUI(data)
	-- body
	if not data then
		return
	end
	self._data = data
	self._heroName:setString(data.name)

	local selfVote = G_UserData:getCountryBoss():getSelf_vote()
	if data.isUnLock then
		self._canVote:setVisible(true)
		self._canNotVoteLable:setVisible(false)
		if selfVote and selfVote ~= 0 then
			self._btnVote:setEnabled(false)
			self._alreadyVote:setVisible(data.id == selfVote)
			self._btnVote:setVisible(data.id ~= selfVote)
			if data.id == selfVote then
				self._imageBg:loadTexture(Path.getCommonImage("img_com_board04c"))
			end
		else
			if CountryBossHelper.getStage() == CountryBossConst.STAGE2 then
				self._btnVote:setEnabled(true)
			else
				self._btnVote:setEnabled(false)
			end
			self._alreadyVote:setVisible(false)
			self._btnVote:setVisible(true)
			self._imageBg:loadTexture(Path.getCommonImage("img_com_board04"))
		end

		local member_num = 1
		local myGuild= G_UserData:getGuild():getMyGuild()
		if myGuild then
			member_num = myGuild:getMember_num()
		end
		local progress = data.vote * 100/member_num
		if progress > 100 then
			progress = 100
		end
		self._voteNum:setString(Lang.get("country_boss_meeting_vote_num",{num = data.vote}))
		self._progress:setPercent(progress)
	else
		self._imageBg:loadTexture(Path.getCommonImage("img_com_board04"))
		self._canVote:setVisible(false)
		self._canNotVoteLable:setVisible(true)
		self._canNotVoteLable:setString(data.lockStr or "")
	end
	self._imageBg:setCapInsets(self._capInsetsRect)
	self:_updateAwards()
end
-- Describle：
function CountryBossMeetingCell:_onBtnVote()
	-- body
	if self._data then
		G_UserData:getCountryBoss():c2sCountryBossVote(self._data.id)
	end
end

function CountryBossMeetingCell:_updateAwards()
	if self._data then
		local awards = CountryBossHelper.getPreviewRankRewards(self._data.id)
		self._rankRewardListViewItem:updateUI(awards, 1)
		self._rankRewardListViewItem:setMaxItemSize(3)
		self._rankRewardListViewItem:setListViewSize(300,100)
		self._rankRewardListViewItem:setItemsMargin(2)
	end
end

return CountryBossMeetingCell
