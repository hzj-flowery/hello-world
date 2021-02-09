local SpineNode = require("yoka.node.SpineNode")
local HeroSpineNode = class("HeroSpineNode", SpineNode)

HeroSpineNode.SCALE = 0.5

function HeroSpineNode:ctor()
	HeroSpineNode.super.ctor(self, HeroSpineNode.SCALE, cc.size(500,500))
end

return HeroSpineNode