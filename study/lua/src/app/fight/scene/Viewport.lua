local Element = class("Element")
local FightConfig = require("app.fight.Config")

--
local function lerpf (src, target, t)
	return (src + t * (target - src))
end

--
function Element:ctor(helper, info)
	self._helper = helper
	self._layerInfo = info
	self._frames = self._layerInfo.frames
	self._name = self._layerInfo.name
	self._entity = nil
	self._lastFrame = nil
end

--
function Element:update(f, factor)
	local frame = self._frames[tostring(f)]
	if frame ~= nil then
		--print(frame.id)
		if self._entity == nil then
			self._entity = self._helper:createSymbol(self._name, self._layerInfo.extras)
		end

		local start = self._helper:getStartPosition()

		self._entity:setFlashPosition((start.x + checkint(frame.x)) * factor, start.y + checkint(frame.y+frame.height))
		self._entity:setFlashScale(frame.scaleX, frame.scaleY)

		if frame.color then
			self._entity:setFlashColor(frame.red_percent, frame.green_percent, frame.blue_percent, frame.alpha_percent)
		end
		self._lastFrame = frame
	end

	if self._lastFrame ~= nil then
		if self._lastFrame.isMotion == true then
			local n = self._lastFrame.id + self._lastFrame.duration
			--print("isMotion = " .. f .. ", n = " .. n)
			local nextFrame = self._frames[tostring(n)]
			if nextFrame then
				local start = self._helper:getStartPosition()
				local t = (f - self._lastFrame.id) / self._lastFrame.duration
	
				local x = lerpf(self._lastFrame.x, nextFrame.x, t)
				local y = lerpf(self._lastFrame.y, nextFrame.y, t)
				local height = lerpf(self._lastFrame.height, nextFrame.height, t)
				local scaleX = lerpf(self._lastFrame.scaleX, nextFrame.scaleX, t)
				local scaleY = lerpf(self._lastFrame.scaleY, nextFrame.scaleY, t)
				local rotation = lerpf(self._lastFrame.rotation, nextFrame.rotation, t)

				self._entity:setFlashPosition((start.x + checkint(x))*factor, start.y + checkint(y+height))
				self._entity:setFlashScale(scaleX, scaleY)

				if self._lastFrame.color and nextFrame.color then
					local alpha = lerpf(self._lastFrame.alpha_percent, nextFrame.alpha_percent, t)
					local red = lerpf(self._lastFrame.red_percent, nextFrame.red_percent, t)
					local green = lerpf(self._lastFrame.green_percent, nextFrame.green_percent, t)
					local blue = lerpf(self._lastFrame.blue_percent, nextFrame.blue_percent, t)
					self._entity:setFlashColor(red, green, blue, alpha)
				end
			end
		end
	end
end

--
function Element:updateFrame(f)
	
end




local Viewport = class("Viewport")

local Engine = require("app.fight.Engine")
--
function Viewport:ctor(sceneView, sceneWidth, sceneHeight)
	self._sceneView = sceneView
	self._sceneWidth = sceneWidth
	self._sceneHeight = sceneHeight
	self._factor = 1
	self._towards = FightConfig.campLeft
end

--
function Viewport:createSymbol(name, extras)
	if name == "scene" then
		return self._sceneView
	elseif name == "flash" then
		return self._sceneView:getFlashGround()
	end


	if extras and extras == "flip" then
		return Engine.getEngine():createEffectBySceneFront(name)
	end
	return Engine.getEngine():createEffectBySceneFront(name, self._towards)

end

--
function Viewport:getStartPosition()
	return self._startPosition
end

--
function Viewport:start(id, towards)
	self._towards = towards
	self._factor = towards == FightConfig.campLeft and 1 or -1
	local str = cc.FileUtils:getInstance():getStringFromFile(Path.getSceneAction(id))
	if str ~= "" then
		self._finish = false
		self._start = true
		self._frame = 0
		self._startPosition = cc.p(0, 0)
		self._data = json.decode(str)
		assert(self._data, string.format("Viewport - Load ani json \"%s\" failed", ani))

		self._layers = {}
		for i,v in ipairs(self._data.layers) do
			local layer = Element.new(self, v)
			self._layers[#self._layers + 1] = layer
		end

		self._startPosition = cc.p(self._sceneView:getFlashPosition())
	end
end

--
function Viewport:stop()
	if self._start then
		self._start = false
		self._sceneView:setFlashPosition(self._startPosition.x, self._startPosition.y)
		self._sceneView:setFlashScale(1, 1)
		for i, v in pairs(self._layers) do
			if v.isFlashLayer then
				v:setVisible(false)
			end
		end
		self._layers = {}
		self._finish = true
		-- if self._startPosition.x == 0 and self._startPosition.y == 0 then
			-- local Enging = require("app.fight.Engine")
			-- local view = Engine.getEngine():getView()
			-- view:showSkill3Layer(false)
		-- end
	end
end

--
function Viewport:update()
	if self._finish == false and self._start == true then
		for i,v in ipairs(self._layers) do
			v:update(self._frame, self._factor)
		end

		self._frame = self._frame + 1
		if self._frame >= self._data.frameCount then
			-- print(self._ani, self._frame, self._finish, self._start)
			self:stop()
		end
	end
end

return Viewport