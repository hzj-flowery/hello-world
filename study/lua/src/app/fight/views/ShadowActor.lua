local ShadowActor = class("ShadowActor", function()
	return cc.Node:create()
end)

function ShadowActor:ctor(needAnim)
	self._shadow = cc.Sprite:create( Path.getUICommon("img_heroshadow") )
	self._shadow:setScale(2)
	self:addChild(self._shadow)
	if needAnim then
		G_EffectGfxMgr:createPlayMovingGfx( self, "moving_bianshenka")
	end
end

function ShadowActor:updatePos(position)
	self:setPosition(position)
end

function ShadowActor:death()
	local action1 = cc.FadeOut:create(0.2)
    local action2 = cc.RemoveSelf:create()
    local action = cc.Sequence:create(action1, action2)
    self:runAction(action)
end

return ShadowActor