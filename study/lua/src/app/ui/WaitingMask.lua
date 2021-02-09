local WaitingMask = class("WaitingMask", cc.Layer)

function WaitingMask:ctor()
	self:setTouchEnabled(true)
    self:setTouchMode(cc.TOUCHES_ONE_BY_ONE)
    self:registerScriptTouchHandler(function (event, x, y)
    	if event == "began" then
        	return self._show
    	end
    end)

    self._show = false
	self._loadingNode = cc.Node:create()
    self:addChild(self._loadingNode)
    self._loadingNode:setVisible(false)

    self._loadingSprite = cc.Sprite:create("other/loading.png")
    self._loadingNode:addChild(self._loadingSprite)

    local size = G_TopLevelNode:getRootContentSize()
    self:setPosition(size.width/2, size.height/2)
	G_TopLevelNode:addToWaitingLevel(self)
end

--
function WaitingMask:clear()
    G_TopLevelNode:remove(self)
end

--
function WaitingMask:showWaiting(show, t)
    if self._show ~= show then
        self._show = show
        self._loadingNode:stopAllActions()
        self._loadingNode:setVisible(false)
        self._loadingSprite:stopAllActions()
        self._loadingSprite:setVisible(false)
        --self._loadingSprite:stop()
        if show then
            t = t or 0.2
            self._loadingNode:setVisible(true)
            self._loadingNode:runAction(cc.RepeatForever:create(cc.RotateBy:create(2, 360)))
            self._loadingSprite:runAction(cc.Sequence:create(cc.DelayTime:create(t), cc.Show:create(), cc.CallFunc:create(function ()
                
            end)))
        end
    end
end



return WaitingMask