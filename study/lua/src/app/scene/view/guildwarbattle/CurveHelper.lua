local CurveHelper = {}

function CurveHelper.bezier3func(uu, controlP)
    local part1 = cc.pMul(controlP[1],(1-uu)*(1-uu)*(1-uu))
    local part2 = cc.pMul(controlP[2],3*uu*(1-uu)*(1-uu))
    local part3 = cc.pMul(controlP[3],3*uu*uu*(1-uu))
    local part4 = cc.pMul(controlP[4],uu*uu*uu) 
    return cc.pAdd(cc.pAdd(part1,part2),cc.pAdd(part3,part4)) 
end


function CurveHelper.lineFunc(uu, startPoint,endPoint)
    local positionDelta = cc.pSub(endPoint,startPoint)
    return cc.pAdd(startPoint,cc.pMul(positionDelta,uu)) 
end


function CurveHelper.bezier3Length(controlP)
    return cc.pGetDistance(controlP[1],controlP[4])
end

function CurveHelper.stopCurveMove(node)
    --node:stopAllActions()
    node:unscheduleUpdate()
end

function CurveHelper.doCurveMove(node,endCallback,rotateCallback,moveCallback,curveConfigList,totalTime,endTime)
    --计算当前时间t处在曲线哪个位置
  --  dump(curveConfigList)
  

    node:stopAllActions()
    local curveData = CurveHelper.computeCurveData(curveConfigList,totalTime)


    local startTime = endTime - totalTime  -- G_ServerTime:getMSTime() - totalTime * uu
    --local endTime = startTime + totalTime 

    local startUU =  math.max(0,math.min( (G_ServerTime:getMSTime()  - startTime) /totalTime,1) )


    local pos,lineStartPos,lineEndPos = CurveHelper.getCurvePosition(node,curveData,curveConfigList,startUU)
    node:setPosition(pos)
    if moveCallback then moveCallback() end

    --判断初始角度
    --local uu = math.max(0, math.min( (G_ServerTime:getMSTime() + 100 - startTime) /totalTime,1) )
    --local nextPos = CurveHelper.getCurvePosition(node,curveData,curveConfigList,uu)
   -- local angle = 180-math.deg(cc.pToAngleSelf(cc.pSub(nextPos,cc.p(node:getPosition()))))
    if rotateCallback then
        --rotateCallback(0,cc.p(node:getPosition()),nextPos)
         rotateCallback(0,lineStartPos,lineEndPos)
    end

    local updateFunc = function()
        local time = G_ServerTime:getMSTime()
        local uu =  (time - startTime) /totalTime 
      
        uu  = math.max(0,math.min(  uu,1) )

        --print(uu)
       -- local nextUU =  (time + 50 - startTime) /totalTime 
       -- nextUU  = math.max(0,math.min(nextUU,1) )
       
        local pos,lineStartPos,lineEndPos = CurveHelper.getCurvePosition(node,curveData,curveConfigList,uu)
       -- local nextPos = CurveHelper.getCurvePosition(node,curveData,curveConfigList,nextUU)

        --local angle = 180-math.deg(cc.pToAngleSelf(cc.pSub(pos,cc.p(node:getPosition()))))
        node:setPosition(pos)

        if moveCallback then moveCallback() end
        
        if rotateCallback then
            rotateCallback(0,lineStartPos,lineEndPos)
        end
      
        if uu >= 1 then

           CurveHelper.stopCurveMove(node)
            if endCallback then
                endCallback()
            end

        end
       
    end


    node:scheduleUpdateWithPriorityLua(updateFunc, 0)
    --[[
    local UIActionHelper = require("app.utils.UIActionHelper")
    local action = UIActionHelper.createUpdateAction(updateFunc, 0.05)
    node:runAction(action)
    ]]
end

function CurveHelper.computeCurveData(curveConfigList,totalTime)
    local s = 0
    local curveData = {s = 0,list = {} }
    for k,curveConfig in ipairs(curveConfigList) do
        local len = CurveHelper.bezier3Length(curveConfig)
        s = s + len
        table.insert(curveData.list,{len = len,time = nil})
    end
    curveData.s = s
    for k,v in ipairs(curveData.list) do
        local time = v.len * totalTime /s
        v.time = time
    end
    return curveData
end

function CurveHelper.getCurvePosition(node,curveData,curveConfigList,uu)
    local currS = curveData.s * uu
    local currCurveIndex = 0
    local currCurveUU = 0

    local tempS = 0
    local lastS = 0
    for k,v in ipairs(curveData.list) do
        tempS  = tempS + v.len
        if currS <= tempS then
            currCurveIndex = k
            currCurveUU = (currS-lastS)/v.len
            break
        end 
        lastS = tempS
    end
    if currCurveIndex == 0 then
        return  node:getPosition()
    end
    local controlP = curveConfigList[currCurveIndex]
    local pos = CurveHelper.lineFunc(currCurveUU, controlP[1],controlP[4])
   -- pos.x  = math.floor(pos.x)
   -- pos.y  = math.floor(pos.y)
    return pos,controlP[1],controlP[4]
end


return CurveHelper