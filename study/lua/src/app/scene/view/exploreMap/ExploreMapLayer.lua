
--地图
local ViewBase = require("app.ui.ViewBase")
local ExploreMapLayer = class("ExploreMapLayer", ViewBase)
local ExploreMapConfig = require("app.config.explore_map")
local ExploreMapHelper = require("app.scene.view.exploreMap.ExploreMapHelper")
local UIHelper = require("yoka.utils.UIHelper")
local CSHelper  = require("yoka.utils.CSHelper")
local AudioConst = require("app.const.AudioConst")
local BigImagesNode = require("app.utils.BigImagesNode")

ExploreMapLayer.ZORDER_BLOCK = 1     --方块
ExploreMapLayer.ZORDER_EVENT = 2     --事件
ExploreMapLayer.ZORDER_ACTOR = 3     --主角
-- ExploreMapLayer.ZORDER_DICE = 4     --骰子特效
-- ExploreMapLayer.ZORDER_ORNAMENT = 5  --花花草草（新版本取消）

ExploreMapLayer.SCALE_AVATAR = 0.85

function ExploreMapLayer:ctor(mapScrollView, exploreBaseData)
    -- body
    self._scrollMap = mapScrollView
    self._exploreBaseData = exploreBaseData
    --
    self._mapBlockSize = 0
    self._mapBg = nil --地图背景
    self._mapBlockData = {} --地图格子数据
    self._blocksParent = nil --格子父节点

    self._innerContainer = nil -- 滚动层

    ExploreMapLayer.super.ctor(self, nil)
end

function ExploreMapLayer:onCreate()
    local mapId = self._exploreBaseData:getMap_id()
    local mapInfo = ExploreMapConfig.get(mapId) -- 地图数据
    self._mapBlockSize = tonumber(mapInfo.size)

    self._mapBg = BigImagesNode.new(Path.getStageBG(mapInfo.map_size))
    self._mapBg:setAnchorPoint(cc.p(0, 0))
    self:addChild(self._mapBg)

    self._blocksParent = cc.Node:create()
    self._mapBg:addChild(self._blocksParent)
    self:_createActor()

    self:_addSelfToScrollMap()
end


--======================================
--              Map地板
--======================================
-- data
function ExploreMapLayer:createMap(exploreBaseData, isFirstPass)
    if not exploreBaseData then
        return
    end
    self._exploreBaseData = exploreBaseData

    self:_initmapInfo()
    self:_createMapBlockUI()
    self:_addPassBoxToBlock(isFirstPass)

end
-- 重置状态
function ExploreMapLayer:resetStatus( )
    -- 重置角色位置
    self:_stopActorAllAction()
    local index = self._exploreBaseData:getFoot_index() + 1
    if index > self._mapBlockSize then
        index = self._mapBlockSize
    end
    self._index = index
    self:setFaceDirection(self._index)
    self:setActorPositionByIndex(self._index)

    -- 重置滚动层位置
    self._innerContainer:stopAllActions()
    self:jumpMap()
end


