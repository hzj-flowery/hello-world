-- 南蛮场景类
local ViewBase = require("app.ui.ViewBase")
local SiegeScene = class("SiegeScene", ViewBase)

local SiegeSceneCell = require("app.scene.view.siege.SiegeSceneCell")

function SiegeScene:ctor()
    self._scenes = {}
    self._sceneCellIndex = 1
    self._needNewMap = false
    SiegeScene.super.ctor(self)
end

function SiegeScene:onCreate()
	self:_addScene()
end

function SiegeScene:onEnter()
end

function SiegeScene:onExit()
end

function SiegeScene:addNode(node)
    if self._needNewMap then
        self:_addScene()
		self._needNewMap = false
    end
    local currentScene = self._scenes[#self._scenes]
    local needNewMap = currentScene:addStageNode(node)

	if needNewMap then
		self._needNewMap = true
	end
end

function SiegeScene:_addScene()
    local scene = SiegeSceneCell.new(self._sceneCellIndex)
    scene:setPositionX(self:getWidth())
    self:addChild(scene)
    table.insert(self._scenes, scene)
    self._sceneCellIndex = self._sceneCellIndex + 1
end

function SiegeScene:getWidth()
    local width = 0
    for i, v in pairs(self._scenes) do
        width = width + v:getVisibleWidth()
    end
    return width
end

function SiegeScene:reset()
	self:removeAllChildren()
	self._scenes = {}
    self._sceneCellIndex = 1
    self._needNewMap = false
	self:_addScene()
end


return SiegeScene
