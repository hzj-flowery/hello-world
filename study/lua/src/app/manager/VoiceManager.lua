local VoiceManager = class("VoiceManager")
local VoiceConst = require("app.const.VoiceConst")
local ChatConst = require("app.const.ChatConst")
local scheduler = require("cocos.framework.scheduler")
local UserDataHelper = require("app.utils.UserDataHelper")

 VoiceManager.IS_TEST = false
 VoiceManager.MAX_RECORD_TIME = 15--最大录音时间单位秒

function VoiceManager:ctor()
    self._currChatObject = nil--录音时聊天对象
    self._currPlayChatObject = nil--播放录音的聊天消息
    self._currMusicVolume = nil--播放录音和录音时保存的音量
    self._currSoundVolume = nil--播放录音和录音时保存的音量

    self._recordStartTime = nil --录音开始时间
    self._recordFinishTime = nil
    self._playCount  = 0

    self._voiceNewFile = nil
    self._voiceNewFileID = nil
    self._signalVoice = G_VoiceAgent.signal:add(handler(self, self.onVoiceHandler))
    self._playVoiceTimeOutHandle = nil
    self._analogVoiceHandle = nil
end

function VoiceManager:clear()
    self._signalVoice:remove()
    self._signalVoice = nil

    self:stopPlayRecordVoice()--停播正在播放的语音

   self:_stopVoiceTimeOutTimer()

   if self._analogVoiceHandle then
        scheduler.unscheduleGlobal(self._analogVoiceHandle)
        self._analogVoiceHandle = nil
   end
 
end

function VoiceManager:_strippath(filename)  
     local file = string.match(filename, ".+/([^/]*%.%w+)$") -- *nix system  
     return string.sub(file,1, - (string.len("_download.dat")+ 1)) 
end  

function VoiceManager:testVoiceTimeOutTimer()
    if self._currPlayChatObject then
         self:_startVoiceTimeOutTimer(self._currPlayChatObject)
    end
end

function VoiceManager:_startVoiceTimeOutTimer(chatMsg)
    self:_stopVoiceTimeOutTimer()
    self._playVoiceTimeOutHandle = scheduler.performWithDelayGlobal(function()
         logWarn("VoiceManager....... startVoiceTimeOutTimer time out")
        if self._currPlayChatObject and self._currPlayChatObject:voiceEquil(chatMsg) then
            logWarn("VoiceManager....... startVoiceTimeOutTimer time out warn ")
            self:onPlayRecordVoiceTimeOut(chatMsg)
        end
    end,chatMsg:getVoiceInfo().voiceLen + 1)
end


function VoiceManager:_stopVoiceTimeOutTimer()
    if self._playVoiceTimeOutHandle then
        scheduler.unscheduleGlobal(self._playVoiceTimeOutHandle)
        self._playVoiceTimeOutHandle = nil
    end
end


function VoiceManager:_resumeMusic()
     logWarn("VoiceManager ..... resumeMusic")
    if self._currMusicVolume then
        logWarn("VoiceManager.... resumeMusic ok "..tostring(self._currMusicVolume))
        G_AudioManager:setMusicVolume(self._currMusicVolume )
        self._currMusicVolume = nil
    end
    if self._currSoundVolume then
        logWarn("VoiceManager.... resumeSound ok "..tostring(self._currSoundVolume))
        G_AudioManager:setSoundVolume(self._currSoundVolume,true)
        self._currSoundVolume = nil
    end
end

function VoiceManager:_stopMusic()
    self._currMusicVolume = G_AudioManager:getMusicVolume()--停止背景音
    logWarn("VoiceManager....... stopMusic "..tostring(self._currMusicVolume))
    G_AudioManager:setMusicVolume(0)

    self._currSoundVolume = G_AudioManager:getSoundVolume()--停止音效
    logWarn("VoiceManager....... stopSound "..tostring(self._currSoundVolume))
    G_AudioManager:setSoundVolume(0,true)
end

