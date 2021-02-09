
-- Author: hedili
-- Date:2018-05-08 14:00:05
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local HomelandGuildList = class("HomelandGuildList", ViewBase)
local HomelandGuildListCell = import(".HomelandGuildListCell")

function HomelandGuildList:ctor(friendId)

	--csb bind var name
	self._buttonFold = nil  --Button
	self._listView = nil  --ScrollView
	self._nodeTab = nil  --SingleNode
	self._panelDesign = nil  --Panel
	self._friendId = friendId
	local resource = {
		file = Path.getCSB("HomelandGuildList", "homeland"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_panelDesign = {events = {{event = "touch", method = "_onButtonFold"}}},
			_buttonFold = {events = {{event = "touch", method = "_onButtonFold"}}},
		},
	}
	HomelandGuildList.super.ctor(self, resource)
end

-- Describle：
function HomelandGuildList:onCreate()
	local PrioritySignal = require("yoka.event.PrioritySignal")
	self.signal = PrioritySignal.new("string")
	self:_initListView()
end

-- Describle：
function HomelandGuildList:onEnter()
	
	self._signalVisitFriendHome = G_SignalManager:add(SignalConst.EVENT_VISIT_FRIEND_HOME_SUCCESS, handler(self, self._onEventVisitFriendHome))
end

-- Describle：
function HomelandGuildList:onExit()
	self._signalVisitFriendHome:remove()
	self._signalVisitFriendHome = nil
end
-- Describle：
function HomelandGuildList:_onButtonFold()
	-- body
	  self:_closeWindow()
end

function HomelandGuildList:_initListView()
	-- body
	self._dataList = G_UserData:getHomeland():getGuildMemberList()
	dump(self._dataList)
	self._listView:setTemplate(HomelandGuildListCell)
	self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
	self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))

	self._listView:resize(#self._dataList)

	if #self._dataList == 0 then
		self._imageNoTimes:setVisible(true)
		self._imageNoTimes:setButtonGetVisible(false)
		self._imageNoTimes:setTipsString(Lang.get("mine_user_no_guild"))
	else
		self._imageNoTimes:setVisible(false)
	end
end

-- Describle：
function HomelandGuildList:_onListViewItemUpdate(item, index)
	 local data = self._dataList[index+1]
	 if data then
	 	item:updateUI(index, data, self._friendId)
	 end
end

-- Describle：
function HomelandGuildList:_onListViewItemSelected(item, index)

end


-- Describle：
function HomelandGuildList:_onListViewItemTouch(index, userId)
	if userId and userId > 0 then
		if userId == G_UserData:getBase():getId() then
			local scene, view = G_SceneManager:createScene("homeland")
			G_SceneManager:replaceScene(scene)
			return 
		end
		if self._friendId ~= userId then
			G_UserData:getHomeland():c2sVisitFriendHome(userId)
			self._friendId = userId
		end
	end
end



function HomelandGuildList:_closeWindow()
    local posX = -self._panelDesign:getContentSize().width - self._buttonFold:getPositionX()
    local callAction = cc.CallFunc:create(function()
		self.signal:dispatch("close")
        self:removeFromParent()
	end)
	local action = cc.MoveBy:create(0.3,cc.p(posX,0))
	local runningAction = cc.Sequence:create(action,callAction)
	self:runAction(runningAction)
end

function HomelandGuildList:_onEventVisitFriendHome(id, message )
	-- body
	
	local scene, view = G_SceneManager:createScene("homelandFriend",self._friendId)
	G_SceneManager:replaceScene(scene)
end

return HomelandGuildList