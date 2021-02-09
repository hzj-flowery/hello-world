local DrawBoxCell = class("DrawBoxCell")

DrawBoxCell.STATE_NORMAL = 1
DrawBoxCell.STATE_OPEN = 2
DrawBoxCell.STATE_EMPTY = 3

function DrawBoxCell:ctor(target)
	self._target = target

    self._textPoint = nil
    self._imageBox = nil
    self._imageRing = nil

    self._touchFunc = nil

    self._imageNormal = nil
    self._imageOpen = nil
    self._imageEmpty = nil
    self._point = nil

    self._state = nil

	self:_init()
end

function DrawBoxCell:_init()
    self._imageBox = ccui.Helper:seekNodeByName(self._target, "Image_Box")
    self._imageBox:setTouchEnabled(true)
    self._imageBox:addClickEventListenerEx(handler(self, self._onBoxClick), true, nil, 0)
    self._imageRing = ccui.Helper:seekNodeByName(self._target, "Image_bgRing")
    self._textPoint = ccui.Helper:seekNodeByName(self._target, "Text_Point")
    self._redPoint = ccui.Helper:seekNodeByName(self._target, "RedPoint")
    self._redPoint:setVisible(false)
    self._nodeEffectA = ccui.Helper:seekNodeByName(self._target, "Node_a")
    self._nodeEffectB = ccui.Helper:seekNodeByName(self._target, "Node_b")
end

function DrawBoxCell:addTouchFunc(func)
    self._touchFunc = func
end

function DrawBoxCell:setParam(param)
    self._imageNormal = param.imageClose
    self._imageOpen = param.imageOpen
    self._imageEmpty = param.imageEmpty
    self._point = param.point
    self._textPoint:setString(self._point)
    self._imageBox:loadTexture(self._imageNormal)
end

function DrawBoxCell:_onBoxClick()
    if self._touchFunc then
        self._touchFunc(self)
    end
end

function DrawBoxCell:setBoxState(state)
    self:showRedPoint(false)
    self._imageBox:ignoreContentAdaptWithSize(true)
    if state == DrawBoxCell.STATE_NORMAL then
        self._imageBox:loadTexture(self._imageNormal)
    elseif state == DrawBoxCell.STATE_OPEN then
        self._imageBox:loadTexture(self._imageOpen)
        self:showRedPoint(true)
    elseif state == DrawBoxCell.STATE_EMPTY then
        self._imageBox:loadTexture(self._imageEmpty)
    end
    self._state = state
end

function DrawBoxCell:getBoxPoint()
    return self._point
end

function DrawBoxCell:setRingImage(image)
    self._imageRing:loadTexture(image)
end

function DrawBoxCell:getState()
    return self._state
end

function DrawBoxCell:showRedPoint(s)
    self._redPoint:setVisible(s)
    if s == true then
        self:_playEffectGfx()
    else
        self:_stopEffectGfx()
    end
end

function DrawBoxCell:_stopEffectGfx()
    self._nodeEffectA:removeAllChildren()
end

--根据funcId 播放特效
function DrawBoxCell:_playEffectGfx()
    self:_stopEffectGfx()

    G_EffectGfxMgr:createPlayGfx(self._nodeEffectA,"effect_zhaomu_baoxiang")
   
end

return DrawBoxCell