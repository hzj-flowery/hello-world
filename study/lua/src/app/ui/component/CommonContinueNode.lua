local CommonContinueNode = class("CommonContinueNode")

function CommonContinueNode:ctor()

end

local EXPORTED_METHODS = {
    "setString"
}

function CommonContinueNode:ctor()
	self._target = nil
end

function CommonContinueNode:_init()
	self._target:updateLabel("Text_continue_desc",{
        text = Lang.get("common_text_click_continue"),
        -- color = Colors.CLICK_SCREEN_CONTINUE,
       -- outlineColor = Colors.COLOR_SCENE_OUTLINE,
       -- outlineSize = 2,
    })

	local fadein = cc.FadeIn:create(0.5)
	local fadeout = cc.FadeOut:create(0.5)
	local seq = cc.Sequence:create(fadein,fadeout)
	local repeatAction = cc.RepeatForever:create(seq)
	self._target:runAction(repeatAction)
    
end

function CommonContinueNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonContinueNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonContinueNode:setString(s)
	self._target:updateLabel("Text_continue_desc",{
        text = s,
        color = Colors.CLICK_SCREEN_CONTINUE,
       -- outlineColor = Colors.COLOR_SCENE_OUTLINE,
       -- outlineSize = 2,
    })    
end


return CommonContinueNode