--
-- Author: Your Name
-- Date: 2017-07-19 17:15:25
--
local CircleScroll = class("CircleScroll", function()
	return ccui.Widget:create()
end)

-- local TurnNode = require("app.scenes.common.turnplate.TurnNode")

local CCSize = cc.size
local ccp = cc.p


--local self._angles = {55, 90, 125, 200, 270, 340}

local SCALE_OFFSET = 30
local SCALE_START = 60

--startIndex ：在angles表中第startIndex个角度，放第一个node，startIndex从0开始
function CircleScroll:ctor(size, angles, startIndex, angleOffset, circle, scaleRange)
    self:setContentSize(cc.size(1136,640))
    self:setAnchorPoint(cc.p(0.5,0.5))
    self:enableNodeEvents()
    self._angles = angles
    self._angleOffset = angleOffset or 0 --角度偏移量
    self._startIndex = startIndex
    if scaleRange then
        self._scaleRange = scaleRange
    else
        self._scaleRange = cc.p(40,40)
    end
     

    self._showList = {}
    self:setContentSize(CCSize(size.width,size.height))
    
    self._enabled = true --是否能转动
    self.isMove = false

    -- 圆心
    self.m_nCenter = ccp(size.width*0.5,size.height*0.5)
 
    -- 椭圆长轴
    self.m_longAxis = size.width*0.45
    
    -- 椭圆短轴
    self.m_shortAxis = self.m_longAxis*0.85
    
    --椭圆长轴，短轴
    if circle then
        self.m_longAxis = circle.height
        self.m_shortAxis = circle.width
    end
    --zorder起点
    self._zStart = 0
    
    -- 最小Y轴
    self.YMin =  self.m_nCenter.y - self.m_shortAxis
    
    -- 最大Y轴
    self.YMax = self.m_nCenter.y + self.m_shortAxis
    
    self._avatarsLayer = display.newNode()

    self._midLayer = display.newNode()
    self:addChild(self._midLayer)
    self:addChild(self._avatarsLayer)
 
    
    self._touchBegin = ccp(0,0)
    self._touchMove = false 
    self._touchEnable = true
    -- local touchNode = cc.LayerColor:create(cc.c4b(0xff,0xff,0xff,100))
    local touchNode = cc.Layer:create()
    touchNode:setContentSize(CCSize(size.width,size.height))
    self:addChild(touchNode)
    self._touchNode = touchNode
    self._touchRect = nil
    
    local listener=cc.EventListenerTouchOneByOne:create()
    listener:setSwallowTouches(false)
    listener:registerScriptHandler(handler(self,self._onTouchBegan),cc.Handler.EVENT_TOUCH_BEGAN)
    listener:registerScriptHandler(handler(self,self._onTouchMoved),cc.Handler.EVENT_TOUCH_MOVED)
    listener:registerScriptHandler(handler(self,self._onTouchEnded),cc.Handler.EVENT_TOUCH_ENDED)
    cc.Director:getInstance():getEventDispatcher():addEventListenerWithSceneGraphPriority(listener,touchNode)
end

function CircleScroll:setMoveEnable( enable )
    -- body
    self._touchEnable = enable
end
function CircleScroll:_onTouchBegan( touch,event )

    if self._touchEnable == false then
        return
    end

    if(self._touchRect == nil)then
        local worldPos = self._touchNode:convertToWorldSpace(cc.p(0,0))
        local size = self._touchNode:getContentSize()
        self._touchRect = cc.rect(worldPos.x,worldPos.y,size.width,size.height)
    end

    if not self._enabled then
        return
    end

    if self.isMove  then
        return
    end
    -- self:_removeTimer()
    self._touchBegin = touch:getLocation()
    return cc.rectContainsPoint(self._touchRect,touch:getLocation())
end