--
function VoiceManager:onVoiceHandler(t, event, ret, fileID, msg)
    if t == "VoiceErrno" then
        --[[if event == "startRecording" then
            if ret ~= VoiceConst.GCLOUD_VOICE_SUCC then
                --调用录音接口失败
            end
        elseif event == "stopRecording" then
            if ret ~= VoiceConst.GCLOUD_VOICE_SUCC then
                --调用停止录音接口失败
            end
        elseif event == "uploadRecorded" then
            if ret ~= VoiceConst.GCLOUD_VOICE_SUCC then
                --调用上传录音接口失败
            end
        elseif event == "downloadRecorded" then
            if ret ~= VoiceConst.GCLOUD_VOICE_SUCC then
                --调用下载录音接口失败
            end
        elseif event == "playRecorded" then
            if ret ~= VoiceConst.GCLOUD_VOICE_SUCC then
                --调用播放录音接口失败
            end
        elseif event == "stopPlayRecorded" then
            if ret ~= VoiceConst.GCLOUD_VOICE_SUCC then
                --调用停止录音接口失败
            end
        elseif event == "speechToText" then
            if ret ~= VoiceConst.GCLOUD_VOICE_SUCC then
                --调用转换文本接口失败
            end
        end]]
    elseif t == "VoiceCompleteCode" then
        if event == "VoiceUploadFile" then
            if ret == VoiceConst.GV_ON_UPLOAD_RECORD_DONE then
                --G_Prompt:showTip("上传录音成功")
                -- 重命名已上传录音，发送者可以不下载自己的录音
                G_VoiceAgent:renameRecorded(self._voiceNewFile, fileID)
                -- 
                self._voiceNewFileID = fileID
                -- 语音转文本
                if G_VoiceAgent:speechToText(fileID, 5000) ~= VoiceConst.GCLOUD_VOICE_SUCC then
                   -- G_WaitingMask:showWaiting(false)
                    self:onRecordVoiceFail("语音转文本接口调用失败")
                end
            else
                -- 失败
              --  G_WaitingMask:showWaiting(false)
                self:onRecordVoiceFail("上传录音失败")
            end
        elseif event == "VoiceDownloadFile" then
            if ret == VoiceConst.GV_ON_DOWNLOAD_RECORD_DONE then
                --下载完成
                --G_Prompt:showTip("下载录音成功")
                G_VoiceAgent:playRecorded(fileID)
            else
                --失败
                self:onPlayRecordVoiceComplete(false,fileID,"下载录音失败")
            end
        elseif event == "VoicePlayRecordedFile" then
            if ret == VoiceConst.GV_ON_PLAYFILE_DONE then
                -- 播放完成
                --G_Prompt:showTip("录音播放完成")
                logWarn("VoiceManager playcomplete filepath "..tostring(fileID))
                if fileID then
                    fileID = self:_strippath(fileID)
                    logWarn("VoiceManager playcomplete filename "..tostring(fileID))
                end    
                self:onPlayRecordVoiceComplete(true,fileID)
            else
                logWarn("VoiceManager  playfail fileID "..tostring(fileID))
                --失败
                self:onPlayRecordVoiceComplete(false,fileID,"录音播放失败")
            end
        elseif event == "VoiceSpeechToText" then
            --
          --  G_WaitingMask:showWaiting(false)
            --
            if ret == VoiceConst.GV_ON_STT_SUCC then
                -- 语音转文本
                --G_Prompt:showTip(msg)
                self:onRecordVoiceSuccess(self._voiceNewFileID, nil, msg)
            else
                --失败
                self:onRecordVoiceFail("语音转文本失败")
            end
        end
    end
end

--开始录音
function VoiceManager:startRecordVoice(chatObject)
    logWarn("VoiceManager ... startRecordVoice")
    if self._currChatObject then
        G_Prompt:showTip("当前正在录音")
        logWarn("VoiceManager....... startRecordVoice errr")
        return false
    end
    self._currChatObject = chatObject
    self:stopPlayRecordVoice() --停播正在播放的语音

    self:_stopMusic()
    local isSuccess = self:_sdkStartRecord()
    if isSuccess or VoiceManager.IS_TEST then
        self._recordStartTime = G_ServerTime:getTime()
       
        logWarn("VoiceManager....... startRecordVoice SDK")
        return true
    else
        self:_resumeMusic()
        self:onRecordVoiceFail("调用录音失败")
        return false
    end
end

--完成录音（回调 onRecordVoiceSuccess or onRecordVoiceFail
function VoiceManager:finishRecordVoice()
     logWarn("VoiceManager....... finishRecordVoice")
    
     local voiceLen = 0
     if self._recordStartTime then
        self._recordFinishTime = G_ServerTime:getTime()
        voiceLen = self._recordFinishTime-self._recordStartTime
     end
     local minVoiceTime = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_VOICE_MIN_TIME)
     if voiceLen < minVoiceTime then
        self:cancelRecordVoice(Lang.get("lang_voice_time_too_short"))
        return 
     end
     self:_resumeMusic()
     if VoiceManager.IS_TEST then --TODO 是不是去掉
         self:onRecordVoiceSuccess(tostring(math.random(1, 1000)),nil,"我是模拟语音")--此处模拟--tostring(math.random(1,10))
     else
        local isSuccess = self:_sdkFinishRecord()
        if not isSuccess then
            self:onRecordVoiceFail("录音失败")
        else
            logWarn("VoiceManager....... finishRecordVoice SDK")    
        end
     end
end

