local DrawCardResourceInfo = class("DrawCardResourceInfo")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

DrawCardResourceInfo.SINGLE_POSX = 108
DrawCardResourceInfo.OTHER_POSX = 90


function DrawCardResourceInfo:ctor(target)
    self._imageRes = nil
    self._text = nil
    self._target = target
    self:_init()
end

function DrawCardResourceInfo:_init()
    self._imageRes = ccui.Helper:seekNodeByName(self._target, "Image")
    self._text = ccui.Helper:seekNodeByName(self._target, "Text")
end

function DrawCardResourceInfo:updateUI(type, value, size)
	type = type or TypeConvertHelper.TYPE_RESOURCE
	local itemParams = TypeConvertHelper.convert(type, value)

	self._itemParams = itemParams
	if itemParams.res_mini then
		self._imageRes:loadTexture(itemParams.res_mini)
	end
	if size then
        if size <= 10 then   
            self._target:setPositionX(DrawCardResourceInfo.SINGLE_POSX)
        else
            self._target:setPositionX(DrawCardResourceInfo.OTHER_POSX)
        end
		self._text:setString(size)
	end
end

function DrawCardResourceInfo:setVisible(v)
    self._target:setVisible(v)
end

return DrawCardResourceInfo