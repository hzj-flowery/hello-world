--
-- Author: Liangxu
-- Date: 2017-06-15 15:02:06
-- 军团列表弹框
local PopupBase = require("app.ui.PopupBase")
local PopupGuildListView = class("PopupGuildListView", PopupBase)
local GuildListCell = require("app.scene.view.guild.GuildListCell")
local PopupCreateGuild = require("app.scene.view.guild.PopupCreateGuild")
local UserDataHelper = require("app.utils.UserDataHelper")
local GuildConst = require("app.const.GuildConst")

--等服务器回包后，创建对话框并弹出UI
function PopupGuildListView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end
	local msgReg = G_SignalManager:add(SignalConst.EVENT_GUILD_GET_LIST, onMsgCallBack)
	G_UserData:getGuild():c2sGetGuildList(1)--请求第一页
	return msgReg
end

function PopupGuildListView:ctor()
	
	local resource = {
		file = Path.getCSB("PopupGuildListView", "guild"),
		binding = {
			_buttonApply = {
				events = {{event = "touch", method = "_onButtonApply"}}
			},
			_buttonContact = {
				events = {{event = "touch", method = "_onButtonContact"}}
			},
			_buttonCreate = {
				events = {{event = "touch", method = "_onButtonCreate"}}
			},
		}
	}
	PopupGuildListView.super.ctor(self, resource)
end

function PopupGuildListView:onCreate()
	self._selectIndex = nil
	self._guildInfoList = {}
	self._resize = false
	
	self._panelBg:setTitle(Lang.get("guild_title_join"))
	self._panelBg:addCloseEventListener(handler(self, self._onClickClose))

	self._buttonApply:setString(Lang.get("guild_btn_apply"))
	self._buttonApply:setEnabled(false)
	self._buttonContact:setString(Lang.get("guild_btn_contact"))
	self._buttonCreate:setString(Lang.get("guild_btn_create_guild"))

	self._listItemSource:setTemplate(GuildListCell)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected),nil, handler(self, self._onScrollEvent))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))

end

function PopupGuildListView:onEnter()
	self._signalCreateSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_CREATE_SUCCESS, handler(self, self._createSuccess))
	self._signalApplySuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_APPLY_SUCCESS, handler(self, self._applySuccess))
	self._signalGuildGetList = G_SignalManager:add(SignalConst.EVENT_GUILD_GET_LIST, handler(self, self._onEventGuildGetList))

	self:_updateList()
	--抛出新手事件出新手事件
	--抛出新手事件出新手事件, 只有在公会引导时，抛出事件
	if G_TutorialManager:isDoingStep(32) then
    	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
	end
end

function PopupGuildListView:onExit()
	self._signalCreateSuccess:remove()
	self._signalCreateSuccess = nil
	self._signalApplySuccess:remove()
	self._signalApplySuccess = nil
	self._signalGuildGetList:remove()
	self._signalGuildGetList = nil
end

function PopupGuildListView:_onEventGuildGetList(event)
	self._inRequest = false
	self:_updateList()
end

