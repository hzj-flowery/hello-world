local Flashground = class("Flashground", function()
	return cc.Node:create()
end)

--
function Flashground:ctor(name)
	self._drawNode = cc.DrawNode:create()
    self:addChild(self._drawNode)
end

--
function Flashground:setFlashColor(r, g, b, a)
	self._drawNode:clear()
	if a > 0 then
		local p = {
			{x=-2000, y=-2000},
			{x=-2000, y=2000},
			{x=2000, y=2000},
			{x=2000, y=-2000}
		}
		self._drawNode:drawPolygon(p, 4, cc.c4f(r, g, b, a), 0, cc.c4f(0, 0, 0, 0))
	end
end

--
function Flashground:clear()
	self._drawNode:clear()
end

--
function Flashground:setFlashPosition(...)
	
end

--
function Flashground:getFlashPosition()
	return 0, 0
end
--
function Flashground:setFlashScale(...)
	
end

return Flashground