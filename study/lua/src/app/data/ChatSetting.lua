
local BaseData = import(".BaseData")
local ChatConst = require("app.const.ChatConst")
local ChatSetting = class("ChatSetting", BaseData)

function ChatSetting:ctor(properties)
	ChatSetting.super.ctor(self, properties)

    self:_loadSetting()
end

function ChatSetting:clear()

end

-- 重置
function ChatSetting:reset()
    self:_loadSetting()
end



function ChatSetting:_loadSetting()
	self._chatSettingData =  G_StorageManager:load(ChatConst.CHAT_SETTING_NAME) or {}
	--self._chatSettingData["checkbox"] = self._chatSettingData["checkbox"] or ChatConst.SETTING_CHECK_BOX_DEFAULT
end

function ChatSetting:saveSetting()
	local message = self._chatSettingData
	G_StorageManager:save(ChatConst.CHAT_SETTING_NAME, message)
end


function ChatSetting:_getSettingValue(key)
	return self._chatSettingData[key]
end


function ChatSetting:saveSettingValue(key,value)
	 self._chatSettingData[key] = value
	 self:saveSetting()
end

function ChatSetting:getCheckBoxValue(id)
	local checkboxData = self:_getSettingValue("checkbox") 
	local checkValue = nil
	if  checkboxData then
		  checkValue = checkboxData[id] --checkboxData[id] or   ChatConst.SETTING_CHECK_BOX_DEFAULT[id]
	end
	if not checkValue then
		if id == ChatConst.SETTING_KEY_AUTO_VOICE_WORLD then
			checkValue = G_ConfigManager:isAutoPlayWorldAudioDefaut() and 1 or 0
		elseif id == ChatConst.SETTING_KEY_AUTO_VOICE_GANG then
			checkValue = G_ConfigManager:isAutoPlayGuildAudioDefaut() and 1 or 0
		else
			checkValue = ChatConst.SETTING_CHECK_BOX_DEFAULT[id]	
		end
	end
--	checkValue = checkValue or 0
	return checkValue
end	


function ChatSetting:isReceiveMsgOfChannel(channel)
	return true
end

--mini聊天框是否显示某个频道的消息
function ChatSetting:isShowMiniMsgOfChannel(channel)
	local key = nil
	if channel == ChatConst.CHANNEL_WORLD then
		key = ChatConst.SETTING_KEY_RECEPT_WORLD
	elseif channel == ChatConst.CHANNEL_SYSTEM then	
		key = ChatConst.SETTING_KEY_RECEPT_SYSTEM
	elseif channel == ChatConst.CHANNEL_CROSS_SERVER then	
		key = ChatConst.SETTING_KEY_RECEPT_CROSS_SERVER
	end
	if not key then
		return true
	end
	local checkValue = self:getCheckBoxValue(key)
	if checkValue and checkValue == 1 then
		return true
	end
	return false
end


--是否播放某个频道的语音
function ChatSetting:isAutoPlayVoiceOfChannel(channel)
	local key = nil
	if channel == ChatConst.CHANNEL_WORLD then
		key = ChatConst.SETTING_KEY_AUTO_VOICE_WORLD
	elseif channel == ChatConst.CHANNEL_GUILD then
		key = ChatConst.SETTING_KEY_AUTO_VOICE_GANG
	elseif channel == ChatConst.CHANNEL_PRIVATE then	
		key = ChatConst.SETTING_KEY_AUTO_VOICE_PRIVATE
	elseif channel == ChatConst.CHANNEL_CROSS_SERVER then	
		key = ChatConst.SETTING_KEY_AUTO_VOICE_CROSS_SERVER
	end
	if not key then
		return false
	end
	local checkValue = self:getCheckBoxValue(key)
	if checkValue and checkValue == 1 then
		return true
	end
	return false
end


return ChatSetting