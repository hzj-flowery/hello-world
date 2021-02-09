local ViewBase = require("app.ui.ViewBase")
local HorseRaceMap = class("HorseRaceMap", ViewBase)

local HorseRaceConst = require("app.const.HorseRaceConst")
local HorseRaceHelper = require("app.scene.view.horseRace.HorseRaceHelper")
local HorseRaceAvatar = require("app.scene.view.horseRace.HorseRaceAvatar")


local scheduler = require("cocos.framework.scheduler")
local AudioConst = require("app.const.AudioConst")

local ZORDER_AVATAR = 1000



function HorseRaceMap:ctor()
    self._mapContent = nil   
    self._avatar = nil
    self._blocks = nil

    self._scheduleHandler = nil

    self._frameDelta = 1/60
    self._distance = 0
	self._startPosition = cc.p(0, 0)
    self._endPosition = cc.p(0, 0)
    self._mapWidth = 0
    self._bgWidth = 0

    self._mapUpdateTime = 0
    self._blockMapWidth = 0

    self._canPlayGold = true
    self._playGoldTime = 0

    -- G_AudioManager:preLoadSound(soundPath)
    G_AudioManager:preLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_GOLD)
    
	local resource = {
        file = Path.getCSB("HorseRaceMap", "horseRace"),
	}
	HorseRaceMap.super.ctor(self, resource)
end

function HorseRaceMap:onCreate()
    local size = G_ResolutionManager:getDesignCCSize()
    self._scrollView:setContentSize(size)
    self._scrollView:setTouchEnabled(false)
    self._mapContent = self._scrollView:getInnerContainer()
    self._mapWidth = size.width

    -- local mapWidth = HorseRaceHelper.getMapWidthBlock(self._index) * HorseRaceConst.BLOCK_WIDTH
    -- self._scrollView:setInnerContainerSize(cc.size(mapWidth, size.height))

    -- self:_createBG(mapWidth)
    -- self:_createFarGround()
    -- self:_createBlocks(self._index)
    -- self:_createAvatar()
end

function HorseRaceMap:onEnter()
    
    self._scheduleHandler = scheduler.scheduleUpdateGlobal(handler(self, self._update))

    self._listenerHorseGetPoint = G_SignalManager:add(SignalConst.EVENT_HORSE_GET_POINT, handler(self, self._onEventHorseGetPoint))
    self._listenerHorsePosX = G_SignalManager:add(SignalConst.EVENT_HORSE_RACE_POSX, handler(self, self._onEventHorseMove))

end

function HorseRaceMap:onExit()
    if self._scheduleHandler then
		scheduler.unscheduleGlobal(self._scheduleHandler)
		self._scheduleHandler = nil
	end
    self._listenerHorseGetPoint:remove()
    self._listenerHorseGetPoint = nil
    self._listenerHorsePosX:remove()
    self._listenerHorsePosX = nil

    G_AudioManager:unLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_GOLD)
end

function HorseRaceMap:getMapWidth()
    return self._scrollView:getInnerContainerSize().width
end

function HorseRaceMap:_createBG(mapWidth)
    self._bgWidth = 0
    while self._bgWidth < mapWidth do 
        local spriteBG = cc.Sprite:create(Path.getHorseRaceImg("bg"))
        spriteBG:setAnchorPoint(cc.p(0, 0))
        spriteBG:setPositionX(self._bgWidth)
        self._mapContent:addChild(spriteBG)
        self._bgWidth = self._bgWidth + spriteBG:getContentSize().width
    end
end

function HorseRaceMap:_createFarGround()
    local bgBlocks = HorseRaceHelper.getBlockInfo(self._index, HorseRaceConst.CONFIG_TYPE_MAP_BG)
    for i, v in pairs(bgBlocks) do 
        self:createSpriteBlock(v)
    end
end

