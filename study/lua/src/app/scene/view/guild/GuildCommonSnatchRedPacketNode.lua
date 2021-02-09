local ViewBase = require("app.ui.ViewBase")
local GuildCommonSnatchRedPacketNode = class("GuildCommonSnatchRedPacketNode", ViewBase)
local AudioConst = require("app.const.AudioConst")
local LIGHT_EFFECT_NAMES = {
	[1] = "effect_hongbao_white",
	[2] = "effect_hongbao_blue",
	[3] = "effect_hongbao_orange",
	[6] = "effect_hongbao_purple"
}

function GuildCommonSnatchRedPacketNode:ctor(redPacketData)
	self._panelTouch = nil
	self._currRedPacketData = redPacketData
	local resource = {
		file = Path.getCSB("GuildCommonSnatchRedPacketNode", "guild"),
		binding = {
			_imageRedPacket = {
				events = {{event = "touch", method = "_onButton"}}
			},
			_panelTouch = {
				events = {{event = "touch", method = "_onButton"}}
			}
		}
	}
	GuildCommonSnatchRedPacketNode.super.ctor(self, resource)
end

function GuildCommonSnatchRedPacketNode:onCreate()
end

function GuildCommonSnatchRedPacketNode:onEnter()
	self._signalGuildRedPacketOpenNotice =
		G_SignalManager:add(
		SignalConst.EVENT_GUILD_RED_PACKET_OPEN_NOTICE,
		handler(self, self._onEventGuildRedPacketOpenNotice)
	)
	self:_updateffect()
end

function GuildCommonSnatchRedPacketNode:onExit()
	self._signalGuildRedPacketOpenNotice:remove()
	self._signalGuildRedPacketOpenNotice = nil
end

function GuildCommonSnatchRedPacketNode:_onButton(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20 then
		self:_onClick()
	end
end

function GuildCommonSnatchRedPacketNode:_onClick()
	local redPacketData = G_UserData:getGuild():getCurrSnatchRedPacket()
	assert(redPacketData, "cannot find redPacketData")
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local success, popFunc = LogicCheckHelper.checkGuildCanSnatchRedPacket()
	if success then
		G_UserData:getGuild():c2sOpenGuildRedBag(redPacketData:getId())
	end
end

function GuildCommonSnatchRedPacketNode:_onEventGuildRedPacketOpenNotice(event, redPacketData, openRedBagUserList)
	--[[
	local PopupGuildOpenRedPacket = require("app.scene.view.guild.PopupGuildOpenRedPacket")
	local UserDataHelper = require("app.utils.UserDataHelper")
	local redPacketOpenData = UserDataHelper.getOpenRedPacketData(redPacketData,openRedBagUserList)
	local popup = PopupGuildOpenRedPacket.new(redPacketOpenData)
	popup:openWithAction()
	]]
end

function GuildCommonSnatchRedPacketNode:updateRedPacketData(redPacketData)
	local different = self._currRedPacketData:getId() ~= redPacketData:getId()
	self._currRedPacketData = redPacketData
	if different then
		self:_updateffect()
	end
end

function GuildCommonSnatchRedPacketNode:_updateffect()
	G_AudioManager:playSoundWithId(AudioConst.SOUND_RED_PACKAGE_OPEN)
	local multiple = self._currRedPacketData:getMultiple()
	local lightEffect = LIGHT_EFFECT_NAMES[multiple]
	self._panelTouch:removeAllChildren()
	local config = self._currRedPacketData:getConfig()
	local function eventFunction(event)
		if event == "finish" then
			G_EffectGfxMgr:createPlayGfx(self._panelTouch, lightEffect, nil, true)
			local effect_res = config.show == 1 and "effect_hongbao_fangda" or "effect_hongbao_fangdanew"
			G_EffectGfxMgr:createPlayGfx(self._panelTouch, effect_res, nil, true)
		end
	end
	local effect_res = config.show == 1 and "effect_hongbao_chuxian" or "effect_hongbao_chuxiannew"
	G_EffectGfxMgr:createPlayGfx(self._panelTouch, effect_res, eventFunction, true)
	-- logWarn("GuildCommonSnatchRedPacketNode:_updateffect")
	local bgRes = config.show == 1 and "img_lit_hongbao_03" or "img_lit_hongbao_03_2"
	self._imageRedPacket:loadTexture(Path.getGuildRes(bgRes))
end

return GuildCommonSnatchRedPacketNode
