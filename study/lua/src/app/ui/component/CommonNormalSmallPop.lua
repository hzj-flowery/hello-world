local CommonNormalSmallPop = class("CommonNormalSmallPop")


local EXPORTED_METHODS = {
    "addCloseEventListener",
    "setTitle",
	"hideCloseBtn",
	"hideBtnBg",
	"setCloseVisible",
	"moveTitleToTop",
	"setCloseButtonLocalZOrder",
	"offsetCloseButton",
	"setTitleSysFont",
	"setTitleFontSize",
	"setTitlePositionX",
}

function CommonNormalSmallPop:ctor()
	self._target = nil
	self._textTitle = nil
	self._btnClose = nil
end

function CommonNormalSmallPop:_init()
	self._textTitle = ccui.Helper:seekNodeByName(self._target, "Text_title")
	self._btnClose = ccui.Helper:seekNodeByName(self._target, "Button_close")
	self._textTitleShadow = ccui.Helper:seekNodeByName(self._target, "Text_title_shadow")
	self._imageBtnBg = ccui.Helper:seekNodeByName(self._target, "ImageBtnBg")
	self._imageTitle = ccui.Helper:seekNodeByName(self._target, "Image_title")

	self:_moveNodeZorder(self._btnClose)
	--self:_moveNodeZorder(self._imageTitle)
end

function CommonNormalSmallPop:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonNormalSmallPop:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonNormalSmallPop:_moveNodeZorder(node)
	if not node then
		return
	end
	--self._btnClose:setGlobalZOrder(1)
	--关闭按钮提到上层
	local container = self._target:getParent()
	node:retain()
    local worldPos = node:convertToWorldSpaceAR(cc.p(0,0))
    local btnNewPos = container:convertToNodeSpace(cc.p(worldPos))
	node:removeFromParent()
	container:addChild(node)
	node:setScale(self._target:getScale())
	node:setPosition(btnNewPos)
	node:release()
end

--
function CommonNormalSmallPop:update(param)
	
end

--
function CommonNormalSmallPop:addCloseEventListener(callback)
	if self._btnClose then
		self._btnClose:setVisible(true)
		self._btnClose:addClickEventListenerEx(callback, true, nil, 0)
	end
end

--
function CommonNormalSmallPop:setTitle(s)
	self._textTitle:setString(s)
end


function CommonNormalSmallPop:hideCloseBtn()
	if self._btnClose then
		self._btnClose:setVisible(false)
	end
end

function CommonNormalSmallPop:hideBtnBg()
	if self._imageBtnBg then
		self._imageBtnBg:setVisible(false)
	end
end

function CommonNormalSmallPop:setCloseVisible(v)
	if self._btnClose then
		self._btnClose:setVisible(v)
	end
end

--不能多次调用
function CommonNormalSmallPop:moveTitleToTop()
	self:_moveNodeZorder(self._imageTitle)
end

-- @Role 	调整渲染层级
function CommonNormalSmallPop:setCloseButtonLocalZOrder(order)
	if self._btnClose then
		self._btnClose:setGlobalZOrder(order)
	end
end

function CommonNormalSmallPop:offsetCloseButton( offsetX, offsetY )
	-- body
	if self._btnClose then
		local posX = self._btnClose:getPositionX() + offsetX
		local posY = self._btnClose:getPositionY() + offsetY 
		self._btnClose:setPosition(cc.p(posX, posY))
	end
end

function CommonNormalSmallPop:setTitleSysFont()
	self._textTitle:setFontName(Path.getCommonFont())
end

function CommonNormalSmallPop:setTitleFontSize(size)
	self._textTitle:setFontSize(size)
end

function CommonNormalSmallPop:setTitlePositionX(pos)
	self._textTitle:setPositionX(pos)
end

return CommonNormalSmallPop