
local PopupBase = require("app.ui.PopupBase")
local PopupTShirtDetail = class("PopupTShirtDetail", PopupBase)

local ZORDER_LOW = 1
local ZORDER_HIGH = 2

function PopupTShirtDetail:ctor()
	local resource = {
		file = Path.getCSB("PopupTShirtDetail", "tshirt"),
		binding = {
			_buttonFront = {
				events = {{event = "touch", method = "_onButtonFront"}}
			},
			_buttonBack = {
				events = {{event = "touch", method = "_onButtonBack"}}
            },
		}
	}
	PopupTShirtDetail.super.ctor(self, resource)
end

function PopupTShirtDetail:onCreate()
    self._isBack = true --默认反面
end

function PopupTShirtDetail:onEnter()
	self:_updateView()
end

function PopupTShirtDetail:onExit()
	
end

function PopupTShirtDetail:_onButtonFront()
    self._isBack = false
    self:_updateView()
end

function PopupTShirtDetail:_onButtonBack()
    self._isBack = true
    self:_updateView()
end

function PopupTShirtDetail:_updateView()
    if self._isBack then
        self._imageBack:setLocalZOrder(ZORDER_HIGH)
        self._imageFront:setLocalZOrder(ZORDER_LOW)
        self._buttonBack:setLocalZOrder(ZORDER_HIGH)
        self._buttonFront:setLocalZOrder(ZORDER_LOW)
        self._buttonBack:loadTextureNormal(Path.getActTShirt("txt_tshirt_fanmian02"))
        self._buttonFront:loadTextureNormal(Path.getActTShirt("txt_tshirt_zhengmian01"))
    else
        self._imageBack:setLocalZOrder(ZORDER_LOW)
        self._imageFront:setLocalZOrder(ZORDER_HIGH)
        self._buttonBack:setLocalZOrder(ZORDER_LOW)
        self._buttonFront:setLocalZOrder(ZORDER_HIGH)
        self._buttonBack:loadTextureNormal(Path.getActTShirt("txt_tshirt_fanmian01"))
        self._buttonFront:loadTextureNormal(Path.getActTShirt("txt_tshirt_zhengmian02"))
    end
end

return PopupTShirtDetail