-- @Author  panhoa
-- @Date  3.20.2019
-- @Role 

local PopupBase = require("app.ui.PopupBase")
local PopupGuildCrossWarRank = class("PopupGuildCrossWarRank", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local GuildCrossWarRankCell = require("app.scene.view.guildCrossWar.GuildCrossWarRankCell")


function PopupGuildCrossWarRank:waitEnterMsg(callBack)
	local function onMsgCallBack(id, message)
		self._rankData = rawget(message, "player_ladders") or {}
		callBack()
	end
	self._rankData 	= {}
	G_UserData:getGuildCrossWar():c2sBrawlGuildsLadder(1)
	local signal = G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_LADDER, onMsgCallBack)
	return signal
end

function PopupGuildCrossWarRank:ctor()
    self._scrollView    = nil
    self._rankView      = nil

	local resource = {
		file = Path.getCSB("PopupGuildCrossWarRank", "guildCrossWar"),
	}
	PopupGuildCrossWarRank.super.ctor(self, resource, false, false)
end

function PopupGuildCrossWarRank:onCreate()
	self._commonNodeBk:setTitle(Lang.get("guild_cross_war_title"))
	self._commonNodeBk:addCloseEventListener(handler(self, self._onBtnClose))
	self:_initScrollView()
end

function PopupGuildCrossWarRank:onEnter()
	self:_updateScrollView()
end

function PopupGuildCrossWarRank:onExit()
end

function PopupGuildCrossWarRank:_onBtnClose()
	self:close()
end

function PopupGuildCrossWarRank:_initScrollView()
	local scrollViewParam = {}
	scrollViewParam.template = GuildCrossWarRankCell
	scrollViewParam.updateFunc = handler(self, self._onCellUpdate)
	scrollViewParam.selectFunc = handler(self, self._onCellSelected)
	scrollViewParam.touchFunc = handler(self, self._onCellTouch)
	self._rankView = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

function PopupGuildCrossWarRank:_updateScrollView()
	if not self._rankData or table.nums(self._rankData) <= 0 then
		return
	end

	self._rankView:updateListView(1, table.nums(self._rankData))
end

function PopupGuildCrossWarRank:_onCellUpdate(cell, index)
	local curIndex = (index + 1)
	if not self._rankData then
		return
	end

	local cellData = {}
	if self._rankData[curIndex] then
		cellData = self._rankData[curIndex]
		cellData.index = curIndex
		cell:updateUI(cellData)
	end
end

function PopupGuildCrossWarRank:_onCellSelected(cell, index)
end

function PopupGuildCrossWarRank:_onCellTouch(index, data)
	if data == nil then return end
end


return PopupGuildCrossWarRank