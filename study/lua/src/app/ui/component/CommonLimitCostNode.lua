local CommonLimitCostNode = class("CommonLimitCostNode")
local UIActionHelper = require("app.utils.UIActionHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local HeroConst = require("app.const.HeroConst")
local LimitCostConst = require("app.const.LimitCostConst")
local AudioConst = require("app.const.AudioConst")
local UIHelper  = require("yoka.utils.UIHelper")

CommonLimitCostNode.POSY_START = -46 --0%水纹位置
CommonLimitCostNode.POSY_END = 30 --100%水纹位置

function CommonLimitCostNode:ctor(target, costKey, callback, index)
    self._target = target
    self._costKey = costKey
    self._callback = callback
    self._index = index or 1
    self._isShowCount = false -- 是否显示数量，默认显示百分比
    self._isFull = false --是否满了
    self:_init()
    self:_check()
end

function CommonLimitCostNode:_init()
    self._nodeNormal = ccui.Helper:seekNodeByName(self._target, "NodeNormal")
    self._nodeFull = ccui.Helper:seekNodeByName(self._target, "NodeFull")

    self._imageButtom = ccui.Helper:seekNodeByName(self._target, "ImageButtom")
    self._imageFront = ccui.Helper:seekNodeByName(self._target, "ImageFront")
    self._nodeRipple = ccui.Helper:seekNodeByName(self._target, "NodeRipple")
    self._imageName = ccui.Helper:seekNodeByName(self._target, "ImageName")
    self._textPercent = ccui.Helper:seekNodeByName(self._target, "TextPercent")
    self._nodeCount = ccui.Helper:seekNodeByName(self._target, "NodeCount")
    self._nodeCount:setVisible(false)
    self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
    self._buttonAdd:addClickEventListenerEx(handler(self, self._onClickAdd))
    UIActionHelper.playBlinkEffect2(self._buttonAdd)
    self._nodeEffectBg = ccui.Helper:seekNodeByName(self._target, "NodeEffectBg")
    self._nodeEffect = ccui.Helper:seekNodeByName(self._target, "NodeEffect")
    self._redPoint = ccui.Helper:seekNodeByName(self._target, "RedPoint")

    self._imageButtom:setLocalZOrder(-2)
    local clip = UIHelper.setCircleClip(self._nodeRipple, 37)
    clip:setLocalZOrder(-1)

    self:initImageFront()
    self:initRipple()
    self:changeImageName()
    self:initEffectBg()

    G_EffectGfxMgr:createPlayMovingGfx(self._nodeFull, self:getMoving(), nil, nil, false)

    local posX, posY = self._target:getPosition()
    self._initPos = cc.p(posX, posY)
end

-- 重写
function CommonLimitCostNode:getMoving()
    return LimitCostConst.RES_NAME[self._costKey].moving[self._index]
end

-- 重写
function CommonLimitCostNode:initImageFront()
    self:_initImageFront(
        LimitCostConst.RES_NAME[self._costKey].imageButtom[self._index],
        LimitCostConst.RES_NAME[self._costKey].imageFront[self._index]
    )
end

-- 重写
function CommonLimitCostNode:initRipple()
    self:_initRipple(LimitCostConst.RES_NAME[self._costKey].ripple[self._index])
end

-- 重写
function CommonLimitCostNode:initEffectBg()
    self:_initEffectBg(LimitCostConst.RES_NAME[self._costKey].effectBg[self._index])
end

function CommonLimitCostNode:_initImageFront(buttomResId, frontResId)
    self._imageButtom:loadTexture(Path.getLimitImg(buttomResId))
    self._imageFront:loadTexture(Path.getLimitImg(frontResId))
end

function CommonLimitCostNode:_initRipple(animation)
    local spineRipple = require("yoka.node.SpineNode").new()
    self._nodeRipple:addChild(spineRipple)
    spineRipple:setAsset(Path.getEffectSpine("tujieshui"))
    spineRipple:setAnimation(animation, true)
end

function CommonLimitCostNode:_initEffectBg(resId)
    local effectBg = EffectGfxNode.new(resId)
    self._nodeEffectBg:addChild(effectBg)
    effectBg:play()
end

-- node名称 需重写
function CommonLimitCostNode:changeImageName()
    self._imageName:loadTexture(Path.getTextLimit(LimitCostConst.RES_NAME[self._costKey].imageName[self._index]))
end

-- 可重写 检查设置显示百分比还是比值
function CommonLimitCostNode:_check()
    self._isShowCount = true
end

-- 可重写  记得调用_updateCommonUI
function CommonLimitCostNode:updateUI(limitLevel, curCount, limitRed)
    self:_updateCommonUI(limitLevel, curCount, limitRed)
end

-- 数量增加描边，适应背景
function CommonLimitCostNode:enableTextOutline(enable)
    if enable then
        local txtColorOutline = cc.c4b(0x00, 0x00, 0x00, 0xff)   -- 黑色
        self._textPercent:enableOutline(txtColorOutline,2)
    else
		self._textPercent:disableEffect(cc.LabelEffect.OUTLINE)
    end
end

function CommonLimitCostNode:_updateCommonUI(limitLevel, curCount, limitRed)
    self._target:setVisible(true)
    local percent, totalCount = self:_calPercent(limitLevel, curCount, limitRed)
    self._isFull = percent >= 100
    local ripplePos = self:_getRipplePos(percent)
    self._nodeRipple:setPosition(ripplePos.x, ripplePos.y)
    if self._isShowCount then --显示数量
        self._textPercent:setString(curCount .."/" .. totalCount)
    else
        logWarn("CommonLimitCostNode:_updateCommonUI " .. percent)
        self._textPercent:setString(percent .. "%")
    end
    self:_updateState()
    self._target:setPosition(self._initPos)
end

function CommonLimitCostNode:_onClickAdd()
    if self._lock or self._isFull then
        return
    end
    if self._callback then
        self._callback(self._costKey)
    end
end

function CommonLimitCostNode:_getRipplePos(percent)
    local height = (self.class.POSY_END - self.class.POSY_START) * percent / 100
    local targetPosY = self.class.POSY_START + height
    return {x = 0, y = targetPosY}
end

-- 计算节点数量比值 需重写
function CommonLimitCostNode:_calPercent(limitLevel, curCount, limitRed)
    return 0, 1
end

function CommonLimitCostNode:playRippleMoveEffect(limitLevel, curCount, limitRed)
    limitRed = limitRed or 0
    self._nodeRipple:stopAllActions()
    local percent, totalCount = self:_calPercent(limitLevel, curCount, limitRed)
    self._isFull = percent >= 100
    local targetPos = self:_getRipplePos(percent)
    local action = cc.MoveTo:create(0.4, cc.p(targetPos.x, targetPos.y))
    self._nodeRipple:runAction(action)
    if self._isShowCount then --显示数量
        self._textPercent:setString(curCount .. "/" .. totalCount)
    else
        logWarn("CommonLimitCostNode:playRippleMoveEffect " .. percent)
        self._textPercent:setString(percent .. "%")
    end
    self:_playEffect(self._isFull)
end

function CommonLimitCostNode:_playEffect(isFull)
    if isFull then
        logWarn(" CommonLimitCostNode:_playEffect Full")
        G_AudioManager:playSoundWithId(AudioConst.SOUND_LIMIT_YINMAN)
        self:_playFullEffect()
    else
        logWarn(" CommonLimitCostNode:_playEffect not Full")
        self:_playCommonEffect()
    end
end

--播放一般粒子到达特效
function CommonLimitCostNode:_playCommonEffect()
    local function eventFunc(event)
        if event == "finish" then
            self:_updateState()
        end
    end
    local effectReceive = EffectGfxNode.new(self:getEffectReceiveName(), eventFunc)
    effectReceive:setAutoRelease(true)
    self._nodeEffect:addChild(effectReceive)
    effectReceive:play()
end

function CommonLimitCostNode:getEffectReceiveName()
    return LimitCostConst.RES_NAME[self._costKey].effectReceive[self._index]
end

--播放满时的特效
function CommonLimitCostNode:_playFullEffect()
    local function eventFunc(event)
        if event == "fuck" then
            self:_updateState()
        end
    end
    local effectName = self:getFullEffectName()
    local effectFull = EffectGfxNode.new(effectName, eventFunc)
    effectFull:setAutoRelease(true)
    self._nodeEffect:addChild(effectFull)
    effectFull:play()
end

function CommonLimitCostNode:getFullEffectName()
    return LimitCostConst.RES_NAME[self._costKey].effectFull[self._index]
end

-- 重写 播放突界动画
function CommonLimitCostNode:playSMoving()
    self:_playSmoving(LimitCostConst.RES_NAME[self._costKey].smoving[self._index])
end

function CommonLimitCostNode:_playSmoving(smoving)
    G_EffectGfxMgr:applySingleGfx(
        self._target,
        smoving,
        function()
            self._target:setVisible(false)
        end
    )
end

function CommonLimitCostNode:_updateState()
    self._nodeFull:setVisible(self._isFull)
    self._nodeNormal:setVisible(not self._isFull)
    self._lock = false
end

function CommonLimitCostNode:isFull()
    return self._isFull
end

function CommonLimitCostNode:showRedPoint(show)
    self._redPoint:setVisible(show)
end

function CommonLimitCostNode:lock()
    self._lock = true
end

function CommonLimitCostNode:setVisible(visible)
    self._target:setVisible(visible)
end

return CommonLimitCostNode
