
local PopupBase = require("app.ui.PopupBase")
local PopupHomelandPrayHandbook = class("PopupHomelandPrayHandbook", PopupBase)
local HomelandPrayHandbookCell = require("app.scene.view.homeland.HomelandPrayHandbookCell")

function PopupHomelandPrayHandbook:waitEnterMsg(callBack)
	local function onMsgCallBack()
		if G_SceneManager:getRunningScene():getName() == "homeland" then
			callBack()
		end
	end
	G_UserData:getHandBook():c2sGetResPhoto()
	local signal = G_SignalManager:add(SignalConst.EVENT_GET_RES_PHOTO_SUCCESS, onMsgCallBack)
	return signal
end

function PopupHomelandPrayHandbook:ctor()
	local resource = {
		file = Path.getCSB("PopupHomelandPrayHandbook", "homeland"),
		binding = {
			_buttonClose = {
                events = {{event = "touch", method = "_onButtonClose"}}
            },
		}
	}
	PopupHomelandPrayHandbook.super.ctor(self, resource)
end

function PopupHomelandPrayHandbook:onCreate()
    self._listView:setTemplate(HomelandPrayHandbookCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupHomelandPrayHandbook:onEnter()
	self:_updateList()
end

function PopupHomelandPrayHandbook:onExit()
	
end

function PopupHomelandPrayHandbook:_updateList()
	self._datas = G_UserData:getHandBook():getHomelandBuffInfos()
	self._listView:clearAll()
	local count = math.ceil(#self._datas / 4)
    self._listView:resize(count)
end

function PopupHomelandPrayHandbook:_onItemUpdate(item, index)
    local index = index * 4
	item:update(self._datas[index + 1], self._datas[index + 2], self._datas[index + 3], self._datas[index + 4])
end

function PopupHomelandPrayHandbook:_onItemSelected(item, index)
	
end

function PopupHomelandPrayHandbook:_onItemTouch(index, t)
    
end

function PopupHomelandPrayHandbook:_onButtonClose()
    self:close()
end

return PopupHomelandPrayHandbook