--初始话创建地图数据
function ExploreMapLayer:_initmapInfo(  )
    -- body
    local mapEvents = self._exploreBaseData:getEvents() --地图事件
    local mapId = self._exploreBaseData:getMap_id()
    local mapInfo = ExploreMapConfig.get(mapId) -- 地图数据
    assert(mapInfo ~= nil, string.format( "can not find map info mapID = %s", mapId or "nil" ))
    self._mapBlockData = {} --地图格子数据
    -- 创建起点block
    local firstBlock = ExploreMapHelper.createFirstBlockData(mapInfo.x, mapInfo.y, mapEvents[1], mapInfo.start_road)
    table.insert( self._mapBlockData, firstBlock )
    -- 其他blcok
    local exploreId = self._exploreBaseData:getId() -- 游历章节id
    local directionsInfo = string.split(mapInfo.map, "|") --地图地板方向朝向数组

    for i = 1, #directionsInfo - 1 do
        local lastBlock = self._mapBlockData[#self._mapBlockData]
        local eventType = mapEvents[i + 1]
        local block = ExploreMapHelper.generateBlockData(lastBlock, directionsInfo[i], eventType, exploreId, mapInfo.road)
        table.insert( self._mapBlockData, block )
    end
    -- 创建终点block
    local endBlock = ExploreMapHelper.createEndBlockData(self._mapBlockData[#self._mapBlockData],
                 directionsInfo[#directionsInfo], mapEvents[#mapEvents], mapInfo.end_road)
    table.insert(self._mapBlockData, endBlock)
end

-- 创建地图UI
function ExploreMapLayer:_createMapBlockUI()
    self._blocksParent:removeAllChildren()
    local function createBlockSprite(blockData)
        local blockSprite = cc.Sprite:create(blockData.blockImagePath)

        blockSprite:setPosition(cc.p(blockData.posX, blockData.posY))
        blockSprite:setLocalZOrder(ExploreMapLayer.ZORDER_BLOCK)

        blockData.blockImagePath = nil -- 删除无用数据了
        return blockSprite
    end

    local function createEventIcon(blockData)
        local parentNode = cc.Node:create()
        parentNode:setLocalZOrder(ExploreMapLayer.ZORDER_EVENT)

        local eventIconInfo = blockData.eventIconInfo

        local eventIcon = cc.Sprite:create(eventIconInfo.eventIconPath)
        parentNode:addChild(eventIcon)
        eventIcon:setScale(0.9)
        eventIcon:setPosition(cc.p(blockData.posX, blockData.posY + 30))

        local eventName = cc.Sprite:create(eventIconInfo.eventNamePath)
        parentNode:addChild(eventName)
        eventName:setScale(0.9)
        eventName:setPosition(cc.p(blockData.posX, blockData.posY + 30))

        blockData.eventIconInfo = nil -- 删除无用数据了
        return parentNode
    end

    local function createTreasureIcon(blockData)
        -- body
        local parentNode = cc.Node:create()
        parentNode:setLocalZOrder(ExploreMapLayer.ZORDER_EVENT)

        local treasureIconInfo = blockData.treasureIconInfo

        local treasureIcon = cc.Sprite:create(treasureIconInfo.treasureIconPath)
        parentNode:addChild(treasureIcon)
        treasureIcon:setScale(0.5)
        treasureIcon:setPosition(cc.p(blockData.posX, blockData.posY+30))

        local nameLabel = UIHelper.createLabel({ text = treasureIconInfo.name, fontSize = 21, color = treasureIconInfo.color,
                outlineColor = treasureIconInfo.color_outline, position = cc.p(blockData.posX, blockData.posY-5)})
        parentNode:addChild(nameLabel)

        blockData.treasureIconInfo = nil -- 删除无用数据了
        return parentNode
    end

    --创建格子
    for _, v in pairs(self._mapBlockData) do
        --地板
        local blockSprite = createBlockSprite(v)
        self._blocksParent:addChild(blockSprite)
        v.blockSprite = blockSprite

        -- 事件和天降宝物
        if not self:_checkEventPassed(v.index) then
            if v.eventIconInfo then
                local eventNode = createEventIcon(v)
                self._blocksParent:addChild(eventNode)
                v.icon = eventNode
            elseif v.treasureIconInfo then
                local treasureNode = createTreasureIcon(v)
                self._blocksParent:addChild(treasureNode)
                v.icon = treasureNode
            end
        end
    end
end

function ExploreMapLayer:_checkEventPassed(index)
    local rollList = self._exploreBaseData:getRoll_nums()
    local rollIndex = 0
    for i, v in pairs(rollList) do
        rollIndex = rollIndex + v
        if rollIndex == index - 1 then
            return true
        end
    end
    return false
end

--创建通关宝箱
function ExploreMapLayer:_addPassBoxToBlock(isFirstPass)
    -- body
    local endBlock = self._mapBlockData[#self._mapBlockData]
    local passboxNode = cc.Node:create()
    self._blocksParent:addChild(passboxNode)

    passboxNode:setLocalZOrder(ExploreMapLayer.ZORDER_EVENT)

    local endBoxIcon = cc.Sprite:create(Path.getExploreDiscover("img_baoxiang01"))
    passboxNode:addChild(endBoxIcon)
    endBoxIcon:setPosition(cc.p(endBlock.posX, endBlock.posY+25))
    endBoxIcon:setScale(0.4)

    local endBoxIconTitle
    if isFirstPass then
        endBoxIconTitle = cc.Sprite:create(Path.getExploreTextImage("txt_stbx"))
    else
        endBoxIconTitle = cc.Sprite:create(Path.getExploreTextImage("txt_tgbx"))
    end
    endBoxIconTitle:setPosition(cc.p(endBlock.posX, endBlock.posY - 10))
    passboxNode:addChild(endBoxIconTitle)
    endBlock.icon = passboxNode
end

--隐藏通关宝箱
function ExploreMapLayer:hidePassBox(  )
    -- body
    local block = self._mapBlockData[#self._mapBlockData]
    if block.icon then
        block.icon:setVisible(false)
    end
end

--隐藏当前位置 事件图标
function ExploreMapLayer:hideCurPosIcon(  )
    -- body
    local block = self._mapBlockData[self._index]
    if block and block.icon then
        block.icon:setVisible(false)
    end
end



--======================================
--           Map滚动层相关函数
--======================================
function ExploreMapLayer:_addSelfToScrollMap( )
    -- body
    local size = self._mapBg:getContentSize()

    self._scrollMap:setInnerContainerSize(size)
    self._innerContainer = self._scrollMap:getInnerContainer()
    self._innerContainer:addChild(self)
    self._innerContainer:setPosition(cc.p(0, 0))
    if CONFIG_EXPLORE_FREE_MOVE then
        self._scrollMap:addEventListener(handler(self, self._moveLayerTouch))
    else
        self._scrollMap:setTouchEnabled(false)
    end
    self._scrollMap:setScrollBarEnabled(false)
end


--地图触摸
function ExploreMapLayer:_moveLayerTouch()
    local x, y = self._innerContainer:getPosition()
    self._innerContainer:setPosition(self:_getInnerPosition(cc.p(x, y)))
end

--判断是不是在界面内
function ExploreMapLayer:_getInnerPosition(position)
    local size = self._mapBg:getContentSize()
    local pos = cc.p(position.x, position.y)
    local width = G_ResolutionManager:getDesignWidth()
    local height = G_ResolutionManager:getDesignHeight()
    if pos.x > 0 then pos.x = 0 end
    if pos.x < width - size.width then pos.x = width - size.width end
    if pos.y > 0 then pos.y = 0 end
    if pos.y < height - size.height then pos.y = height - size.height end
    return pos
end

--移动地图
function ExploreMapLayer:jumpMap()
    local curPos = self:getPositionByIndex()
    local width = G_ResolutionManager:getDesignWidth()
    local x = width*0.5 - curPos.x
    local height = G_ResolutionManager:getDesignHeight()
    local y = height*0.5 - curPos.y
    local pos = self:_getInnerPosition(cc.p(x, y))
    self._innerContainer:setPosition(pos)
end

--获得人物获得地图坐标
function ExploreMapLayer:_getMapPosition(posX, posY)
    local width = G_ResolutionManager:getDesignWidth()
    local x = width*0.5 - posX
    local height = G_ResolutionManager:getDesignHeight()
    local y = height*0.5 - posY
    return self:_getInnerPosition(cc.p(x, y))
end

--创建跑图角色
function ExploreMapLayer:_createActor(  )
    -- body
    local myHeroId = G_UserData:getBase():getPlayerBaseId()
    self._actor = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
    self._actor:updateAvatar(G_UserData:getBase():getPlayerShowInfo())
    self._actor:setScale(ExploreMapLayer.SCALE_AVATAR)
    self._actor:setAction("idle", true)

    self._mapBg:addChild(self._actor, ExploreMapLayer.ZORDER_ACTOR)

    self._autoExploreEffect = G_EffectGfxMgr:createPlayGfx(self._actor, "effect_zidongyouli_zi", nil, false, cc.p(0,185))
    self._autoExploreEffect:setVisible(false)

end

--停止actor 动作
function ExploreMapLayer:_stopActorAllAction(  )
    -- body
    self._actor:stopAllActions()
end

--设置脸朝向
function ExploreMapLayer:setFaceDirection(index)
    -- body
    local block = self._mapBlockData[index]
    local nextBlock = self._mapBlockData[index + 1]
    if block and nextBlock then
        if nextBlock.posX < block.posX then
            self:_setActorScaleX(-1)
        else
            self:_setActorScaleX(1)
        end
    end
end

function ExploreMapLayer:_setActorScaleX(scale)
	self._actor:setScaleX(scale)
	self._autoExploreEffect:setScaleX(scale)
end

-- 设置角色位置
function ExploreMapLayer:setActorPositionByIndex(index)
    local block = self._mapBlockData[index]
    self._actor:setPosition(cc.p(block.posX, block.posY))
    self._actor:setAction("idle", true)
end
-- 自动游历特效字
function ExploreMapLayer:setActorAutoExploreWord( trueOrFalse )
    -- body
    self._autoExploreEffect:setVisible(trueOrFalse)
end

-- 获取当前位置
function ExploreMapLayer:getPositionByIndex(index)
    -- body
    if not index then
        index = self._index
    end
    local block = self._mapBlockData[index]
    return cc.p(block.posX, block.posY)
end

--获取角色 世界坐标
function ExploreMapLayer:getWorldPositionByIndex(index)
    -- body
    if not index then
        index = self._index
    end
    local block = self._mapBlockData[index]
    local pos = cc.p(block.posX, block.posY)
    return self._innerContainer:convertToWorldSpace(pos)
end


-- 是否跑到终点了
function ExploreMapLayer:isActorRunEnd()
    -- body
    return self._index >= self._mapBlockSize
end

--检查 修正 角色是否要到终点了
function ExploreMapLayer:checkActorWillRunEnd ( num )
    -- body
    if self._index + num >= self._mapBlockSize then
        return true, self._mapBlockSize - self._index
    end
    return false
end

-- 获取当前的百分比
function ExploreMapLayer:getPercent( )
    -- body
    local percent = math.floor(self._index / self._mapBlockSize * 100)
    if self._index == 1 then
        percent = 0
    end
    return percent
end

-- 获取当前运动索引
function ExploreMapLayer:getCurIndex( )
    -- body
    return self._index
end

--获取当前 事件类型
function ExploreMapLayer:getCurPosEventType()
    -- body
    local block = self._mapBlockData[self._index]
    return block.type
end

-- 判断当前位置 是否有宝物
function ExploreMapLayer:isCurPosTreasure()
    -- body
    local block = self._mapBlockData[self._index]
    return block.isTreasure
end


--前进格子
function ExploreMapLayer:moveForward(n, callback)
    if self._index + n > self._mapBlockSize then
        n = self._mapBlockSize - self._index
    end

    local actions = {}
    local mapActions = {}
    for i = 1, n do
        local nowBlock = self._mapBlockData[self._index]
        local block = self._mapBlockData[self._index + 1]
        local turnBack = 1
        if block.posX < nowBlock.posX then
            turnBack = -1
        end

        local scaleCallFunc = cc.CallFunc:create(function()
			self:_setActorScaleX(turnBack)
        end)

        local soundCallFunc = cc.CallFunc:create(function()
            G_AudioManager:playSoundWithId(AudioConst.SOUND_EXPLORE_WALK)
        end)
        local action = cc.Spawn:create(cc.MoveTo:create(0.2, cc.p(block.posX, block.posY)),scaleCallFunc, soundCallFunc)
        table.insert(actions, action)
        local mapAction = cc.MoveTo:create(0.2, self:_getMapPosition(block.posX, block.posY))
        table.insert(mapActions, mapAction)
        self._index = self._index + 1
    end

    local actionEnd = cc.CallFunc:create(function()
        -- body
        self._actor:setAction("idle", true)
        if callback then
            callback()
        end
    end)
    local action = cc.Sequence:create(actions[1], actions[2], actions[3], actions[4], actions[5], actions[6], actionEnd)
    self._actor:setAction("run", true)
    self._actor:runAction(action)


    local mapAction = cc.Sequence:create(mapActions[1], mapActions[2], mapActions[3], mapActions[4], mapActions[5], mapActions[6])
    self._innerContainer:runAction(mapAction)
end

return ExploreMapLayer
