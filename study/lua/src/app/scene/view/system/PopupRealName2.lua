
local PopupBase = require("app.ui.PopupBase")
local PopupRealName2 = class("PopupRealName2", PopupBase)

function PopupRealName2:ctor()
	local resource = {
		file = Path.getCSB("PopupRealName2", "system"),
		binding = {
			_buttonOk = 
			{
				events = {{event = "touch", method = "_onClickOk"}},
			}
		}
    }
    PopupRealName2.super.ctor(self, resource, false)
end

function PopupRealName2:onCreate()
	self._textTitle:setString(Lang.get("avoid_title2"))
	self._buttonOk:setString(Lang.get("avoid_ok2"))
    
    local label = cc.Label:createWithTTF(Lang.get("avoid_content2"), Path.getCommonFont(), 18)
	label:setAnchorPoint(cc.p(0, 1))
	label:setLineHeight(26)
	label:setWidth(370)
    label:setColor(Colors.NORMAL_BG_ONE)
    self._nodeContent:addChild(label)

	local InputUtils = require("app.utils.InputUtils")
	self._editBoxName = InputUtils.createInputView(
		{ 	
			bgPanel = self._panelInputName,
			fontSize = 18,
			fontColor = Colors.BRIGHT_BG_ONE,
			placeholderFontColor = Colors.INPUT_PLACEHOLDER_2,
			placeholder = Lang.get("avoid_placeholder_name"),
			maxLength = 8,
		}
	)

	self._editBoxId = InputUtils.createInputView(
		{ 	
			bgPanel = self._panelInputId,
			fontSize = 18,
			fontColor = Colors.BRIGHT_BG_ONE,
			placeholderFontColor = Colors.INPUT_PLACEHOLDER_2,
			placeholder = Lang.get("avoid_placeholder_id"),
			maxLength = 18,
		}
	)
end

function PopupRealName2:open()
	self:setPosition(G_ResolutionManager:getDesignCCPoint())
	G_TopLevelNode:addToRealNameLevel(self)
end

function PopupRealName2:onEnter()
	self._signalRealName = G_SignalManager:add(SignalConst.EVENT_SDK_REAL_NAME_RET, handler(self, self._onEventRealName))
end

function PopupRealName2:onExit()
	self._signalRealName:remove()
	self._signalRealName = nil
end

function PopupRealName2:_onClickOk()
	local strName = self._editBoxName:getText()
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
 
	G_GameAgent:requestSdkRealName(strName, strId)
end

function PopupRealName2:_onEventRealName(eventName, code, message, data)
	local errorMsg = data.failReason or message or ""
	if code == 0 then
		if data.status == 1 then
			if data.isAdult == 1 then
				self:closeWithAction()
				G_Prompt:showTipOnTop(Lang.get("sdk_real_name_success"))
				G_GameAgent:loginGame()
			else
				G_Prompt:showTipOnTop(errorMsg)
			end
		else
			
			G_Prompt:showTipOnTop(errorMsg)
		end
	else
		G_Prompt:showTipOnTop(errorMsg)
	end
end

return PopupRealName2