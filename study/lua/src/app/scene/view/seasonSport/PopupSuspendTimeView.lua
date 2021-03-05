-- @Author panhoa
-- @Date 10.9.2018
-- @Role

local PopupBase = require("app.ui.PopupBase")
local PopupSuspendTimeView = class("PopupSuspendTimeView", PopupBase)
local scheduler = require("cocos.framework.scheduler")


function PopupSuspendTimeView:ctor()
    self._commonNodeBk  = nil
    self._btnBack       = nil
    self._textHint      = nil

	local resource = {
		file = Path.getCSB("PopupSuspendTimeView", "seasonSport"),
		binding = {
			_btnBack = {
				events = {{event = "touch", method = "_onBtnBack"}}
			},
		}
	}
    PopupSuspendTimeView.super.ctor(self, resource, false, false)
end

-- @Role    自定信息
-- @Param   strTitle 标题
-- @Param   strContent 内容
-- @Param   strButton  按钮名
function PopupSuspendTimeView:setCustomText(strTitle, strContent, strButton, strContentEnd, offsetY)
    self._commonNodeBk:setTitle(strTitle)
    
    self._nodeDesc:removeAllChildren()
    local richText = ccui.RichText:createRichTextByFormatString(strContent,
    {defaultColor = Colors.BRIGHT_BG_TWO, defaultSize = 22, other ={
        [1] = {fontSize = 22}
    }})
    self._nodeDesc:addChild(richText)

    if strContentEnd ~= nil and strContentEnd ~= "" then
        local richText2 = ccui.RichText:createRichTextByFormatString(strContentEnd,
        {defaultColor = Colors.BRIGHT_BG_TWO, defaultSize = 22, other ={
            [1] = {fontSize = 22}
        }})
        richText2:setPositionY(richText:getPositionY() - 30)
        self._nodeDesc:addChild(richText2)    
    end
    self._nodeDesc:setPositionY(self._oriPositionY - offsetY)
    self._btnBack:setString(strButton)
end

function PopupSuspendTimeView:onCreate()
    self._commonNodeBk:addCloseEventListener(handler(self, self._onCloseBack))
    self._oriPositionY = self._nodeDesc:getPositionY()
end

function PopupSuspendTimeView:onEnter()
    local suspendTime = G_UserData:getSeasonSport():getSuspendTime()
    if tonumber(G_ServerTime:getLeftSeconds(suspendTime)) > 0 then
        self._textHint:setString(G_ServerTime:getLeftSecondsString(suspendTime, "00：00：00"))
        self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._update), 0.5)
    end
    self._image_time:setVisible(tonumber(G_ServerTime:getLeftSeconds(suspendTime)) > 0)
end

function PopupSuspendTimeView:onExit()
    if self._countDownScheduler then
        scheduler.unscheduleGlobal(self._countDownScheduler)
    end
	self._countDownScheduler = nil
end

function PopupSuspendTimeView:setCloseCallBack(closeCallBack)
    self._closeCallBack = closeCallBack
end

function PopupSuspendTimeView:setOkCallBack(okCallBack)
    self._okCallBack = okCallBack
end

function PopupSuspendTimeView:_onCloseBack(sender)
    if self._closeCallBack then
        self._closeCallBack()
    end
	self:close()
end

function PopupSuspendTimeView:_onBtnBack(sender)
    if self._closeCallBack then
        self._closeCallBack()
    end

    if self._okCallBack then
        self._okCallBack()
    end
	self:close()
end

-- @Role 	Update
function PopupSuspendTimeView:_update(dt)
    local suspendTime = G_UserData:getSeasonSport():getSuspendTime()
    if tonumber(G_ServerTime:getLeftSeconds(suspendTime)) > 0 then
        self._textHint:setString(G_ServerTime:getLeftSecondsString(suspendTime, "00：00：00"))
    else
        if self._closeCallBack then
            self._closeCallBack()
        end
        self:close()
    end
end


return PopupSuspendTimeView
