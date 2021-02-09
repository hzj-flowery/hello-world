
local PopupBase = require("app.ui.PopupBase")
local PopupGuildWarRecord = class("PopupGuildWarRecord", PopupBase)
local UserDataHelper = require("app.utils.UserDataHelper")

--[[
function PopupGuildWarRecord:waitEnterMsg(callBack)
	local function onMsgCallBack(event,list)
		callBack()
	end
	local msgReg = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_MEMBER_DATA_LIST, onMsgCallBack)
	G_UserData:getGuildWar():c2sGuildWarData()
	return msgReg
end
]]

function PopupGuildWarRecord:ctor()
    self._panelBg = nil
    self._listItemSource = nil
	local resource = {
		file = Path.getCSB("PopupGuildWarRecord", "guildwarbattle"),
		binding = {
		}
	}
	PopupGuildWarRecord.super.ctor(self, resource)
end

function PopupGuildWarRecord:onCreate()

    self._panelBg:setTitle(Lang.get("guildwar_record_title"))
	self._panelBg:addCloseEventListener(handler(self, self._onClickClose))

    local GuildWarRecordItemCell = require("app.scene.view.guildwarbattle.GuildWarRecordItemCell")
	self._listItemSource:setTemplate(GuildWarRecordItemCell)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))


    G_UserData:getGuildWar():c2sGuildWarData()
end

function PopupGuildWarRecord:onEnter()
    self._signalMemberDataList = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_MEMBER_DATA_LIST, handler(self, self._onEventMemberDataList ))
end

function PopupGuildWarRecord:onExit()
    self._signalMemberDataList:remove()
	self._signalMemberDataList = nil

end


function PopupGuildWarRecord:_onEventMemberDataList(event,list)
	self:_updateList(list)
end


function PopupGuildWarRecord:_onClickClose()
	self:close()
end


function PopupGuildWarRecord:_updateList(list)
	self._listData =list
	self._listItemSource:clearAll()
	self._listItemSource:resize(#self._listData)
end

function PopupGuildWarRecord:_onItemUpdate(item, index)
	if self._listData[index + 1] then
		item:update(self._listData[index + 1],index + 1)
	end
end

function PopupGuildWarRecord:_onItemSelected(item, index)
end

function PopupGuildWarRecord:_onItemTouch(index,reportId)
end

return PopupGuildWarRecord 