function CircleScroll:_onTouchMoved(touch,event)
    if self._touchEnable == false then
        return
    end

    if self.isMove  then
        return
    end    
    local pt = touch:getLocation()
    local deltaX = pt.x - self._touchBegin.x
    for k,v in pairs(self._showList) do
        local  startAngle, endAngle = self:_calcStartAndEndAngle(v.pos, deltaX > 0 and 1 or -1, 1)
        local percent = math.abs(deltaX/360)
        if percent > 1 then percent = 1 end  
        v.angle = startAngle + (endAngle - startAngle)*percent 
    end
    self:_arrange()
    self:onTouchMove()
end


function CircleScroll:_onTouchEnded(touch,event)

    if self._touchEnable == false then
        return
    end

    local pt = touch:getLocation()
    --self:judgeNeedMoveBack()
    local fDist = math.abs(pt.x - self._touchBegin.x)
    --print("fdist=" .. fDist)
    if fDist > 10 then 
        local step = 1
        local dir = (pt.x - self._touchBegin.x)/math.abs(pt.x - self._touchBegin.x)
        self:judgeNeedMoveBack(dir, step)
        return
    else
        --这个时候可能位置有点移动, 修正一下
        self:_refresh()
        self:onMoveStop("refresh")
    end
end

-- @desc 检查是否回滚回去
function CircleScroll:judgeNeedMoveBack(dir, step)
    --print("judgeNeedMoveBack " .. dir .. "," ..  step .. "," .. tostring(self.isMove)  )
    if self.isMove == true then
        return 
    end
    self.isMove = true
    -- 计算下一个位置的角速度

    for k,v in pairs(self._showList) do

        v.speed,v.pos,v.EndAngle = self:_calcAngleSpeed(v,v.pos,dir, step)
    end
    
    -- self:scheduleUpdate()
    self:scheduleUpdateWithPriorityLua(handler(self, self._moveBackAnimation), 0)
end

function CircleScroll:addMidLayer( node )
    -- body
    self._avatarsLayer:addChild(node)
    self._midNode = node
end
function CircleScroll:addNode(node, pos)
    node.pos = pos
    node.angle = self:_calcStartAndEndAngle(pos, 1)
    node.EndAngle = node.angle


    self._avatarsLayer:addChild(node)
    
    
    table.insert(self._showList,node)

    self:_arrange()
end

function CircleScroll:_refresh()
    for k,v in pairs(self._showList) do
        v.angle = self:_calcStartAndEndAngle(v.pos, 1)
    end
    self:_arrange()
end

function CircleScroll:getOrderList()
    local _list = self:_orderByY()
    return _list
end


--根据节点当前角度angle计算位置, 缩放, zorder
function CircleScroll:_arrange()
    --self:arrangeAngle()
    self:_arrangePosition()
    self:_arrangeScale()
    self:_arrangeZOrder()
end

-- @desc 设置位置
function CircleScroll:_arrangePosition()
    for k,v in pairs(self._showList) do
        local fAngle = math.fmod(v.angle + self._angleOffset, 360.0)
        local x = math.cos(fAngle/180.0*3.14159)*self.m_longAxis + self.m_nCenter.x
        local y = math.sin(fAngle/180.0*3.14159)*self.m_shortAxis*0.5 + self.m_nCenter.y
        v:setPosition(x, y)
    end
end

-- @desc 重新设置z轴
function CircleScroll:_arrangeZOrder()
    local ZMax = self._zStart + #self._showList
    
    local _list = self:_orderByY()

    for k,v in pairs(_list) do
        v:setLocalZOrder(ZMax)
        ZMax = ZMax + 1
    end
    if self._midNode then
        self._midNode:setLocalZOrder(ZMax - 3)
    end
    
end

function CircleScroll:_orderByY()
    local _list = {}
    for k,v in pairs(self._showList) do
        table.insert(_list,v)
    end
    table.sort(_list,function(p1,p2)
        return p1:getPositionY() > p2:getPositionY()
    end)
    return _list
end

