--竞技场排行榜
local PopupBase = require("app.ui.PopupBase")
local PopupArenaRank = class("PopupArenaRank", PopupBase)
local Path = require("app.utils.Path")
local PopupArenaRankCell = require("app.scene.view.arena.PopupArenaRankCell")
local ArenaHelper    = require("app.scene.view.arena.ArenaHelper")

function PopupArenaRank:waitEnterMsg(callBack)
	local function onMsgCallBack(id, message)
		local dialog = callBack()
		if dialog and dialog.updateGetArenaTopInfo then
			dialog:updateGetArenaTopInfo(id, message)
		end
	end
	G_UserData:getArenaData():c2sGetArenaTopInfo()
	return G_SignalManager:add(SignalConst.EVENT_ARENA_GET_ARENA_RANK_INFO, onMsgCallBack)
end

function PopupArenaRank:ctor()
	--
	self._title = Lang.get("arena_challenge_rank_title")
    self._listViewItem = nil
    self._commonNodeBk = nil
	self._textMyRank   = nil
	self._textNullReward =nil --当前排名暂无奖励

	---
	self._userList 	=  {}
	--
	local resource = {
		file = Path.getCSB("PopupArenaRank", "arena"),
		binding = {

		}
	}
	PopupArenaRank.super.ctor(self, resource, true)
end
--
function PopupArenaRank:onCreate()
    self._commonNodeBk:setTitle(self._title)
    self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
end


function PopupArenaRank:_onItemTouch(index)
	dump(itemData)
	local itemData = self._userList[index + 1]

	if itemData then
		G_UserData:getBase():c2sGetUserBaseInfo(itemData.user_id)
	end
end

function PopupArenaRank:_onItemUpdate(item, index)
	local data = self._userList[ index + 1 ]
	if #self._userList > 0 and data then
		item:updateUI(index, data )
	end

end

function PopupArenaRank:_onItemSelected(item, index)

end


--
function PopupArenaRank:onEnter()

end

function PopupArenaRank:onExit()

end

--
function PopupArenaRank:onBtnCancel()
	self:close()
end


function PopupArenaRank:onShowFinish()

end

function PopupArenaRank:onEnter()
	-- self._getArenaTopInfo = G_SignalManager:add(SignalConst.EVENT_ARENA_GET_ARENA_RANK_INFO, handler(self, self._onEventGetArenaTopInfo))

end


function PopupArenaRank:onExit()
    -- self._getArenaTopInfo:remove()
	-- self._getArenaTopInfo =nil
end


--获得战报
function PopupArenaRank:updateGetArenaTopInfo(id, message)

	if message.ret ~= 1 then
		return
	end

	self._userList = rawget(message,"user_list") or {}
	local userRank = rawget(message, "user_arena_rank") or 0
	self._textMyRank:setString(userRank)

	local lineCount = #self._userList
	if lineCount > 0 and self._listViewItem then
	    local listView = self._listViewItem
		listView:setTemplate(PopupArenaRankCell)
		listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		listView:setCustomCallback(handler(self, self._onItemTouch))
		listView:resize(lineCount)
	end



	local awardList = ArenaHelper.getAwardListByRank(userRank)

	if awardList and #awardList == 0 then
		self._textNullReward:setVisible(true)
	else
		self._textNullReward:setVisible(false)
		for i, value in ipairs(awardList) do
			self["_resInfoEx"..i]:setVisible(true)
			self["_resInfoEx"..i]:updateUI(value.type,value.value,value.size)
			self["_resInfoEx"..i]:setTextCountSize(20)
		end
	end


end

return PopupArenaRank
