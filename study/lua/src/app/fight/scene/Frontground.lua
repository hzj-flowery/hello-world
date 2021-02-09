local Frontground = class("Frontground", function()
	return cc.Node:create()
end)

--
function Frontground:ctor()
	self._effectName = nil
end

function Frontground:createEffect(effectName)
	self:removeAllChildren()
	if effectName ~= "" then
		G_EffectGfxMgr:createPlayMovingGfx( self, Path.getFightSceneEffect(effectName), effectFunction, nil ,false ) 
		self._effectName = effectName
	end
end

function Frontground:removeEffect()
	self:removeAllChildren()
end

function Frontground:reCreateEffect()
	if self._effectName then 
		self:createEffect(self._effectName)
	end
end


return Frontground