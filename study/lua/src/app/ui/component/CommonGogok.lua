--
-- Author: Liangxu
-- Date: 2018-8-9
-- 通用勾玉

local CommonGogok = class("CommonGogok")

local EXPORTED_METHODS = {
	"setCount",
	"resetSize"
}

function CommonGogok:ctor()
	self._target = nil
end

function CommonGogok:_init()
	self._image1 = ccui.Helper:seekNodeByName(self._target, "Image1")
	self._image2 = ccui.Helper:seekNodeByName(self._target, "Image2")
	self._image3 = ccui.Helper:seekNodeByName(self._target, "Image3")
	self._showSize = 3
	self._size = 3
end

function CommonGogok:resetSize(size)
	for i=self._size+1,size do
		local img = ccui.ImageView:create()
		img:loadTexture(Path.getLimitImg("img_limit_05b"))
		self._target:addChild(img)
		img:setPosition(cc.p(0, 0))
		self["_image"..i] = img
	end
	self._showSize = size
	self._size = math.max(self._size, self._showSize)
	local offset = 50
	local width = (size-1)*offset
	for i=1,size do
		local posX = (i-(size+1)/2)*offset
		self["_image"..i]:setPositionX(posX)
		self["_image"..i]:setVisible(true)
	end
	for i=size+1,self._size do
		self["_image"..i]:setVisible(false)
	end
end

function CommonGogok:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonGogok:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonGogok:setCount(count)
	for i = 1, self._showSize do
		if i <= count then
			self["_image"..i]:loadTexture(Path.getLimitImg("img_limit_05"))
		else
			self["_image"..i]:loadTexture(Path.getLimitImg("img_limit_05b"))
		end
	end
end

return CommonGogok