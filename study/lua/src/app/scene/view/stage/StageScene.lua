--场景类
local ViewBase = require("app.ui.ViewBase")
-- local SceneBase = class("SceneBase", ViewBase)
local StageScene = class("StageScene", ViewBase)

local StoryChapterScene = require("app.config.story_chapter_scene")
local Path = require("app.utils.Path")

--中层要分，从前到后，前特效，宝箱层，人物层，人物后，图片，后特效
StageScene.Z_BACKEFT = 1
StageScene.Z_MAINPIC = 2
StageScene.Z_BACKNODE = 3
StageScene.Z_STAGENODE = 5
StageScene.Z_STAGEBOX = 4
StageScene.Z_FRONTEFT = 6 

StageScene.SCENE_BACK = 1
StageScene.SCENE_MIDDLE = 2
StageScene.SCENE_FRONT = 3

function StageScene:ctor(sceneId)
    self._sceneInfo = StoryChapterScene.get(sceneId)
    assert(self._sceneInfo, "scene id is nil "..sceneId)
    self._moveDiff = self._sceneInfo.differ_value
    self._moveFront = -self._sceneInfo.differ_front_value
    self._picPath = self._sceneInfo.background
    self._size = nil
    self._scenes = {} 
    StageScene.super.ctor(self)
end

function StageScene:onCreate()
    for i = 1, StageScene.SCENE_FRONT do
        local scene = cc.Node:create()
        scene:setPosition(cc.p(0, 0))
        self:addChild(scene, i)
        self._scenes[i] = scene
    end

    local picBack, picMid, picFront = Path.getStageMapPath(self._picPath)

    if picBack then
        local spriteBack = cc.Sprite:create(picBack)
        spriteBack:setPosition(cc.p(0, 640))
        spriteBack:setAnchorPoint(cc.p(0, 1))

        -- --反转
        -- spriteBack:setAnchorPoint(cc.p(1, 1))
        -- spriteBack:setScaleX(-1)

        self._scenes[StageScene.SCENE_BACK]:addChild(spriteBack, StageScene.Z_MAINPIC)
    end

    local spriteMid = cc.Sprite:create(picMid)
    spriteMid:setPosition(cc.p(0, 0))
    spriteMid:setAnchorPoint(cc.p(0, 0))

    -- --反转
    -- spriteMid:setAnchorPoint(cc.p(1, 0))
    -- spriteMid:setScaleX(-1)

    self._size = spriteMid:getContentSize()     --以中景为最终场景基准尺寸
    self._scenes[StageScene.SCENE_MIDDLE]:addChild(spriteMid, StageScene.Z_MAINPIC)

    if picFront then
        local spriteFront = cc.Sprite:create(picFront)
        spriteFront:setPosition(cc.p(0, 0))
        spriteFront:setAnchorPoint(cc.p(0, 0))

        -- --反转
        -- spriteFront:setAnchorPoint(cc.p(1, 0))
        -- spriteFront:setScaleX(-1)

        self._scenes[StageScene.SCENE_FRONT]:addChild(spriteFront, StageScene.Z_MAINPIC)
    end

    self:_createEffect(StageScene.SCENE_FRONT, self._sceneInfo.front_front, StageScene.Z_FRONTEFT)
    self:_createEffect(StageScene.SCENE_FRONT, self._sceneInfo.front_back, StageScene.Z_BACKEFT)
    self:_createEffect(StageScene.SCENE_MIDDLE, self._sceneInfo.mid_front, StageScene.Z_BACKNODE)
    self:_createEffect(StageScene.SCENE_MIDDLE, self._sceneInfo.mid_back, StageScene.Z_BACKEFT)
    self:_createEffect(StageScene.SCENE_BACK, self._sceneInfo.back_front, StageScene.Z_FRONTEFT)
end

function StageScene:onEnter()
end

function StageScene:onExit()
end

function StageScene:onMoveEvent(posX)
    local diffPerPix = self._moveDiff / self._size.width
    local backPosX = -posX * diffPerPix
    self._scenes[StageScene.SCENE_BACK]:setPositionX(backPosX)

    if self._scenes[StageScene.SCENE_FRONT] then
        local diffPerPix = self._moveFront / self._size.width
        local backPosX = -posX * diffPerPix
        self._scenes[StageScene.SCENE_FRONT]:setPositionX(backPosX)
    end
end

function StageScene:getSize()
    return self._size
end

function StageScene:addStageNode(node, index)
    self._scenes[StageScene.SCENE_MIDDLE]:addChild(node, StageScene.Z_STAGENODE)
end

function StageScene:addStageBox(node, index)
    self._scenes[StageScene.SCENE_MIDDLE]:addChild(node, StageScene.Z_STAGEBOX)
end 

function StageScene:getScene(index)
    return self._scenes[index]
end

function StageScene:_createEffect(sceneIndex, effectName, ZOrder)
    if effectName == "" then
        return
    end
    local scene = self._scenes[sceneIndex]
    assert(scene, "scene index is wrong index = "..sceneIndex)
    local effect = G_EffectGfxMgr:createPlayMovingGfx( scene, effectName, nil, nil ,false ) 
    local height = math.min(640, display.height)
    effect:setPosition(cc.p(self._size.width*0.5, height*0.5)) 
    -- --反转 
    -- effect:setScaleX(-1)
    if ZOrder then
        effect:setLocalZOrder(ZOrder)
    end
end

return StageScene