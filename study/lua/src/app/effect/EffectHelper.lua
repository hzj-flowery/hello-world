-- Effect的 Creator
-- 主要用于特效的创建帮助类


-- Effect 加载类

-- Json Loader

local EffectHelper = {}


local function isTypeOfEffectNode(o)   
    if o.__isEffectNode ~= nil and o.__isEffectNode  then
        return true
    end
    return false
end


function EffectHelper.decodeJsonFile(jsonFileName)
    
    local jsonString=cc.FileUtils:getInstance():getStringFromFile(jsonFileName)
--    local jsonString = CCFileUtils:sharedFileUtils():getEncryptFileData(jsonFileName)
    assert(jsonString, "Could not read the json file with path: "..tostring(jsonFileName))

    local jsonConfig = json.decode(jsonString)
    assert(jsonConfig, "Invalid json string: "..tostring(jsonString).." with name: "..tostring(jsonFileName))
    
    return jsonConfig
end


function EffectHelper.jsonGetter(resIniter,effectJsonName)
    local jsonFile = resIniter.cacheJson[effectJsonName]
    if jsonFile == nil then
        local js = EffectHelper.decodeJsonFile("effect/"..effectJsonName.."/"..effectJsonName..".json")
        assert(js, "Could not find the effectJson with name: "..tostring(effectJsonName))
        resIniter.cacheJson[effectJsonName] = js
        return js
    end
    return jsonFile
end


function EffectHelper.pngGetter(resIniter,effectJsonName)
    local effectJson = EffectHelper.jsonGetter(resIniter,effectJsonName)
    assert(effectJson, "Could not find the effectJson with name: "..tostring(effectJsonName))

   
    local effectJsonPath = "effect/" .. effectJsonName .. "/" .. effectJsonName
    if effectJson['png'] ~= nil then
        if effectJson['png'] ~= "" then
            EffectHelper._loadResource(effectJsonPath .. ".plist",  "effect/" ..effectJsonName.."/".. effectJson['png'])     
        end
    else 
        EffectLoader._loadResource(effectJsonPath .. ".plist", effectJsonPath .. ".png") 
    end

end

function EffectHelper.framesGetter(png)
    return display.newSpriteFrame(png)
end


function EffectHelper._loadResource(plist, png)
    display.loadSpriteFrames(plist, png)
end




--创建drawNode 里面是矩形或者圆形
function EffectHelper.drawNodeGetter(mask_info)
    local effectNode = CCDrawNode:create()

    if mask_info.mask_type == "circle" then

        local r = mask_info.width/2
        local pointsCount = 200
        local pointarr1 = CCPointArray:create(pointsCount)

        local angle = 2*math.pi/pointsCount

        for i=1,pointsCount do
           pointarr1:add(ccp(r*math.cos((i-1)*angle), r*math.sin((i-1)*angle)))
        end
                
        effectNode:drawPolygon(pointarr1:fetchPoints(), pointsCount, ccc4f(1.0, 1.0, 1, 1), 1, ccc4f(0.1, 1, 0.1, 1) )
    else
        local pointarr1 = CCPointArray:create(4)
        local halfw = mask_info.width/2
        local halfh = mask_info.height/2
    
        pointarr1:add(ccp(-halfw, -halfh))
        pointarr1:add(ccp(-halfw, halfh))
        pointarr1:add(ccp(halfw, halfh))
        pointarr1:add(ccp(halfw, -halfh))
        effectNode:drawPolygon(pointarr1:fetchPoints(), 4, ccc4f(1.0, 1.0, 1, 1), 1, ccc4f(0.1, 1, 0.1, 1) )
    end
    return effectNode
end


--根据png名字创建一个ccsprite
function EffectHelper.spriteGetter(effectRoot,png, sprite, key, colorOffset, effectNodeCreator)   

    local ret = false
    local outsideObject = nil    
    if sprite == nil then
        --debugPrint("---_createSprite" .. tostring(key)  .. " from " ..self._effectJsonName)

        local sprite = nil

        if colorOffset ~= nil then  

            local node = display.newNode()
            node:setCascadeOpacityEnabled(true)
            node:setCascadeColorEnabled(true)

            local realSprite = nil
            if colorOffset.a > 0 then
                realSprite = cc.SpriteLighten:createWithSpriteFrameName(png)
                function node.setColorOffset(_, ...)
                    return realSprite:setColorOffset(...)
                end

                function node.getColorOffset()
                    return realSprite:getColorOffset()
                end
            else
                realSprite = cc.Sprite:createWithSpriteFrameName(png)
                function node.setColorOffset(_, ...)
                   
                end

                function node.getColorOffset()
                    return cc.c4b(0,0,0,0)
                end
            end

            assert(realSprite, "Could not create SpriteLighten with png: "..tostring(png))
            realSprite:setScale(effectRoot._effectJson.scale)
            node:addChild(realSprite)

            function node.setSpriteFrame(_, ...)
                return realSprite:setSpriteFrame(...)
            end
            function node.setBlendFunc(_, ...)
                return realSprite:setBlendFunc(...)
            end
            sprite = node

        else
            if effectNodeCreator ~= nil and type(effectNodeCreator) == "function" then
               ret, outsideObject = effectNodeCreator(sprite, png, key)  -- effectNode之外可以自定义某个动画原件                  
            end
            if not ret then
                --print("new sprite " .. png)
                -- sprite = display.newSprite("#"..png) 
                local node = display.newNode()
                node:setCascadeOpacityEnabled(true)
                node:setCascadeColorEnabled(true)

                local realSprite = display.newSprite("#"..png)
                realSprite:setScale(effectRoot._effectJson.scale)
                node:addChild(realSprite)

                function node.setSpriteFrame(_, ...)
                    return realSprite:setSpriteFrame(...)
                end
                function node.setBlendFunc(_, ...)
                    return realSprite:setBlendFunc(...)
                end
                sprite = node

            else
                sprite =  outsideObject   
            end
            
        end
        return sprite
    else
        if effectNodeCreator ~= nil then
           ret, outsideObject =  effectNodeCreator(sprite, png, key)     -- effectNode之外可以自定义某个动画原件             
        end 
        if not ret then
            local spriteFrame = EffectHelper.framesGetter(png)
            if spriteFrame ~= nil then
                sprite:setSpriteFrame(spriteFrame)
            end
        else
            sprite =  outsideObject   
        end   

        return sprite
    end
