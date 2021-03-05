local ChatConst = require("app.const.ChatConst")
local ChatUnReadMsgNode = class("ChatUnReadMsgNode")

function ChatUnReadMsgNode:ctor(target,chatMsgScrollView)
    self._target = target
    self._chatMsgScrollView = chatMsgScrollView
    self._imageUnReadMsgNum = ccui.Helper:seekNodeByName(self._target, "ImageUnReadMsgNum")
    self._textUnReadMsgNum = ccui.Helper:seekNodeByName(self._target, "TextUnReadMsgNum")
    self._imageUnReadMsgNum:addClickEventListenerEx(handler(self,self._onClickUnReadMsgView), true, nil, 0)

    self:setVisible(false)
end

function ChatUnReadMsgNode:_onClickUnReadMsgView(sender)
    self._chatMsgScrollView:readAllMsg()
end

function ChatUnReadMsgNode:setVisible(visible)
     self._target:setVisible(visible)
     self._imageUnReadMsgNum:setTouchEnabled(visible)
end

function ChatUnReadMsgNode:refreshAcceptMsgNum(unReadNum)
    if unReadNum <= 0 then
        --渐变消失
        self:_fadeMsgNumView()
        return
    end
    self:_showMsgNumView()
    local maxNum = ChatConst.UNREAD_MSG_MAX_SHOW_NUM
    local str = Lang.get("chat_accept_msg_num",
        	{num = unReadNum > maxNum and tostring(maxNum) .. "+" or  tostring(unReadNum)})
    self._textUnReadMsgNum:setString(str)
end

function ChatUnReadMsgNode:_fadeMsgNumView()
    local action1 = cc.FadeOut:create(0.2)
    local action2 = cc.CallFunc:create(function(actionNode)
		 self:setVisible(false)
	end)

    local action = cc.Sequence:create(action1,action2)
    self._imageUnReadMsgNum:stopAllActions()
    self._imageUnReadMsgNum:runAction(action)
end

function ChatUnReadMsgNode:_showMsgNumView()
    self:setVisible(true)
    self._imageUnReadMsgNum:stopAllActions()
    --self._imageUnReadMsgNum:setVisible(true)
    self._imageUnReadMsgNum:setOpacity(255)       
end


return ChatUnReadMsgNode
