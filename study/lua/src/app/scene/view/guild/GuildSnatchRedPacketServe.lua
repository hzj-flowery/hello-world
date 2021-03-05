
local GuildCommonSnatchRedPacketNode = import(".GuildCommonSnatchRedPacketNode")
local GuildSnatchRedPacketServe = class("GuildSnatchRedPacketServe")
local UserDataHelper = require("app.utils.UserDataHelper")
local AudioConst = require("app.const.AudioConst")

function GuildSnatchRedPacketServe:ctor( ... )
	self._rootNode = nil
	self._filterSceneList = {"login"}
	self._isShowSnatchRedPacketUI = nil
	self:_registerEvents()
end

function GuildSnatchRedPacketServe:_registerEvents()
	if not self._signalChangeScene then
		self._signalChangeScene = G_SignalManager:add(SignalConst.EVENT_SCENE_TRANSITION, handler(self, self._onEventChangeScene))    
	end
	if not self._signalGuildCanSnatchRedPacketNumChange then
		self._signalGuildCanSnatchRedPacketNumChange = G_SignalManager:add(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE,
			 handler(self, self._onEventCanSnatchRedPacketNumChange))   
	end
	if not self._signalGuildRedPacketOpenNotice then
		self._signalGuildRedPacketOpenNotice = G_SignalManager:add(SignalConst.EVENT_GUILD_RED_PACKET_OPEN_NOTICE, handler(self, self._onEventGuildRedPacketOpenNotice))
	end

	if self._rootNode == nil then
		self:_createRootNode()
	end
end

function GuildSnatchRedPacketServe:_unRegisterEvents()
	if self._signalChangeScene then
		self._signalChangeScene:remove()
		self._signalChangeScene = nil
	end
	if self._signalGuildCanSnatchRedPacketNumChange then
		self._signalGuildCanSnatchRedPacketNumChange:remove()
		self._signalGuildCanSnatchRedPacketNumChange = nil
	end
	if self._signalGuildRedPacketOpenNotice then
		self._signalGuildRedPacketOpenNotice:remove()
    	self._signalGuildRedPacketOpenNotice = nil
	end
end

function GuildSnatchRedPacketServe:start()
	self:_registerEvents()
end

function GuildSnatchRedPacketServe:_onEventGuildRedPacketOpenNotice(event,redPacketData,openRedBagUserList,snatchSuccess)
	self:_closePopup()
	local PopupGuildOpenRedPacket = require("app.scene.view.guild.PopupGuildOpenRedPacket")
	local redPacketOpenData = UserDataHelper.getOpenRedPacketData(redPacketData,openRedBagUserList)
	local popup = PopupGuildOpenRedPacket.new(redPacketOpenData)
	popup:setName("PopupGuildOpenRedPacket")
	popup:openWithAction()
	self._popupSignal = popup.signal:add(handler(self, self._onPopupPatrolClose))

	if snatchSuccess then
		G_AudioManager:playSoundWithId(AudioConst.SOUND_RED_PACKAGE_RECIEVE_SUCCESS)
	end

end

function GuildSnatchRedPacketServe:_onPopupPatrolClose(event)
    if event == "close" then
		if self._popupSignal then
			self._popupSignal:remove()
			self._popupSignal = nil
		end

		local hintFlag = G_UserData:getGuild():isLastCanSnatchRedPacketHintFlag()
		if hintFlag then
			 G_UserData:getGuild():setLastCanSnatchRedPacketHintFlag(false)
			 G_Prompt:showTip(Lang.get("guild_snatch_redpacket_num_limit_hint"))
		end

    end
end


function GuildSnatchRedPacketServe:_closePopup()
	local popupGuildOpenRedPacket  = G_SceneManager:getRunningScene():getPopupByName("PopupGuildOpenRedPacket")
    if popupGuildOpenRedPacket then
        popupGuildOpenRedPacket:close()
    end
end

function GuildSnatchRedPacketServe:_onEventChangeScene(event,enter,sceneName)	
	if enter then
		if table.indexof(self._filterSceneList,sceneName) == false then
			self:show()	
		else
			self:hide()
		end
	end
end

function GuildSnatchRedPacketServe:_onEventCanSnatchRedPacketNumChange(event,num)
	local redPacketData = G_UserData:getGuild():getCurrSnatchRedPacket()
	local num = UserDataHelper.getCanSnatchRedPacketNum()
	if redPacketData and num > 0 then
		self:_showSnatchRedPacketUI(redPacketData)
	else
		self:_removeSnatchRedPacketUI()
	end
end

function GuildSnatchRedPacketServe:_showSnatchRedPacketUI(redPacketData)
	if self._isShowSnatchRedPacketUI then
		self._itemNode:updateRedPacketData(redPacketData)
		return
	end

	local itemNode = GuildCommonSnatchRedPacketNode.new(redPacketData)
	itemNode:setPosition(0,0)
	self._rootNode:addChild(itemNode)
	self._itemNode = itemNode
	self._isShowSnatchRedPacketUI = true
end

function GuildSnatchRedPacketServe:_removeSnatchRedPacketUI( ... )
	if self._rootNode ~= nil then
		self._rootNode:removeAllChildren()
		self._itemNode = nil
		self._isShowSnatchRedPacketUI = nil
	end
end


function GuildSnatchRedPacketServe:clear()
	self:_unRegisterEvents()
	self:_removeSnatchRedPacketUI()
	if self._rootNode ~= nil then
		self._rootNode:removeFromParent()
		self._rootNode = nil
	end

	self._popupSignal = nil

end

function GuildSnatchRedPacketServe:show( ... )
	logWarn("GuildSnatchRedPacketServe show ")
	if self._rootNode ~= nil then
		self._rootNode:setVisible(true)
	end
end

function GuildSnatchRedPacketServe:hide( ... )
	logWarn("GuildSnatchRedPacketServe hide ")
	if self._rootNode ~= nil then
		self._rootNode:setVisible(false)
	end
end

function GuildSnatchRedPacketServe:_createRootNode()
	if self._rootNode == nil then
		self._rootNode = display.newNode()
		G_TopLevelNode:addToSubtitleLayer(self._rootNode)

	end
end

return GuildSnatchRedPacketServe