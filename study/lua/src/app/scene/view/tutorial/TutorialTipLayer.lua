
-- TutorialTipLayer.lua
--引导的提示层
--通常位于场景的最上层，用来屏蔽按钮击穿和提供某一个区域的访问，并提供相应的可能的提示信息

local TutorialTipLayer = class("TutorialTipLayer", function()
	return cc.LayerColor:create(cc.c4b(100,0,0,0))
end)

function TutorialTipLayer:ctor()

    self:setContentSize(G_ResolutionManager:getDesignCCSize())
    -- 可触摸的区域，默认都不可触摸
    self._touchRect = cc.rect(0, 0, 0, 0)

    -- 授权触摸区域，默认没有
    self._authTouchRect = {}

	-- 注册node事件，不过不使用quick的
	self:registerScriptHandler(function(event)
        if event == "enter" then
            self:onEnter()
        elseif event == "exit" then
            self:onExit()
        end
    end)

    -- 触摸事件监听
    local listener = cc.EventListenerTouchOneByOne:create()
    listener:setSwallowTouches(true)
    listener:registerScriptHandler(handler(self, self._onTouchEvent), cc.Handler.EVENT_TOUCH_BEGAN)
    listener:registerScriptHandler(handler(self, self._onTouchEvent), cc.Handler.EVENT_TOUCH_MOVED)
    listener:registerScriptHandler(handler(self, self._onTouchEvent), cc.Handler.EVENT_TOUCH_ENDED)

    self._touchListener = listener

    cc.Director:getInstance():getEventDispatcher():addEventListenerWithSceneGraphPriority(listener, self)

end

function TutorialTipLayer:onEnter()

end

function TutorialTipLayer:onExit()

end


function TutorialTipLayer:destroy()

    if self._touchListener then
        cc.Director:getInstance():getEventDispatcher():removeEventListener(self._touchListener)
        self._touchListener = nil
    end

end

--高亮点击区域
function TutorialTipLayer:showHighLightClick(targetPosition,info)

  
    local function createClipNode()
     
        local stencil = cc.Node:create()
        local clippingNode = cc.ClippingNode:create()

        clippingNode:setStencil(stencil)  
        local contentSize = G_ResolutionManager:getDesignCCSize()
        local layerColor = cc.LayerColor:create(cc.c4b(0, 0, 0, 127), contentSize.width, contentSize.height )
        clippingNode:addChild(layerColor)

        clippingNode:setInverted(true)
        clippingNode:setAlphaThreshold(0.8)
        clippingNode:setName("clippingNode")

        if info and info.light and info.light > 0 then
            local image = display.newSprite(Path.getGuide(tostring("mask")))
            image:setAnchorPoint(cc.p(0.5,0.5))
            stencil:addChild(image)

            local image2 = display.newSprite(Path.getGuide(tostring(info.light)))
            image2:setPosition(targetPosition)
            self:addChild(image2)
        end
    
        stencil:setPosition(targetPosition)
        self:addChild(clippingNode)
        
    end
 
    local clippingNode = self:getChildByName("clippingNode")
    if clippingNode == nil then
        if info.black == 1 then --1则显示黑屏
            createClipNode()
        end
    else
        clippingNode:removeFromParent()
        if info.black == 1 then  --1则显示黑屏
            createClipNode()
        end
    end


end

function TutorialTipLayer:_onTouchEvent(touch, event)

    local eventCode = event:getEventCode()

    local location = touch:getLocation()
    local x, y = location.x, location.y
   
    -- 根据触摸到是否点击到触摸区域来决定是否保留此触摸
    if eventCode == cc.EventCode.BEGAN then
        local nodePos = self:convertToNodeSpace(cc.p(x, y))
        local rect = self._authTouchRect[#self._authTouchRect] or self._touchRect
        local retValue = not cc.rectContainsPoint(rect, nodePos)
        logNewT("TutorialTipLayer:_onTouchEvent(touch, event)"..tostring(retValue))
        if retValue == true then

        end
        return retValue
    end

end


--设置触摸区域
--主要是针对在新手引导当中，哪些位置是可以放过点击的，除此之外的位置则不可以放过
function TutorialTipLayer:setTouchRect(rect)
    self._touchRect = rect
    self:_showTouchRect()


end


--压栈申请触摸区域
--主要是针对授权点击的，按照授权点击的要求设置点击区域，优先级高于引导触摸区域
function TutorialTipLayer:pushAuthTouchRect(rect)
    self._authTouchRect[#self._authTouchRect + 1] = rect
    self:_showTouchRect()
end


--出栈申请触摸区域
function TutorialTipLayer:popAuthTouchRect()
    table.remove(self._authTouchRect, #self._authTouchRect)
    self:_showTouchRect()
end

--清理所有的提示，主要是手之类的
function TutorialTipLayer:clearTip()
    -- 现在先简单粗暴移除所有添加的对象，因为其本身没有其他对象要显示
    self:removeAllChildren()
    self._touchRectLayer = nil
end

function TutorialTipLayer:_showTouchRect()
   -- local rect = self._touchRect
   -- if rect then
   --     self:showHighLightClick(rect)
 --   end
    
     if self._touchRectLayer then
         self._touchRectLayer:removeFromParent()
         self._touchRectLayer = nil
     end
    
     local rect = self._authTouchRect[#self._authTouchRect] or self._touchRect
     if rect then
        if rect.width ~= 0 and rect.height ~= 0 then
           -- self:showHighLightClick(rect)
           -- self._touchRectLayer = cc.LayerColor:create(cc.c4b(255, 0, 0, 60), rect.width, rect.height)
           -- self:addChild(self._touchRectLayer)
           -- self._touchRectLayer:setPosition(rect.x, rect.y)
        end
     end
    

end

return TutorialTipLayer