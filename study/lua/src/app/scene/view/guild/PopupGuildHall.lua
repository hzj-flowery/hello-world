--
-- Author: Liangxu
-- Date: 2017-06-22 13:46:48
-- 军团大厅
local PopupBase = require("app.ui.PopupBase")
local PopupGuildHall = class("PopupGuildHall", PopupBase)
local TabButtonGroup = require("app.utils.TabButtonGroup")
local GuildHallBaseInfoNode = require("app.scene.view.guild.GuildHallBaseInfoNode")
local GuildMemberListNode = require("app.scene.view.guild.GuildMemberListNode")
local GuildMemberListNodeTrain = require("app.scene.view.guild.GuildMemberListNodeTrain")
local GuildCheckApplicationNode = require("app.scene.view.guild.GuildCheckApplicationNode")
local GuildLogNode = require("app.scene.view.guild.GuildLogNode")
local UserDataHelper = require("app.utils.UserDataHelper")
local GuildConst = require("app.const.GuildConst")
local GuildWageNode = require("app.scene.view.guild.GuildWageNode")
local GuildRedPacketNode = require("app.scene.view.guild.GuildRedPacketNode")
local FunctionConst = require("app.const.FunctionConst")

function PopupGuildHall:ctor()
	local resource = {
		file = Path.getCSB("PopupGuildHall", "guild"),
		binding = {

		}
	}
	PopupGuildHall.super.ctor(self, resource)
end

function PopupGuildHall:onCreate()
	self._selectTabIndex = 0
	self._contentNodes = {}
	self._tabDatas = {}

	self._panelBg:setTitle(Lang.get("guild_title_hall"))
	self._panelBg:addCloseEventListener(handler(self, self._onClickClose))

	
end

function PopupGuildHall:_isHavePermission()
	local userMemberData = G_UserData:getGuild():getMyMemberData()
	local userPosition = userMemberData:getPosition()
	local isHave = UserDataHelper.isHaveJurisdiction(userPosition, GuildConst.GUILD_JURISDICTION_6)
	return isHave
end

function PopupGuildHall:_refreshTabs()
	local tabIndex = self._selectTabIndex
	local isShowCheckApplication = self:_isHavePermission()--是否显示审核
	self._tabDatas = isShowCheckApplication and {1,2,5,6,4} or {1,2,5,6,4}	
	local param = {
		callback = handler(self, self.onTabSelect),
		isVertical = 2,
		offset = -2,
		textList = isShowCheckApplication and Lang.get("guild_hall_tab_titles") or Lang.get("guild_hall_tab_titles_2"),
	}
	self._tabGroup:recreateTabs(param)
	if tabIndex == 0 then
		self._tabGroup:setTabIndex(1)
	else
		self._selectTabIndex = 0
		tabIndex = math.min(#self._tabDatas,tabIndex)
		self._tabGroup:setTabIndex(tabIndex)
	end

	self:_refreshRedPoint()
end

function PopupGuildHall:onEnter()
	self._signalGuildUserPositionChange = G_SignalManager:add(SignalConst.EVENT_GUILD_USER_POSITION_CHANGE, handler(self, self._refreshTabs))
	
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))

	self:_refreshTabs()
end

function PopupGuildHall:onExit()
	self._signalGuildUserPositionChange:remove()
	self._signalGuildUserPositionChange = nil

	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil
end

function PopupGuildHall:onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end
	self._selectTabIndex = index
	for k, node in pairs(self._contentNodes) do
		node:setVisible(false)
	end
	self._tabGroup:setTabIndex(index)
	local curContent = self:_getCurNodeContent()
	if curContent then
		curContent:updateView()
		curContent:setVisible(true)
	end
end

function PopupGuildHall:_getCurNodeContent()
	local tabId = self._tabDatas[self._selectTabIndex]
	local nodeContent = self._contentNodes[tabId]
	if nodeContent == nil then
		if tabId == 1 then--基本信息
			nodeContent = GuildHallBaseInfoNode.new()
		elseif tabId == 2 then--成员列表
			-- nodeContent = GuildMemberListNode.new()
			local open = require("app.utils.logic.FunctionCheck").funcIsShow(FunctionConst.FUNC_GUILD_TRAIN)
			if open then
				nodeContent = GuildMemberListNodeTrain.new()
			else
				nodeContent = GuildMemberListNode.new()
			end
		elseif tabId == 3 then--审核申请
			nodeContent = GuildCheckApplicationNode.new()
		elseif tabId == 4 then--军团日志
			nodeContent = GuildLogNode.new()
		elseif tabId == 5 then--军团工资	
			nodeContent = GuildWageNode.new()
		elseif tabId == 6 then--军团红包	
			nodeContent = GuildRedPacketNode.new()
		end
		self._nodeContent:addChild(nodeContent)
		self._contentNodes[tabId] = nodeContent
	end
	return nodeContent
end
  
function PopupGuildHall:_onClickClose()
	self:close()
end


function PopupGuildHall:_refreshRedPoint()
	local RedPointHelper = require("app.data.RedPointHelper")
	local tabCount = self._tabGroup:getTabCount()
	for k = 1,tabCount,1 do
		local tabId = self._tabDatas[k]
		local redPointShow = false
		if tabId == 2 then--成员
			 redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP,"checkApplicationRP")
		elseif tabId == 6 then--红包
			 redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP,"redPacketRP")
		elseif tabId == 1 then--任务
			 redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP,"guildTaskRP")	 
		end
		self._tabGroup:setRedPointByTabIndex(k,redPointShow)
	end
end


function PopupGuildHall:_onEventRedPointUpdate(event,funcId,param)
	if funcId and funcId ~= FunctionConst.FUNC_ARMY_GROUP then
		return
	end
	self:_refreshRedPoint()
end


return PopupGuildHall