local CampRaceCountryNode = class("CampRaceCountryNode")

local CAMP2RES = {
	[1] = "img_com_camp08",
	[2] = "img_com_camp05",
	[3] = "img_com_camp07",
	[4] = "img_com_camp06",
}

function CampRaceCountryNode:ctor(target, camp, callback)
	self._target = target
	self._camp = camp
	self._callback = callback

	self._imageCamp = ccui.Helper:seekNodeByName(self._target, "ImageCamp")
	self._imageCamp:addClickEventListenerEx(handler(self, self._onClick))
	local res = Path.getTextSignet(CAMP2RES[camp])
	self._imageCamp:loadTexture(res)

	self._imageHighLight = ccui.Helper:seekNodeByName(self._target, "ImageHighLight")
	self._imageHighLight:setVisible(false)
end

function CampRaceCountryNode:setSelected(selected)
	self._imageHighLight:setVisible(selected)
end

function CampRaceCountryNode:_onClick()
	if self._callback then
		self._callback(self._camp)
	end
end

return CampRaceCountryNode