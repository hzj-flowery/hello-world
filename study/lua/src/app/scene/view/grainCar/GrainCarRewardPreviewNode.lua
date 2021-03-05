-- Description: 粮车奖励预览节点
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-10-09
local ViewBase = require("app.ui.ViewBase")
local GrainCarRewardPreviewNode = class("GrainCarRewardPreviewNode", ViewBase)
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper")

function GrainCarRewardPreviewNode:ctor(target)
    local resource = {
		file = Path.getCSB("GrainCarRewardPreviewNode", "grainCar"),
		binding = {
        }
	}
	GrainCarRewardPreviewNode.super.ctor(self, resource)
end

function GrainCarRewardPreviewNode:onCreate()
end

function GrainCarRewardPreviewNode:onEnter()
end

function GrainCarRewardPreviewNode:onExit()
end


function GrainCarRewardPreviewNode:update()
end

return GrainCarRewardPreviewNode