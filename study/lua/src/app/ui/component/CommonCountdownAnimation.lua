-- @Author panhoa
-- @Date 7.4.2018
-- @Role countdownAni

local CommonCountdownAnimation = class("CommonCountdownAnimation")

local EXPORTED_METHODS = {
    "setTextureList",
    "playAnimation",
    "isPlaying",
}


-- @Param imgList   需要传入的图片集
-- @Param callback  
function CommonCountdownAnimation:ctor()
    self._target = nil
end

function CommonCountdownAnimation:_init()
    self._countdownSprite = ccui.Helper:seekNodeByName(self._target, "CountdownSprite")
    self._countdownSprite:setVisible(false)
    
    -- 动画是否播放状态
    self._isPlay = false    
end

-- @Role bind
function CommonCountdownAnimation:bind(target)
    self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

-- @Role unbind
function CommonCountdownAnimation:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

-- @Role cur'state
function CommonCountdownAnimation:isPlaying()
    -- body
    return self._isPlay
end

-- @Param textureList 需要传入的倒计时纹理
-- @Role action-node
function CommonCountdownAnimation:setTextureList(textureList)
    -- body
    if not textureList and #textureList <= 0 then
        assert(false, "CommonCountdownAnimation init textureList is Null!")
        return
    end

    self._textureList = textureList
    self._countdownSprites = {}
    for index = 1, #self._textureList do
        local sprite = cc.Sprite:create(Path.getImgRunway(self._textureList[index]))
        sprite:setVisible(false)
        self._target:addChild(sprite)
        table.insert(self._countdownSprites, sprite)
    end
end

-- @Param startIndex 纹理开始下标
-- @Param endIndex   纹理结束下标
function CommonCountdownAnimation:playAnimation(startIndex, endIndex, callback)
    if #self._textureList < (startIndex - endIndex - 1) then
        assert(false, "CommonCountdownAnimation playAnimation set textureList is not match coounttime!")
        return
    end 

    self._startIndex = startIndex
    self._endIndex = endIndex
    self._callback = callback
    
    -- stopAllActios
    self:_stopAllActios()

    if self._startIndex >= self._endIndex then
        self._curIndex = (startIndex - endIndex + 1)
        if self._textureList[self._curIndex] then
            self._isPlay = true
            self._countdownSprites[self._curIndex]:setVisible(true)
            G_EffectGfxMgr:applySingleGfx(self._countdownSprites[self._curIndex], "smoving_saipaojishi", 
                                                                handler(self, self._timesUpdate), nil, nil)
        end
    else
        self:_callEnd()
    end
end

-- @Role 
function CommonCountdownAnimation:_timesUpdate(eventName)
    if eventName == "finish" then
        self:_changeSpriteVisible()   

        if self._startIndex >= self._endIndex then
            self:_stopAllActios()
            G_EffectGfxMgr:applySingleGfx(self._countdownSprites[self._curIndex], "smoving_saipaojishi", 
                                                                handler(self, self._timesUpdate), nil, nil)
        else
            self:_stopAllActios()
            self:_callEnd()
        end
    end
end

-- @Role change visible sprite
function CommonCountdownAnimation:_changeSpriteVisible()
    -- last visible
    if self._curIndex == 0 then
        return
    end
    self._countdownSprites[self._curIndex]:setVisible(false)

    -- change cur
    self._startIndex = (self._startIndex - 1)
    self._curIndex = (self._curIndex - 1)
    if self._curIndex > 0 and self._textureList[self._curIndex] then
        self._countdownSprites[self._curIndex]:setVisible(true)
    end
end

-- @Role stop allActions
function CommonCountdownAnimation:_stopAllActios()
    -- body
    for index = 1, #self._textureList do
        if self._countdownSprites[index] then
            self._countdownSprites[index]:stopAllActions()
            self._countdownSprites[index]:setScale(1)
        end
    end
end

-- @Role end callback
function CommonCountdownAnimation:_callEnd()
    if self._callback then
        self._callback()
    end
    self._isPlay = false
end


return CommonCountdownAnimation