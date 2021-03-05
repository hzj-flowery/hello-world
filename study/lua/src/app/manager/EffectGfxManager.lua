--Effect Manager

--特效管理器
local EffectGfxManager = class("EffectGfxManager")

local EffectGfxNode = require("app.effect.EffectGfxNode")
local EffectGfxSingle = require("app.effect.EffectGfxSingle")
local EffectGfxMoving = require("app.effect.EffectGfxMoving")

function EffectGfxManager:ctor()
    
end

--播放嵌套特效形式，不能用于UI控件的控制
--attachNode 需要将特效绑定的父节点
--jsonName 特效文件 一般是存放与effect目录下
--callback 特效事件回调
--autoRelease 特效播放完后自动释放
function EffectGfxManager:createPlayGfx(attachNode, jsonName, callBack, autoRelease, position )

    logDebug(string.format( "EffectGfxManager:playGfx by %s", jsonName))
	local effectNode = EffectGfxNode.new(jsonName,callBack)

    attachNode:addChild(effectNode)
    if position == nil then
        local contentSize = attachNode:getContentSize()
        effectNode:setPosition(contentSize.width*0.5, contentSize.height*0.5)
    else
        effectNode:setPosition(position.x, position.y)
    end
    effectNode:play()

    if autoRelease and autoRelease == true then
        effectNode:setAutoRelease(autoRelease)
    end

    return effectNode
end

--加载flash编辑好的特效文件，生成action， 使得UI播放
--applyNode 指代需要做处理的UI控件
--jsonName 特效文件 一般是存放与move目录下
--callback 特效事件回调
--ignoreAttr 可以忽略掉美术flash一些效果（位移，旋转），而不用重新导出flash文件
--startFrame 起始帧
function EffectGfxManager:applySingleGfx(applyNode, jsonName, callBack, ignoreAttr, startFrame)
    -- logDebug(string.format( "EffectGfxManager:applySingleGfx by %s", jsonName))
	local effectNode = EffectGfxSingle.new(applyNode, jsonName, callBack, ignoreAttr, startFrame)
    effectNode:play()
    return effectNode
end


--加载flash编辑好的特效文件，MovingGfx主要是特效播放过程中会抛出事件
--该事件可以动态创建一些UI控件或特效在MovingGfx上。

--attachNode 需要将特效绑定的父节点
--jsonName 特效文件 一般是存放与move目录下
--effectFunction 节点回调
--callBack 事件回调
--autoRelease 特效播放完后自动释放
function EffectGfxManager:createPlayMovingGfx( attachNode, jsonName, effectFunction, callBack , autoRelease )

    logDebug(string.format( "EffectGfxManager:playMovingGfx by %s", jsonName))
	local effectNode = EffectGfxMoving.new( jsonName, effectFunction, callBack )

    attachNode:addChild(effectNode)
    if position == nil then
        local contentSize = attachNode:getContentSize()
        effectNode:setPosition(contentSize.width*0.5, contentSize.height*0.5)
    else
        effectNode:setPosition(position.x, position.y)
    end

    effectNode:play()
    
    if autoRelease and autoRelease == true then
        effectNode:setAutoRelease(autoRelease)
    end

    return effectNode
end

return EffectGfxManager