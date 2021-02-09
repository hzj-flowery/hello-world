local ViewBase = require("app.ui.ViewBase")
local GuildRedPacketNode = class("GuildRedPacketNode", ViewBase)
local GuildMyRedPacketItemCell = require("app.scene.view.guild.GuildMyRedPacketItemCell")
local GuildAllRedPacketItemCell = require("app.scene.view.guild.GuildAllRedPacketItemCell")
local PopupGuildOpenRedPacket = require("app.scene.view.guild.PopupGuildOpenRedPacket")
local PopupGuildGiveRedPacket = require("app.scene.view.guild.PopupGuildGiveRedPacket")
local UserDataHelper = require("app.utils.UserDataHelper")
local GuildConst = require("app.const.GuildConst")

function GuildRedPacketNode:ctor()
	self._listItemSource = nil
	self._listItemSource2 = nil
	local resource = {
		file = Path.getCSB("GuildRedPacketNode", "guild"),
		binding = {
		}
	}
	GuildRedPacketNode.super.ctor(self, resource)
end

function GuildRedPacketNode:onCreate()
	self._commonHelp:updateLangName("HELP_GUILD_RED_PACKET")

	self._listItemSource:setTemplate(GuildMyRedPacketItemCell)
	self._listItemSource:setCallback(handler(self, self._onMyRedPacketItemUpdate), handler(self, self._onMyRedPacketItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onMyRedPacketItemTouch))

	self._listItemSource2:setTemplate(GuildAllRedPacketItemCell)
	self._listItemSource2:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource2:setCustomCallback(handler(self, self._onItemTouch))
end

function GuildRedPacketNode:onEnter()
	self._signalGuildRedPacketDelete = G_SignalManager:add(SignalConst.EVENT_GUILD_RED_PACKET_DELETE, handler(self, self._onEventGuildRedPacketDelete))
	self._signalGuildRedPacketOpenNotice = G_SignalManager:add(SignalConst.EVENT_GUILD_RED_PACKET_OPEN_NOTICE, handler(self, self._onEventGuildRedPacketOpenNotice))
	self._signalGuildRedPacketSend = G_SignalManager:add(SignalConst.EVENT_GUILD_RED_PACKET_SEND, handler(self, self._onEventGuildRedPacketSend))
	self._signalGuildRedPacketGetList = G_SignalManager:add(SignalConst.EVENT_GUILD_RED_PACKET_GET_LIST, handler(self, self._onEventGuildRedPacketGetList))
	self._signalGuildGetUserGuild = G_SignalManager:add(SignalConst.EVENT_GUILD_GET_USER_GUILD, handler(self, self._onEventGuildGetUserGuild))
end


function GuildRedPacketNode:onExit()
	self._signalGuildRedPacketDelete:remove()
	self._signalGuildRedPacketDelete = nil

	self._signalGuildRedPacketOpenNotice:remove()
	self._signalGuildRedPacketOpenNotice = nil

	self._signalGuildRedPacketSend:remove()
	self._signalGuildRedPacketSend = nil
	
	self._signalGuildRedPacketGetList:remove()
	self._signalGuildRedPacketGetList = nil

	self._signalGuildGetUserGuild:remove()
	self._signalGuildGetUserGuild = nil
end

function GuildRedPacketNode:updateView()
	self:_refreshCanSnatchRedPacketNum()
	G_UserData:getGuild():c2sGetGuildRedBagList()
end

function GuildRedPacketNode:_updateList()
	self._guildAllRedPacketList = G_UserData:getGuild():getAllGuildRedPacketList()
	self._guildMyRedPacketList = G_UserData:getGuild():getMyRedPacketList()

	self._listItemSource:clearAll()
	self._listItemSource:resize(#self._guildMyRedPacketList)

	self._listItemSource2:clearAll()
	self._listItemSource2:resize(math.ceil(#self._guildAllRedPacketList/GuildAllRedPacketItemCell.LINE_ITEM_NUM))-- 一行3个
end


function GuildRedPacketNode:_onEventGuildRedPacketDelete(event,redPacketData)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateList()
end

function GuildRedPacketNode:_onEventGuildRedPacketOpenNotice(event,redPacketData,openRedBagUserList)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	--TODO 红包在打开前已是查看状态则不用刷新 
	self:_updateList()

	--[[
	--@see GuildSnatchRedPacketServe
	local redPacketOpenData = UserDataHelper.getOpenRedPacketData(redPacketData,openRedBagUserList)
	local popup = PopupGuildOpenRedPacket.new(redPacketOpenData)
	popup:openWithAction()
	]]
end


function GuildRedPacketNode:_onEventGuildRedPacketSend(event,redPacketData)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateList()
end


function GuildRedPacketNode:_onEventGuildRedPacketGetList(event,redPacketDataList)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateList()
end


function GuildRedPacketNode:_onEventGuildGetUserGuild(event)
	self:_refreshCanSnatchRedPacketNum()
end

function GuildRedPacketNode:_onItemUpdate(item, index)
	if self._guildAllRedPacketList[index * GuildAllRedPacketItemCell.LINE_ITEM_NUM + 1] then
		item:update(index,self._guildAllRedPacketList)
	end
end

function GuildRedPacketNode:_onItemSelected(item, index)

end

function GuildRedPacketNode:_onItemTouch(lineIndex,index)
	local data = self._guildAllRedPacketList[index + 1]
	if not data then
		return
	end
	self:_clickRedPacket(data)
end

function GuildRedPacketNode:_onMyRedPacketItemUpdate(item, index)
	if self._guildMyRedPacketList[index + 1] then
		item:update(self._guildMyRedPacketList[index + 1])
	end
end

function GuildRedPacketNode:_onMyRedPacketItemSelected(item, index)
end

function GuildRedPacketNode:_onMyRedPacketItemTouch(index)
	local data = self._guildMyRedPacketList[index + 1]
	if not data then
		return
	end
	self:_clickRedPacket(data)
end

function GuildRedPacketNode:_clickRedPacket(data)
	local state = data:getRed_bag_state()
	local isMyRedPacket = data:isSelfRedPacket()
	if state == GuildConst.GUILD_RED_PACKET_NO_SEND and isMyRedPacket then
		--发红包
		local popup = PopupGuildGiveRedPacket.new(data)
		popup:openWithAction()
	elseif state == GuildConst.GUILD_RED_PACKET_NO_RECEIVE then
		--领取
		local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
		local success,popFunc = LogicCheckHelper.checkGuildCanSnatchRedPacket()
		if success then
			G_UserData:getGuild():c2sOpenGuildRedBag(data:getId())
		end
		
	elseif state == GuildConst.GUILD_RED_PACKET_RECEIVED then
		--查看
		G_UserData:getGuild():c2sSeeGuildRedBag(data:getId())
	end
end

function GuildRedPacketNode:_refreshCanSnatchRedPacketNum()
	local canSnatchNum = UserDataHelper.getCanSnatchRedPacketNum()
	self._textRemainNum:setString(Lang.get("guild_can_snatch_redpacket_num",{num = canSnatchNum}))
end


return GuildRedPacketNode