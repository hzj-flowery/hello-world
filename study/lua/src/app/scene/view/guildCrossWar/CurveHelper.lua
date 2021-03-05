local CurveHelper = {}


function CurveHelper.lineFunc(uu, startPoint,endPoint)
    local positionDelta = cc.pSub(endPoint,startPoint)
    return cc.pAdd(startPoint,cc.pMul(positionDelta,uu)) 
end


function CurveHelper.bezier3Length(controlP)
    return cc.pGetDistance(controlP[1],controlP[#controlP])
end

function CurveHelper.stopCurveMove(node)
    node:unscheduleUpdate()
end

function CurveHelper.doCurveMove(node,endCallback,rotateCallback,moveCallback,curveConfigList,totalTime,endTime)
    --计算当前时间t处在曲线哪个位置
    node:stopAllActions()
    local curveData = CurveHelper.computeCurveData(curveConfigList, totalTime)
    local startTime = endTime - totalTime 

    local startUU =  math.max(0,math.min( (G_ServerTime:getMSTime()  - startTime)/totalTime, 1) )
    local pos,lineStartPos,lineEndPos = CurveHelper.getCurvePosition(node,curveData, curveConfigList, startUU)

    if type(pos) == "table" and table.nums(pos) == 2 then
        node:setPosition(pos)
    end
    if moveCallback then moveCallback(pos) end

    --判断初始角度
    if rotateCallback then
         rotateCallback(0,lineStartPos,lineEndPos)
    end

    local updateFunc = function()
        local time = G_ServerTime:getMSTime()
        local uu =  (time - startTime) /totalTime 
        uu  = math.max(0,math.min(uu, 1))
        local pos,lineStartPos,lineEndPos = CurveHelper.getCurvePosition(node,curveData,curveConfigList,uu)
        local oldPos = cc.p(node:getPosition())

        if type(pos) == "table" and table.nums(pos) == 2 then
            node:setPosition(pos)
        end

        if moveCallback then 
            moveCallback(pos, oldPos) 
        end
        
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
end

function CurveHelper.computeCurveData(curveConfigList,totalTime)
    local curveData = {s = 0,list = {} }
    local len = CurveHelper.bezier3Length(curveConfigList)
    local s = len or 0
    table.insert(curveData.list,{len = len,time = nil})
    curveData.s = s

    for k,v in ipairs(curveData.list) do
        local time = v.len * totalTime/s
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

    local controlP = curveConfigList
    local pos = CurveHelper.lineFunc(currCurveUU, controlP[1], controlP[#controlP])
    return pos,controlP[1],controlP[#controlP]
end


return CurveHelper