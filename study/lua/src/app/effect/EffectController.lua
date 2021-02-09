-- Effect的 Controller
-- 特效控制器，控制位移，颜色等功能


local EffectController = {}


local function calValueByK(start, endt, percent)
    return start + (endt-start)*percent;
end

--单帧更新
function EffectController.keyUpdate(playingSub, subInfo, frameIndex, colorOffset)
    local fx = "f" .. frameIndex
    local start = subInfo[fx].start

    playingSub:setPositionX(start.x)
    playingSub:setPositionY(start.y)
    playingSub:setRotation(start.rotation)
    playingSub:setScaleX(start.scaleX)
    playingSub:setScaleY(start.scaleY)

    --
    if start.opacity ~= nil then
        playingSub:setOpacity(start.opacity)              
    end

    --
    if start.color then
        playingSub:setColor(cc.c3b(start.color.red_original * 255, start.color.green_original * 255, start.color.blue_original * 255))
        playingSub:setOpacity(start.color.alpha_original * 255)

        if playingSub.setColorOffset then
            playingSub:setColorOffset(cc.c4f(start.color.red/255, start.color.green/255, start.color.blue/255, start.color.alpha/255))
        end
      --  if colorOffset then
      --      playingSub:setColorOffset(cc.c4f(start.color.red/255 + colorOffset.r, start.color.green/255 + colorOffset.g, start.color.blue/255 + colorOffset.b, start.color.alpha/255 + colorOffset.a))
      --  end
    end

    -- 混合模式
    if start.blendMode ~= nil and playingSub.setBlendFunc ~= nil then
        if start.blendMode == "add" then
            playingSub:setBlendFunc(cc.blendFunc(gl.ONE, gl.ONE))
        end
    end
end

--插值更新
function EffectController.keyInterUpdate(playingSub, subInfo, frameIndex, lastFrameStart)
    --if playingSub == nil then
    --    return
    --end

    local lastFx = "f"..lastFrameStart
    local start = subInfo[lastFx].start
    local nextFrame = subInfo[lastFx].nextFrame
    local frames = subInfo[lastFx].frames
 
    if nextFrame == nil then return end

    if playingSub == nil then
        logWarn( "key is "..lastFx.." frameIndex is "..frameIndex.." lastFrameStart is "..lastFrameStart)
        assert(false)
    end


    if subInfo[nextFrame].remove then return end

    -- local function getNextStart()
    --     if frames == nil or frames ==0 then
    --         frames = 1
    --     end
    --     local percent = (frameIndex - lastFrameStart) / frames
    --     if percent == nil then
    --         percent = 1
    --     end 
    --     local nextStart = subInfo[nextFrame].start
    --     return nextStart, percent
    -- end

    -- local nextStart, percent = getNextStart()
    if frames == nil or frames ==0 then
        frames = 1
    end
    local percent = (frameIndex - lastFrameStart) / frames
    if percent == nil then
        percent = 1
    end
    local nextStart = subInfo[nextFrame].start

    playingSub:setPositionX(calValueByK(start.x, nextStart.x, percent))
    playingSub:setPositionY(calValueByK(start.y, nextStart.y, percent))

    -- 旋转
    playingSub:setRotation(start.rotation + (nextStart.rotation - start.rotation) * percent)
    -- 拉伸

    playingSub:setScaleX(start.scaleX + (nextStart.scaleX - start.scaleX) * percent)
    playingSub:setScaleY(start.scaleY + (nextStart.scaleY - start.scaleY) * percent)
    -- 透明度
    if start.opacity ~= nil then
        local nextOpacity = nextStart.opacity or nextStart.color.alpha_original * 255
        playingSub:setOpacity(start.opacity + (nextOpacity - start.opacity) * percent)
    end

    -- 颜色
    if start.color and nextStart.color then
        local redOriginal = nextStart.color and nextStart.color.red_original or 1
        local greenOriginal = nextStart.color and nextStart.color.green_original or 1
        local blueOriginal = nextStart.color and nextStart.color.blue_original or 1
        local alphaOriginal = nextStart.color and nextStart.color.alpha_original or 1

        playingSub:setColor(cc.c3b(
                            (start.color.red_original + (redOriginal - start.color.red_original) * percent) * 255,
                            (start.color.green_original + (greenOriginal - start.color.green_original) * percent) * 255,
                            (start.color.blue_original + (blueOriginal - start.color.blue_original) * percent) * 255
                        ))

        playingSub:setOpacity((start.color.alpha_original + (alphaOriginal - start.color.alpha_original) * percent) * 255)

        local red = nextStart.color and nextStart.color.red or 0
        local green = nextStart.color and nextStart.color.green or 0
        local blue= nextStart.color and nextStart.color.blue or 0
        local alpha = nextStart.color and nextStart.color.alpha or 0

        if playingSub.setColorOffset then
            playingSub:setColorOffset(cc.c4f(
                (start.color.red + (red - start.color.red) * percent) / 255,
                (start.color.green + (green - start.color.green) * percent) / 255,
                (start.color.blue + (blue - start.color.blue) * percent) / 255,
                (start.color.alpha + (alpha - start.color.alpha) * percent) / 255
            ))
        end

    end
end
return EffectController