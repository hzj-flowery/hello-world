-- @Author panhoa
-- @Date 7.31.2018
-- @Role comonnormalpop2

local CommonNormalSmallPop2 = class("CommonNormalSmallPop2")


local EXPORTED_METHODS = {
    "addCloseEventListener",
    "setTitle",
	"setCloseVisible",
	"moveTitleToTop"
}

function CommonNormalSmallPop2:ctor()
	self._target = nil
	self._textTitle = nil
	self._btnClose = nil
end

function CommonNormalSmallPop2:_init()
	self._textTitle = ccui.Helper:seekNodeByName(self._target, "Text_title")
	self._btnClose = ccui.Helper:seekNodeByName(self._target, "Button_close")
	self._imageTitle = ccui.Helper:seekNodeByName(self._target, "Image_title")
	self:_moveNodeZorder(self._btnClose)
end

-- @Role bind
function CommonNormalSmallPop2:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

-- @Role unbind
function CommonNormalSmallPop2:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

-- @Param node
-- @Role Strength the render
function CommonNormalSmallPop2:_moveNodeZorder(node)
	if not node then
		return
	end

	local container = self._target:getParent()
	node:retain()
    local worldPos = node:convertToWorldSpaceAR(cc.p(0,0))
    local btnNewPos = container:convertToNodeSpace(cc.p(worldPos))
	node:removeFromParent()
	container:addChild(node)
	node:setPosition(btnNewPos)
	node:release()
end

-- @Param callback
-- @Role close
function CommonNormalSmallPop2:addCloseEventListener(callback)
	if self._btnClose then
		self._btnClose:setVisible(true)
		self._btnClose:addClickEventListenerEx(callback, true, nil, 0)
	end
end

-- @Param name
-- @Role Set Title
function CommonNormalSmallPop2:setTitle(name)
	self._textTitle:setString(name)
end

-- @Param bShow
-- @Role Hide CloseBtn
function CommonNormalSmallPop2:setCloseVisible(bShow)
	if self._btnClose then
		self._btnClose:setVisible(bShow)
	end
end

-- @Role Reset the render
-- @Attention: only use once
function CommonNormalSmallPop2:moveTitleToTop()
	self:_moveNodeZorder(self._imageTitle)
end

return CommonNormalSmallPop2