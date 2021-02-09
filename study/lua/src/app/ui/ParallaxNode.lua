--
-- Author: liangxu
-- Date: 2019-10-28
-- 视差节点

local scheduler = require("cocos.framework.scheduler")
local ParallaxNode = class("ParallaxNode", function()
	return cc.Node:create()
end)

function ParallaxNode:ctor()
    self:enableNodeEvents()
    self._subNodes = {}
    self._lastPosition = cc.p(0, 0)
    self._ratio = {}
end

function ParallaxNode:onEnter()
    self._lastPosition = self:_getWorldPos()
    self._scheduleHandler = scheduler.scheduleUpdateGlobal(handler(self, self._update))
end

function ParallaxNode:onExit()
    if self._scheduleHandler then
		scheduler.unscheduleGlobal(self._scheduleHandler)
		self._scheduleHandler = nil
	end
end

function ParallaxNode:_update(f)
    local curPos = self:_getWorldPos()
    local diffDisX = curPos.x - self._lastPosition.x
    local diffDisY = curPos.y - self._lastPosition.y
    if diffDisX == 0 and diffDisY == 0 then
        return
    end

    self._lastPosition = curPos
    
    for name, info in pairs(self._subNodes) do
        local posX = info.lastPos.x + diffDisX * (info.ratio.x - 1)
        local posY = info.lastPos.y + diffDisY * (info.ratio.y - 1)
        self._subNodes[name].lastPos = cc.p(posX, posY)
        local subNode = self:getSubNodeByName(name)
        subNode:setPosition(cc.p(posX, posY))
    end
end

--node加入的子节点 zOrder层级 ratio速率 offset偏移量 name名称
function ParallaxNode:addSubNode(node, zOrder, ratio, offset, name)
    node:setName(name)
    node:setPosition(offset)
    self:addChild(node, zOrder)
    
    self._subNodes[name] = {
        lastPos = offset,
        offset = offset,
        ratio = ratio,
    }
end

function ParallaxNode:_getWorldPos()
    local posX, posY = self:getPosition()
    local worldPos = self:convertToWorldSpace(cc.p(posX, posY))
    return worldPos
end

return ParallaxNode
