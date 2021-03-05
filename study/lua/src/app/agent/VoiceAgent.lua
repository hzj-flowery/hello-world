local VoiceAgent = class("VoiceAgent")
local PrioritySignal = require("yoka.event.PrioritySignal")
local MessageError  = require("app.config.net_msg_error")
local VoiceConst = require("app.const.VoiceConst")


--
function VoiceAgent:ctor()
	--
	self._voiceSuccRet = {
		[VoiceConst.GV_ON_JOINROOM_SUCC] = true,
		[VoiceConst.GV_ON_QUITROOM_SUCC] = true,
		[VoiceConst.GV_ON_MESSAGE_KEY_APPLIED_SUCC] = true,
		[VoiceConst.GV_ON_UPLOAD_RECORD_DONE] = true,
		[VoiceConst.GV_ON_DOWNLOAD_RECORD_DONE] = true,
		[VoiceConst.GV_ON_STT_SUCC] = true,
		[VoiceConst.GV_ON_PLAYFILE_DONE] = true,
	}
	--qiyu
    --self._voiceId = "1119024502"
    --self._voiceKey = "811efe18f32ffeef66bfbcc8b65d5751"
    --yoka
    self._voiceId = "1698864032"
    self._voiceKey = "f3faf617681b352187b72193119f7697"
    self._voiceOpenId = "0"

	--
	voice.create()
    voice.registerScriptHandler(handler(self, self.onScriptHandler))

    --
    self.signal = PrioritySignal.new("number", "table")
end

--
function VoiceAgent:setAppId(appId)
	self._voiceId = appId
end

--
function VoiceAgent:setAppKey(appKey)
	self._voiceKey = appKey
end

--
function VoiceAgent:setOpenId(openId)
	self._voiceOpenId = openId
end

--
function VoiceAgent:init()
	local ret = self:setAppInfo(self._voiceId, self._voiceKey, self._voiceOpenId)
	if ret == VoiceConst.GCLOUD_VOICE_SUCC then
		ret = voice.init()
		self:_onVoiceError("VoiceErrno", "init", ret)
	end

	return ret
end

--
function VoiceAgent:setAppInfo(appID, appKey, openID)
	local ret = voice.setAppInfo(appID, appKey, openID)
	self:_onVoiceError("VoiceErrno", "setAppInfo", ret)
	return ret
end

--
function VoiceAgent:setMaxMessageLength(msTime)
	local ret = voice.setMaxMessageLength(msTime)
	self:_onVoiceError("VoiceErrno", "setMaxMessageLength", ret)
	return ret
end
   
--
function VoiceAgent:applyMessageKey(msTimeout)
	local ret = self:setAppInfo(self._voiceId, self._voiceKey, self._voiceOpenId)
	if ret == VoiceConst.GCLOUD_VOICE_SUCC then
		ret = voice.applyMessageKey(msTimeout)
		self:_onVoiceError("VoiceErrno", "applyMessageKey", ret)
	end
	return ret
end

--
function VoiceAgent:startRecording(fileName)
	local ret = voice.startRecording(fileName)
	self:_onVoiceError("VoiceErrno", "startRecording", ret)
	return ret
end

--
function VoiceAgent:stopRecording()
	local ret = voice.stopRecording()
	self:_onVoiceError("VoiceErrno", "stopRecording", ret)
	return ret
end

--
function VoiceAgent:renameRecorded(fileName, fileID)
	voice.renameRecorded(fileName, fileID)
end

--
function VoiceAgent:uploadRecorded(fileName, timeout)
	local ret = voice.uploadRecorded(fileName, timeout)
	self:_onVoiceError("VoiceErrno", "uploadRecorded", ret)
	return ret
end

--
function VoiceAgent:downloadRecorded(fileID, msTimeout)
	local ret = voice.downloadRecorded(fileID, msTimeout)
	self:_onVoiceError("VoiceErrno", "downloadRecorded", ret)
	return ret
end

--
function VoiceAgent:playRecorded(fileID)
	local ret = voice.playRecorded(fileID)
	self:_onVoiceError("VoiceErrno", "playRecorded", ret)
	return ret
end

--
function VoiceAgent:stopPlayRecorded()
	local ret = voice.stopPlayRecorded()
	self:_onVoiceError("VoiceErrno", "stopPlayRecorded", ret)
	return ret
end

--
function VoiceAgent:speechToText(fileID, msTimeout)
	local ret = voice.speechToText(fileID, msTimeout)
	self:_onVoiceError("VoiceErrno", "speechToText", ret)
	return ret
end

--
function VoiceAgent:isRecordFileExist(fileID)
	return voice.isRecordFileExist(fileID) == 1
end

--100 means same as it has been recorded, 
--50 means half volume, 
--200 means double volume
function VoiceAgent:setMicVolume(v)
	if voice.setMicVolume then
	    local ret = voice.setMicVolume(v)
		self:_onVoiceError("VoiceErrno", "setMicVolume", ret)
		return ret
	end
end

--value range is 0-800, 
--100 means original voice volume, 
--50 means only 1/2 original voice volume, 
--200 means double original voice volume
function VoiceAgent:setSpeakerVolume(v)
	if voice.setSpeakerVolume then
	    local ret = voice.setSpeakerVolume(v)
		self:_onVoiceError("VoiceErrno", "setSpeakerVolume", ret)
		return ret
	end
end

--
function VoiceAgent:onScriptHandler(t, event, ret, fileID, msg)
	self:_onVoiceError(t, event, ret)
	self.signal:dispatch(t, event, ret, fileID, msg)
	print("VoiceAgent:onScriptHandler", event, ret)
end

--
function VoiceAgent:_onVoiceError(t, event, ret)
	if t == "VoiceErrno" then
		if ret ~= VoiceConst.GCLOUD_VOICE_SUCC then
			local error_msg = nil
			if ret == -1 then
				error_msg = "当前平台不支持语音消息"
			else
				local errMsg = MessageError.get(1000000 + ret)
				if errMsg ~= nil then
					error_msg = errMsg.error_msg
				end
			end
			
			if error_msg ~= nil then
				G_Prompt:showTip(error_msg)
			else
				G_Prompt:showTip("VoiceErrno ret: "..tostring(ret))
			end
		end
	elseif t == "VoiceCompleteCode" then
		if self._voiceSuccRet[ret] == true then
		else
			local errMsg = MessageError.get(2000000 + ret)
			if errMsg ~= nil then
				G_Prompt:showTip(errMsg.error_msg)
			else
				G_Prompt:showTip("VoiceCompleteCode ret: "..tostring(ret))
			end
		end
	end
end

return VoiceAgent