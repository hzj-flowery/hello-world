
local CommonVoiceBtn = class("CommonVoiceBtn")
local ChatVoiceView = require("app.scene.view.chat.ChatVoiceView")
local scheduler = require("cocos.framework.scheduler")
local EXPORTED_METHODS = {
        "updateInfo",
        "forceFinishRecord",
        "cancelRecordVoice",
        "isInRecordVoice",
        "setGetChatObjectFunc",
        "showChatVoiceViewInCentre"
}


function CommonVoiceBtn:ctor()
	self._target = nil
    self._voiceNode = nil
    self._chatObject = nil
    self._btnTouchListener = nil
    self._getChatObjectFuncfunc = nil
    self._inRecordVoice = false
    self._isInBtnRange = false
    self._maxRecordTime = G_VoiceManager.MAX_RECORD_TIME--最大录音时间单位秒
    self._timerHandle = nil

    self._isChatVoiceViewInCentre = false
end

function CommonVoiceBtn:_init()
    self._target:addTouchEventListener(handler(self,self._onPanelTouched))
end

function CommonVoiceBtn:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonVoiceBtn:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonVoiceBtn:_isTouchInBtn(node,point)
    local pos = node:convertToNodeSpace(cc.p(point))
    local size = node:getContentSize()
    local rect = {x = 0, y = 0,width = size.width ,height =  size.height}
    if not cc.rectContainsPoint(rect, pos) then
        return false
    end
    return true
end

function CommonVoiceBtn:_onPanelTouched( sender,event )
    
	if(event == ccui.TouchEventType.began)then
		return  self:_startRecordVoice()
    elseif(event == ccui.TouchEventType.moved)then    
        --判断是否出了按钮范围
        local point = sender:getTouchMovePosition()
        self._isInBtnRange = self:_isTouchInBtn(sender,point)
        if self._voiceNode then 
            self._voiceNode:refreshState(self._isInBtnRange)
        end
	elseif(event == ccui.TouchEventType.ended)then
        local point = sender:getTouchEndPosition()
        if self:_isTouchInBtn(sender,point) then 
            self:_finishRecordVoice()
        else
            self:cancelRecordVoice()    
        end
	elseif(event == ccui.TouchEventType.canceled)then
		self:cancelRecordVoice()
	end
end


function CommonVoiceBtn:_refreshRecordBtnState(isPress)
    if self._btnTouchListener then
        self._btnTouchListener(self._target,isPress)
    end
    
end

function CommonVoiceBtn:_showRecordVoiceNode()
    if self._voiceNode then 
        self._voiceNode:removeFromParent()
        self._voiceNode = nil
    end
    local voiceNode = ChatVoiceView.new()
    voiceNode:setName("ChatVoiceView")

    if self._isChatVoiceViewInCentre then
        voiceNode:setImgRootXPos(CC_DESIGN_RESOLUTION.width / 2)
    end

    G_SceneManager:getRunningScene():addChildToVoiceLayer(voiceNode)
    self._voiceNode = voiceNode
end

function CommonVoiceBtn:showChatVoiceViewInCentre()
    self._isChatVoiceViewInCentre = true
end

function CommonVoiceBtn:_hideRecordVoiceNode()
    if self._voiceNode then 
        self._voiceNode:removeFromParent()
        self._voiceNode = nil
    end
end

function CommonVoiceBtn:_startRecordVoice()
    --检查是否可以发送消息
    local chatObject = self._chatObject
    if self._getChatObjectFuncfunc then
        chatObject = self._getChatObjectFuncfunc()  
    end
   
    local sendMsgChannel = chatObject:getChannel()
    local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
    if not LogicCheckHelper.chatMsgSendCheck(sendMsgChannel,true) then
        return false
    end
    
    local success = G_VoiceManager:startRecordVoice(chatObject)
    if not success then
        return false 
    end

    self._inRecordVoice = true
    self._isInBtnRange = true
    self:_refreshRecordBtnState(true)
    self:_showRecordVoiceNode()
    self:_startTimer()
    return true
end

function CommonVoiceBtn:_finishRecordVoice()
    if not self._inRecordVoice then
        return
    end
    self._inRecordVoice = false
    self._isInBtnRange = false
    self:_refreshRecordBtnState(false)
    self:_hideRecordVoiceNode()
    self:_endTimer()
    G_VoiceManager:finishRecordVoice()
end

function CommonVoiceBtn:cancelRecordVoice()
    if not self._inRecordVoice then
        return
    end
    self._inRecordVoice = false
    self._isInBtnRange = false
    self:_refreshRecordBtnState(false)
    self:_hideRecordVoiceNode()
    self:_endTimer()
     G_VoiceManager:cancelRecordVoice()
end

function CommonVoiceBtn:updateInfo(chatObject,btnTouchListener)
    self._chatObject = chatObject
    self._btnTouchListener = btnTouchListener
end

function CommonVoiceBtn:setGetChatObjectFunc(func)
    self._getChatObjectFuncfunc  = func
end


function CommonVoiceBtn:_startTimer()
    self:_endTimer()
     --计时
     self._timerHandle = scheduler.performWithDelayGlobal(function()
         --需要停止录音
         self:forceFinishRecord()
     end,self._maxRecordTime)
end

function CommonVoiceBtn:_endTimer()
    if self._timerHandle then
        scheduler.unscheduleGlobal(self._timerHandle)
        self._timerHandle = nil
    end    
end


function CommonVoiceBtn:forceFinishRecord()
     if self._inRecordVoice then
       -- local point = self._target:getTouchMovePosition()
        if  self._isInBtnRange then --self:_isTouchInBtn(self._target,point)
            self:_finishRecordVoice()
        else
            self:cancelRecordVoice()    
        end
    end
end

function CommonVoiceBtn:isInRecordVoice()
    return self._inRecordVoice
end

return CommonVoiceBtn