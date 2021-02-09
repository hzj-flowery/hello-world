--
-- Author: Liangxu
-- Date: 2017-06-29 16:23:28
-- 军团援助
local ViewBase = require("app.ui.ViewBase")
local GuildHelpView = class("GuildHelpView", ViewBase)
local GuildRequestHelpNode = require("app.scene.view.guildHelp.GuildRequestHelpNode")
local GuildHelpList = require("app.scene.view.guildHelp.GuildHelpList")

function GuildHelpView:ctor()

	local resource = {
		file = Path.getCSB("GuildHelpView", "guild"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		}
	}
	GuildHelpView.super.ctor(self, resource)
end

function GuildHelpView:onCreate()
	self._selectTabIndex = 0
	self._contentNodes = {}

	self._topbarBase:setImageTitle("txt_sys_com_juntuanyuanzhu")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_GUILD)
	self:_initTab()
end

function GuildHelpView:onEnter()
	self._signalCommonZeroNotice = G_SignalManager:add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(self, self._onEventCommonZeroNotice))
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
	self._signalGuildKickNotice = G_SignalManager:add(SignalConst.EVENT_GUILD_KICK_NOTICE, handler(self, self._onEventGuildKickNotice))

	if not G_UserData:getGuild():isInGuild() then
		G_SceneManager:popScene()
		return
	end

	self:_refreshRedPoint()
	
	if G_UserData:getGuild():isExpired() == true then
        G_UserData:getGuild():pullData()
    end

	
end

function GuildHelpView:onExit()
	self._signalCommonZeroNotice:remove()
	self._signalCommonZeroNotice = nil

	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil

	self._signalGuildKickNotice:remove()
	self._signalGuildKickNotice = nil
end

function GuildHelpView:_onEventCommonZeroNotice(eventName,hour)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	--if G_UserData:getGuild():isExpired() == true then
        G_UserData:getGuild():pullData()
        --return
    --end
end

function GuildHelpView:_refreshRedPoint()
	local RedPointHelper = require("app.data.RedPointHelper")
	local tabCount = self._tabGroup:getTabCount()
	for k = 1,tabCount,1 do
		local redPointShow = false
		if k == 1 then
			 redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP,"myHelpRP")
		elseif k == 2 then
			redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP,"giveHelpRP")
		end
		self._tabGroup:setRedPointByTabIndex(k,redPointShow)
	end
end

function GuildHelpView:_onEventRedPointUpdate(event,funcId,param)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	if funcId and funcId ~= FunctionConst.FUNC_ARMY_GROUP then
		return
	end
	self:_refreshRedPoint()
end


function GuildHelpView:_initTab()
	local tabNameList = {}
	table.insert(tabNameList, Lang.get("guild_help_tab_title_1"))
	table.insert(tabNameList, Lang.get("guild_help_tab_title_2"))

	local param = {
		callback = handler(self, self._onTabSelect),
		textList = tabNameList,
	}
	self._tabGroup:recreateTabs(param)
	self._tabGroup:setTabIndex(1)
end

function GuildHelpView:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	for k, node in pairs(self._contentNodes) do
		node:setVisible(false)
	end
	local curContent = self:_getCurNodeContent()
	if curContent then
		self:_updateContent()
		curContent:updateView()
		curContent:setVisible(true)
	end
end

function GuildHelpView:_getCurNodeContent()
	local nodeContent = self._contentNodes[self._selectTabIndex]
	if nodeContent == nil then
		if self._selectTabIndex == 1 then
			nodeContent = GuildRequestHelpNode.new()
		elseif self._selectTabIndex == 2 then
			nodeContent = GuildHelpList.new()
		end
		self._nodeContent:addChild(nodeContent)
		self._contentNodes[self._selectTabIndex] = nodeContent
	end
	return nodeContent
end

function GuildHelpView:_updateContent()
	self._fullScreen:setTitle(Lang.get("guild_help_tab_title_"..self._selectTabIndex))
end

--踢出事件
function GuildHelpView:_onEventGuildKickNotice(event,uid)
	if uid == G_UserData:getBase():getId() then--被踢玩家是自己
		local UIPopupHelper = require("app.utils.UIPopupHelper")
		UIPopupHelper.popupOkDialog(nil,Lang.get("guild_kick_hint"),function() 
			G_SceneManager:popScene()
			--[[ --军团主城 onEnter 处理了不在军团情况
			if self._isFromGuildMainScene then
				G_SceneManager:popSceneByTimes(2)
			else
				G_SceneManager:popScene()
			end
			]]
		end,Lang.get("common_btn_name_confirm"))
	end
end

return GuildHelpView