function PopupGuildListView:_updateList()
	local oldListSize = #self._guildInfoList

	self._guildInfoList = G_UserData:getGuild():getGuildListData():getGuildListBySort()
	self._selectIndex = self._selectIndex or 0--从0开始
	if self._selectIndex >= #self._guildInfoList then
		self._selectIndex = 0
	end
	self._listItemSource:clearAll()

	self._resize = true
	self._listItemSource:resize(#self._guildInfoList)
	self._resize = false

	if oldListSize > 0 and #self._guildInfoList > 0 and #self._guildInfoList ~= oldListSize then
		local posY = self._listItemSource:getItemBottomLocation(math.min(oldListSize,#self._guildInfoList))
		self._listItemSource:setLocation(math.min(oldListSize,#self._guildInfoList),390-15)
		--self._listItemSource:setLocationByPos(cc.p(0,-posY))
	end


	self:_updateInfo(self._selectIndex)	
end

function PopupGuildListView:_onItemUpdate(item, index)
	if self._guildInfoList[index + 1] then
		item:update(self._guildInfoList[index + 1],
			index ,self._selectIndex)
		if self._selectIndex == index then
			logWarn(string.format("------------------------  %d true",index))
		end	
	end
end

function PopupGuildListView:_onItemSelected(item, index)
	if item == nil or self._selectIndex == index then
		return
	end
	local oldSelectItem = self._listItemSource:getItemByTag(self._selectIndex)
	if oldSelectItem then
		logWarn(string.format("------------------------  %d false",self._selectIndex))
		oldSelectItem:setSelected(false)
	else
		logWarn(string.format("------------------------  %d xxxxx",self._selectIndex))	
	end
	item:setSelected(true)
	logWarn(string.format("------------------------  %d true",index))
	self._selectIndex = index
	self:_updateInfo(index)
end

function PopupGuildListView:_onItemTouch(index)
end

function PopupGuildListView:_onScrollEvent(sender, eventType)
	logWarn(" ------------------------ "..eventType)
	if eventType == ccui.ScrollviewEventType.scrollToBottom then
		--logWarn(" ------------------------ scrollToBottom")
		
	elseif eventType == ccui.ScrollviewEventType.containerMoved then
		local y = self._listItemSource:getInnerContainer():getPositionY()
		if y >= -1 and not self._resize and not self._inRequest then
			logWarn(" ------------------------ PositionY "..y)
			local currPageIndex = G_UserData:getGuild():getGuildListData():getNum()
			local pageIndex = currPageIndex +1
			if pageIndex <= G_UserData:getGuild():getGuildListData():getTotalPage()  then
				self._inRequest = true
				logWarn(" ------------------------ request page "..pageIndex)
				G_UserData:getGuild():c2sGetGuildList(pageIndex)
			end
		end
	end
end

--[[
function PopupGuildListView:_findItemNodeByIndex(index)
	local items = self._listItemSource:getItems()
	local itemCellNode = nil
	for k,v in ipairs(items) do
		if v:getTag()  ==  index then
			itemCellNode = v
		end
	end
	return itemCellNode
end
]]

function PopupGuildListView:_updateInfo(index)
	self._data = self._guildInfoList[index + 1]
	if not self._data then
		self._buttonApply:setEnabled(false)
		self._buttonContact:setEnabled(false)
		return
	end

	self._buttonApply:setEnabled(true)
	self._buttonContact:setEnabled(true)


	local declaration = UserDataHelper.getGuildDeclaration(self._data)
	self._textDeclaration:setString(declaration)

	local number = self._data:getMember_num()
	local hasApplication = self._data:isHas_application()
	local maxNumber = UserDataHelper.getGuildMaxMember(self._data:getLevel())
	local isFull = number >= maxNumber

	if isFull and (not hasApplication) then
		--self._buttonApply:setVisible(false)	
		self._buttonApply:setEnabled(false)
	else
		--self._buttonApply:setVisible(true)
		local hasApplication = self._data:isHas_application()
		local btnString = hasApplication and Lang.get("guild_btn_cancel_apply") or Lang.get("guild_btn_apply")
		self._buttonApply:setString(btnString)
	end
end

function PopupGuildListView:_onButtonApply()
	local hasApplication = self._data:isHas_application()
	local op = hasApplication and GuildConst.GUILD_APPLY_OP2 or GuildConst.GUILD_APPLY_OP1
	if op == GuildConst.GUILD_APPLY_OP1 then
		if not UserDataHelper.checkCanApplyJoinInGuild() then
			return
		end
	end

	local guildId = self._data:getId()
	G_UserData:getGuild():c2sGuildApplication(guildId, op)
end

function PopupGuildListView:_onButtonContact()
	if not self._data then
		return 
	end

	if self._data:getLeader_base_id() ~= 0 then --以前的军团没有BaseID

		local ChatConst = require("app.const.ChatConst")
		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		if not LogicCheckHelper.chatMsgSendCheck(ChatConst.CHANNEL_PRIVATE,true,true) then
			return
		end

		local ChatConst = require("app.const.ChatConst")
		local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
		local chatPlayerData = require("app.data.ChatPlayerData").new()
		chatPlayerData:setDataByGuildUnitData(self._data)
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT, {ChatConst.CHANNEL_PRIVATE,chatPlayerData} )
	end

end

function PopupGuildListView:_onButtonCreate()
	local popupCreateGuild = PopupCreateGuild.new(handler(self, self._doCreateGuild))
	popupCreateGuild:openWithAction()
end

function PopupGuildListView:_doCreateGuild(guildName, icon)
	G_UserData:getGuild():c2sCreateGuild(guildName, icon)
end

function PopupGuildListView:_onClickClose()
	self:close()
end

function PopupGuildListView:_applySuccess(eventName, guildId, op)
	local hasApplication = true
	--local btnString = ""
	if op == GuildConst.GUILD_APPLY_OP1 then
		hasApplication = true
		--btnString = Lang.get("guild_btn_cancel_apply")
		
		G_Prompt:showTip(Lang.get("guild_apply_success"))
	elseif op == GuildConst.GUILD_APPLY_OP2 then
		hasApplication = false
		--btnString = Lang.get("guild_btn_apply")

		G_Prompt:showTip(Lang.get("guild_unapply_success"))
	end
	--self._buttonApply:setString(btnString)

	if self._data then
		self._data:setHas_application(hasApplication)
	end
	if self._selectIndex then
		self:_updateInfo(self._selectIndex)
	end
	self:_refreshSelectItem()
end

function PopupGuildListView:_refreshSelectItem()
	local selectItem = self._listItemSource:getItemByTag(self._selectIndex)
	if selectItem and self._guildInfoList[self._selectIndex + 1] then
		selectItem:update(self._guildInfoList[self._selectIndex + 1],self._selectIndex,self._selectIndex)
	end
end

function PopupGuildListView:_createSuccess()
	self:close()
	
	G_SceneManager:showScene("guild")

	local scheduler = require("cocos.framework.scheduler")
	scheduler.performWithDelayGlobal(function()
        G_Prompt:showTip(Lang.get("guild_tip_create_guild_success"))	
    end, 0.1)	
end

return PopupGuildListView