--取消录音（录音时间过短或玩家主动放弃录音）
function VoiceManager:cancelRecordVoice(errMsg)
    logWarn("VoiceManager ....... cancelRecordVoice")

    local isSuccess = self:_sdkStopRecording()

    self:_resumeMusic()
    self:_onRecordVoiceFinish()
    G_Prompt:showTip(errMsg)
end


--录音成功(voiceTime 可以为nil) TODO：SDK回调
function VoiceManager:onRecordVoiceSuccess(voiceUrl,voiceTime,voiceText)
    logWarn("....... onRecordVoiceSucces")

    if not self._currChatObject then    
        self:_onRecordVoiceFinish()
        return
    end

    if not voiceTime and self._recordFinishTime and self._recordStartTime then
         local voiceLen = math.ceil(self._recordFinishTime-self._recordStartTime)
         voiceTime = tostring(voiceLen)
    end
    if voiceText then
        logWarn("VoiceManager "..voiceText)
        local BlackList = require("app.utils.BlackList")
        local UTF8 = require("app.utils.UTF8")
        local chatTextLength = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_TEXT_LENGTH)
        voiceText = UTF8.utf8sub(voiceText,1,chatTextLength) 
        voiceText = BlackList.filterBlack(voiceText) --过滤禁词
        voiceText = string.gsub(voiceText, "|", "*")
        voiceText = string.gsub(voiceText, "#", "*")
    end

    local chatObject = self._currChatObject--取出对应的聊天对象
    local content = string.format("%s#%s#%s",voiceUrl,voiceTime or "",voiceText or "")--"voiceUrl|voiceTime|voiceText"
   
    -- G_UserData:getChat():c2sChatRequest(chatObject:getChannel(),content,chatObject:getChatPlayerData(),ChatConst.MSG_TYPE_VOICE)--2 语音消息
    G_GameAgent:checkTalkAndSend(chatObject:getChannel(),voiceText,chatObject:getChatPlayerData(),ChatConst.MSG_TYPE_VOICE, nil, voiceUrl, voiceTime)
    self:_onRecordVoiceFinish()
end

--录音失败  TODO：SDK回调
function VoiceManager:onRecordVoiceFail(errorMsg)
    logWarn("VoiceManager....... onRecordVoiceFail")
    --if errorMsg then G_Prompt:showTip(errorMsg) end
    self:_onRecordVoiceFinish()
end 

function VoiceManager:_onRecordVoiceFinish()
     logWarn("VoiceManager....... onRecordVoiceFinish")
     self._currChatObject = nil
    --播放下一个语音
    self:_playNextVoice()
end

--播放语音
function VoiceManager:playRecordVoice(chatMsg)
     logWarn("VoiceManager....... playRecordVoice")
     if self._currChatObject then
        G_Prompt:showTip("正在录音...")  
        logWarn("VoiceManager....... playRecordVoice errr")
        return
     end   
     if self._currPlayChatObject and self._currPlayChatObject:voiceEquil(chatMsg) then--不能播放正在播放的音效
        return
     end
     self:stopPlayRecordVoice()--停播正在播放的语音
     chatMsg:setVoicePlay(true)--设置语音成已播放状态（自动播放跳过已播放语音）

     local isSuccess = false
     local voiceInfo = chatMsg:getVoiceInfo()
     local fileID = voiceInfo.voiceUrl
     logWarn("VoiceManager....... fileID "..tostring(fileID))
    
    if VoiceManager.IS_TEST and tonumber(fileID) and  tonumber(fileID) <= 1000 then
        --模拟播放
        G_Prompt:showTip("我在播放模拟语音....."..tostring(fileID))     
        --隔几秒
        local scheduler = require("cocos.framework.scheduler")
        
        if self._analogVoiceHandle then
            scheduler.unscheduleGlobal(self._analogVoiceHandle)
            self._analogVoiceHandle = nil
        end

        if math.random(1, 5) == 3 then
             logWarn("VoiceManager....... analogVoiceHandle")
             self._analogVoiceHandle = scheduler.performWithDelayGlobal(function()
                self._analogVoiceHandle = nil
                self:onPlayRecordVoiceComplete(true,fileID)
            end,voiceInfo.voiceLen)
        end
       

        isSuccess = true
    elseif not fileID or fileID == "" then    
         isSuccess = false
    else
         isSuccess = self:_sdkPlayRecord(fileID)
    end
    if isSuccess then
        self._currPlayChatObject = chatMsg
        self._playCount = self._playCount + 1
        self:_stopMusic()
        G_SignalManager:dispatch(SignalConst.EVENT_VOICE_PLAY_NOTICE,self._currPlayChatObject,true)

         --语音播放超时倒计时,避免语音播放完成或中止时未回调onPlayRecordVoiceComplete
        self:_startVoiceTimeOutTimer(chatMsg)
    else
        self._currPlayChatObject = chatMsg
        self._playCount = self._playCount + 1
        self:onPlayRecordVoiceComplete(false,fileID)    
    end