function HorseRaceMap:_createBlocks(id)
    self._blocks, self._blockMapWidth = HorseRaceHelper.getBlockInfo(id, HorseRaceConst.CONFIG_TYPE_MAP)
    for i, v in pairs(self._blocks) do 
        if v.type == HorseRaceConst.BLOCK_TYPE_START then 
            self._startPosition.x = (v.blockX - 1)*HorseRaceConst.BLOCK_WIDTH + v.width/2
            self._startPosition.y = (v.blockY - 1)*HorseRaceConst.BLOCK_HEIGHT
        end
        if v.type == HorseRaceConst.BLOCK_TYPE_FINAL then 
            self._endPosition.x = (v.blockX - 1)*HorseRaceConst.BLOCK_WIDTH + v.width/2
            self._endPosition.y = (v.blockY - 1)*HorseRaceConst.BLOCK_HEIGHT
        end

        if v.resType == "png" then
            self:createSpriteBlock(v)
        end
    end
    self._distance = self._endPosition.x - self._startPosition.x
end

function HorseRaceMap:getMapDistance()
    return self._distance
end

function HorseRaceMap:createSpriteBlock(block)
    local node = cc.Node:create()
    local posX = (block.blockX-1)*HorseRaceConst.BLOCK_WIDTH
    local posY = (block.blockY-1)*HorseRaceConst.BLOCK_HEIGHT
    self._mapContent:addChild(node)
    node:setContentSize(block.width, block.height-1)
    node:setLocalZOrder(block.zOrder)
    block.mapPos = cc.p(posX, posY)
    node:setPosition(block.mapPos)
    -- node:setColor(Colors.getRankColor(1))


    local pic = cc.Sprite:create(Path.getHorseRaceImg(block.res))
    pic:setAnchorPoint(cc.p(0, 0))
    pic:setPositionX(-block.moveX)
    node:addChild(pic)
    block.mapRes = pic
    return pic
end

function HorseRaceMap:_createAvatar()
    self._avatar = HorseRaceAvatar.new()
    self._mapContent:addChild(self._avatar)
    self._avatar:setStartPos(self._startPosition)
    self._avatar:setLocalZOrder(ZORDER_AVATAR)
end

function HorseRaceMap:_startMove()
    if not self._move then
        self._move = true
        
        local time = self._distance / 700
        -- local action = cc.MoveTo:create(time, cc.p(-self._distance , 0))
        -- self._mapContent:runAction(action)
        self._scrollView:scrollToPercentHorizontal(100, time, false)
    end
end


function HorseRaceMap:_update(f)
    if f>self._frameDelta then
        f = self._frameDelta
    end
    self._avatar:update(f, self._blocks)
    if not self._canPlayGold then 
        if self._playGoldTime > 0.5 then 
            self._canPlayGold = true
            self._playGoldTime = 0
        end
        self._playGoldTime = self._playGoldTime + f
    end
end

function HorseRaceMap:_onEventHorseMove(eventName, horsePosX)
    local posX = horsePosX - self._mapWidth / 4
    if posX < 0 then 
        posX = 0
    end
    if posX > self._blockMapWidth - self._mapWidth then 
        posX = self._blockMapWidth - self._mapWidth
    end
    self._mapContent:setPositionX(-posX)
end

function HorseRaceMap:_onEventHorseGetPoint(eventName, point, block)
    if block.resType == "png" then 
        if self._canPlayGold then 
            G_AudioManager:playSoundWithId(AudioConst.SOUND_HORSE_RACE_GOLD)
            self._canPlayGold = false
        end
        block.mapRes:setVisible(false)
    end
end

function HorseRaceMap:resetMap(index)
    self._mapContent:removeAllChildren()

    self._index = index
    local size = G_ResolutionManager:getDesignCCSize()
    local mapWidth = HorseRaceHelper.getMapWidthBlock(self._index) * HorseRaceConst.BLOCK_WIDTH
    self._scrollView:setInnerContainerSize(cc.size(mapWidth, size.height))

    self:_createBG(mapWidth)
    self:_createFarGround()
    self:_createBlocks(self._index)
    self:_createAvatar()  
end


return HorseRaceMap