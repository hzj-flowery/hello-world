-- @Author panhoa
-- @Date 7.19.2019
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local ObserveCell = class("ObserveCell", ListViewCellBase)


function ObserveCell:ctor()
    local resource = {
        file = Path.getCSB("ObserveCell", "guildCrossWar"),
    }
    ObserveCell.super.ctor(self, resource)
end

function ObserveCell:onCreate()
    local size = self._resource:getContentSize()
    self:setContentSize(size)
    self._resource:setVisible(false)
    self["_txtName"]:setSwallowTouches(true)
    self["_panelTouch"]:setSwallowTouches(false)
    --self["_btnItem"]:addClickEventListenerEx(handler(self, self._onTouchCallBack))
    self["_panelTouch"]:addTouchEventListenerEx(handler(self, self._onTouchCallBack))
end

function ObserveCell:_onTouchCallBack(sender,state)
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
            self:dispatchCustomCallback(self._uId)
		end
	end
end

function ObserveCell:updateUI(data)
    self._uId = data.cfg.user_id
    self._resource:setVisible(true)
    self["_spriteEye"]:setVisible(data.isObserver)
    self["_txtName"]:setString(data.cfg.user_name)
    self["_txtName"]:setColor(Colors.getOfficialColor(data.cfg.officer_level))
end


return ObserveCell