end


local function getColorOffset(color)
    return cc.c4f(color.red/255, color.green/255, color.blue/255, color.alpha/255)
end

--创建某层上的子节点
function EffectHelper.createSub(effectRoot, parentNode, key, subInfo, frame)
    --create
    --debugPrint("---real create sub" .. tostring(key)  .. " from " ..effectJsonName)

    -- 如果当前节点层是指定effect，表示是嵌套层
    local sub = nil
    if subInfo.effect then
        local colorOffset = effectRoot._colorOffset
        if subInfo[frame].start.color then
            colorOffset = getColorOffset(subInfo[frame].start.color)
        end
        local EffectGfxNode = require("app.effect.EffectGfxNode")
        local embedEffect = EffectGfxNode.new(subInfo.effect, nil , colorOffset, effectRoot._resourceIniter, effectRoot._effectNodeCreator)
        parentNode:addChild(embedEffect, subInfo.order)

        sub = embedEffect
    else
        --如果这个是遮罩层, 而且是rect/circle类型的遮罩,那么创建一个矩形/圆形即可,不需要加载图片
        if  subInfo.mask_info and  subInfo.mask_info.mask_type ~= "image" then
            sub = EffectHelper.createDrawNode( subInfo.mask_info)
            parentNode:addChild(sub, subInfo.order)
        else
            -- 创建ccsprite
            local colorOffset = effectRoot._colorOffset
            if subInfo[frame].start.color then
                colorOffset = getColorOffset(subInfo[frame].start.color)
            end
            sub =  EffectHelper.spriteGetter(effectRoot, subInfo[frame].start.png,  sub, key, colorOffset) 
            -- print("eff= " .. tostring(effectNode))
            parentNode:addChild(sub, subInfo.order)
        end
    end  
    sub:setCascadeOpacityEnabled(true)

    return sub
end

function EffectHelper.deleteSub(key,  playingSub)
    --debugPrint("set pool sub" .. tostring(key) .. " from " .. self._effectJsonName)
    -- print("play embedEffect " .. tostring(key))

    playingSub:setVisible(false)


    -- playingSub:setPositionXY(0, 0)
    playingSub:setPositionX(0)
    playingSub:setPositionY(0)

    
    playingSub:setScale(1)
    playingSub:setRotation(0)
    playingSub:setOpacity(255)
    if isTypeOfEffectNode(playingSub) then
        playingSub:pause()
    end
  
end

--创建drawNode 里面是矩形或者圆形
function EffectHelper.createDrawNode(mask_info)
    local effectNode = CCDrawNode:create()

    if mask_info.mask_type == "circle" then

        local r = mask_info.width/2
        local pointsCount = 200
        local pointarr1 = CCPointArray:create(pointsCount)

        local angle = 2*math.pi/pointsCount

        for i=1,pointsCount do
           pointarr1:add(ccp(r*math.cos((i-1)*angle), r*math.sin((i-1)*angle)))

        end
        
        
        effectNode:drawPolygon(pointarr1:fetchPoints(), pointsCount, ccc4f(1.0, 1.0, 1, 1), 1, ccc4f(0.1, 1, 0.1, 1) )


    else
        local pointarr1 = CCPointArray:create(4)
        local halfw = mask_info.width/2
        local halfh = mask_info.height/2
    
        pointarr1:add(ccp(-halfw, -halfh))
        pointarr1:add(ccp(-halfw, halfh))
        pointarr1:add(ccp(halfw, halfh))
        pointarr1:add(ccp(halfw, -halfh))
        effectNode:drawPolygon(pointarr1:fetchPoints(), 4, ccc4f(1.0, 1.0, 1, 1), 1, ccc4f(0.1, 1, 0.1, 1) )
    end
    return effectNode
end

return EffectHelper