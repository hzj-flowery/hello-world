-- Author: Panhoa
-- Date: 2018-12-17
-- 
local CommonTabIcon2 = class("CommonTabIcon2")

local EXPORTED_METHODS = {
	"updateUI",
	"setClickCallback",
	"showRedPoint",
	"setSelected"
}

function CommonTabIcon2:ctor()
	self._target = nil
	self._imageBg = nil
	self._text = nil
	self._imageRedPoint = nil
	self._panelTouch = nil

	self._index = nil
	self._clickCallBack = nil
end

function CommonTabIcon2:_init()
	self._imageBg = ccui.Helper:seekNodeByName(self._target, "Image_down")
	self._text = ccui.Helper:seekNodeByName(self._target, "Text_desc") 				-- 文字描述
	self._imgDesc = ccui.Helper:seekNodeByName(self._target, "Image_desc") 			-- 图片描述，可选
	self._imgDescSel = ccui.Helper:seekNodeByName(self._target, "Image_desc_sel") 	-- 被选中的图片描述，可选
	self._imageRedPoint = ccui.Helper:seekNodeByName(self._target, "Image_RedPoint")
	self._imageRedPoint:setVisible(false)
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:setSwallowTouches(false)
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
end

function CommonTabIcon2:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTabIcon2:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonTabIcon2:updateUI(txt, bselected, index, imgPath, imgSelPath)
	self._index = index
	self._imageBg:setVisible(bselected)
	self._text:setString(txt)
	if self._imgDesc then
		self._imgDesc:loadTexture(imgPath)
	end
	if self._imgDescSel then
		self._imgDescSel:loadTexture(imgSelPath)
		self._imgDescSel:setVisible(bselected)
	end
end

function CommonTabIcon2:setClickCallback(callback)
	self._clickCallBack = callback
end

function CommonTabIcon2:showRedPoint(show)
	self._imageRedPoint:setVisible(show)
end

function CommonTabIcon2:setSelected(selected)
	self._imageBg:setVisible(selected)
	if self._imgDescSel then
		self._imgDescSel:setVisible(selected)
	end
end

function CommonTabIcon2:_onPanelTouch(sender, state)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:setSelected(true)
		if self._clickCallBack then
			self._clickCallBack(self._index)
		end
	end
end

return CommonTabIcon2