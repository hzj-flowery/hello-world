local PopupBase = require("app.ui.PopupBase")
local PopupRealName = class("PopupRealName", PopupBase)

local SchedulerHelper = require ("app.utils.SchedulerHelper")

function PopupRealName:ctor(avoidMode)
	local resource = {
		file = Path.getCSB("PopupRealName", "system"),
		binding = {
			_btnOK = 
			{
				events = {{event = "touch", method = "_onOKClick"}},
			}
		}
	}
	self._avoidMode = avoidMode
	if avoidMode then
		PopupRealName.super.ctor(self, resource, false, false)
	else 
		PopupRealName.super.ctor(self, resource)
	end
end

function PopupRealName:onCreate()
	self._bg:setTitle(Lang.get("avoid_title"))
	if self._avoidMode then 
		self._bg:hideCloseBtn()
		self._textTitle:setString(Lang.get("avoid_content"))
	else 
		self._bg:addCloseEventListener(function() self:closeWithAction() end)
		self._textTitle:setString(Lang.get("real_name_content"))
	end

    if not G_ConfigManager:isAvoidHooked() then 
        self._textTime:setVisible(false) 
    end

	self._textTips:setString(Lang.get("avoid_tips"))
	self._btnOK:setString(Lang.get("avoid_ok"))
	local time = G_UserData:getBase():getOnlineTime()
	local strTime = G_ServerTime:getTimeStringHMS(time)
	self._textTime:setString(Lang.get("online_time", {count = strTime}))

	self._textId:setVisible(false)
	self._textPlayerName:setVisible(false)
	

	local InputUtils = require("app.utils.InputUtils")
	self._editBox = InputUtils.createInputView(
		{ 	
			bgPanel = self._panelInputName,
			fontSize = 26,
			fontColor = Colors.CHAT_MSG,
			placeholderFontColor = Colors.INPUT_CREATE_ROLE,
			placeholder = Lang.get("avoid_input_name"),
			maxLength = 8,
		}
	)

	self._editBoxId = InputUtils.createInputView(
		{ 	
			bgPanel = self._panelInputId,
			fontSize = 26,
			fontColor = Colors.CHAT_MSG,
			placeholderFontColor = Colors.INPUT_CREATE_ROLE,
			placeholder = Lang.get("avoid_input_id"),
			maxLength = 18,
		}
	)
end

function PopupRealName:open()
	self:setPosition(G_ResolutionManager:getDesignCCPoint())
	G_TopLevelNode:addToRealNameLevel(self)
end

function PopupRealName:onEnter()
	self._scheduler = SchedulerHelper.newSchedule(handler(self,self._update), 1)
	self._signalRealName = G_SignalManager:add(SignalConst.EVENT_REAL_NAME_RET, handler(self, self._onEventRealName))
end

function PopupRealName:onExit()
	if self._scheduler then
		SchedulerHelper.cancelSchedule(self._scheduler)
		self._scheduler = nil
	end
	self._signalRealName:remove()
	self._signalRealName = nil
end

function PopupRealName:_onOKClick()

	local strName = self._editBox:getText()
	local strId = self._editBoxId:getText()


	if not strName or strName == ""  then
		G_Prompt:showTipOnTop(Lang.get("name_id_wrong"))
		return 
	end

	if not strId or strId == "" or string.len(strId) ~= 18 then 
		G_Prompt:showTipOnTop(Lang.get("name_id_wrong"))
		return 
	end

	local year = tonumber(string.sub( strId, 7, 10 ))
	local month = tonumber(string.sub( strId, 11, 12 ))
	local day = tonumber(string.sub( strId, 13, 14 ))

	if not year or not month or not day then 
		G_Prompt:showTipOnTop(Lang.get("name_id_wrong"))
		return 
	end

	if not G_ServerTime:isOldEnough(year, month, day) then 
		G_Prompt:showTipOnTop(Lang.get("name_id_young"))
		return 
	end
 
	G_GameAgent:setRealName(strName, strId)

end

function PopupRealName:_update()
	local time = G_UserData:getBase():getOnlineTime()
	local strTime = G_ServerTime:getTimeStringHMS(time)
	self._textTime:setString(Lang.get("online_time", {count = strTime}))
end

function PopupRealName:_onEventRealName(msgName, errorCode, errorMsg)
	if errorCode == 1 then 
		self:closeWithAction()
		G_Prompt:showTip(Lang.get("real_name_success"))
		G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_AVOID_GAME)
	else
		G_Prompt:showTip(Lang.get(errorMsg))
	end
end

return PopupRealName