function CircleScroll:_arrangeScale ()
     for k,v in pairs(self._showList) do
        local fy = v:getPositionY() 
        if fy < 0 then fy = 0 end
        --算法
        -- 55-75过渡 短轴就是1
        -- 75- 55= 20总百分比
        -- fy / self.m_shortAxis * 2

        local offset =  (self.m_shortAxis*2 - fy) / (self.m_shortAxis*2) 
        
        local fScale = self._scaleRange.x + offset * 100
        if fScale > self._scaleRange.y then
            fScale = self._scaleRange.y
        end
        dump(fScale)
        v:setScale(fScale*0.01)
        if v.updateScale then
            v:updateScale(fScale*0.01)
        end
    end
end

--当自动滑动的过程中,根据速度修改卡牌的角度, 当卡牌到达目标角度时,返回,停止
function CircleScroll:_moveShow()
    local finished = true
    for k,v in pairs(self._showList) do  
        if v.speed ~= 0 then
            --print( k .. " " .. math.abs(v.angle - v.EndAngle) .. " ---" .. math.abs(v.speed))

            -- if math.abs(v.angle - v.EndAngle) <= math.abs(v.speed)
            if math.abs(v.angle - v.EndAngle) <= 0.5
              or  (v.speed <0 and v.angle <= v.EndAngle ) 
              or (v.speed >0 and v.angle >= v.EndAngle ) then 
                v.angle = v.EndAngle
                v.speed = 0
            else
                -- v.angle = v.angle+v.speed
                v.angle = v.angle + (v.EndAngle - v.angle)/4
                finished = false
            end
        end
    end
    return finished
end

-- @desc 计算角速度
--自动滑动的时候, 需要知道现在要往哪个方向(dir)滑动多少格(step), 然后计算出一个速度, 然后在movieShow里修改angle
function CircleScroll:_calcAngleSpeed(sprite,pos,dir, step)
    if step == nil then
        step = 1  --滑多少格
    end
    local temp = pos + dir*step
    local len = #self._angles
    if temp > len then 
        temp = temp - len 
    end
    
    if temp  < 1 then 
        temp = temp + len 
    end
    local _startAngle,_endAngle = self:_calcStartAndEndAngle(pos,dir, step)
    --sprite.angle = _startAngle
    local subValue = _endAngle - sprite.angle
    return subValue/3,temp,_endAngle
end

-- @desc 计算下一个位置的角度
-- @return param1 开始角度 @param2终点角度
function CircleScroll:_calcStartAndEndAngle(index,dir,step)
    if step == nil then
        step = 1
    end


    local startIndex = self._startIndex + index 
    if startIndex > #self._angles then
        startIndex = startIndex - #self._angles
    end


    local endIndex = startIndex + dir*step 
    if endIndex > #self._angles then
        endIndex = endIndex -  #self._angles
    end
    if endIndex < 1 then
        endIndex = endIndex +  #self._angles
    end


    local startAngle = self._angles[startIndex]
    local endAngle  = self._angles[endIndex]

    if dir == 1 then
        if startAngle > endAngle then
            if startAngle - 360 < 0 then
                endAngle = endAngle + 360
            else
                startAngle = startAngle - 360
            end
        end
    else
        if startAngle < endAngle then
            if endAngle - 360 < 0 then
                startAngle = startAngle + 360
            else
                endAngle = endAngle - 360
            end
        end
    end
    return startAngle, endAngle
end


function CircleScroll:_removeTimer()
    self:unscheduleUpdate()
end

function CircleScroll:onMoveStop(reason)
    
end

function CircleScroll:onTouchMove( ... )
    -- body
end

function CircleScroll:_moveBackAnimation()
    if self:_moveShow() then
        self:_removeTimer()
        self.isMove = false
        self:onMoveStop("back")
    end
    self:_arrange()
end

function CircleScroll:onEnter( ... )
    self:_moveBackAnimation()
end

function CircleScroll:onExit( ... )
    -- body
end

function CircleScroll:setEnabled(bool)
    self._enabled = bool
end

return CircleScroll