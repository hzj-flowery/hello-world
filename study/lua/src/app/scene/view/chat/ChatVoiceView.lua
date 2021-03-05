local ViewBase = require("app.ui.ViewBase")
local ChatVoiceView = class("ChatVoiceView", ViewBase)

function ChatVoiceView:ctor()
    self._imageVoice = nil
    self._imageVoice2 = nil
    self._textHint = nil
    self._textHint2 = nil
    self._effectNode = nil
    local resource = {
        file = Path.getCSB("ChatVoiceView", "chat"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
			_imageRoot = {
				events = {{event = "touch", method = "_onClickVoice"}}
			}
		},
    }
    ChatVoiceView.super.ctor(self, resource)
end

function ChatVoiceView:onCreate()
    --local effect = G_EffectGfxMgr:createPlayGfx( self._effectNode, "effect_liaotian_luyin" )
end

function ChatVoiceView:onEnter()
    self:refreshState(true)
end

function ChatVoiceView:onExit()
end

function ChatVoiceView:setImgRootXPos(offset)
    self._imageRoot:setPositionX(offset)
end 

function ChatVoiceView:_onClickVoice(sender)
end

function ChatVoiceView:refreshState(inRecordVoice)

    --self._imageVoice:setVisible(inRecordVoice)
    self._textHint:setVisible(inRecordVoice)
    self._imageVoice2:setVisible(not inRecordVoice)
    self._textHint2:setVisible(not inRecordVoice)
end

return ChatVoiceView