end

--停播语音 
function VoiceManager:stopPlayRecordVoice()
    logWarn("VoiceManager....... stopPlayRecordVoice")
    if not self._currPlayChatObject then
        return true
    end
    --TODO 停播语音 
    local isSuccess = self:_sdkStopPlayRecord()
    local isFail = (not isSuccess) and self._currPlayChatObject
    if (not isSuccess) and self._currPlayChatObject then
        G_Prompt:showTip("停止播放录音失败")  
    end    
    if self._currPlayChatObject then
         G_SignalManager:dispatch(SignalConst.EVENT_VOICE_PLAY_NOTICE,self._currPlayChatObject,false) 
         self._currPlayChatObject = nil
         logWarn("VoiceManager....... stopPlayRecordVoice currPlayChatObject")
         self:_resumeMusic()
    end
    if isFail then
        self._playCount = self._playCount - 1
    end
    return not isFail
end

--播放语音完成 
function VoiceManager:onPlayRecordVoiceComplete(success,fileID,errorMsg)
    logWarn("VoiceManager....... onPlayRecordVoiceComplete")

    self._playCount = self._playCount - 1
    if self._playCount > 0 then
        return
    end    

   if not self._currPlayChatObject  then
        return
    end    
 
    G_SignalManager:dispatch(SignalConst.EVENT_VOICE_PLAY_NOTICE,self._currPlayChatObject,false) 
    self._currPlayChatObject = nil
    

    if (not self._currChatObject) and (not self._currPlayChatObject) then
        self:_resumeMusic()
        --播放下一个语音
        self:_playNextVoice()
    end
    
end

--播放语音超时 
function VoiceManager:onPlayRecordVoiceTimeOut(chatMsg)
     local voiceInfo = chatMsg:getVoiceInfo()
     local fileID = voiceInfo.voiceUrl
     self:onPlayRecordVoiceComplete(true,fileID)
end

--播放下一个语音
function VoiceManager:_playNextVoice()
    --判断是否是有自动播放
    --从聊天数据取出需要播放的消息
    if not G_NetworkManager:isConnected() then
        return
    end
    logWarn("VoiceManager....... try playNextVoice")
    local nextChatMsg = G_UserData:getChat():getNextAutoPlayVoiceMsg()
    if nextChatMsg then
         logWarn("VoiceManager....... playNextVoice")
        self:playRecordVoice(nextChatMsg)
    end
end

function VoiceManager:tryAutoPlay()
    logWarn("VoiceManager....... tryAutoPlay")
    if (not self._currChatObject) and (not self._currPlayChatObject) then
        self:_playNextVoice()
    end
end

function VoiceManager:_sdkStopPlayRecord()
    if self._currPlayChatObject then
    end    
    local returnCode = G_VoiceAgent:stopPlayRecorded()
    return returnCode == VoiceConst.GCLOUD_VOICE_SUCC
end

function VoiceManager:_sdkPlayRecord(fileID)
    -- 播放 voiceUrl的语音
    local returnCode = nil
    if G_VoiceAgent:isRecordFileExist(fileID) then
        -- 播放录音
        returnCode = G_VoiceAgent:playRecorded(fileID)
    else
        -- 下载录音
        returnCode = G_VoiceAgent:downloadRecorded(fileID, 15000)
    end
    return returnCode == VoiceConst.GCLOUD_VOICE_SUCC
end

function VoiceManager:_sdkStopRecording()
    if self._startRecordVoice then
        self._startRecordVoice = false
        local returnCode = G_VoiceAgent:stopRecording() 
        return returnCode == VoiceConst.GCLOUD_VOICE_SUCC
    end
    return true
end

function VoiceManager:_sdkFinishRecord()
     -- 发送录音  
    if self._startRecordVoice then
        self._startRecordVoice = false
        local returnCode = nil
        -- 停止录音
        returnCode = G_VoiceAgent:stopRecording()
        if returnCode ~= VoiceConst.GCLOUD_VOICE_SUCC then
            return false
        end
        -- 上传录音
        returnCode = G_VoiceAgent:uploadRecorded(self._voiceNewFile, 50000)

        if returnCode ~= VoiceConst.GCLOUD_VOICE_SUCC then
            return false
        end
        -- 显示菊花
        --G_WaitingMask:showWaiting(true)
    end
    --进不到这里
    return true
end

function VoiceManager:_sdkStartRecord()
     -- 开始录音
    self._voiceNewFile = tostring(os.time()):reverse():sub(1, 7)
    if G_VoiceAgent:startRecording(self._voiceNewFile) == VoiceConst.GCLOUD_VOICE_SUCC  then
        self._startRecordVoice = true
        return true
    end
    return false
end
  
return VoiceManager
