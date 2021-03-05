
-- Author: hedili
-- Date:2018-04-19 14:10:14
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local HomelandFriendView = class("HomelandFriendView", ViewBase)
local HomelandMainNode = require("app.scene.view.homeland.HomelandMainNode")
local HomelandNode = require("app.scene.view.homeland.HomelandNode")
local HomelandGuildList = require("app.scene.view.homeland.HomelandGuildList")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
local HomelandConst = require("app.const.HomelandConst")
local HomelandPrayNode = require("app.scene.view.homeland.HomelandPrayNode")

function HomelandFriendView:ctor(friendId)
	dump(friendId)
	--csb bind var name
	self._commonChat = nil  --CommonMiniChat
	self._commonHelp = nil  --CommonHelp
	self._panelbk = nil  --Panel
	self._topbarBase = nil  --CommonTopbarBase
	self._betIcon = nil 	--投注按钮
	self._mainNode = nil 
	self._buttonFold = nil --
	self._friendId = friendId
	self._guildListView = nil
	local resource = {
		file = Path.getCSB("HomelandFriendView", "homeland"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonFold = {events = {{event = "touch", method = "_onButtonFold"}}},
		},
	}
	HomelandFriendView.super.ctor(self, resource, 2001)
end

-- Describle：

function HomelandFriendView:onCreate()
	self:_makeBackGroundBottom()
	self:_updateTreeModel()
	self:_initPrayModel()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_HOMELAND)
	self._topbarBase:setImageTitle("txt_big_homeland_01")

	self._commonBack:updateUI(FunctionConst.FUNC_HOMELAND_BACK)
	self._commonBack:addClickEventListenerEx(handler(self, self.onBackToMain))
	
	self:_updatFriendName()
end


function HomelandFriendView:_updatFriendName( ... )
	-- body
	local guildData = G_UserData:getHomeland():getGuildMemberByFriendId(self._friendId)
	if guildData then
		local official = guildData:getOfficer_level()
		self._playerName:setColor(Colors.getOfficialColor(official))
		self._playerName:enableOutline(Colors.getOfficialColorOutline(official),1)
		self._playerName:setString(guildData:getName())
		local widthName = self._playerName:getContentSize().width
		local widthTxt = self._playerTxt:getContentSize().width
		local center = (widthName + widthTxt) / 2
		self._playerName:setPositionX(widthName - center)
		self._playerTxt:setPositionX(widthName - center + 8)
	end
	
end

function HomelandFriendView:_updatePower( ... )
	-- body
	self._fileNodePower:updateUI(HomelandHelp.getFriendAllPower(self._friendId))
	self._fileNodePower:setPositionX(250 - self._fileNodePower:getWidth()*0.5)
	
end

function HomelandFriendView:_updateTreeModel( ... )

	local groundNode = self:getGroundNode()

	for i= 1, HomelandConst.MAX_SUB_TREE do
		local subTree = G_UserData:getHomeland():getInviteFriendSubTree(self._friendId, i)

		local subNode = groundNode:getChildByName("subNode"..i)
		if subNode == nil  then
			subNode = HomelandNode.new(HomelandConst.FRIEND_TREE)
			subNode:setName("subNode"..i)
			groundNode:addChild(subNode)
			self["_subTree"..i] = subNode
		end
		if subTree and subNode then
			dump(subTree)
			subNode:updateUI(subTree)
		end
	end

	-- body

	local mainTree = G_UserData:getHomeland():getInviteFriendMainTree(self._friendId)
	local mainNode = groundNode:getChildByName("mainTree")
	if mainNode == nil and mainTree then
		mainNode = HomelandMainNode.new(HomelandConst.FRIEND_TREE)
		groundNode:addChild(mainNode)
		mainNode:setName("mainTree")
	end
	mainNode:updateUI(mainTree)

	--mainNode:setPosition(HomelandConst.MAIN_TREE_POSITION)
	self._mainTree = mainNode
end

function HomelandFriendView:_initPrayModel()
	local groundNode = self:getGroundNode()
	local prayNode = HomelandPrayNode.new(HomelandConst.FRIEND_TREE)
	groundNode:addChild(prayNode)
	prayNode:updateRedPoint()
end

-- Describle：
function HomelandFriendView:_onButtonFold()
	-- body
	logWarn("HomelandFriendView:_onButtonFold")

	self:_createGuildList()

end

function HomelandFriendView:_createGuildList( ... )
	-- body
	if self._guildListView == nil then
		local popup = HomelandGuildList.new(self._friendId)
		popup:setName("HomelandGuildList")
		self:addChild(popup)
		self._guildListView = popup
		self._guildListSignal = self._guildListView.signal:add(handler(self, self._onGuildListClose))
		self._popResult = nil
		self._buttonFold:setVisible(false)
	end
end
-- Describle：
function HomelandFriendView:onEnter()
	logWarn("HomelandFriendView")
	self:_updatePower()

	self:_createGuildList()
end

-- Describle：
function HomelandFriendView:onExit()

end

function HomelandFriendView:onBackToMain( ... )
	local scene, view = G_SceneManager:createScene("homeland")
	G_SceneManager:replaceScene(scene)
end


--公会列表关闭事件通知
function HomelandFriendView:_onGuildListClose(event)
    if event == "close" then
		self._buttonFold:setVisible(true)
        self._guildListView = nil
		if self._guildListSignal then
			self._guildListSignal:remove()
			self._guildListSignal = nil
		end
    end
end
return HomelandFriendView