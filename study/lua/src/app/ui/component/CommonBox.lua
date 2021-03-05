local CommonBox = class("CommonBox")

local EXPORTED_METHODS = {
    "addClickEventListenerEx",
    "setParams",
    "setState",
    "playBoxJump",
}

-- params = 
-- {
--     picNormal,
--     picEmpty,
--     picOpen,
--     effect,
-- }

--
function CommonBox:ctor()
	self._target = nil
    self._touchPanel = nil
    self._imageBox = nil
    self._nodeEffect = nil

    self._picNormal = nil
    self._picEmpty = nil
    self._picOpen = nil
    self._effect = nil

    self._hasEffect = false

    self._nowState = nil
end

--
function CommonBox:_init()
    self._touchPanel = ccui.Helper:seekNodeByName(self._target, "Touch_Panel")
    self._imageBox = ccui.Helper:seekNodeByName(self._target, "Image_Box")
    self._nodeEffect = ccui.Helper:seekNodeByName(self._target, "Node_Effect")
end

--
function CommonBox:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

--
function CommonBox:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonBox:addClickEventListenerEx(callback)
	self._touchPanel:addClickEventListenerEx(callback, true, nil, 0)
end

--
function CommonBox:setParams(params)
    self._picNormal = params.picNormal or Path.getChapterBox("img_mapbox_guan")
    self._picEmpty = params.picEmpty or Path.getChapterBox("img_mapbox_kong")
    self._picOpen = params.picOpen or Path.getChapterBox("img_mapbox_kai")
    self._effect = params.effect or "effect_boxflash_xingxing"
    if params.effect then
        self._hasEffect = true
    end
end

function CommonBox:setState(state)
    if self._nowState == state then
        return
    end
    self._nowState = state
    self._nodeEffect:setVisible(false)
    self._imageBox:setVisible(false)
    if state == "normal" then 
        self._imageBox:setVisible(true)
        self._imageBox:loadTexture(self._picNormal)
    elseif state == "open" then 
        self._nodeEffect:setVisible(true)
        self._nodeEffect:removeAllChildren()
        G_EffectGfxMgr:createPlayGfx(self._nodeEffect, self._effect)
        self._imageBox:setVisible(true)
        self._imageBox:loadTexture(self._picOpen)
    elseif state == "empty" then 
        self._imageBox:setVisible(true)
        self._imageBox:loadTexture(self._picEmpty)
    end
end

function CommonBox:playBoxJump()
    self._nodeEffect:removeAllChildren()
    self._imageBox:setVisible(false)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "effect_boxjump"then
            local subEffect = EffectGfxNode.new("effect_boxjump")
            subEffect:play()
            return subEffect
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self._nodeEffect, "moving_boxjump", effectFunction, nil, false )
    --local size = baseNode:getContentSize()
    --effect:setPosition(size.width*0.5, size.height*0.5)

end
return CommonBox