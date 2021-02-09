local TopLevelNode = class("TopLevelNode", cc.Scene)

local Director = cc.Director:getInstance()

function TopLevelNode:ctor()
    local resolutionSize =  G_ResolutionManager:getDesignCCSize()
    local width = resolutionSize.width
    local height = resolutionSize.height
    --
    self._root = cc.LayerColor:create(cc.c4b(100,0,0,0))
    self._root:setContentSize(width, height)
    self._root:setIgnoreAnchorPointForPosition(false)
    self._root:setPosition(display.center)
    self._root:setAnchorPoint(0.5, 0.5)
    self:addChild(self._root, 100000)

   --
    self._drawNodeTop = cc.DrawNode:create()
    self:addToBlackFrame(self._drawNodeTop)
    self._drawNodeTop:clear()
    local p = {
        {x=-display.width*0.5, y=0},
        {x=-display.width*0.5, y=400},
        {x=display.width*0.5, y=400},
        {x=display.width*0.5, y=0}
    }
    self._drawNodeTop:drawPolygon(p, 4, cc.c4f(0, 0, 0, 1), 0, cc.c4f(0, 0, 0, 0))
    self._drawNodeTop:setPosition(cc.p(display.cx,height*0.5+320))

    --
    self._drawNodeBottom = cc.DrawNode:create()
    self:addToBlackFrame(self._drawNodeBottom)
    self._drawNodeBottom:clear()
    local p = {
        {x=-display.width*0.5, y=0},
        {x=-display.width*0.5, y=-400},
        {x=display.width*0.5, y=-400},
        {x=display.width*0.5, y=0}
    }
    self._drawNodeBottom:drawPolygon(p, 4, cc.c4f(0, 0, 0, 1), 0, cc.c4f(0, 0, 0, 0))
    self._drawNodeBottom:setPosition(cc.p(display.cx, height*0.5-320))

    
    -- self._drawNodeLeft = cc.DrawNode:create()
    -- self:addToBlackFrame(self._drawNodeLeft)
    -- self._drawNodeLeft:clear()
    -- local p = {
    --     {x=0, y=-display.height*0.5},
    --     {x=-400, y=-display.height*0.5},
    --     {x=-400, y=display.height*0.5},
    --     {x=0, y=display.height*0.5}
    -- }
    -- self._drawNodeLeft:drawPolygon(p, 4, cc.c4f(0, 0, 0, 1), 0, cc.c4f(0, 0, 0, 0))
    -- self._drawNodeLeft:setPosition(cc.p(width*0.5-700, display.cy))
    
    -- self._drawNodeRight = cc.DrawNode:create()
    -- self:addToBlackFrame(self._drawNodeRight)
    -- self._drawNodeRight:clear()
    -- local p = {
    --     {x=0, y=-display.height*0.5},
    --     {x=400, y=-display.height*0.5},
    --     {x=400, y=display.height*0.5},
    --     {x=0, y=display.height*0.5}
    -- }
    -- self._drawNodeRight:drawPolygon(p, 4, cc.c4f(0, 0, 0, 1), 0, cc.c4f(0, 0, 0, 0))
    -- self._drawNodeRight:setPosition(cc.p(width*0.5+700, display.cy))

    local picPath = "ui3/common/sidebar.jpg"
    local sideNodeLeft = cc.Sprite:create(picPath)
    sideNodeLeft:setAnchorPoint(cc.p(1, 0.5))
    self:addToBlackFrame(sideNodeLeft)
    sideNodeLeft:setPosition(cc.p(width*0.5-700, display.cy))

    local sideNodeRight = cc.Sprite:create(picPath)
    self:addToBlackFrame(sideNodeRight)
    sideNodeRight:setAnchorPoint(cc.p(1, 0.5))
    sideNodeRight:setScaleX(-1)
    sideNodeRight:setPosition(cc.p(width*0.5+700, display.cy))

    

    if APP_DEVELOP_MODE then
        local imageView = ccui.Button:create()
        imageView:addClickEventListenerEx(handler(self, self.onDebugClick), true, nil, 0)
        imageView:setSwallowTouches(true)
        imageView:loadTextures(Path.getUICommon("img_battle_arrow_up"),"")
        imageView:setScale(1.5)
         local resolutionSize =  G_ResolutionManager:getDesignCCSize()
        imageView:setTouchEnabled(true)
        imageView:setPosition(resolutionSize.width-4,resolutionSize.height)
        imageView:setAnchorPoint(cc.p(1,1))
        self:addToOfflineLevel(imageView)
    end
    Director:setNotificationNode(self)
end

function TopLevelNode:onDebugClick( ... )
    -- body
    if APP_DEVELOP_MODE then
        local UIDebugView = ccui.Helper:seekNodeByName( display.getRunningScene(), "UIDebugView")
        if UIDebugView == nil then
            UIDebugView = require("app.scene.view.uicontrol.UIDebugView").new()
            UIDebugView:open()
        end
    end
end
--
function TopLevelNode:getRootContentSize()
    return self._root:getContentSize()
end

--
function TopLevelNode:addToWaitingLevel(node)
    if self._root then
	   self._root:addChild(node, 3000)
    end
end

--
function TopLevelNode:addToOfflineLevel(node)
    if self._root then
        self._root:addChild(node, 20000)
    end
end

function TopLevelNode:addToRealNameLevel(node)
    if self._root then 
        self._root:addChild(node, 3000)
    end
end

function TopLevelNode:addToTipLevel(node)
    if self._root then 
        self._root:addChild(node, 4000)
    end
end

--
function TopLevelNode:addToNoticeLevel(node)
    if self._root then
        self._root:addChild(node, 30000)
    end
end

--最高层，特效层放后面
function TopLevelNode:addToShareLevel(node)
    if self._root then
	   self._root:addChild(node, 50000)
    end
end

--
function TopLevelNode:addToTouchEffectLevel(node)
    if self._root then
	   self._root:addChild(node, 10000)
    end
end

function TopLevelNode:addTutorialLayer(node)
    if self._root then
	   self._root:addChild(node, 2000)
    end
end

function TopLevelNode:addBulletLayer(node)
    if self._root then
	   self._root:addChild(node, 1000)
    end
end

function TopLevelNode:addToSubtitleLayer(node)
    if self._root then
        self._root:addChild(node, 1000)
    end
end

function TopLevelNode:addToGroupNoticeLayer(node)
    if self._root then
        self._root:addChild(node, 1000)
    end
end

--ipad 分辨率 上下黑边层
--在最高层
function TopLevelNode:addToBlackFrame(node)
    if self._root then
        self._root:addChild(node, 40000)
    end
end


--
function TopLevelNode:remove(node)
    if self._root then
    	self._root:removeChild(node)
    end
end

--
function TopLevelNode:clear()
	--Director:setNotificationNode(nil)
    self:removeAllChildren()
    self._root = nil
end

return TopLevelNode