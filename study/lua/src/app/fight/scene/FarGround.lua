--远景层
local FarGround = class("FarGround", function()
	return cc.Node:create()
end)

local Path = require("app.utils.Path")

FarGround.ZORDER_BACK = 1
FarGround.ZORDER_EFFECT = 2

--
function FarGround:ctor()
	self._image = nil
	self._effectNode = cc.Node:create()
	self:addChild(self._effectNode, FarGround.ZORDER_EFFECT)
end

function FarGround:setBG(name)
	if self._image then
		self._image:removeFromParent(true)
		self._image = nil
    end
    if name == "" then
        return
    end
	-- self._image = cc.Sprite:create(Path.getFightSceneBackground(name))
	self._image = cc.Sprite:create(name)
	self._image:setAnchorPoint(cc.p(0.5, 1))
	self._image:setPositionY(320)
	self:addChild(self._image, FarGround.ZORDER_BACK)
end

function FarGround:createEffect(effectName)
	self._effectNode:removeAllChildren()
	if effectName ~= "" then
		G_EffectGfxMgr:createPlayMovingGfx( self._effectNode, Path.getFightSceneEffect(effectName), nil, nil ,false ) 
	end
end

return FarGround