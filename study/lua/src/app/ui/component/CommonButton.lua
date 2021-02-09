local CommonButton = class("CommonButton")

CommonButton.EXPORTED_METHODS = {
    "addClickEventListenerEx",
	"addTouchEventListenerEx",
    "setString",
    "showRedPoint",
    "setEnabled",
	"isEnabled",
	"setButtonTag",
	"setButtonName",
    "setWidth",
	"setTouchEnabled",
	"setSwallowTouches",
	"loadTexture",
	"getDesc",
	"addClickEventListenerExDelay",
	"setFontSize",
	"hideTxt",
	"setTxtVisible"
}

function CommonButton:ctor()
	self._target = nil
	self._button = nil
	self._desc = nil
	self._redPoint = nil
end

function CommonButton:_init()
	self._button = ccui.Helper:seekNodeByName(self._target, "Button")
	self._desc = ccui.Helper:seekNodeByName(self._target, "Text")
	self._redPoint = ccui.Helper:seekNodeByName(self._target, "RedPoint")
	self:setEnabled(true)
end

function CommonButton:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, self.class.EXPORTED_METHODS)
end

function CommonButton:unbind(target)
    cc.unsetmethods(target, self.class.EXPORTED_METHODS)
end

--
function CommonButton:update(param)

end

--
function CommonButton:addClickEventListenerExDelay(callback, delay)
	self._button:addClickEventListenerEx(callback, nil, delay)
end

function CommonButton:addClickEventListenerEx(callback)
	self._button:addClickEventListenerEx(callback, true, nil, 0)
end

function CommonButton:addTouchEventListenerEx(callback,swallow)
	self._button:addTouchEventListenerEx(callback)
	if swallow ~= nil then
	    self._button:setSwallowTouches(swallow)
	end
end

function CommonButton:setSwallowTouches(swallow)
	self._button:setSwallowTouches(swallow)
end

--
function CommonButton:setString(s)
	self._desc:setString(s)
end


function CommonButton:setFontSize(size)
	self._desc:setFontSize(size)
end

--
function CommonButton:showRedPoint(v)
	self._redPoint:setVisible(v)
end

function CommonButton:isEnabled()
	return self._button:isEnabled()
end
--
function CommonButton:setEnabled(e)
	self._button:setEnabled(e)
	--self._desc:setColor(e and Colors.BUTTON_ONE_NORMAL or Colors.BUTTON_ONE_DISABLE)
	--self._desc:enableOutline(e and Colors.BUTTON_ONE_NORMAL_OUTLINE or Colors.BUTTON_ONE_DISABLE_OUTLINE, 2)
end

function CommonButton:setTouchEnabled(e)
	self._button:setTouchEnabled(e)
end

function CommonButton:setWidth(width)
	local height = self._button:getContentSize().height
	self._button:setContentSize(width, height)
end

function CommonButton:setButtonTag(tag)
	self._button:setTag(tag)
end

function CommonButton:setButtonName(name)
	self._button:setName(name)
end

function CommonButton:loadTexture(normalImg,selectImg,disableImg)
	self._button:loadTextures(normalImg, selectImg, disableImg)
end

function CommonButton:getDesc()
	return self._desc
end

function CommonButton:setTxtVisible(s)
	if s then
		print("bShow ====== true")
	else
		print("bShow ====== false")
	end
	
	self._desc:setVisible(s)
end



return CommonButton
