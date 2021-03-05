local CommonMiniChat = class("CommonMiniChat")

local EXPORTED_METHODS = {
    "setMsgGap",
    "isInRecordVoice",
    "getPanelDanmu"
}

function CommonMiniChat:ctor()
	self._target = nil
    self._chatMiniNode = nil
end

function CommonMiniChat:getPanelDanmu( ... )
    -- body
    return self._panelDanmu
end

function CommonMiniChat:_init()
    self._resNode = ccui.Helper:seekNodeByName(self._target, "ResourceNode")
    self._panelDanmu = ccui.Helper:seekNodeByName(self._target, "PanelDanmu")

    if self._resNode then
        self._resNode:setContentSize(G_ResolutionManager:getDesignCCSize())
    end
    if self._panelDanmu then
        self._panelDanmu:setVisible(false)
    end
    

    self._target:onNodeEvent("exit", function ()
       
        self._signalUserLevelUpdate:remove()
        self._signalUserLevelUpdate = nil
        if self._chatMiniNode then
            logWarn("CommonMiniChat exit .......")
            self._chatMiniNode:onExit()
        end
    end)

     self._target:onNodeEvent("enter", function ()
        self._signalUserLevelUpdate = G_SignalManager:add(SignalConst.EVENT_USER_LEVELUP, handler(self, self._onEventUserLevelUpdate))

        local newCreate = self:_onEventUserLevelUpdate()
        if self._chatMiniNode and not newCreate then
            self._chatMiniNode:onEnter()
        end
    end)
end

function CommonMiniChat:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonMiniChat:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonMiniChat:setMsgGap(gap)
    if self._chatMiniNode then
        self._chatMiniNode:setMsgGap(gap)
    end
end

function CommonMiniChat:_onEventUserLevelUpdate(_, param)
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local chatShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_CHAT)

    local newCreate = false
    if not self._chatMiniNode and chatShow then
        local ChatMiniNode = require("app.scene.view.chat.ChatMiniNode")
	    self._chatMiniNode = ChatMiniNode.new(self._target)
        self._chatMiniNode:onEnter()
        newCreate = true
        logWarn("CommonMiniChat enter .......")
    end

    
    self._target:setVisible(chatShow)

    return newCreate
end


function CommonMiniChat:isInRecordVoice()
    if not self._chatMiniNode then
        return false
    end
    return self._chatMiniNode:isInRecordVoice()
end

return CommonMiniChat
