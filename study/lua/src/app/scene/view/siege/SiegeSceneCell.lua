--南蛮场景，单元
local ViewBase = require("app.ui.ViewBase")
local SiegeSceneCell = class("SiegeSceneCell", ViewBase)
local StoryChapterScene = require("app.config.story_chapter_scene")

--中层要分，从前到后，前特效，宝箱层，人物层，人物后，图片，后特效
SiegeSceneCell.Z_BACKEFT = 1
SiegeSceneCell.Z_MAINPIC = 2
SiegeSceneCell.Z_BACKNODE = 3
SiegeSceneCell.Z_STAGENODE = 5
SiegeSceneCell.Z_STAGEBOX = 4
SiegeSceneCell.Z_FRONTEFT = 6

SiegeSceneCell.SCENE_BACK = 1
SiegeSceneCell.SCENE_MIDDLE = 2
SiegeSceneCell.SCENE_FRONT = 3

SiegeSceneCell.SCENE_INDEX = 8      --南蛮场景的id
SiegeSceneCell.SCENE_LAST_WIDTH = 300   --最后一个怪距离版边的距离

SiegeSceneCell.SCENE_CONFIG =
{
    nodePosition1 = {
		[1] = cc.p(430,182),
		[2] = cc.p(765,126),
		[3] = cc.p(1042,273),
		[4] = cc.p(1283,396),
		[5] = cc.p(1593,168),
		[6] = cc.p(1889,126),
		[7] = cc.p(2145,258),
    },
    nodePosition = {
		[1] = cc.p(98,151),
		[2] = cc.p(430,182),
		[3] = cc.p(765,126),
		[4] = cc.p(1042,273),
		[5] = cc.p(1283,396),
		[6] = cc.p(1593,168),
		[7] = cc.p(1889,126),
		[8] = cc.p(2145,258),
    },
}

function SiegeSceneCell:ctor(cellIndex)
    self._config = SiegeSceneCell.SCENE_CONFIG
    self._sceneConfig = StoryChapterScene.get(SiegeSceneCell.SCENE_INDEX)
    -- self._picPath = self._config.path
    self._scenes = {}
    self._nodeIndex = 0
    self._cellIndex = cellIndex
    --有特殊走特殊，没有走普通站位配置
    self._positionList = self._config["nodePosition"..self._cellIndex]
    if not self._positionList then
        self._positionList = self._config.nodePosition
    end
    SiegeSceneCell.super.ctor(self)
end

function SiegeSceneCell:onCreate()
    for i = 1, SiegeSceneCell.SCENE_FRONT do
        local scene = cc.Node:create()
        scene:setPosition(cc.p(0, 0))
        self:addChild(scene, i)
        self._scenes[i] = scene
    end

    local picBack, picMid, picFront = Path.getStageMapPath(self._sceneConfig.background)

    if picBack then
        local spriteBack = cc.Sprite:create(picBack)
        spriteBack:setPosition(cc.p(0, 640))
        spriteBack:setAnchorPoint(cc.p(0, 1))
        -- spriteBack:setScale(1.25)
        self._scenes[SiegeSceneCell.SCENE_BACK]:addChild(spriteBack, SiegeSceneCell.Z_MAINPIC)
    end

    local spriteMid = cc.Sprite:create(picMid)
    spriteMid:setPosition(cc.p(0, 0))
    spriteMid:setAnchorPoint(cc.p(0, 0))
    self._size = spriteMid:getContentSize()     --以中景为最终场景基准尺寸
    self._scenes[SiegeSceneCell.SCENE_MIDDLE]:addChild(spriteMid, SiegeSceneCell.Z_MAINPIC)

    if picFront then
        local spriteFront = cc.Sprite:create(picFront)
        spriteFront:setPosition(cc.p(0, 0))
        spriteFront:setAnchorPoint(cc.p(0, 0))
        self._scenes[SiegeSceneCell.SCENE_FRONT]:addChild(spriteFront, SiegeSceneCell.Z_MAINPIC)
    end



    self:_createEffect(SiegeSceneCell.SCENE_FRONT, self._sceneConfig.front_front, SiegeSceneCell.Z_FRONTEFT)
    self:_createEffect(SiegeSceneCell.SCENE_FRONT, self._sceneConfig.front_back, SiegeSceneCell.Z_BACKEFT)
    self:_createEffect(SiegeSceneCell.SCENE_MIDDLE, self._sceneConfig.mid_front, SiegeSceneCell.Z_BACKNODE)
    self:_createEffect(SiegeSceneCell.SCENE_MIDDLE, self._sceneConfig.mid_back, SiegeSceneCell.Z_BACKEFT)
    self:_createEffect(SiegeSceneCell.SCENE_BACK, self._sceneConfig.back_front, SiegeSceneCell.Z_FRONTEFT)
end

function SiegeSceneCell:onEnter()
end

function SiegeSceneCell:onExit()
end

function SiegeSceneCell:getSize()
    return self._size
end

function SiegeSceneCell:addStageNode(node)
    self._nodeIndex = self._nodeIndex + 1
    local position = self._positionList[self._nodeIndex]
    node:setPosition(position)
    self._scenes[SiegeSceneCell.SCENE_MIDDLE]:addChild(node, SiegeSceneCell.Z_STAGENODE)
    if self._nodeIndex == #self._positionList then
        return true
    end
end

function SiegeSceneCell:_createEffect(sceneIndex, effectName, ZOrder)
    if effectName == "" then
        return
    end
    local scene = self._scenes[sceneIndex]
    assert(scene, "scene index is wrong index = "..sceneIndex)
    local effect = G_EffectGfxMgr:createPlayMovingGfx( scene, effectName, nil, nil ,false )
    effect:setPosition(cc.p(self._size.width*0.5, self._size.height*0.5))
    if ZOrder then
        effect:setLocalZOrder(ZOrder)
    end
end

function SiegeSceneCell:getVisibleWidth()
    local lastIndex = self._nodeIndex
    if lastIndex == #self._positionList then
        return self._size.width
    elseif self._cellIndex == 1 and lastIndex == 0 then    --第一张图并且没有怪的时候
        return display.width
    end
    local width = self._positionList[self._nodeIndex].x + SiegeSceneCell.SCENE_LAST_WIDTH
    if self._size.width < width then
        width = self._size.width
    end
    return width
end

return SiegeSceneCell
