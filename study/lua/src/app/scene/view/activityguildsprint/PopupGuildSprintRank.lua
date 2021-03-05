
local PopupBase = require("app.ui.PopupBase")
local PopupGuildSprintRank = class("PopupGuildSprintRank", PopupBase)
local Path = require("app.utils.Path")
local GuildSprintRankItemCell = require("app.scene.view.activityguildsprint.GuildSprintRankItemCell")
local ArenaHelper    = require("app.scene.view.arena.ArenaHelper")


function PopupGuildSprintRank:waitEnterMsg(callBack)
	local function onMsgCallBack(id,rankUnitDataList,myRank)
		local dialog = callBack()
		if dialog and dialog.updateList then
			dialog:updateList(rankUnitDataList,myRank)
		end
	end
	G_UserData:getGuildSprint():c2sGetSevenDaysSprintGuildRank()
	return G_SignalManager:add(SignalConst.EVENT_ACTIVITY_GUILD_SPRINT_GET_RANK_LIST, onMsgCallBack)
end

function PopupGuildSprintRank:ctor()
	self._title = Lang.get("common_title_rank")
    self._listViewItem = nil
    self._commonNodeBk = nil
	self._textMyRank   = nil
	self._nodeEmpty = nil

	self._listData = nil
	self._myRank = nil

	local resource = {
		file = Path.getCSB("PopupGuildSprintRank", "activityguildsprint"),
		binding = {

		}
	}
	PopupGuildSprintRank.super.ctor(self, resource, true)
end
--
function PopupGuildSprintRank:onCreate()
    self._commonNodeBk:setTitle(self._title)
    self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
end

function PopupGuildSprintRank:onEnter()
	--self._signalActGuildSprintGetRankList = G_SignalManager:add(SignalConst.EVENT_ACTIVITY_GUILD_SPRINT_GET_RANK_LIST, 
	--	handler(self,self._onEventActGuildSprintGetRankList))
end

function PopupGuildSprintRank:onExit()
	--self._signalActGuildSprintGetRankList:remove()
	--self._signalActGuildSprintGetRankList = nil
end

function PopupGuildSprintRank:onShowFinish()
end

function PopupGuildSprintRank:_onItemTouch(index)
end

function PopupGuildSprintRank:_onItemUpdate(item, index)
	local itemData = self._listData[ index + 1 ]
	if itemData then
		item:updateUI(itemData,index )
	end
end

function PopupGuildSprintRank:_onItemSelected(item, index)
end

--获得战报
function PopupGuildSprintRank:updateList(rankUnitDataList,myRank)
	self._listData = rankUnitDataList
	self._myRank = myRank


	if myRank <= 0 then
		self._textMyRank:setString(Lang.get("activity_guild_sprint_no_crops"))
	else
		self._textMyRank:setString(myRank)
	end
	
	local lineCount = #self._listData
	if lineCount > 0 and self._listViewItem then
	    local listView = self._listViewItem
		listView:setTemplate(GuildSprintRankItemCell)
		listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		listView:setCustomCallback(handler(self, self._onItemTouch))
		listView:resize(lineCount)
	end

	self._nodeEmpty:setVisible(lineCount <= 0)
	
end

function PopupGuildSprintRank:onBtnCancel()
	self:close()
end

return PopupGuildSprintRank
