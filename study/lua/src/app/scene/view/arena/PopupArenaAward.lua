local PopupBase = require("app.ui.PopupBase")
local PopupArenaAward = class("PopupArenaAward", PopupBase)
local PopupArenaAwardCell = require("app.scene.view.arena.PopupArenaAwardCell")

local UIHelper = require("yoka.utils.UIHelper")
function PopupArenaAward:ctor()
	--
	self._title = Lang.get("arena_award_title")
    self._listViewItem = nil
    self._commonNodeBk = nil
	self._labelMaxRank = nil --历史最高排名
	--
	local resource = {
		file = Path.getCSB("PopupArenaAward", "arena"),
		binding = {
			
		}
	}
	PopupArenaAward.super.ctor(self, resource, true)
end

--
function PopupArenaAward:onCreate()
    self._commonNodeBk:setTitle(self._title)
    self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))


	
	local maxRank = G_UserData:getArenaData():getArenaMaxRank()
	self._labelMaxRank:setString(maxRank)

	--self:_updateTakeAwardList()
	self:_updateListView()
end

function PopupArenaAward:_updateListView()
	self._awardList = G_UserData:getArenaData():getAwardList()
	local lineCount = #self._awardList
	local listView = self._listViewItem
	listView:clearAll()
	listView:setTemplate(PopupArenaAwardCell)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))
	listView:resize(lineCount)
end

function PopupArenaAward:_onItemTouch(index, awardId)
	assert(awardId, "PopupArenaAward:_onItemTouch, awardId is null")
	if awardId and awardId > 0 then
		G_NetworkManager:send(MessageIDConst.ID_C2S_GetArenaRankReward, {reward_id = awardId})
	end
end



function PopupArenaAward:_onItemUpdate(item, index)
	if self._awardList[ index + 1 ]  then
		item:updateUI(index, self._awardList[ index + 1 ] )
	end
	

end

function PopupArenaAward:_onItemSelected(item, index)

end


--
function PopupArenaAward:onEnter()
    self._getArenaReward = G_SignalManager:add(SignalConst.EVENT_ARENA_GET_REWARD, handler(self, self._onEventGetReward))
	self:_updateListView()
end

function PopupArenaAward:onExit()
    self._getArenaReward:remove()
	self._getArenaReward = nil
end

--
function PopupArenaAward:onBtnCancel()
	self:close()
end



function PopupArenaAward:_onEventGetReward(id, message)
	if message.ret ~= 1 then
		return
	end

	--dump(message)
	local awards = rawget(message, "award") or {}
	local PopupGetRewards = require("app.ui.PopupGetRewards").new()
	PopupGetRewards:showRewards(awards)
	 
	self:_updateListView()

end

return PopupArenaAward